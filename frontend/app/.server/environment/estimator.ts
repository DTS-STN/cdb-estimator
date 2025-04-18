import * as v from 'valibot';

// Default estimator configuration object
export const defaults = {
  ESTIMATOR_CDB_CONTACT_URL_EN: undefined,
  ESTIMATOR_CDB_CONTACT_URL_FR: undefined,
  ESTIMATOR_CDB_URL_EN: 'https://www.canada.ca/en/services/benefits/disability/canada-disability-benefit.html',
  ESTIMATOR_CDB_URL_FR:
    'https://www.canada.ca/fr/services/prestations/handicap/prestation-canadienne-personnes-situation-handicap.html',
  ESTIMATOR_CDB_ELIGIBILITY_URL_EN: 'https://www.canada.ca/en/services/benefits/disability/canada-disability-benefit.html', //TODO: this is a placeholder
  ESTIMATOR_CDB_ELIGIBILITY_URL_FR:
    'https://www.canada.ca/fr/services/prestations/handicap/prestation-canadienne-personnes-situation-handicap.html', //TODO: this is a placeholder
  ESTIMATOR_CDB_APPLY_URL_EN: 'https://www.canada.ca/en/services/benefits/disability/canada-disability-benefit.html', //TODO: this is a placeholder
  ESTIMATOR_CDB_APPLY_URL_FR:
    'https://www.canada.ca/fr/services/prestations/handicap/prestation-canadienne-personnes-situation-handicap.html', //TODO: this is a placeholder
  ESTIMATOR_INFLATION_FACTOR: '1',
  ESTIMATOR_SINGLE_WORKING_INCOME_EXEMPTION: '10000',
  ESTIMATOR_COUPLE_WORKING_INCOME_EXCEPTION: '14000',
  ESTIMATOR_COUPLE_THRESHOLD: '32500',
  ESTIMATOR_SINGLE_THRESHOLD: '23000',
  ESTIMATOR_YEARLY_MAX_BENEFITS: '2400',
  ESTIMATOR_BENEFIT_REDUCTION_RATE: '0.2',
  ESTIMATOR_SPLIT_BENEFIT_REDUCTION_RATE: '0.1',
} as const;

// Define schema for the environment variable
export const estimator = v.object({
  /**
   * Canada Disability Benefit english contact URL
   */
  ESTIMATOR_CDB_CONTACT_URL_EN: v.optional(stringAsUrl(), defaults.ESTIMATOR_CDB_CONTACT_URL_EN),
  /**
   * Canada Disability Benefit english contact URL
   */
  ESTIMATOR_CDB_CONTACT_URL_FR: v.optional(stringAsUrl(), defaults.ESTIMATOR_CDB_CONTACT_URL_FR),

  /**
   * Canada Disability Benefit landing page url (en)
   */
  ESTIMATOR_CDB_URL_EN: v.optional(stringAsUrl(), defaults.ESTIMATOR_CDB_URL_EN),
  /**
   * Canada Disability Benefit landing page url (fr)
   */
  ESTIMATOR_CDB_URL_FR: v.optional(stringAsUrl(), defaults.ESTIMATOR_CDB_URL_FR),
  /**
   * Canada Disability Benefit eligibility requirements url (en)
   */
  ESTIMATOR_CDB_ELIGIBILITY_URL_EN: v.optional(stringAsUrl(), defaults.ESTIMATOR_CDB_ELIGIBILITY_URL_EN),
  /**
   * Canada Disability Benefit eligibility requirements url (fr)
   */
  ESTIMATOR_CDB_ELIGIBILITY_URL_FR: v.optional(stringAsUrl(), defaults.ESTIMATOR_CDB_ELIGIBILITY_URL_FR),
  /**
   * Canada Disability Benefit application url (en)
   */
  ESTIMATOR_CDB_APPLY_URL_EN: v.optional(stringAsUrl(), defaults.ESTIMATOR_CDB_APPLY_URL_EN),
  /**
   * Canada Disability Benefit application url (fr)
   */
  ESTIMATOR_CDB_APPLY_URL_FR: v.optional(stringAsUrl(), defaults.ESTIMATOR_CDB_APPLY_URL_FR),

  /**
   * Reflects inflation as a part of the calculation
   */
  ESTIMATOR_INFLATION_FACTOR: v.optional(stringToNumberSchema(), defaults.ESTIMATOR_INFLATION_FACTOR),
  /**
   * Amount of working income that is excluded when calculating the benefit amount
   */
  ESTIMATOR_SINGLE_WORKING_INCOME_EXEMPTION: v.optional(
    stringToNumberSchema(),
    defaults.ESTIMATOR_SINGLE_WORKING_INCOME_EXEMPTION,
  ),
  /**
   * Amount of working income that is excluded when calculating the benefit amount
   */
  ESTIMATOR_COUPLE_WORKING_INCOME_EXCEPTION: v.optional(
    stringToNumberSchema(),
    defaults.ESTIMATOR_COUPLE_WORKING_INCOME_EXCEPTION,
  ),
  /**
   * Maximum amount of (couple) income before the benefit amount is reduced
   */
  ESTIMATOR_COUPLE_THRESHOLD: v.optional(stringToNumberSchema(), defaults.ESTIMATOR_COUPLE_THRESHOLD), //test
  /**
   * Maximum amount of income before the benefit amount is reduced
   */
  ESTIMATOR_SINGLE_THRESHOLD: v.optional(stringToNumberSchema(), defaults.ESTIMATOR_SINGLE_THRESHOLD),
  /**
   * Maximum yearly benefit
   */
  ESTIMATOR_YEARLY_MAX_BENEFITS: v.optional(stringToNumberSchema(), defaults.ESTIMATOR_YEARLY_MAX_BENEFITS),
  /**
   * Benefit reduction rate
   */
  ESTIMATOR_BENEFIT_REDUCTION_RATE: v.optional(stringToNumberSchema(), defaults.ESTIMATOR_BENEFIT_REDUCTION_RATE),
  /**
   * Benefit reduction rate (split)
   */
  ESTIMATOR_SPLIT_BENEFIT_REDUCTION_RATE: v.optional(stringToNumberSchema(), defaults.ESTIMATOR_SPLIT_BENEFIT_REDUCTION_RATE),
});

export type Estimator = Readonly<v.InferOutput<typeof estimator>>;

export function stringToNumberSchema(): v.GenericSchema<string, number> {
  return v.pipe(v.string(), v.transform(Number));
}

export function stringAsUrl(): v.GenericSchema<string, string> {
  return v.pipe(v.string(), v.url('must be a valid url'));
}
