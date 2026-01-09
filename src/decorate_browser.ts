/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Browser as PlayWrightBrowser, BrowserContextOptions } from 'playwright'

import { decoratePage } from './decorate_page.js'
import { decorateContext } from './decorate_context.js'
import type { Decorator, PluginConfig } from './types/main.js'

/**
 * Decorates the browser by re-writing "newContext" and "newPage"
 * methods and making them pass through custom decorators.
 *
 * This ensures that all pages and contexts created from the browser
 * instance are automatically decorated with custom methods.
 *
 * @param browser - The Playwright browser instance to decorate
 * @param decorators - Array of decorators to apply
 * @param config - Plugin configuration options
 *
 * @example
 * ```ts
 * const decoratedBrowser = decorateBrowser(
 *   browser,
 *   [addAssertions, addPauseMethods],
 *   { assertions: { timeout: 10000 } }
 * )
 * ```
 */
export function decorateBrowser(
  browser: PlayWrightBrowser,
  decorators: Decorator[],
  config: PluginConfig = {}
): PlayWrightBrowser {
  const originalNewContext: typeof browser.newContext = browser.newContext.bind(browser)
  const originalNewPage: typeof browser.newPage = browser.newPage.bind(browser)

  browser.newContext = async function (options?: BrowserContextOptions) {
    const context = await originalNewContext(options)
    return decorateContext(context, decorators, config)
  }

  browser.newPage = async function (...args: Parameters<typeof browser.newPage>) {
    const page = await originalNewPage(...args)
    return decoratePage(page, page.context(), decorators, config)
  }

  return browser
}
