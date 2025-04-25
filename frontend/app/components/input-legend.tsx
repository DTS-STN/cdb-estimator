import type { ComponentProps, ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { cn } from '~/utils/tailwind-utils';

export interface InputLegendProps extends ComponentProps<'legend'> {
  children: ReactNode;
  required?: boolean;
  showRequired?: boolean;
  showOptional?: boolean;
}

export function InputLegend(props: InputLegendProps) {
  const { t } = useTranslation('common');
  const { children, className, required, showRequired = false, showOptional = true, ...restProps } = props;

  return (
    <legend className={cn('block', className)} {...restProps}>
      <span className="font-semibold">{children}</span>

      {showRequired === true && required === true && (
        // Using a regular space entity (&#32;) to ensure consistent spacing before the required text,
        // preventing accidental collapse or omission in rendering.
        <>
          &#32;<span aria-hidden="true">({t('input-label.required')})</span>
        </>
      )}
      {showOptional === true && required !== true && (
        // Using a regular space entity (&#32;) to ensure consistent spacing before the required text,
        // preventing accidental collapse or omission in rendering.
        <>
          &#32;<span aria-hidden="true">({t('input-label.optional')})</span>
        </>
      )}
    </legend>
  );
}
