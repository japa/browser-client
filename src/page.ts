/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Decorator } from './types'
import type { BrowserContext, Page } from 'playwright'

/**
 * Decorates the playwright page object
 */
export function decoratePage(page: Page, context: BrowserContext, decorators: Decorator[]): Page {
  decorators.forEach((decorator) => {
    if (decorator.page) {
      decorator.page(page, context)
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
