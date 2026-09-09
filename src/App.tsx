import React, { useState, useEffect } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { MaterialTopBar } from './components/MaterialTopBar';
import { MaterialBottomNav } from './components/MaterialBottomNav';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { ContextView } from './components/ContextView';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ChatMessage, SuggestionChip } from './types';
import { DEFAULT_SUGGESTION_CHIPS } from './data/surajProfile';

const STORAGE_KEY_MESSAGES = 'suraj_chat_history_v1';
const STORAGE_KEY_CONTEXT = 'suraj_custom_context_v1';
const STORAGE_KEY_ADMIN = 'suraj_admin_auth_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'chat' | 'profile' | 'context'>(() => {
    try {
      const searchTab = new URLSearchParams(window.location.search).get('tab');
      if (searchTab === 'profile') return 'profile';
    } catch {
      // ignore
    }
    return 'chat';
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_ADMIN) === 'true';
    } catch {
      return false;
    }
  });
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [customContext, setCustomContext] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTEXT);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return '';
  });

  const [defaultContext, setDefaultContext] = useState<string>('');
  const [chips, setChips] = useState<SuggestionChip[]>(DEFAULT_SUGGESTION_CHIPS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial profile context & suggestions from backend
  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile) {
          setDefaultContext(data.profile);
        }
      })
      .catch((err) => console.error('Failed to load profile context:', err));

    fetch('/api/suggestions')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setChips(data.suggestions);
        }
      })
      .catch((err) => console.error('Failed to load suggestions:', err));
  }, []);

  // Sync messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Sync custom context to local storage
  useEffect(() => {
    try {
      if (customContext) {
        localStorage.setItem(STORAGE_KEY_CONTEXT, customContext);
      } else {
        localStorage.removeItem(STORAGE_KEY_CONTEXT);
      }
    } catch {
      // ignore
    }
  }, [customContext]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: timeString,
    };

    // Update conversation state with user's question
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Send previous turns for conversational memory & context
      const historyPayload = messages.slice(-10).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        text: msg.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyPayload,
          customProfile: customContext || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to receive response from Gemini');
      }

      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Failed to connect to Gemini. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'chat' | 'profile' | 'context') => {
    if (tab === 'context' && !isAdmin) {
      setShowAdminModal(true);
      return;
    }
    setCurrentTab(tab);
    try {
      const url = new URL(window.location.href);
      if (tab === 'chat') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tab);
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    try {
      sessionStorage.setItem(STORAGE_KEY_ADMIN, 'true');
    } catch {
      // ignore
    }
    setShowAdminModal(false);
    setCurrentTab('context');
  };

  const handleLockAdmin = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY_ADMIN);
    } catch {
      // ignore
    }
    if (currentTab === 'context') {
      setCurrentTab('chat');
    }
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
    <AndroidFrame>
      {/* Material 3 Top App Bar */}
      <MaterialTopBar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onClearChat={handleClearChat}
        messageCount={messages.length}
        isAdmin={isAdmin}
        onRequestAdmin={() => setShowAdminModal(true)}
        onLockAdmin={handleLockAdmin}
      />

      {/* Screen Views */}
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
            onAskAbout={handleAskAbout}
            onBackToChat={() => setCurrentTab('chat')}
            isAdmin={isAdmin}
            onRequestAdmin={() => setShowAdminModal(true)}
          />
        )}

        {currentTab === 'context' && isAdmin && (
          <ContextView
            customContext={customContext}
            defaultContext={defaultContext}
            onSaveContext={setCustomContext}
            onResetContext={() => setCustomContext('')}
            onBackToChat={() => setCurrentTab('chat')}
            onLockAdmin={handleLockAdmin}
          />
        )}
      </main>

      {/* Material 3 Bottom Navigation Bar */}
      <MaterialBottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        messageCount={messages.length}
        isAdmin={isAdmin}
      />

      {/* Admin Passcode Verification Dialog */}
      <AdminAuthModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={handleAdminSuccess}
      />
    </AndroidFrame>
  );
}
