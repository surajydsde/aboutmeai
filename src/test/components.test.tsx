import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MaterialBottomNav } from '../components/MaterialBottomNav';
import { AdminAuthModal } from '../components/AdminAuthModal';
import { ProfileView } from '../components/ProfileView';
import { SURAJ_PROFILE } from '../data/surajProfile';

describe('MaterialBottomNav Component', () => {
  it('renders default visitor tabs without admin context tab', () => {
    const handleTabChange = vi.fn();
    render(
      <MaterialBottomNav
        currentTab="chat"
        onTabChange={handleTabChange}
        messageCount={2}
        isAdmin={false}
      />
    );

    expect(screen.getByText('AI Chat')).toBeInTheDocument();
    expect(screen.getByText('Resume & Bio')).toBeInTheDocument();
    expect(screen.queryByText('AI Context')).not.toBeInTheDocument();
  });

  it('renders owner context tab when isAdmin is true', () => {
    const handleTabChange = vi.fn();
    render(
      <MaterialBottomNav
        currentTab="context"
        onTabChange={handleTabChange}
        messageCount={0}
        isAdmin={true}
      />
    );

    expect(screen.getByText('AI Context')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('triggers onTabChange on tab click', () => {
    const handleTabChange = vi.fn();
    render(
      <MaterialBottomNav
        currentTab="chat"
        onTabChange={handleTabChange}
        messageCount={0}
        isAdmin={false}
      />
    );

    fireEvent.click(screen.getByText('Resume & Bio'));
    expect(handleTabChange).toHaveBeenCalledWith('profile');
  });
});

describe('AdminAuthModal Component', () => {
  it('does not render when closed', () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    const { container } = render(
      <AdminAuthModal isOpen={false} onClose={handleClose} onSuccess={handleSuccess} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('sends the passcode to the server and passes back the token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 'tok123', expiresAt: Date.now() + 1000 }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const handleSuccess = vi.fn();
    render(<AdminAuthModal isOpen={true} onClose={vi.fn()} onSuccess={handleSuccess} />);

    expect(screen.getByText('Owner Verification')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Enter passcode'), { target: { value: 'my-secret' } });
    fireEvent.click(screen.getByText('Unlock'));

    await waitFor(() => expect(handleSuccess).toHaveBeenCalledWith('tok123'));
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/login', expect.objectContaining({ method: 'POST' }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ passcode: 'my-secret' });
    vi.unstubAllGlobals();
  });

  it('shows the server error on an incorrect passcode', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'Incorrect passcode.' }) })
    );
    const handleSuccess = vi.fn();
    render(<AdminAuthModal isOpen={true} onClose={vi.fn()} onSuccess={handleSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('Enter passcode'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Unlock'));

    expect(await screen.findByText(/Incorrect passcode/i)).toBeInTheDocument();
    expect(handleSuccess).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('does not contain a hardcoded passcode', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/components/AdminAuthModal.tsx', 'utf8');
    expect(src).not.toMatch(/owner12345/);
  });
});

describe('ProfileView with live profile', () => {
  const profile = { ...SURAJ_PROFILE, name: 'Test Person', title: 'Staff Engineer', phone: '' };

  it('renders whatever profile it is given', () => {
    render(<ProfileView profile={profile} onAskAbout={vi.fn()} onBackToChat={vi.fn()} />);
    expect(screen.getByText('Test Person')).toBeInTheDocument();
    expect(screen.getByText('Staff Engineer')).toBeInTheDocument();
    // empty phone is hidden
    expect(screen.queryByText('+91 8286683658')).not.toBeInTheDocument();
    // all skill groups render, including ones the old view skipped
    expect(screen.getByText('Mocha')).toBeInTheDocument();
  });

  it('shows the edit button only to the owner', () => {
    const { rerender } = render(
      <ProfileView profile={profile} onAskAbout={vi.fn()} onBackToChat={vi.fn()} onSaveProfile={vi.fn()} />
    );
    expect(screen.queryByText(/Edit profile/)).not.toBeInTheDocument();
    rerender(
      <ProfileView profile={profile} onAskAbout={vi.fn()} onBackToChat={vi.fn()} onSaveProfile={vi.fn()} isAdmin />
    );
    expect(screen.getByText(/Edit profile/)).toBeInTheDocument();
  });

  it('editor saves edited fields, splitting lists by line', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <ProfileView profile={profile} onAskAbout={vi.fn()} onBackToChat={vi.fn()} onSaveProfile={onSave} isAdmin isEditing />
    );
    expect(screen.getByTestId('profile-editor')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('Staff Engineer'), { target: { value: 'Principal Engineer' } });
    fireEvent.change(screen.getByDisplayValue(/^Mocha/), { target: { value: 'Vitest\nPlaywright, Cypress\n\n' } });
    fireEvent.click(screen.getByText('Save & publish'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const saved = onSave.mock.calls[0][0];
    expect(saved.title).toBe('Principal Engineer');
    expect(saved.skills.testing).toEqual(['Vitest', 'Playwright, Cypress']);
    expect(saved.experiences[0].highlights.length).toBeGreaterThan(0);
    expect(await screen.findByText(/Visitors now see this version/)).toBeInTheDocument();
  });

  it('editor shows save errors', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Storage is not set up.'));
    render(
      <ProfileView profile={profile} onAskAbout={vi.fn()} onBackToChat={vi.fn()} onSaveProfile={onSave} isAdmin isEditing />
    );
    fireEvent.click(screen.getByText('Save & publish'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Storage is not set up.');
  });
});
