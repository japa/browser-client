/*
 * @japa/browser-client
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * A proxy instance that raises a meaningful error when the browser
 * is accessed from a suite that is not configured to run a browser.
 *
 * This helps developers identify when they're trying to use browser
 * functionality in tests that don't have browser access.
 *
 * @param suite - The name of the suite attempting to access the browser
 *
 * @example
 * ```ts
 * // In a suite not configured for browser tests
 * test('my test', ({ browser }) => {
 *   browser.newPage() // Throws: Cannot access "browser.newPage"...
 * })
 * ```
 */
export class BrowserProxy {
  constructor(suite: string) {
    return new Proxy(this, {
      get(_, property) {
        throw new Error(
          `Cannot access "browser.${String(
            property
          )}". The browser is not configured to run for "${suite}" suite`
        )
      },
    })
  }
}

/**
 * A proxy instance that raises a meaningful error when the browser context
 * is accessed from a suite that is not configured to run a browser.
 *
 * This helps developers identify when they're trying to use browser context
 * functionality in tests that don't have browser access.
 *
 * @param suite - The name of the suite attempting to access the browser context
 *
 * @example
 * ```ts
 * // In a suite not configured for browser tests
 * test('my test', ({ browserContext }) => {
 *   browserContext.newPage() // Throws: Cannot access "browserContext.newPage"...
 * })
 * ```
 */
export class BrowserContextProxy {
  constructor(suite: string) {
    return new Proxy(this, {
      get(_, property) {
        throw new Error(
          `Cannot access "browserContext.${String(
            property
          )}". The browser is not configured to run for "${suite}" suite`
        )
      },
    })
  }
}
