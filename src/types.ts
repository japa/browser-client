/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Page, BrowserContext, Response, Browser } from '../modules/playwright'

/**
 * Decorators are used to extend the `page`, `context`, and the
 * `response` objects. Since Playwright does not exports classes,
 * we cannot use inheritance and have to decorate objects
 * directly
 */
export type Decorator = {
  page?: (page: Page, context: BrowserContext) => void
  context?: (context: BrowserContext) => void
  response?: (response: Response) => void
}

/**
 * Configuration accepted by the plugin.
 */
export type PluginConfig = {
  /**
   * Custom decorators to apply
   */
  decorators?: Decorator[]

  /**
   * Lazily launch a browser.
   */
  laucher: () => Promise<Browser>

  /**
   * An optional array of suites that will be interacting
   * with the browser. All suites will great a browser
   * context if no specific suites are configured
   */
  runInSuites?: string[]
}
