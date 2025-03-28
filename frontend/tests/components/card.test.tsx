import { createRoutesStub } from 'react-router';

import { faUser } from '@fortawesome/free-solid-svg-icons';
import { render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button } from '~/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  CardImage,
  CardTag,
  CardTitle,
} from '~/components/card';
import { AppLink } from '~/components/links';

describe('Card', () => {
  afterEach(() => {
    vi.mocked(useTranslation).mockReset();
  });

  it('should render a card', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Test Card</CardDescription>
        </CardHeader>
      </Card>,
    );
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render a card with a link', () => {
    const translation = useTranslation();
    vi.mocked(useTranslation).mockReturnValue({ ...translation, i18n: { ...translation.i18n, language: 'fr' } });

    const RoutesStub = createRoutesStub([
      {
        path: '/fr',
        Component: () => (
          <Card asChild>
            <AppLink file="routes/index.tsx">
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Test Card</CardDescription>
              </CardHeader>
            </AppLink>
          </Card>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render a card with a link with an image', () => {
    const translation = useTranslation();
    vi.mocked(useTranslation).mockReturnValue({ ...translation, i18n: { ...translation.i18n, language: 'fr' } });

    const RoutesStub = createRoutesStub([
      {
        path: '/fr',
        Component: () => (
          <Card asChild>
            <AppLink file="routes/index.tsx">
              <CardImage src="https://www.canada.ca/content/dam/canada/activities/20250115-1-520x200.jpg" />
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Test Card</CardDescription>
              </CardHeader>
              <CardFooter>
                <CardTag>Coming soon</CardTag>
              </CardFooter>
            </AppLink>
          </Card>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render a card with a link with an icon', () => {
    const translation = useTranslation();
    vi.mocked(useTranslation).mockReturnValue({ ...translation, i18n: { ...translation.i18n, language: 'fr' } });

    const RoutesStub = createRoutesStub([
      {
        path: '/fr',
        Component: () => (
          <Card>
            <div className="flex items-center gap-4 p-6">
              <CardIcon icon={faUser} />
              <CardHeader className="p-0">
                <CardTitle asChild>
                  <h2>Card Title</h2>
                </CardTitle>
                <CardDescription>Test Card</CardDescription>
              </CardHeader>
            </div>
          </Card>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr']} />);
    expect(container).toMatchSnapshot('expected html');
  });

  it('should render a card with a link with an icon, content, footer with button and heading2', () => {
    const translation = useTranslation();
    vi.mocked(useTranslation).mockReturnValue({ ...translation, i18n: { ...translation.i18n, language: 'fr' } });

    const RoutesStub = createRoutesStub([
      {
        path: '/fr',
        Component: () => (
          <Card>
            <div className="flex items-center gap-4 p-6">
              <CardIcon icon={faUser} />
              <CardHeader className="p-0">
                <CardTitle asChild>
                  <h2>Card Title</h2>
                </CardTitle>
                <CardDescription>Test Card</CardDescription>
              </CardHeader>
            </div>
            <CardContent className="space-y-3">
              <p>Card content part 1</p>
              <p>Card content part 2</p>
            </CardContent>
            <CardFooter>
              <Button>Click me</Button>
            </CardFooter>
          </Card>
        ),
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={['/fr']} />);
    expect(container).toMatchSnapshot('expected html');
  });
});
