import * as v from 'valibot';

// Default estimator configuration object
export const defaults = {
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
