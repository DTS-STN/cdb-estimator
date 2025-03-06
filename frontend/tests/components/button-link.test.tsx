import { createRoutesStub } from 'react-router';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ButtonLink } from '~/components/button-link';

describe('ButtonLink', () => {
  it('should render a ButtonLink with default styles', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr',
        Component: () => <ButtonLink file="routes/index.tsx">Test ButtonLink</ButtonLink>,
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render a ButtonLink with custom styles', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr',
        Component: () => (
          <ButtonLink className="text-red-500" file="routes/index.tsx" size="sm" variant="primary">
            Test ButtonLink
          </ButtonLink>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render a disabled ButtonLink correctly', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr',
        Component: () => (
          <ButtonLink disabled file="routes/index.tsx" pill={true}>
            Test ButtonLink
          </ButtonLink>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render a pill ButtonLink correctly', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr',
        Component: () => (
          <ButtonLink file="routes/index.tsx" pill={true}>
            Test ButtonLink
          </ButtonLink>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr']} />);
    expect(container).toMatchSnapshot('expected html');
  });
});
