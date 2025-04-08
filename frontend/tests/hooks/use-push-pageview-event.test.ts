import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { usePushPageviewEvent } from '~/hooks/use-push-pageview-event';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';

// --- Mocks ---
// Mock the analytics utils module
vi.mock('~/utils/adobe-analytics-utils', () => ({
  __esModule: true,
  isEnabled: vi.fn(),
  pushPageviewEvent: vi.fn(),
}));

describe('usePushPageviewEvent', () => {
  // Use beforeEach for consistent setup before each test
  beforeEach(() => {
    // Reset mocks to ensure test isolation
    vi.mocked(adobeAnalytics.isEnabled).mockReset();
    vi.mocked(adobeAnalytics.pushPageviewEvent).mockReset();
  });

  // Define test cases
  const testCases = [
    {
      description: 'should call pushPageviewEvent when enabled and URL changes',
      config: { ADOBE_ANALYTICS_ENABLED: true },
      pathname: '/foo',
      params: { param1: 'value1' },
      expectedCalls: 1,
    },
    {
      description: 'should NOT call pushPageviewEvent when disabled',
      config: { ADOBE_ANALYTICS_ENABLED: false },
      pathname: '/bar',
      params: {},
      expectedCalls: 0,
    },
    {
      description: 'should call pushPageviewEvent only once for the same url twice in a row',
      config: { ADOBE_ANALYTICS_ENABLED: true },
      pathname: '/foobar',
      params: {},
      expectedCalls: 1,
    },
  ];

  it.each(testCases)('$description', ({ config, pathname, params, expectedCalls }) => {
    // --- Arrange ---
    // Set up global environment for this test case
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment, // Preserve other potential defaults
      ...config,
    };

    // Configure the isEnabled mock based on the test case
    vi.mocked(adobeAnalytics.isEnabled).mockReturnValue(config.ADOBE_ANALYTICS_ENABLED);

    const pushPageviewEventMock = vi.mocked(adobeAnalytics.pushPageviewEvent);

    // --- Act ---
    // Render the hook using renderHook
    const { rerender, unmount } = renderHook((props) => usePushPageviewEvent(props.pathname, props.params), {
      initialProps: { pathname, params }, // Pass initial props
    });

    // --- Assert ---
    const locationUrl = new URL(pathname, location.origin);

    // Check if pushPageviewEvent was called the expected number of times
    expect(pushPageviewEventMock).toHaveBeenCalledTimes(expectedCalls);

    // If expected to be called, verify the arguments
    if (expectedCalls > 0) {
      expect(pushPageviewEventMock).toHaveBeenCalledWith(locationUrl, params);
    }

    // --- Test rerender behavior ---
    // Rerender with the *same* path, should not call again
    if (config.ADOBE_ANALYTICS_ENABLED) {
      rerender({ pathname, params }); // Rerender with same props
      // Should still only have been called once from the initial render
      expect(pushPageviewEventMock).toHaveBeenCalledTimes(1);

      //Rerender with a *new* path, should call again
      const newPathname = '/new-path';
      const newLocationUrl = new URL(newPathname, location.origin);
      rerender({ pathname: newPathname, params }); // Rerender with new props
      expect(pushPageviewEventMock).toHaveBeenCalledTimes(2);
      expect(pushPageviewEventMock).toHaveBeenLastCalledWith(newLocationUrl, params);
    }

    // Clean up the hook instance
    unmount();
  });
});
