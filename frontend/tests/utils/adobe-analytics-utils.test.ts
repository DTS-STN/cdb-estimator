import type { Mock, MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as adobeAnalytics from '~/utils/adobe-analytics-utils';

describe('adobe-analytics-utils', () => {
  it.each([
    {
      config: {
        ADOBE_ANALYTICS_ENABLED: true,
        ADOBE_ANALYTICS_CUSTOM_CLICK_PREFIX: 'ESDC-EDSC_CDB-PCH',
      },
      input: 'foo',
      output: 'ESDC-EDSC_CDB-PCH:foo',
    },
    {
      config: {
        ADOBE_ANALYTICS_ENABLED: false,
        ADOBE_ANALYTICS_CUSTOM_CLICK_PREFIX: 'ESDC-EDSC_CDB-PCH',
      },
      input: 'foo',
      output: undefined,
    },
  ])('getCustomClick should return the correct value given a config/input', ({ config, input, output }) => {
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ...config,
    };
    const result = adobeAnalytics.getCustomClick(input);
    expect(result).toBe(output);
  });

  it.each([
    {
      config: {
        ADOBE_ANALYTICS_ENABLED: true,
      },

      output: true,
    },
    {
      config: {
        ADOBE_ANALYTICS_ENABLED: false,
      },

      output: false,
    },
  ])('isEnabled() should return the true or false based on config', ({ config, output }) => {
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ...config,
    };
    const result = adobeAnalytics.isEnabled();
    expect(result).toBe(output);
  });

  it.each([
    {
      config: {
        ADOBE_ANALYTICS_DEBUG: true,
      },

      output: true,
    },
    {
      config: {
        ADOBE_ANALYTICS_DEBUG: false,
      },

      output: false,
    },
  ])('isDebug() should return the true or false based on config', ({ config, output }) => {
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ...config,
    };
    const result = adobeAnalytics.isDebug();
    expect(result).toBe(output);
  });
  it.each([
    { input: {}, output: '' },
    { input: { a: '1' }, output: 'a-1' },
    { input: { a: '1', b: '2' }, output: 'a-1|b-2' },
    { input: { 'a-b': '1' }, output: 'a_b-1' },
    { input: { a: '1-2' }, output: 'a-1_2' },
    { input: { 'a': '1-2', 'b-c': '1-2-3' }, output: 'a-1_2|b_c-1_2_3' },
    { input: { 'a|b': '1' }, output: 'a_b-1' },
    { input: { a: '1|2' }, output: 'a-1_2' },
    { input: { 'a-|b': '1|2-3', 'c': 'def' }, output: 'a__b-1_2_3|c-def' },
  ])('getRouteParamsString should return the correct value', ({ input, output }) => {
    const result = adobeAnalytics.getRouteParamsString(input);
    expect(result).toBe(output);
  });
});

