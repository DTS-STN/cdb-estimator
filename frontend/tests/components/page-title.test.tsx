import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageTitle } from '~/components/page-title';

describe('PageTitle', () => {
  it('should render a h1 tag with default styles', () => {
    const { container } = render(<PageTitle>Test Title</PageTitle>);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render a h1 & h2 tag with default styles', () => {
    const { container } = render(<PageTitle subTitle="This is subtitle">Test Title</PageTitle>);
    expect(container).toMatchSnapshot('expected html');
  });
});
