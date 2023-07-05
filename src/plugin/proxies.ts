/*
 * @japa/browser-client
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * A proxy instance to raise meaningful error when browser
 * is accessed from a suite that is not running a browser.
 */
export class BrowserProxy {
  constructor(suite: string) {
    return new Proxy(this, {
      get(_, property) {
        throw new Error(
          `Cannot access "browser.${String(
            property
          )}". The browser is not configured to run for "${suite}" tests`
        )
      },
    })
  }
}

/**
 * A proxy instance to raise meaningful error when browser context
 * is accessed from a suite that is not running a browser.
 */
export class BrowserContextProxy {
  constructor(suite: string) {
    return new Proxy(this, {
      get(_, property) {
        throw new Error(
          `Cannot access "browserContext.${String(
            property
          )}". The browser is not configured to run for "${suite}" tests`
        )
      },
    })
  }
}
