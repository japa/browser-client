/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { decoratePage } from './decorate_page.js'
import type { Decorator, PluginConfig } from './types/main.js'
import type { BrowserContext } from 'playwright'

/**
 * Decorates the playwright browser context
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
