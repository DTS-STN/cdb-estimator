import * as v from 'valibot';

// Default breadcrumbs object
export const defaults = {
  BREADCRUMBS: JSON.stringify([
    {
      label: { en: 'Canada.ca', fr: 'Canada.ca' },
      url: { en: 'https://www.canada.ca/en.html', fr: 'https://www.canada.ca/fr.html' },
    },
    {
      label: { en: 'Benefits', fr: 'Prestations' },
      url: { en: 'https://www.canada.ca/en/services/benefits.html', fr: 'https://www.canada.ca/fr/services/prestations.html' },
    },
    {
      label: { en: 'Disability benefits', fr: "Prestations d'invalidité" },
      url: {
        en: 'https://www.canada.ca/en/services/benefits/disability.html',
        fr: 'https://www.canada.ca/fr/services/prestations/handicap.html',
      },
    },
    {
      label: { en: 'Canada Disability Benefit', fr: 'Prestation canadienne pour les personnes handicapées' },
      url: {
        en: 'https://www.canada.ca/en/services/benefits/disability/canada-disability-benefit.html',
        fr: 'https://www.canada.ca/fr/services/prestations/handicap/prestation-canadienne-personnes-situation-handicap.html',
      },
    },
  ] as BreadcrumbItem[]),
} as const;

export interface BreadcrumbItem {
  label: {
    en: string;
    fr: string;
  };
  url: {
    en: string;
    fr: string;
  };
}

// Define schema for a single breadcrumb item
const BreadcrumbSchema = v.object({
  label: v.object({
    en: v.string(),
    fr: v.string(),
  }),
  url: v.object({
    en: v.string(),
    fr: v.string(),
  }),
});

// Define schema for the environment variable
export const breadcrumbs = v.object({
  BREADCRUMBS: v.optional(stringToBreadcrumbsSchema(), defaults.BREADCRUMBS),
});

export type Breadcrumbs = Readonly<v.InferOutput<typeof breadcrumbs>>;

export function stringToBreadcrumbsSchema(): v.GenericSchema<string, BreadcrumbItem[]> {
  return v.pipe(
    v.string(),
    v.transform((raw: string) => {
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error('Invalid JSON in BREADCRUMBS');
      }
    }),
    v.array(BreadcrumbSchema), // Ensures it's an array of valid breadcrumb objects
  );
}
