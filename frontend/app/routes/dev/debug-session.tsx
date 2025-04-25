import type { Route } from './+types/debug-session';

export function loader({ context }: Route.LoaderArgs) {
  /*if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'dev') {
    throw new Response('Forbidden', { status: 403 });
  }*/
  return Response.json(context.session);
}
