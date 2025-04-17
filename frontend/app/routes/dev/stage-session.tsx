import type { Route } from './+types/debug-session';

export async function action({ context, request }: Route.ActionArgs) {
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'dev') {
    throw new Response('Forbidden', { status: 403 });
  }

  const json = await request.json();

  console.dir(json, { depth: null });
  context.session.estimator = json.estimator;
  context.session.formFieldValues = json.formFieldValues;
  return new Response('Session staged', { status: 200 });
}
