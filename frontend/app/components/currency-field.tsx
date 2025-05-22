import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';

import type { InputFieldProps } from './input-field';
import { InputField } from './input-field';

import { removeNumericFormatting } from '~/utils/string-utils';
import { cn } from '~/utils/tailwind-utils';

export interface CurrencyFieldProps extends Omit<InputFieldProps, 'type' | 'value' | 'defaultValue'> {
  allowNegative?: boolean;
  value?: string | number | null;
  defaultValue?: string | number | null;
}

export function CurrencyField({ allowNegative = false, maxLength, defaultValue, label, ...rest }: CurrencyFieldProps) {
  const { i18n } = useTranslation(['common']);
  const strippedDefaultValue = Number(removeNumericFormatting(defaultValue?.toString()));
  const val = Number.isInteger(strippedDefaultValue) ? strippedDefaultValue : strippedDefaultValue.toFixed(2);

  return (
    <NumericFormat
      customInput={InputField}
      thousandSeparator={i18n.language === 'fr' ? ' ' : ','}
      allowedDecimalSeparators={i18n.language === 'fr' ? [',', '.'] : ['.']}
      allowNegative={allowNegative}
      decimalScale={2}
      decimalSeparator={i18n.language === 'fr' ? ',' : '.'}
      fixedDecimalScale={false}
      thousandsGroupStyle={'thousand'}
      maxLength={maxLength ?? (i18n.language === 'en' ? 15 : 16)}
      type="text"
      beforeInput={
        i18n.language === 'en' ? (
          <span aria-hidden="true" className="mr-1">
            $
          </span>
        ) : undefined
      }
      afterInput={
        i18n.language === 'fr' ? (
          <span aria-hidden="true" className="ml-1">
            $
          </span>
        ) : undefined
      }
      className={cn('inline', rest.className)}
      defaultValue={val}
      label={
        <>
          {label}
          <span className="sr-only"> ($)</span>
        </>
      }
      {...rest}
    />
  );
}
