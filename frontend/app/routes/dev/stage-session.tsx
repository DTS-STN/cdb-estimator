import type { Route } from './+types/stage-session';

import { serverEnvironment } from '~/.server/environment';

export async function action({ context, request }: Route.ActionArgs) {
  if (!serverEnvironment.DEV_ENDPOINTS_ENABLED) {
    throw new Response('Forbidden', { status: 403 });
  }

  const json = await request.json();

  console.dir(json, { depth: null });
  context.session.estimator = json.estimator;
  context.session.formFieldValues = json.formFieldValues;
  return new Response('Session staged', { status: 200 });
}
