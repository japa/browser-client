/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Test, TestContext } from '@japa/runner/core'
import type { Page, Browser as PlayWrightBrowser } from 'playwright'

import debug from '../../debug.js'
import { BrowserContextProxy, BrowserProxy } from '../proxies.js'
import type { PluginConfig, VisitOptions } from '../../types/main.js'

/**
 * Test setup hook that creates a fresh browser context for each test.
 * This ensures test isolation by providing a clean browser state.
 *
 * The hook adds `browser`, `browserContext`, `visit`, and `record` methods
 * to the test context.
 *
 * @param browser - The Playwright browser instance
 * @param config - Plugin configuration
 * @param test - The test instance
 *
 * @example
 * ```ts
 * // Used internally by the plugin
 * test.setup((self) => createContextHook(browser, config, self))
 * ```
 */
export async function createContextHook(
  browser: PlayWrightBrowser,
  config: PluginConfig,
  test: Test
) {
  const host = process.env.HOST
  const port = process.env.PORT
  const context = test.context!
  debug('creating browser context for test "%s"', context.test.title)

  /**
   * Share browser, context and visit method with the test
   * context.
   */
  context.browser = browser
  context.browserContext = await browser.newContext({
    baseURL: host && port ? `http://${host}:${port}` : undefined,
    ...config.contextOptions,
  })

  context.visit = context.browserContext.visit.bind(context.browserContext)
  context.record = async function (
    this: TestContext,
    urlOrCallback: string | (() => Promise<Page>),
    options?: VisitOptions
  ) {
    /**
     * Recorder code is taken from
     * https://github.com/microsoft/playwright/blob/24365d66eb47e307ff4253b62340a80fc957b53d/packages/playwright-core/src/cli/program.ts#L558
     */
    const recorder = (this.browserContext as any)._enableRecorder.bind(context)
    await recorder({
      contextOptions: {
        baseURL: host && port ? `http://${host}:${port}` : undefined,
        ...config.contextOptions,
      },
      mode: 'recording',
      handleSIGINT: false,
    })

    const page =
      typeof urlOrCallback === 'function'
        ? await urlOrCallback()
        : await this.visit(urlOrCallback, options)

    /**
     * Headless chrome doesn't close on page close, hence we have
     * to listen for page close and explicitly close the browser
     */
    page.on('close', async () => {
      await this.browserContext.close()
      await this.browser.close()
    })

    /**
     * Wait until the browser is disconnected
     */
    return new Promise<void>((resolve) => {
      this.browser.on('disconnected', () => resolve())
    })
  }.bind(context)

  return () => {
    debug('closing browser context for test "%s"', context.test.title)
    return context.browserContext.close()
  }
}

/**
 * Test setup hook that creates fake browser and context objects for tests
 * in suites that are not configured to interact with browsers.
 *
 * These proxies throw helpful error messages if accessed, guiding developers
 * to configure the plugin for the suite.
 *
 * @param test - The test instance
 *
 * @example
 * ```ts
 * // Used internally by the plugin for non-browser suites
 * test.setup((self) => createFakeContextHook(self))
 * ```
 */
export function createFakeContextHook(test: Test) {
  const suiteName = test.options.meta.suite.name

  test.context!.browser = new BrowserProxy(suiteName) as any
  test.context!.browserContext = new BrowserContextProxy(suiteName) as any
  test.context!.visit = async function () {
    throw new Error(
      `Cannot access call "visit". The browser is not configured to run for "${suiteName}" suite`
    )
  }
}
