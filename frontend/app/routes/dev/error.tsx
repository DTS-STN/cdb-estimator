import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';

/**
 * An error route that can be used to test error boundaries.
 */
export default function Error() {
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'dev') {
    throw new Response('Forbidden', { status: 403 });
  }
  throw new AppError('This is a test error', ErrorCodes.TEST_ERROR_CODE);
}
