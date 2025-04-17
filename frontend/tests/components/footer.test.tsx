import { render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Footer } from '~/components/footer';

describe('Footer', () => {
  afterEach(() => {
    vi.mocked(useTranslation).mockReset();
  });

  it('should render footer', () => {
    const { container } = render(<Footer />);
    expect(container).toMatchSnapshot('expected html');
  });
});
