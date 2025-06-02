import { useEffect } from 'react';

import * as adobeAnalytics from '~/utils/adobe-analytics-utils';

export function usePushErrorEvent(errorStatusCode: 404 | 403 | 500) {
  useEffect(() => {
    if (adobeAnalytics.isEnabled()) {
      adobeAnalytics.pushErrorEvent(errorStatusCode);
    }
  }, [errorStatusCode]);
}
