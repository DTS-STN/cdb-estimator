import type { Route } from './+types/debug-session';

import { serverEnvironment } from '~/.server/environment';

export function loader({ context }: Route.LoaderArgs) {
  if (!serverEnvironment.DEV_ENDPOINTS_ENABLED) {
    throw new Response('Forbidden', { status: 403 });
  }
  return Response.json(context.session);
}
