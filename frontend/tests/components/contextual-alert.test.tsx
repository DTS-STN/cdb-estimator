import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { AlertType } from '~/components/contextual-alert';
import { ContextualAlert } from '~/components/contextual-alert';

describe('ContextualAlert', () => {
  it.each([
    { type: 'warning' as AlertType, className: 'warn-test-css', childNode: <div>test</div> },
    { type: 'success' as AlertType, className: 'succ-test-css', childNode: <div>test</div> },
    { type: 'danger' as AlertType, className: 'dang-test-css', childNode: <div>test</div> },
    { type: 'info' as AlertType, className: 'info-test-css', childNode: <div>test</div> },
    { type: 'comment' as AlertType, className: 'cmnt-test-css', childNode: <div>test</div> },
    { type: 'foo' as AlertType, className: 'foo-test-css', childNode: <div>test</div> },
  ])('should render : $type', ({ type, className, childNode }) => {
    const { container } = render(
      <ContextualAlert type={type} className={className}>
        {childNode}
      </ContextualAlert>,
    );

    expect(container).toMatchSnapshot('expected html');
  });
});
