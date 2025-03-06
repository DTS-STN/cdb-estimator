import { createRoutesStub } from 'react-router';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppBar } from '~/components/app-bar';
import { MenuItem } from '~/components/menu';

describe('AppBar', () => {
  it('should correctly render an AppBar with a MenuItem when the file property is provided', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr',
        Component: () => (
          <AppBar>
            <MenuItem file="routes/index.tsx">This is a test</MenuItem>
          </AppBar>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr']} />);

    expect(container).toMatchSnapshot('expected html');
  });

  it('should correctly render an AppBar with a MenuItem when the to property is provided', () => {
    const RoutesStub = createRoutesStub([
      {
        path: '/fr',
        Component: () => (
          <AppBar>
            <MenuItem to="https://example.com/">This is a test</MenuItem>
          </AppBar>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr']}></RoutesStub>);

    expect(container).toMatchSnapshot('expected html');
  });
});
