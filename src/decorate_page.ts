/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { BrowserContext, Page } from 'playwright'
import { type Decorator, type PluginConfig } from './types/main.js'

/**
 * Decorates the Playwright page object by applying custom decorators
 * to the page and its response events.
 *
 * @param page - The Playwright page instance to decorate
 * @param context - The browser context associated with the page
 * @param decorators - Array of decorators to apply
 * @param config - Plugin configuration options
 *
 * @example
 * ```ts
 * const decoratedPage = decoratePage(
 *   page,
 *   context,
 *   [addAssertions, addPauseMethods],
 *   { assertions: { timeout: 5000 } }
 * )
 * ```
 */
export function decoratePage(
  page: Page,
  context: BrowserContext,
  decorators: Decorator[],
  config: PluginConfig
): Page {
  decorators.forEach((decorator) => {
    if (decorator.page) {
      decorator.page(page, context, config)
    }
  })

  page.on('response', (response) => {
    decorators.forEach((decorator) => {
      if (decorator.response) {
        decorator.response(response)
      }
    })
  })

  return page
}
