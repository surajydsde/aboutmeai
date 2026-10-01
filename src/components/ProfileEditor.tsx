import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, X, RotateCcw, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { UserProfileData, ExperienceItem, ProjectItem } from '../types';
import { SKILL_GROUPS } from '../lib/profile';
import { SURAJ_PROFILE } from '../data/surajProfile';

interface ProfileEditorProps {
  profile: UserProfileData;
  onSave: (profile: UserProfileData) => Promise<void>;
  onCancel: () => void;
}

// Lists are edited as "one item per line" so items can contain commas.
const toLines = (items: string[] = []) => items.join('\n');
const fromLines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const inputCls =
  'w-full bg-[#18191f] text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none';
const areaCls = `${inputCls} leading-relaxed resize-y`;

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block space-y-1">
    <span className="text-[11px] font-medium text-slate-400">
      {label}
      {hint && <span className="text-slate-500 font-normal"> · {hint}</span>}
    </span>
    {children}
  </label>
);

const Section: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <section className="bg-[#24252d] border border-slate-700/60 rounded-3xl p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const ItemControls: React.FC<{ index: number; count: number; onMove: (dir: -1 | 1) => void; onRemove: () => void; label: string }> = ({
  index,
  count,
  onMove,
  onRemove,
  label,
}) => (
  <div className="flex items-center gap-1">
    <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-30 cursor-pointer" aria-label={`Move ${label} up`}>
      <ArrowUp className="w-3.5 h-3.5" />
    </button>
    <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-30 cursor-pointer" aria-label={`Move ${label} down`}>
      <ArrowDown className="w-3.5 h-3.5" />
    </button>
    <button type="button" onClick={onRemove} className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/50 cursor-pointer" aria-label={`Remove ${label}`}>
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
);

function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = [...list];
  const target = index + dir;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

const AddButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-medium cursor-pointer">
    <Plus className="w-3 h-3" />
    {label}
  </button>
);

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onSave, onCancel }) => {
  const [draft, setDraft] = useState<UserProfileData>(() => structuredClone(profile));
  // Raw text for list fields, so typing a newline isn't immediately collapsed.
  const [skillText, setSkillText] = useState<Record<string, string>>(() =>
    Object.fromEntries(SKILL_GROUPS.map(({ key }) => [key, toLines(profile.skills[key])]))
  );
  const [awardsText, setAwardsText] = useState(toLines(profile.awards));
  const [certsText, setCertsText] = useState(toLines(profile.certifications));
  const [highlightText, setHighlightText] = useState<string[]>(() => profile.experiences.map((e) => toLines(e.highlights)));
  const [techText, setTechText] = useState<string[]>(() => profile.projects.map((p) => toLines(p.technologies)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof UserProfileData>(key: K, value: UserProfileData[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  };

  const updateExp = (i: number, patch: Partial<ExperienceItem>) =>
    set('experiences', draft.experiences.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  const updateProj = (i: number, patch: Partial<ProjectItem>) =>
    set('projects', draft.projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const loadDefaults = () => {
    if (!window.confirm('Replace everything in this editor with the original resume from the code? Nothing is saved until you press Save.')) return;
    const d = structuredClone(SURAJ_PROFILE);
    setDraft(d);
    setSkillText(Object.fromEntries(SKILL_GROUPS.map(({ key }) => [key, toLines(d.skills[key])])));
    setAwardsText(toLines(d.awards));
    setCertsText(toLines(d.certifications));
    setHighlightText(d.experiences.map((e) => toLines(e.highlights)));
    setTechText(d.projects.map((p) => toLines(p.technologies)));
    setSaved(false);
  };

  const handleSave = async () => {
    const final: UserProfileData = {
      ...draft,
      skills: Object.fromEntries(SKILL_GROUPS.map(({ key }) => [key, fromLines(skillText[key] || '')])) as UserProfileData['skills'],
      awards: fromLines(awardsText),
      certifications: fromLines(certsText),
      experiences: draft.experiences.map((e, i) => ({ ...e, highlights: fromLines(highlightText[i] || '') })),
      projects: draft.projects.map((p, i) => ({ ...p, technologies: fromLines(techText[i] || '') })),
    };
    setSaving(true);
    setError(null);
    try {
      await onSave(final);
      setSaved(true);
    } catch (err: any) {
      setError(err?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#1a1b20] text-slate-200 p-4 space-y-4 pb-28" data-testid="profile-editor">
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200">
        <strong>Editing live profile.</strong> Saving updates the Resume tab and the AI's answers for every visitor.
      </div>

      <Section title="Basics">
        <Field label="Name">
          <input className={inputCls} value={draft.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Title">
          <input className={inputCls} value={draft.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Location">
            <input className={inputCls} value={draft.location} onChange={(e) => set('location', e.target.value)} />
          </Field>
          <Field label="Years of experience" hint="e.g. 7+">
            <input className={inputCls} value={draft.experienceYears || ''} onChange={(e) => set('experienceYears', e.target.value)} />
          </Field>
        </div>
        <Field label="Email">
          <input className={inputCls} type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Phone" hint="leave empty to hide">
          <input className={inputCls} value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="LinkedIn" hint="linkedin.com/in/…">
          <input className={inputCls} value={draft.linkedin} onChange={(e) => set('linkedin', e.target.value)} />
        </Field>
        <Field label="Summary">
          <textarea className={areaCls} rows={6} value={draft.summary} onChange={(e) => set('summary', e.target.value)} />
        </Field>
      </Section>

      <Section title="Skills">
        <p className="text-[11px] text-slate-500">One skill per line.</p>
        {SKILL_GROUPS.map(({ key, label }) => (
          <Field key={key} label={label}>
            <textarea
              className={areaCls}
              rows={3}
              value={skillText[key] || ''}
              onChange={(e) => {
                setSkillText((t) => ({ ...t, [key]: e.target.value }));
                setSaved(false);
              }}
            />
          </Field>
        ))}
      </Section>

      <Section
        title="Work experience"
        action={
          <AddButton
            label="Add role"
            onClick={() => {
              set('experiences', [{ company: '', role: '', period: '', highlights: [] }, ...draft.experiences]);
              setHighlightText((h) => ['', ...h]);
            }}
          />
        }
      >
        {draft.experiences.map((exp, i) => (
          <div key={i} className="p-3 rounded-2xl bg-[#1d1e25] border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-300 truncate">{exp.company || `Role ${i + 1}`}</span>
              <ItemControls
                index={i}
                count={draft.experiences.length}
                label={exp.company || `role ${i + 1}`}
                onMove={(dir) => {
                  set('experiences', move(draft.experiences, i, dir));
                  setHighlightText((h) => move(h, i, dir));
                }}
                onRemove={() => {
                  if (!window.confirm(`Remove ${exp.company || 'this role'}?`)) return;
                  set('experiences', draft.experiences.filter((_, idx) => idx !== i));
                  setHighlightText((h) => h.filter((_, idx) => idx !== i));
                }}
              />
            </div>
            <Field label="Role">
              <input className={inputCls} value={exp.role} onChange={(e) => updateExp(i, { role: e.target.value })} />
            </Field>
            <Field label="Company">
              <input className={inputCls} value={exp.company} onChange={(e) => updateExp(i, { company: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Period">
                <input className={inputCls} value={exp.period} placeholder="Jul 2025 – Present" onChange={(e) => updateExp(i, { period: e.target.value })} />
              </Field>
              <Field label="Location">
                <input className={inputCls} value={exp.location || ''} onChange={(e) => updateExp(i, { location: e.target.value })} />
              </Field>
            </div>
            <Field label="Highlights" hint="one per line">
              <textarea
                className={areaCls}
                rows={5}
                value={highlightText[i] || ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setHighlightText((h) => h.map((t, idx) => (idx === i ? v : t)));
                  setSaved(false);
                }}
              />
            </Field>
          </div>
        ))}
      </Section>

      <Section
        title="Projects"
        action={
          <AddButton
            label="Add project"
            onClick={() => {
              set('projects', [...draft.projects, { title: '', subtitle: '', description: '', technologies: [] }]);
              setTechText((t) => [...t, '']);
            }}
          />
        }
      >
        {draft.projects.map((proj, i) => (
          <div key={i} className="p-3 rounded-2xl bg-[#1d1e25] border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-300 truncate">{proj.title || `Project ${i + 1}`}</span>
              <ItemControls
                index={i}
                count={draft.projects.length}
                label={proj.title || `project ${i + 1}`}
                onMove={(dir) => {
                  set('projects', move(draft.projects, i, dir));
                  setTechText((t) => move(t, i, dir));
                }}
                onRemove={() => {
                  if (!window.confirm(`Remove ${proj.title || 'this project'}?`)) return;
                  set('projects', draft.projects.filter((_, idx) => idx !== i));
                  setTechText((t) => t.filter((_, idx) => idx !== i));
                }}
              />
            </div>
            <Field label="Title">
              <input className={inputCls} value={proj.title} onChange={(e) => updateProj(i, { title: e.target.value })} />
            </Field>
            <Field label="Subtitle">
              <input className={inputCls} value={proj.subtitle} onChange={(e) => updateProj(i, { subtitle: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea className={areaCls} rows={4} value={proj.description} onChange={(e) => updateProj(i, { description: e.target.value })} />
            </Field>
            <Field label="Impact" hint="optional">
              <input className={inputCls} value={proj.impact || ''} onChange={(e) => updateProj(i, { impact: e.target.value })} />
            </Field>
            <Field label="Technologies" hint="one per line">
              <textarea
                className={areaCls}
                rows={3}
                value={techText[i] || ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setTechText((t) => t.map((x, idx) => (idx === i ? v : x)));
                  setSaved(false);
                }}
              />
            </Field>
          </div>
        ))}
      </Section>

      <Section title="Awards, certifications & education">
        <Field label="Awards" hint="one per line">
          <textarea className={areaCls} rows={4} value={awardsText} onChange={(e) => { setAwardsText(e.target.value); setSaved(false); }} />
        </Field>
        <Field label="Certifications" hint="one per line">
          <textarea className={areaCls} rows={4} value={certsText} onChange={(e) => { setCertsText(e.target.value); setSaved(false); }} />
        </Field>
        <Field label="Education">
          <textarea className={areaCls} rows={2} value={draft.education} onChange={(e) => set('education', e.target.value)} />
        </Field>
      </Section>

      <Section title="Notes for the AI">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Not shown on the Resume tab. The AI can use these when answering — e.g. availability, notice period, preferred roles or locations.
        </p>
        <textarea
          className={areaCls}
          rows={4}
          value={draft.aiNotes || ''}
          placeholder="e.g. Open to senior frontend roles in Mumbai or remote. Notice period: 60 days."
          onChange={(e) => set('aiNotes', e.target.value)}
        />
      </Section>

      <button type="button" onClick={loadDefaults} className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer">
        <RotateCcw className="w-3 h-3" />
        Load original resume from code
      </button>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-[#1a1b20]/95 backdrop-blur border-t border-slate-700/60 space-y-2">
        {error && (
          <div role="alert" className="flex items-start gap-2 p-2.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {saved && !error && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Saved. Visitors now see this version.</span>
          </div>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 cursor-pointer">
            <X className="w-3.5 h-3.5" />
            {saved ? 'Done' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving…' : 'Save & publish'}
          </button>
        </div>
      </div>
    </div>
  );
};