describe('pushErrorEvent', () => {
  let mockPush: Mock; // Use Vitest's Mock type
  let warnSpy: MockInstance; // Use Vitest's SpyInstance type
  let debugSpy: MockInstance; // Use Vitest's SpyInstance type

  beforeEach(() => {
    mockPush = vi.fn();

    // Spy on console methods using vi.spyOn()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    // Default setup:
    vi.stubGlobal('window', { adobeDataLayer: { push: mockPush } });
  });

  afterEach(() => {
    // Restore original properties and spies after each test
    warnSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('should log a warning and return if window.adobeDataLayer is not defined', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };
    vi.stubGlobal('window', { adobeDataLayer: undefined });

    // Act
    adobeAnalytics.pushErrorEvent(404);

    // Assert
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('window.adobeDataLayer is not defined'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('should not call push if window.adobeDataLayer exists but push is not defined', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };

    vi.stubGlobal('window', { adobeDataLayer: { push: undefined } });

    // Act
    adobeAnalytics.pushErrorEvent(404);

    // Assert
    expect(warnSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('should not log debug message if isDebug returns false', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };

    // Act
    adobeAnalytics.pushErrorEvent(404);

    // Assert
    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should log debug message if isDebug returns true', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: true,
    };

    // Act
    adobeAnalytics.pushErrorEvent(500);

    // Assert
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith('Pushing error event to Adobe Data Layer:', 500);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it.each([[403 as const], [404 as const], [500 as const]])(
    'should push the correct error event payload for status code %p',
    (statusCode) => {
      // Arrange
      globalThis.__appEnvironment = {
        ...globalThis.__appEnvironment,
        ADOBE_ANALYTICS_DEBUG: false,
      };
      // Act
      adobeAnalytics.pushErrorEvent(statusCode);

      // Assert
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith({
        event: 'error',
        error: { name: `${statusCode}` },
      });
      expect(warnSpy).not.toHaveBeenCalled();
    },
  );

  it.each([[403 as const], [404 as const], [500 as const]])(
    'should push correct payload and log debug when isDebug is true for status %p',
    (statusCode) => {
      // Arrange
      globalThis.__appEnvironment = {
        ...globalThis.__appEnvironment,
        ADOBE_ANALYTICS_DEBUG: true,
      };

      // Act
      adobeAnalytics.pushErrorEvent(statusCode);

      // Assert
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith({
        event: 'error',
        error: { name: `${statusCode}` },
      });
      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(debugSpy).toHaveBeenCalledWith('Pushing error event to Adobe Data Layer:', statusCode);
      expect(warnSpy).not.toHaveBeenCalled();
    },
  );
});

describe('pushPageviewEvent', () => {
  let mockPush: Mock; // Use Vitest's Mock type
  let warnSpy: MockInstance; // Use Vitest's SpyInstance type
  let debugSpy: MockInstance; // Use Vitest's SpyInstance type

  beforeEach(() => {
    mockPush = vi.fn();

    // Spy on console methods using vi.spyOn()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    // Default setup:
    vi.stubGlobal('window', { adobeDataLayer: { push: mockPush } });
  });

  afterEach(() => {
    // Restore original properties and spies after each test
    warnSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('should log a warning and return if window.adobeDataLayer is not defined', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };
    vi.stubGlobal('window', { adobeDataLayer: undefined });

    // Act
    adobeAnalytics.pushPageviewEvent('http://localhost/en/', {});

    // Assert
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('window.adobeDataLayer is not defined'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('should not call push if window.adobeDataLayer exists but push is not defined', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };

    vi.stubGlobal('window', { adobeDataLayer: { push: undefined } });

    // Act
    adobeAnalytics.pushPageviewEvent('http://localhost/en/', {});

    // Assert
    expect(warnSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('should not log debug message if isDebug returns false', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };

    // Act
    adobeAnalytics.pushPageviewEvent('http://localhost/en/', {});

    // Assert
    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should log debug message if isDebug returns true', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: true,
    };

    // Act
    adobeAnalytics.pushPageviewEvent('http://localhost/en/', {});

    // Assert
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('Pushing pageLoad event to Adobe Data Layer:'),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it.each([
    { isDebug: false, url: 'http://localhost/en', query: {}, expected: { url: 'localhost/en', id: '' } },
    { isDebug: true, url: 'http://localhost/en', query: {}, expected: { url: 'localhost/en', id: '' } },
    { isDebug: false, url: 'http://localhost/en', query: { foo: 'bar' }, expected: { url: 'localhost/en', id: 'foo-bar' } },
    { isDebug: true, url: 'http://localhost/en', query: { foo: 'bar' }, expected: { url: 'localhost/en', id: 'foo-bar' } },
  ])('should pushPageviewEvent', ({ isDebug, url, query, expected }) => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: isDebug,
    };
    // Act
    adobeAnalytics.pushPageviewEvent(url, query);

    // Assert
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      event: 'pageLoad',
      page: { url: expect.stringContaining(expected.url), id: expect.stringContaining(expected.id) },
    });
    expect(warnSpy).not.toHaveBeenCalled();
    if (isDebug) {
      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(debugSpy).toHaveBeenCalledWith(
        'Pushing pageLoad event to Adobe Data Layer:',
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    }
  });
});

describe('pushPageviewEvent', () => {
  let mockPush: Mock; // Use Vitest's Mock type
  let warnSpy: MockInstance; // Use Vitest's SpyInstance type
  let debugSpy: MockInstance; // Use Vitest's SpyInstance type

  beforeEach(() => {
    mockPush = vi.fn();

    // Spy on console methods using vi.spyOn()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    // Default setup:
    vi.stubGlobal('window', { adobeDataLayer: { push: mockPush } });
  });

  afterEach(() => {
    // Restore original properties and spies after each test
    warnSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('should log a warning and return if window.adobeDataLayer is not defined', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };
    vi.stubGlobal('window', { adobeDataLayer: undefined });

    // Act
    adobeAnalytics.pushPageviewEvent('http://localhost/en/', {});

    // Assert
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('window.adobeDataLayer is not defined'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('should not call push if window.adobeDataLayer exists but push is not defined', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };

    vi.stubGlobal('window', { adobeDataLayer: { push: undefined } });

    // Act
    adobeAnalytics.pushPageviewEvent('http://localhost/en/', {});

    // Assert
    expect(warnSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('should not log debug message if isDebug returns false', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };

    // Act
    adobeAnalytics.pushPageviewEvent('http://localhost/en/', {});

    // Assert
    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should log debug message if isDebug returns true', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: true,
    };

    // Act
    adobeAnalytics.pushPageviewEvent('http://localhost/en/', {});

    // Assert
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('Pushing pageLoad event to Adobe Data Layer:'),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it.each([
    { isDebug: false, url: 'http://localhost/en', query: {}, expected: { url: 'localhost/en', id: '' } },
    { isDebug: true, url: 'http://localhost/en', query: {}, expected: { url: 'localhost/en', id: '' } },
    { isDebug: false, url: 'http://localhost/en', query: { foo: 'bar' }, expected: { url: 'localhost/en', id: 'foo-bar' } },
    { isDebug: true, url: 'http://localhost/en', query: { foo: 'bar' }, expected: { url: 'localhost/en', id: 'foo-bar' } },
  ])('should pushPageviewEvent', ({ isDebug, url, query, expected }) => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: isDebug,
    };
    // Act
    adobeAnalytics.pushPageviewEvent(url, query);

    // Assert
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      event: 'pageLoad',
      page: { url: expect.stringContaining(expected.url), id: expect.stringContaining(expected.id) },
    });
    expect(warnSpy).not.toHaveBeenCalled();
    if (isDebug) {
      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(debugSpy).toHaveBeenCalledWith(
        'Pushing pageLoad event to Adobe Data Layer:',
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    }
  });
});

describe('pushValidationErrorEvent', () => {
  let mockPush: Mock; // Use Vitest's Mock type
  let warnSpy: MockInstance; // Use Vitest's SpyInstance type
  let debugSpy: MockInstance; // Use Vitest's SpyInstance type

  beforeEach(() => {
    mockPush = vi.fn();

    // Spy on console methods using vi.spyOn()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    // Default setup:
    vi.stubGlobal('window', { adobeDataLayer: { push: mockPush } });
  });

  afterEach(() => {
    // Restore original properties and spies after each test
    warnSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('should log a warning and return if window.adobeDataLayer is not defined', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };
    vi.stubGlobal('window', { adobeDataLayer: undefined });

    // Act
    adobeAnalytics.pushValidationErrorEvent(['foo']);

    // Assert
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('window.adobeDataLayer is not defined'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('should not call push if window.adobeDataLayer exists but push is not defined', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };

    vi.stubGlobal('window', { adobeDataLayer: { push: undefined } });

    // Act
    adobeAnalytics.pushValidationErrorEvent(['foo']);

    // Assert
    expect(warnSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('should not log debug message if isDebug returns false', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: false,
    };

    // Act
    adobeAnalytics.pushValidationErrorEvent(['foo']);

    // Assert
    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should log debug message if isDebug returns true', () => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: true,
    };

    // Act
    adobeAnalytics.pushValidationErrorEvent(['foo']);

    // Assert
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('Pushing error event to Adobe Data Layer:'),
      expect.stringContaining('foo'),
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it.each([{ isDebug: false, ids: ['foo'], expected: { ids: 'foo' } }])('should push', ({ isDebug, ids, expected }) => {
    // Arrange
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ADOBE_ANALYTICS_DEBUG: isDebug,
    };
    // Act
    adobeAnalytics.pushValidationErrorEvent(ids);

    // Assert
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      event: 'error',
      error: { name: expect.stringContaining(expected.ids) },
    });
    expect(warnSpy).not.toHaveBeenCalled();
    if (isDebug) {
      expect(debugSpy).toHaveBeenCalledTimes(1);
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining('Pushing error event to Adobe Data Layer:'),
        expect.anything(),
      );
    }
  });
});
