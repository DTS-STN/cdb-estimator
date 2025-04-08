import { useEffect, useState } from 'react';

import * as adobeAnalytics from '~/utils/adobe-analytics-utils';

export interface UseAdobeAnalyticsProps {
  url: URL;
  params: Record<string, string | undefined>;
}

export function usePushPageviewEvent(pathname: string, params: Record<string, string | undefined>) {
  const [previousUrl, setPreviousUrl] = useState<URL>();
  useEffect(() => {
    if (adobeAnalytics.isEnabled()) {
      const locationUrl = new URL(pathname, origin);
      if (locationUrl.href !== previousUrl?.href) {
        adobeAnalytics.pushPageviewEvent(locationUrl, params);
        setPreviousUrl(locationUrl);
      }
    }
  }, [pathname, params]);
}
