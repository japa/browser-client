/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Test } from '@japa/runner/core'
import type { Browser as PlayWrightBrowser } from 'playwright'

import debug from '../debug.js'
import type { PluginConfig } from '../types/main.js'
import { BrowserContextProxy, BrowserProxy } from './proxies.js'

/**
 * Creates a new browser context
 */
export async function createContext(browser: PlayWrightBrowser, config: PluginConfig, test: Test) {
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

  return () => {
    debug('closing browser context for test "%s"', context.test.title)
    return context.browserContext.close()
  }
}

/**
 * Assigns fake browser and browser context to the test context
 */
export function createFakeContext(test: Test) {
  test.context!.browser = new BrowserProxy(test.options.meta.suite.name) as any
  test.context!.browserContext = new BrowserContextProxy(test.options.meta.suite.name) as any
}
