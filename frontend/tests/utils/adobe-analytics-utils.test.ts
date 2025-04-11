import { describe, expect, it } from 'vitest';

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
});
