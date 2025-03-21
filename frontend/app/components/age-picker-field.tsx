import { Fragment, useState } from 'react';
import type { ChangeEvent, JSX, ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { InputError } from '~/components/input-error';
import { InputHelp } from '~/components/input-help';
import { InputLabel } from '~/components/input-label';
import { InputLegend } from '~/components/input-legend';
import { useLanguage } from '~/hooks/use-language';
import { calculateAge } from '~/utils/age-utils';
import { getLocalizedMonths } from '~/utils/date-utils';
import { cn } from '~/utils/tailwind-utils';

type DatePart = 'year' | 'month';

type AriaErrorMessage = Readonly<Record<DatePart, string | undefined>>;

/**
 * Order of date parts based on language
 */
const DATE_PART_ORDER = {
  en: ['month', 'year'] as const,
  fr: ['month', 'year'] as const,
} as const satisfies Record<Language, DatePart[]>;

const inputStyles = {
  base: 'rounded-lg border-gray-500 focus:border-blue-500 focus:ring-blue-500 block focus:ring focus:outline-none',
  disabled: 'disabled:bg-gray-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
} as const;

/**
 * Props for the AgePickerField component
 */
export interface AgePickerFieldProps {
  defaultValues?: {
    year?: number;
    month?: number;
  };
  disabled?: boolean;
  displayAge?: boolean;
  errorMessages?: {
    all?: string;
    month?: string;
    year?: string;
  };
  helpMessagePrimary?: React.ReactNode;
  helpMessagePrimaryClassName?: string;
  helpMessageSecondary?: React.ReactNode;
  helpMessageSecondaryClassName?: string;
  id: string;
  legend: ReactNode;
  names: {
    month: string;
    year: string;
  };
  required?: boolean;
}

/**
 * AgePickerField component
 *
 * @param props - Props for the AgePickerField component
 * @returns JSX.Element
 */
export const AgePickerField = ({
  defaultValues,
  disabled,
  displayAge,
  errorMessages,
  helpMessagePrimary,
  helpMessagePrimaryClassName,
  helpMessageSecondary,
  helpMessageSecondaryClassName,
  id,
  legend,
  names,
  required,
}: AgePickerFieldProps): JSX.Element => {
  const { t } = useTranslation(['common', 'estimator']);
  const { currentLanguage = 'en' } = useLanguage(); // english by default
  const currentDatePartOrder = DATE_PART_ORDER[currentLanguage];

  // Generate unique IDs for accessibility
  const baseId = `age-picker-${id}`;
  const ids = {
    wrapper: baseId,
    legend: `${baseId}-legend`,
    error: {
      all: `${baseId}-error-all`,
      month: `${baseId}-error-month`,
      year: `${baseId}-error-year`,
    },
    help: {
      primary: `${baseId}-help-primary`,
      secondary: `${baseId}-help-secondary`,
    },
  };

  // Combine IDs for aria-describedby attribute
  const ariaDescribedBy: string = [
    ids.legend,
    helpMessagePrimary ? ids.help.primary : false,
    helpMessageSecondary ? ids.help.secondary : false,
  ]
    .filter(Boolean)
    .join(' ');

  // Generate error messages for each date part
  const ariaErrorMessage: AriaErrorMessage = currentDatePartOrder.reduce((acc, datePart) => {
    const errors = [errorMessages?.all ? ids.error.all : false, errorMessages?.[datePart] ? ids.error[datePart] : false]
      .filter(Boolean)
      .join(' ');

    return { ...acc, [datePart]: errors || undefined };
  }, {} as AriaErrorMessage);

  const [month, setMonth] = useState(defaultValues?.month);
  const [year, setYear] = useState(defaultValues?.year);
  const age = month && year && calculateAge(month, year);
  const ageAdditionalInfo = (() => {
    if (age !== undefined) {
      if (age >= 65) return t('estimator:age.max-eligible-age-info');
      else if (age < 18) return t('estimator:age.min-eligible-age-info');
    }
    return undefined;
  })();

  const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event: ChangeEvent<HTMLInputElement>) => {
    setYear(parseInt(event.target.value));
  };

  // Define age picker part fields
  const agePickerPartFields = {
    year: (
      <AgePickerYearField
        id={id}
        defaultValue={year}
        name={names.year}
        label={t('common:age-picker.year.label')}
        className="w-full sm:w-32"
        ariaDescribedBy={ariaDescribedBy}
        ariaErrorMessage={ariaErrorMessage.year}
        onChange={handleYearChange}
        required={required}
        disabled={disabled}
      />
    ),
    month: (
      <AgePickerMonthField
        id={id}
        defaultValue={month}
        name={names.month}
        label={t('common:age-picker.month.label')}
        placeholder={t('common:age-picker.month.placeholder')}
        className="w-full sm:w-auto"
        currentLanguage={currentLanguage}
        ariaDescribedBy={ariaDescribedBy}
        ariaErrorMessage={ariaErrorMessage.month}
        onChange={handleMonthChange}
        required={required}
        disabled={disabled}
      />
    ),
  } as const satisfies Record<DatePart, JSX.Element>;

  return (
    <div id={ids.wrapper}>
      <fieldset className="space-y-2">
        <InputLegend id={ids.legend} required={required}>
          {legend}
        </InputLegend>

        {/* Error Messages */}
        {errorMessages && Object.values(errorMessages).filter(Boolean).length > 0 && (
          <div className="space-y-2">
            {errorMessages.all && <InputError id={ids.error.all}>{errorMessages.all}</InputError>}
            {currentDatePartOrder
              .filter((datePart) => Boolean(errorMessages[datePart]))
              .map((datePart) => (
                <p key={datePart}>
                  <InputError id={ids.error[datePart]}>{errorMessages[datePart]}</InputError>
                </p>
              ))}
          </div>
        )}

        {/* Help Messages - Primary */}
        {helpMessagePrimary && (
          <InputHelp id={ids.help.primary} className={helpMessagePrimaryClassName}>
            {helpMessagePrimary}
          </InputHelp>
        )}

        {/* Date Picker Part Fields */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          {currentDatePartOrder.map((datePart) => (
            <Fragment key={datePart}>{agePickerPartFields[datePart]}</Fragment>
          ))}

          {displayAge === true && age !== undefined && year !== undefined && year > 1000 && year < 9999 && (
            <AgeDisplay age={age} additionalInfo={ageAdditionalInfo} />
          )}
        </div>

        {/* Help Messages - Secondary */}
        {helpMessageSecondary && (
          <InputHelp id={ids.help.secondary} className={helpMessageSecondaryClassName}>
            {helpMessageSecondary}
          </InputHelp>
        )}
      </fieldset>
    </div>
  );
};

/**
 * Props for the AgePickerMonthField component
 */
interface AgePickerMonthFieldProps {
  ariaDescribedBy: string;
  ariaErrorMessage?: string;
  className?: string;
  currentLanguage?: Language;
  defaultValue?: number;
  disabled?: boolean;
  id: string;
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  required?: boolean;
}

/**
 * AgePickerMonthField component
 *
 * @param props - Props for the AgePickerMonthField component
 * @returns JSX.Element
 */
function AgePickerMonthField({
  ariaDescribedBy,
  ariaErrorMessage,
  className,
  currentLanguage,
  defaultValue,
  disabled,
  id,
  label,
  name,
  onChange,
  placeholder,
  required,
}: AgePickerMonthFieldProps): JSX.Element {
  const baseId = `age-picker-${id}-month`;
  const ids = {
    wrapper: baseId,
    label: `${baseId}-label`,
    select: `${baseId}-select`,
    optionUnselected: `${baseId}-option-unselected`,
    option: (monthIndex: number) => `${baseId}-option-${monthIndex}`,
  };
  const hasErrorMessage = !!ariaErrorMessage;
  const months = getLocalizedMonths(currentLanguage ?? 'en');

  return (
    <div id={ids.wrapper} className="space-y-2">
      <InputLabel id={ids.label} htmlFor={ids.select}>
        {label}
      </InputLabel>
      <select
        aria-describedby={ariaDescribedBy}
        aria-errormessage={ariaErrorMessage}
        aria-invalid={hasErrorMessage}
        aria-labelledby={ids.label}
        aria-required={required}
        className={cn(inputStyles.base, inputStyles.disabled, hasErrorMessage && inputStyles.error, className)}
        defaultValue={defaultValue}
        disabled={disabled}
        id={ids.select}
        name={name}
        onChange={onChange}
        required={required}
      >
        <option id={ids.optionUnselected} disabled hidden selected={defaultValue === undefined}>
          {placeholder}
        </option>
        {months.map((month) => {
          return (
            <option id={ids.option(month.value)} key={month.value} value={month.value}>
              {month.text}
            </option>
          );
        })}
      </select>
    </div>
  );
}

/**
 * Props for the AgePickerYearField component
 */
interface AgePickerYearFieldProps {
  ariaDescribedBy: string;
  ariaErrorMessage?: string;
  className?: string;
  defaultValue?: number;
  disabled?: boolean;
  id: string;
  label: string;
  name: string;
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * AgePickerYearField component
 *
 * @param props - Props for the AgePickerYearField component
 * @returns JSX.Element
 */
function AgePickerYearField({
  ariaDescribedBy,
  ariaErrorMessage,
  className,
  defaultValue,
  disabled,
  id,
  label,
  name,
  onChange,
  required,
}: AgePickerYearFieldProps): JSX.Element {
  const baseId = `age-picker-${id}-year`;
  const ids = {
    wrapper: baseId,
    label: `${baseId}-label`,
    input: `${baseId}-input`,
  };
  const hasErrorMessage = !!ariaErrorMessage;

  return (
    <div id={ids.wrapper} className="space-y-2">
      <InputLabel id={ids.label} htmlFor={ids.input}>
        {label}
      </InputLabel>
      <input
        aria-describedby={ariaDescribedBy}
        aria-errormessage={ariaErrorMessage}
        aria-invalid={hasErrorMessage}
        aria-labelledby={ids.label}
        aria-required={required}
        className={cn(inputStyles.base, inputStyles.disabled, hasErrorMessage && inputStyles.error, className)}
        defaultValue={defaultValue}
        disabled={disabled}
        id={ids.input}
        min={1900}
        name={name}
        required={required}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        onChange={onChange}
      />
    </div>
  );
}

/**
 * Props for the AgeDisplay component
 */
interface AgeDisplayProps {
  age: number;
  additionalInfo?: string;
}

/**
 * AgeDisplay component
 *
 * @param props - Props for the AgeDisplay component
 * @returns JSX.Element
 */
function AgeDisplay({ age, additionalInfo }: AgeDisplayProps): JSX.Element {
  const { t } = useTranslation(['common']);

  return (
    <div role="alert" aria-live="assertive" className="space-y-1.5 sm:ml-30">
      <label className="block">
        <span className="font-semibold">{t('age-picker.your-age.label')}</span>
      </label>

      <div className="block max-w-prose">{`${age} ${t(age === 1 ? 'age-picker.your-age.value-suffix-singular' : 'age-picker.your-age.value-suffix-plural')}`}</div>

      <div>{additionalInfo}</div>
    </div>
  );
}
