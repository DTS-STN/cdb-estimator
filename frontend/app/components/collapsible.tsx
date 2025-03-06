import { useId } from 'react';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '~/utils/tailwind-utils';

export type CollapsibleSummaryProps = ComponentProps<'summary'>;

export function CollapsibleSummary({ children, className, ...props }: CollapsibleSummaryProps) {
  return (
    <summary className={cn('marker:cursor-pointer hover:text-blue-800', className)} {...props}>
      <div className="ml-2 inline-block text-lg font-medium text-slate-950 underline hover:cursor-pointer">{children}</div>
    </summary>
  );
}

export interface CollapsibleProps extends ComponentProps<'details'> {
  contentClassName?: string;
  summary: ReactNode;
}

export function Collapsible({ children, contentClassName, id, summary, ...props }: CollapsibleProps) {
  const uniqueId = useId();
  const summaryId = `${id ?? uniqueId}-summary`;
  const contentId = `${id ?? uniqueId}-content`;
  return (
    <details id={id ?? uniqueId} {...props} className="my-2">
      <CollapsibleSummary id={summaryId}>{summary}</CollapsibleSummary>
      <div id={contentId} className={cn('my-2 border-l-[2px] border-slate-950 px-6 text-lg', contentClassName)}>
        {children}
      </div>
    </details>
  );
}
