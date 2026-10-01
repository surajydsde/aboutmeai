import React, { useState, useEffect, useCallback } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { MaterialTopBar } from './components/MaterialTopBar';
import { MaterialBottomNav } from './components/MaterialBottomNav';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { ContextView } from './components/ContextView';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ChatMessage, SuggestionChip, UserProfileData } from './types';
import { DEFAULT_SUGGESTION_CHIPS, SURAJ_PROFILE } from './data/surajProfile';
import { ProfileContext } from './lib/ProfileContext';
import { buildProfileContext } from './lib/profile';
import { ApiError, chatRequest, fetchProfile, ownerToken, saveProfileRequest, verifyTokenRequest } from './lib/api';

type Tab = 'chat' | 'profile' | 'context';

const STORAGE_KEY_MESSAGES = 'suraj_chat_history_v1';
// Keys from the old client-side owner mode; removed on load.
const LEGACY_KEYS = ['suraj_custom_context_v1', 'suraj_admin_auth_v1'];

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>(() => {
    try {
      const searchTab = new URLSearchParams(window.location.search).get('tab');
      if (searchTab === 'profile') return 'profile';
    } catch {
      // ignore
    }
    return 'chat';
  });

  const [token, setToken] = useState<string | null>(() => ownerToken.get());
  const isAdmin = Boolean(token);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<Tab>('profile');
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<UserProfileData>(SURAJ_PROFILE);
  const [aiContext, setAiContext] = useState<string>(() => buildProfileContext(SURAJ_PROFILE));

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [chips, setChips] = useState<SuggestionChip[]>(DEFAULT_SUGGESTION_CHIPS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lockAdmin = useCallback(() => {
    ownerToken.clear();
    setToken(null);
    setIsEditing(false);
    setCurrentTab((tab) => (tab === 'context' ? 'chat' : tab));
  }, []);

  // Load the live profile + suggestions, and check any saved owner session.
  useEffect(() => {
    try {
      LEGACY_KEYS.forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
    } catch {
      // ignore
    }

    fetchProfile()
      .then((data) => {
        if (data?.profile) {
          setProfile(data.profile);
          setAiContext(data.context);
        }
      })
      .catch((err) => console.error('Failed to load profile:', err));

    fetch('/api/suggestions')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setChips(data.suggestions);
        }
      })
      .catch((err) => console.error('Failed to load suggestions:', err));

    const saved = ownerToken.get();
    if (saved) {
      verifyTokenRequest(saved).then((valid) => {
        if (!valid) lockAdmin();
      });
    }
  }, [lockAdmin]);

  useEffect(() => {
    document.title = profile.title ? `${profile.name} — ${profile.title}` : profile.name;
  }, [profile.name, profile.title]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const handleSaveProfile = async (next: UserProfileData) => {
    if (!token) {
      setShowAdminModal(true);
      throw new Error('Please unlock owner mode first.');
    }
    try {
      const data = await saveProfileRequest(next, token);
      setProfile(data.profile);
      setAiContext(data.context);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        ownerToken.clear();
        setToken(null);
        setPendingTab('profile');
        setShowAdminModal(true);
        throw new Error('Your owner session expired. Unlock again, then press Save — your edits are still here.');
      }
      throw err;
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        text: msg.text,
      }));
      const data = await chatRequest(text.trim(), history);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.reply || 'No response generated.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Failed to reach the AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: Tab) => {
    if (tab === 'context' && !isAdmin) {
      setPendingTab('context');
      setShowAdminModal(true);
      return;
    }
    if (tab !== 'profile') setIsEditing(false);
    setCurrentTab(tab);
    try {
      const url = new URL(window.location.href);
      if (tab === 'chat') url.searchParams.delete('tab');
      else url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  const requestAdmin = (target: Tab = 'profile') => {
    setPendingTab(target);
    setShowAdminModal(true);
  };

  const handleAdminSuccess = (newToken: string) => {
    ownerToken.set(newToken);
    setToken(newToken);
    setShowAdminModal(false);
    setCurrentTab(pendingTab);
    if (pendingTab === 'profile') setIsEditing(true);
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    setError(null);
  };

  const handleAskAbout = (query: string) => {
    setCurrentTab('chat');
    handleSendMessage(query);
  };

  return (
    <ProfileContext.Provider value={profile}>
      <AndroidFrame>
        <MaterialTopBar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          onClearChat={handleClearChat}
          messageCount={messages.length}
          isAdmin={isAdmin}
          onRequestAdmin={() => requestAdmin('profile')}
          onLockAdmin={lockAdmin}
          name={profile.name}
          experienceYears={profile.experienceYears}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentTab === 'chat' && (
            <ChatView
              messages={messages}
              isLoading={isLoading}
              error={error}
              onSendMessage={handleSendMessage}
              chips={chips}
              onSelectChip={handleSendMessage}
              onClearError={() => setError(null)}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              profile={profile}
              onSaveProfile={handleSaveProfile}
              isEditing={isEditing}
              onEditingChange={setIsEditing}
              onAskAbout={handleAskAbout}
              onBackToChat={() => setCurrentTab('chat')}
              isAdmin={isAdmin}
              onRequestAdmin={() => requestAdmin('profile')}
            />
          )}

          {currentTab === 'context' && isAdmin && (
            <ContextView
              context={aiContext}
              onEditProfile={() => {
                setCurrentTab('profile');
                setIsEditing(true);
              }}
              onBackToChat={() => setCurrentTab('chat')}
              onLockAdmin={lockAdmin}
            />
          )}
        </main>

        {!isEditing && (
          <MaterialBottomNav currentTab={currentTab} onTabChange={handleTabChange} messageCount={messages.length} isAdmin={isAdmin} />
        )}

        <AdminAuthModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} onSuccess={handleAdminSuccess} />
      </AndroidFrame>
    </ProfileContext.Provider>
  );
}
