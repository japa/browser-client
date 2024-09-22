/*
 * @japa/browser-client
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Creates markup for a basic HTML document (to avoid repetition in tests)
 */
export const basicDocument = ({
  title = 'Hello world',
  body = '',
}: { title?: string; body?: string } = {}) => {
  return `
  <html>
    <head>
      <title>${title}</title>
    </head>
    <body>
      ${body}
    </body>
  </html>`
}
