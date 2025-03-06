import { Outlet } from 'react-router';
import type { RouteHandle } from 'react-router';

export const handle = {
  i18nNamespace: ['gcweb', 'public', 'estimator'],
} as const satisfies RouteHandle;

export default function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}
