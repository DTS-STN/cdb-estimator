import prettier from 'prettier';

/**
 * Formats an HTML string using Prettier for consistent snapshotting.
 * @param htmlString The raw HTML string to format.
 * @returns A Promise that resolves with the formatted HTML string.
 */
export async function formatHtml(htmlString: string): Promise<string> {
  try {
    const formattedHtml = await prettier.format(htmlString, { parser: 'html' });

    return formattedHtml;
  } catch (error) {
    if (error instanceof Error) {
      // eslint-disable-next-line unicorn/prefer-type-error
      throw new Error(`❌ Failed to format HTML for snapshot: ${error.message}`, { cause: error });
    }
    throw error;
  }
}
