import * as adobeAnalytics from '~/utils/adobe-analytics-utils';

export function AdobeAnalyticsHeadScript() {
  const { ADOBE_ANALYTICS_JQUERY_SRC, ADOBE_ANALYTICS_SRC } = globalThis.__appEnvironment;

  if (adobeAnalytics.isEnabled()) {
    return (
      <>
        <script src={ADOBE_ANALYTICS_JQUERY_SRC} />
        <script src={ADOBE_ANALYTICS_SRC} />
      </>
    );
  }
  return <></>;
}

export function AdobeAnalyticsBottomScript() {
  if (adobeAnalytics.isEnabled() && adobeAnalytics.isDebug()) {
    return <script id="gc-analytics-bottom-script">_satellite.setDebug(true);</script>;
  }
  return <></>;
}
