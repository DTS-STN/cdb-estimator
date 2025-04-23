export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export const ErrorCodes = {
  UNCAUGHT_ERROR: 'UNC-0000',

  // component error codes
  MISSING_LANG_PARAM: 'CMP-0001',

  // i18n error codes
  NO_LANGUAGE_FOUND: 'I18N-0001',

  // instance error codes
  NO_FACTORY_PROVIDED: 'INST-0001',

  // route error codes
  ROUTE_NOT_FOUND: 'RTE-0001',

  // dev-only error codes
  TEST_ERROR_CODE: 'DEV-0001',

  // i18n error codes
  MISSING_TRANSLATION_KEY: 'I18N-0001',
} as const;
