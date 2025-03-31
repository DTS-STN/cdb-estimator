type AdobeDataLayer = { push?: (object: Record<string, string | Record<string, string>>) => void };

declare global {
  interface Window {
    adobeDataLayer?: AdobeDataLayer;
  }
}

/**
 *
 * @param value colon seperated identifier value example: 'Dashboard:NextButton'
 * @returns undefined if AA is not enabled. a string otherwise
 */
export function getCustomClick(value: string) {
  if (!isEnabled()) return undefined;

  const { ADOBE_ANALYTICS_CUSTOM_CLICK_PREFIX } = globalThis.__appEnvironment;
  return `${ADOBE_ANALYTICS_CUSTOM_CLICK_PREFIX}:${value}`;
}

export function isEnabled() {
  const { ADOBE_ANALYTICS_ENABLED } = globalThis.__appEnvironment;
  return ADOBE_ANALYTICS_ENABLED;
}

export function isDebug() {
  const { ADOBE_ANALYTICS_DEBUG } = globalThis.__appEnvironment;
  return ADOBE_ANALYTICS_DEBUG;
}

export const getRouteParamsString = (query: Record<string, string | string[] | undefined>) => {
  return Object.entries(query)
    .map(([key, value]) => {
      const sanitizedValue = Array.isArray(value)
        ? value.map((v) => v.replace(/-/g, '_')).join(',') // Handle arrays
        : value?.replace(/-/g, '_'); // Handle single values

      return `${key}-${sanitizedValue}`;
    })
    .join('|');
};

export function pushErrorEvent(errorStatusCode: 404 | 403 | 500) {
  if (!window.adobeDataLayer) {
    console.warn(
      'window.adobeDataLayer is not defined. This could mean your adobe analytics script has not loaded on the page yet.',
    );
    return;
  }

  if (isDebug()) {
    console.debug('Pushing error event to Adobe Data Layer:', errorStatusCode);
  }

  window.adobeDataLayer.push?.({
    event: 'error',
    error: { name: `${errorStatusCode}` },
  });
}

export function pushPageviewEvent(locationUrl: string | URL, query: Record<string, string | string[] | undefined>) {
  if (!window.adobeDataLayer) {
    console.warn(
      'window.adobeDataLayer is not defined. This could mean your adobe analytics script has not loaded on the page yet.',
    );
    return;
  }

  const locationUrlObj = new URL(locationUrl);
  const url = `${locationUrlObj.host}${locationUrlObj.pathname}`; // We don't keep the search params in the URL if any.
  const pageIds = getRouteParamsString(query);

  if (isDebug()) {
    console.debug('Pushing pageLoad event to Adobe Data Layer:', locationUrlObj, url, pageIds);
  }

  window.adobeDataLayer.push?.({
    event: 'pageLoad',
    page: { url, id: pageIds },
  });
}

export function pushValidationErrorEvent(fielIds: readonly string[]) {
  if (!window.adobeDataLayer) {
    console.warn(
      'window.adobeDataLayer is not defined. This could mean your adobe analytics script has not loaded on the page yet.',
    );
    return;
  }

  const joinedFieldIds = fielIds.join('|');
  const { ADOBE_ANALYTICS_ERROR_NAME } = globalThis.__appEnvironment;
  const errorName = `${ADOBE_ANALYTICS_ERROR_NAME}:${joinedFieldIds}`;

  if (isDebug()) {
    console.debug('Pushing error event to Adobe Data Layer:', errorName);
  }

  window.adobeDataLayer.push?.({
    event: 'error',
    error: {
      // Adobe Analytics accepts a maximum of 255 characters
      name: errorName.slice(0, 255),
    },
  });
}
