import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaterialBottomNav } from '../components/MaterialBottomNav';
import { AdminAuthModal } from '../components/AdminAuthModal';

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

  it('renders and unlocks with valid passcode', () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    render(
      <AdminAuthModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />
    );

    expect(screen.getByText('Owner Verification')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Enter passcode');
    fireEvent.change(input, { target: { value: '#owner12345@$' } });
    fireEvent.click(screen.getByText('Unlock Context'));

    expect(handleSuccess).toHaveBeenCalled();
  });

  it('displays error on incorrect passcode', () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();
    render(
      <AdminAuthModal isOpen={true} onClose={handleClose} onSuccess={handleSuccess} />
    );

    const input = screen.getByPlaceholderText('Enter passcode');
    fireEvent.change(input, { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Unlock Context'));

    expect(handleSuccess).not.toHaveBeenCalled();
    expect(screen.getByText(/Incorrect passcode/i)).toBeInTheDocument();
  });
});
