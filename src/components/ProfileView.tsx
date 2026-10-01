import React, { useState } from 'react';
import type { UserProfileData } from '../types';
import { SKILL_GROUPS } from '../lib/profile';
import { ProfileEditor } from './ProfileEditor';
import {
  Briefcase,
  Code2,
  Sparkles,
  Award,
  GraduationCap,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Lock,
  Database,
  Share2,
  Check,
  Pencil,
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfileData;
  onSaveProfile?: (profile: UserProfileData) => Promise<void>;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  onAskAbout: (query: string) => void;
  onBackToChat: () => void;
  isAdmin?: boolean;
  onRequestAdmin?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onSaveProfile,
  isEditing = false,
  onEditingChange,
  onAskAbout,
  onBackToChat,
  isAdmin = false,
  onRequestAdmin,
}) => {
  const [profileCopied, setProfileCopied] = useState(false);
  const firstName = profile.name.split(' ')[0] || profile.name;
  const years = profile.experienceYears ? `${profile.experienceYears} Yrs` : '';

  const handleShareProfile = async () => {
    const url = `${window.location.origin}${window.location.pathname}?tab=profile`;
    const shareData = {
      title: `${profile.name}${profile.title ? ` - ${profile.title}` : ''}`,
      text: `Check out ${profile.name}'s profile and ask the AI about their experience.`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setProfileCopied(true);
      setTimeout(() => setProfileCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  if (isEditing && onSaveProfile) {
    return <ProfileEditor profile={profile} onSave={onSaveProfile} onCancel={() => onEditingChange?.(false)} />;
  }

  const skillGroups = SKILL_GROUPS.filter(({ key }) => profile.skills[key]?.length > 0);

  return (
    <div className="flex-1 overflow-y-auto bg-[#1a1b20] text-slate-200 p-4 space-y-4">
      {isAdmin && onSaveProfile && (
        <button
          onClick={() => onEditingChange?.(true)}
          id="btn-edit-profile"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-semibold cursor-pointer transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit profile (owner)
        </button>
      )}

      {/* Header Profile Card */}
      <div className="bg-[#24252d] border border-slate-700/60 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-md flex items-center justify-center overflow-hidden">
              <img
                src="/avatar.png"
                alt={profile.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{profile.name}</h2>
              <p className="text-xs text-indigo-300 font-medium">{profile.title}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Callout */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleShareProfile}
              id="btn-share-profile"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all active:scale-95 cursor-pointer ${
                profileCopied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#1c1d24] hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Share profile link"
            >
              {profileCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{profileCopied ? 'Copied Link!' : 'Share'}</span>
            </button>

            <button
              onClick={onBackToChat}
              id="btn-return-chat"
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open AI Chat</span>
            </button>
          </div>
        </div>

        {/* Contact Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/60 text-xs">
          {profile.email && (<a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-2 p-2 rounded-xl bg-[#1c1d24] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{profile.email}</span>
          </a>)}
          {profile.phone && (<a
            href={`tel:${profile.phone.replace(/\s+/g, '')}`}
            className="flex items-center gap-2 p-2 rounded-xl bg-[#1c1d24] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{profile.phone}</span>
          </a>)}
          {profile.linkedin && (<a
            href={`https://${profile.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-xl bg-[#1c1d24] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">LinkedIn Profile</span>
            <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
          </a>)}
        </div>

        {/* Summary text */}
        <p className="mt-4 text-xs leading-relaxed text-slate-300 bg-[#1e1f26] p-3 rounded-2xl border border-slate-700/40">
          {profile.summary}
        </p>
      </div>

      {/* Featured AI Projects */}
      <div className="bg-[#24252d] border border-slate-700/60 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Highlighted Projects</h3>
          </div>
          <button
            onClick={() => onAskAbout(`Tell me about ${firstName}'s projects.`)}
            className="text-[11px] text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
          >
            <span>Ask AI</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {profile.projects.map((proj, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#1d1e25] border border-slate-700/50 hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-slate-100">{proj.title}</h4>
                  <span className="text-[11px] text-amber-300/90 font-medium">{proj.subtitle}</span>
                </div>
                <button
                  onClick={() => onAskAbout(`Tell me about ${proj.title}`)}
                  className="px-2 py-1 rounded-full bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                >
                  Ask AI
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{proj.description}</p>
              {proj.impact && (
                <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{proj.impact}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {proj.technologies.map((tech, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skills Matrix */}
      <div className="bg-[#24252d] border border-slate-700/60 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Technical Skills</h3>
          </div>
          <button
            onClick={() => onAskAbout(`Give me a detailed breakdown of ${firstName}'s technical skills.`)}
            className="text-[11px] text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
          >
            <span>Ask AI</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {skillGroups.map(({ key, label }) => (
            <div key={key}>
              <span className="text-[11px] font-medium text-slate-400 block mb-1.5">{label}</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills[key].map((s) => (
                  <span
                    key={s}
                    onClick={() => onAskAbout(`What is ${firstName}'s experience with ${s}?`)}
                    className={`px-2.5 py-1 rounded-full border text-[11px] transition-colors cursor-pointer ${
                      key === 'aiGenAi'
                        ? 'bg-indigo-950/30 hover:bg-indigo-900/50 text-indigo-300 border-indigo-500/30'
                        : 'bg-[#1c1d24] hover:bg-indigo-950/40 text-slate-200 hover:text-indigo-200 border-slate-700/60 hover:border-indigo-500/40'
                    }`}
                    title={`Ask about ${s}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="bg-[#24252d] border border-slate-700/60 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Work Experience{years ? ` (${years})` : ''}</h3>
          </div>
          <button
            onClick={() => onAskAbout(`Walk me through ${firstName}'s work experience, most recent first.`)}
            className="text-[11px] text-indigo-300 hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
          >
            <span>Ask AI</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-4 relative border-l-2 border-slate-700/80 ml-2 pl-4">
          {profile.experiences.map((exp, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[#24252d]" />
              <div className="flex items-baseline justify-between flex-wrap gap-1">
                <h4 className="text-xs font-bold text-white">{exp.role}</h4>
                <span className="text-[10px] text-indigo-300 font-medium">{exp.period}</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mb-2">{exp.company}</div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {exp.highlights.map((point, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2">
                <button
                  onClick={() => onAskAbout(`What were ${firstName}'s key achievements and responsibilities at ${exp.company}?`)}
                  className="text-[10px] text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Ask AI about {exp.company}
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Awards & Certifications & Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Awards */}
        <div className="bg-[#24252d] border border-slate-700/60 rounded-3xl p-5 shadow-lg space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400">
            <Award className="w-4 h-4" />
            <h4 className="text-xs font-semibold text-white">Awards & Recognition</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {profile.awards.map((award, aIdx) => (
              <li key={aIdx} className="p-2 rounded-xl bg-[#1d1e25] border border-slate-700/40 leading-snug">
                {award}
              </li>
            ))}
          </ul>
        </div>

        {/* Certifications & Education */}
        <div className="bg-[#24252d] border border-slate-700/60 rounded-3xl p-5 shadow-lg space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-400">
            <GraduationCap className="w-4 h-4" />
            <h4 className="text-xs font-semibold text-white">Certifications & Education</h4>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            {profile.certifications.map((cert, cIdx) => (
              <div key={cIdx} className="p-2 rounded-xl bg-[#1d1e25] border border-slate-700/40 leading-snug">
                <span className="text-emerald-400 font-medium">✓ </span>
                {cert}
              </div>
            ))}
            <div className="p-2.5 rounded-xl bg-[#1d1e25] border border-slate-700/40 text-xs">
              <span className="text-indigo-300 font-semibold block mb-0.5">Education:</span>
              <span>{profile.education}</span>
            </div>
          </div>
        </div>

        {/* Discreet Owner / Developer Access */}
        <div className="pt-2 pb-4 flex items-center justify-center">
          {isAdmin ? (
            <div className="text-[11px] text-amber-400/80 flex items-center gap-1.5">
              <span>Owner Mode Active</span>
            </div>
          ) : (
            <button
              onClick={onRequestAdmin}
              className="text-[11px] text-slate-500 hover:text-slate-400 flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Owner Settings</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
