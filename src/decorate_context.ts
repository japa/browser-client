/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { BrowserContext } from 'playwright'

import { decoratePage } from './decorate_page.js'
import type { Decorator, PluginConfig } from './types/main.js'

/**
 * Decorates the Playwright browser context by applying custom decorators
 * and setting up automatic decoration for all pages created within the context.
 *
 * @param context - The Playwright browser context to decorate
 * @param decorators - Array of decorators to apply
 * @param config - Plugin configuration options
 *
 * @example
 * ```ts
 * const decoratedContext = decorateContext(
 *   context,
 *   [addAssertions, addVisitMethod],
 *   { assertions: { timeout: 5000 } }
 * )
 * ```
 */
export function decorateContext(
  context: BrowserContext,
  decorators: Decorator[],
  config: PluginConfig
): BrowserContext {
  decorators.forEach((decorator) => {
    if (decorator.context) {
      decorator.context(context)
    }
  })

  context.on('page', (page) => decoratePage(page, context, decorators, config))
  return context
}
