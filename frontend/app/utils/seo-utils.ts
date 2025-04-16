import { normalizeSpaces } from './string-utils';

/**
 * Generates meta tags for title.
 * @param title - The title to be included in meta tags.
 * @returns An array of meta tag objects.
 */
export function getTitleMetaTags(title: string, dcTermsTitle?: string) {
  const normalizedTitle = normalizeSpaces(title);
  const normalizedDcTermsTitle = dcTermsTitle ? normalizeSpaces(dcTermsTitle) : normalizedTitle;
  // prettier-ignore
  return [
    { title: normalizedTitle },
    { property: 'og:title', content: normalizedTitle },
    { property: 'dcterms.title', content: normalizedDcTermsTitle }
  ];
}

/**
 * Generates meta tags for description.
 * @param description - The description to be included in meta tags.
 * @returns An array of meta tag objects.
 */
export function getDescriptionMetaTags(description: string) {
  const normalizedDescription = normalizeSpaces(description);
  return [
    { name: 'description', content: normalizedDescription },
    { property: 'og:description', content: normalizedDescription },
  ];
}
