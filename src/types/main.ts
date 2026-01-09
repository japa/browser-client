/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  Page,
  Browser,
  Response,
  LaunchOptions,
  BrowserContext,
  BrowserContextOptions,
} from 'playwright'

/**
 * Decorators are used to extend the `page`, `context`, and the
 * `response` objects. Since Playwright does not export classes,
 * we cannot use inheritance and have to decorate objects directly.
 *
 * @example
 * ```ts
 * const myDecorator: Decorator = {
 *   page(page, context, config) {
 *     page.customMethod = function() {
 *       // Implementation
 *     }
 *   },
 *   context(context) {
 *     context.customContextMethod = function() {
 *       // Implementation
 *     }
 *   }
 * }
 * ```
 */
export type Decorator = {
  /**
   * Function to decorate the Playwright page instance
   *
   * @param page - The page instance to decorate
   * @param context - The browser context associated with the page
   * @param config - Plugin configuration
   */
  page?: (page: Page, context: BrowserContext, config: PluginConfig) => void

  /**
   * Function to decorate the Playwright browser context instance
   *
   * @param context - The browser context to decorate
   */
  context?: (context: BrowserContext) => void

  /**
   * Function to decorate the Playwright response instance
   *
   * @param response - The response to decorate
   */
  response?: (response: Response) => void
}

/**
 * Options for the visit method. These are the same options accepted
 * by Playwright's page.goto method.
 */
export type VisitOptions = Exclude<Parameters<Page['goto']>[1], undefined>

/**
 * Configuration accepted by the browser client plugin.
 *
 * @example
 * ```ts
 * const config: PluginConfig = {
 *   tracing: {
 *     enabled: true,
 *     event: 'onError',
 *     cleanOutputDirectory: true,
 *     outputDirectory: './traces'
 *   },
 *   assertions: {
 *     timeout: 10000,
 *     pollIntervals: [100, 250, 500, 1000]
 *   }
 * }
 * ```
 */
export type PluginConfig = {
  /**
   * Control automatic tracing of tests. Traces can be viewed in Playwright's
   * trace viewer for debugging test failures.
   */
  tracing?: {
    /**
     * Whether tracing is enabled
     */
    enabled: boolean

    /**
     * When to capture traces - 'onError' only captures on failures,
     * 'onTest' captures for all tests
     */
    event: 'onError' | 'onTest'

    /**
     * Whether to clean the output directory before running tests
     */
    cleanOutputDirectory: boolean

    /**
     * Directory where trace files will be saved
     */
    outputDirectory: string
  }

  /**
   * Options for the browser context created for every test.
   * These are standard Playwright BrowserContextOptions.
   */
  contextOptions?: BrowserContextOptions

  /**
   * Options for built-in assertions. These control retry behavior
   * for all assertion methods.
   */
  assertions?: {
    /**
     * Maximum time in milliseconds to wait for assertions to pass
     */
    timeout?: number

    /**
     * Array of intervals in milliseconds to wait between retry attempts
     */
    pollIntervals?: number[]
  }

  /**
   * Function to lazily launch a browser. Allows using a custom browser
   * instance or configuration.
   *
   * @param config - Browser launch configuration
   */
  launcher?: (config: Pick<LaunchOptions, 'headless' | 'slowMo' | 'devtools'>) => Promise<Browser>

  /**
   * An optional array of suite names that will interact with the
   * browser. When specified, only these suites will have browser
   * instances created. This is useful for performance when you have
   * mixed test suites.
   */
  runInSuites?: string[]
}
