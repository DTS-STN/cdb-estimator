import type { Route } from './+types/error';

import { serverEnvironment } from '~/.server/environment';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

export function loader({ context }: Route.LoaderArgs) {
  if (!serverEnvironment.DEV_ENDPOINTS_ENABLED) {
    throw new Response('Forbidden', { status: 403 });
  }
  return;
}

/**
 * An error route that can be used to test error boundaries.
 */
export default function Error() {
  throw new AppError('This is a test error', ErrorCodes.TEST_ERROR_CODE);
}
