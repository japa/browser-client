/*
 * @japa/browser-client
 *
 * (c) Japa.dev
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
      get(property) {
        throw new Error(
          `Cannot access "browser.${property}". The browser is not configured to run in "${suite}" name`
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
      get(property) {
        throw new Error(
          `Cannot access "browserContext.${property}". The browser is not configured to run in "${suite}" name`
        )
      },
    })
  }
}
