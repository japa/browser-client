/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { decoratePage } from './page.js'
import type { Decorator } from './types.js'
import { decorateContext } from './context.js'
import type { Browser as PlayWrightBrowser, BrowserContextOptions } from 'playwright'

/**
 * Decorates the browser by re-writing "newContext" and "newPage"
 * methods and making them pass through custom decorators.
 */
export function decorateBrowser(
  browser: PlayWrightBrowser,
  decorators: Decorator[]
): PlayWrightBrowser {
  const originalNewContext: typeof browser.newContext = browser.newContext.bind(browser)
  browser.newContext = async function (options?: BrowserContextOptions) {
    const context = await originalNewContext(options)
    return decorateContext(context, decorators)
  }

  const originalNewPage: typeof browser.newPage = browser.newPage.bind(browser)
  browser.newPage = async function (...args: Parameters<typeof browser.newPage>) {
    const page = await originalNewPage(...args)
    return decoratePage(page, page.context(), decorators)
  }

  return browser
}
