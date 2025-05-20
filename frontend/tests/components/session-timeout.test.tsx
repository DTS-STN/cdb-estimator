import { createRoutesStub } from 'react-router';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { useIdleTimer } from 'react-idle-timer';
import { describe, expect, it, vi } from 'vitest';

import { SessionTimeout } from '~/components/session-timeout';
import type { SessionTimeoutProps } from '~/components/session-timeout';

vi.mock('react-idle-timer');

describe('SessionTimeout', () => {
  const mockActivate = vi.fn();
  const mockIsPrompted = vi.fn();
  const mockGetRemainingTime = vi.fn();

  vi.mocked(useIdleTimer, { partial: true }).mockReturnValue({
    activate: mockActivate,
    isPrompted: mockIsPrompted,
    getRemainingTime: mockGetRemainingTime,
  });

  const setup = (props: Partial<SessionTimeoutProps> = {}) => {
    const defaultProps = {
      promptBeforeIdle: 30_000,
      timeout: 60_000,
      onSessionEnd: vi.fn(),
      onSessionExtend: vi.fn(),
    };

    const RoutesStub = createRoutesStub([
      {
        Component: () => <SessionTimeout {...defaultProps} {...props} />,
        path: '/en/public',
      },
    ]);

    return render(<RoutesStub initialEntries={['/en/public']} />);
  };

  it('should render the session timeout dialog when prompted', () => {
    mockIsPrompted.mockReturnValue(true);

    setup();
    expect(screen.queryByText('common:session-timeout.header')).not.toBeNull();
    expect(screen.queryByText('common:session-timeout.end-session')).not.toBeNull();
    expect(screen.queryByText('common:session-timeout.continue-session')).not.toBeNull();
  });

  it('should call `onSessionEnd` when the "End Session" button is clicked', () => {
    const onSessionEnd = vi.fn();

    setup({ onSessionEnd });

    const endSessionButton = screen.getByText('common:session-timeout.end-session');
    act(() => void fireEvent.click(endSessionButton));

    expect(onSessionEnd).toHaveBeenCalled();
  });

  it('should call `onSessionExtend` when the "Continue Session" button is clicked', () => {
    const onSessionExtend = vi.fn();

    setup({ onSessionExtend });

    const continueSessionButton = screen.getByText('common:session-timeout.continue-session');
    act(() => void fireEvent.click(continueSessionButton));

    expect(onSessionExtend).toHaveBeenCalled();
  });

  it('should activate the IdleTimer on location change', () => {
    mockIsPrompted.mockReturnValue(false);

    setup();

    expect(mockActivate).toHaveBeenCalled();
  });

  it('should update the remaining time every second', () => {
    mockIsPrompted.mockReturnValue(true);
    mockGetRemainingTime.mockReturnValue(50_000);

    vi.useFakeTimers({ shouldAdvanceTime: true });

    setup();

    expect(
      screen.queryByText('{"key":"common:session-timeout.description","options":{"timeRemaining":"0:50"}}'),
    ).not.toBeNull();

    act(() => {
      mockGetRemainingTime.mockReturnValue(49_000);
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.queryByText('{"key":"common:session-timeout.description","options":{"timeRemaining":"0:49"}}'),
    ).not.toBeNull();

    vi.useRealTimers();
  });
});
