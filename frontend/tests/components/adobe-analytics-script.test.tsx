import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdobeAnalyticsBottomScript, AdobeAnalyticsHeadScript } from '~/components/adobe-analytics-script';

describe('AdobeAnalytics', () => {
  describe.skip('AdobeAnalyticsBottomScript', () => {
    it.each([
      {
        config: {
          ADOBE_ANALYTICS_ENABLED: true,
          ADOBE_ANALYTICS_DEBUG: true,
        },
      },
      {
        config: {
          ADOBE_ANALYTICS_ENABLED: true,
          ADOBE_ANALYTICS_DEBUG: false,
        },
      },
      {
        config: {
          ADOBE_ANALYTICS_ENABLED: false,
          ADOBE_ANALYTICS_DEBUG: false,
        },
      },
    ])('AdobeAnalyticsBottomScript should render the correct script tag based on config', ({ config }) => {
      globalThis.__appEnvironment = {
        ...globalThis.__appEnvironment,
        ...config,
      };
      const { container } = render(<AdobeAnalyticsBottomScript />);
      expect(container).toMatchSnapshot('expected html');
    });
  });

  describe('AdobeAnalyticsHeadScript', () => {
    it.each([
      {
        config: {
          ADOBE_ANALYTICS_ENABLED: true,
          ADOBE_ANALYTICS_SRC: 'https://assets.adobedtm.com/be5dfd287373/0127575cd23a/launch-913b1beddf7a-staging.min.js',
          ADOBE_ANALYTICS_JQUERY_SRC: 'https://code.jquery.com/jquery-3.7.1.min.js',
        },
      },
      {
        config: {
          ADOBE_ANALYTICS_ENABLED: false,
          ADOBE_ANALYTICS_SRC: 'https://assets.adobedtm.com/be5dfd287373/0127575cd23a/launch-913b1beddf7a-staging.min.js',
          ADOBE_ANALYTICS_JQUERY_SRC: 'https://code.jquery.com/jquery-3.7.1.min.js',
        },
      },
    ])('AdobeAnalyticsHeadScript should render the correct script tag based on config', ({ config }) => {
      globalThis.__appEnvironment = {
        ...globalThis.__appEnvironment,
        ...config,
      };
      const { container } = render(<AdobeAnalyticsHeadScript />);
      expect(container).toMatchSnapshot('expected html');
    });
  });
});
