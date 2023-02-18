/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  Page,
  Browser,
  Response,
  BrowserContext,
  BrowserContextOptions,
  LaunchOptions,
} from '../modules/playwright'

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
 * Options for the visit method
 */
export type VisitOptions = Exclude<Parameters<Page['goto']>[1], undefined>

/**
 * Configuration accepted by the plugin.
 */
export type PluginConfig = {
  /**
   * Control automatic tracing of tests
   */
  tracing?: {
    enabled: boolean
    event: 'onError' | 'onTest'
  }

  /**
   * Options for the context created for every test
   */
  contextOptions?: BrowserContextOptions

  /**
   * Custom decorators to apply
   */
  decorators?: Decorator[]

  /**
   * Lazily launch a browser.
   */
  launcher?: (config: Pick<LaunchOptions, 'headless' | 'slowMo' | 'devtools'>) => Promise<Browser>

  /**
   * An optional array of suites that will be interacting
   * with the browser. All suites will great a browser
   * context if no specific suites are configured
   */
  runInSuites?: string[]
}
