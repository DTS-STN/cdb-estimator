import { Outlet } from 'react-router';
import type { RouteHandle } from 'react-router';

import { handle as parentHandle } from '../layout';

export const handle = {
  breadcrumbs: [
    ...parentHandle.breadcrumbs,
    { labelKey: 'estimator:index.breadcrumb', destinationRoute: { file: 'routes/index.tsx' } },
  ],
  i18nNamespace: ['common', 'estimator'],
} as const satisfies RouteHandle;

export default function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}
