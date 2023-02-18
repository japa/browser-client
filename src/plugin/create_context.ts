/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Test } from '@japa/runner'
import type { Browser as PlayWrightBrowser } from 'playwright'

import type { PluginConfig } from '../types'
import { BrowserContextProxy, BrowserProxy } from './proxies'

/**
 * Creates a new browser context
 */
export async function createContext(
  browser: PlayWrightBrowser,
  config: PluginConfig,
  { context }: Test
) {
  const host = process.env.HOST
  const port = process.env.PORT

  /**
   * Share browser, context and visit method with the test
   * context.
   */
  context.browser = browser
  context.browserContext = await browser.newContext({
    baseURL: host && port ? `http://${host}:${port}` : undefined,
    ...config.contextOptions,
  })

  /**
   * Sharing assert with page
   */
  context.browserContext.on('page', function (page) {
    page.assert = context.assert
  })

  return () => context.browserContext.close()
}

/**
 * Assigns fake browser and browser context to the test context
 */
export function createFakeContext(test: Test) {
  test.context.browser = new BrowserProxy(test.options.meta.suite.name) as any
  test.context.browserContext = new BrowserContextProxy(test.options.meta.suite.name) as any
}
