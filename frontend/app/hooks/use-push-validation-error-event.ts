import { useEffect } from 'react';

import * as adobeAnalytics from '~/utils/adobe-analytics-utils';

export function usePushValidationErrorEvent(fielIds: readonly string[]) {
  useEffect(() => {
    if (adobeAnalytics.isEnabled() && fielIds.length > 0) {
      adobeAnalytics.pushValidationErrorEvent(fielIds);
    }
  }, [fielIds]);
}
