import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Collapsible } from '~/components/collapsible';

describe('Collapsible', () => {
  it.each([
    { open: true, childNode: <div>test</div>, summaryNode: <div>summary</div> },
    { open: false, childNode: <div>test</div>, summaryNode: <div>summary</div> },
  ])('should render open: $open', ({ open, childNode, summaryNode }) => {
    const { container } = render(
      <Collapsible open={open} summary={summaryNode}>
        {childNode}
      </Collapsible>,
    );

    expect(container).toMatchSnapshot('expected html');
  });
});
