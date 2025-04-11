import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';

import type { InputFieldProps } from './input-field';
import { InputField } from './input-field';

import { cn } from '~/utils/tailwind-utils';

export interface CurrencyFieldProps extends Omit<InputFieldProps, 'type' | 'value' | 'defaultValue'> {
  allowNegative?: boolean;
  value?: string | number | null;
  defaultValue?: string | number | null;
}

export function CurrencyField({ allowNegative = false, maxLength = 15, ...rest }: CurrencyFieldProps) {
  const { i18n } = useTranslation(['common']);
  return (
    <NumericFormat
      customInput={InputField}
      thousandSeparator={i18n.language === 'fr' ? ' ' : ','}
      allowedDecimalSeparators={i18n.language === 'fr' ? [',', '.'] : ['.']}
      allowNegative={allowNegative}
      decimalScale={2}
      decimalSeparator={i18n.language === 'fr' ? ',' : '.'}
      fixedDecimalScale={true}
      thousandsGroupStyle={'thousand'}
      maxLength={maxLength}
      type="text"
      beforeInput={i18n.language === 'en' ? <span className="mr-1">$</span> : undefined}
      afterInput={i18n.language === 'fr' ? <span className="ml-1">$</span> : undefined}
      className={cn('inline', rest.className)}
      {...rest}
    />
  );
}
