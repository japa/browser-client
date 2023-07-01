/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { VisitOptions } from './types.js'
import type { Page, BrowserContext } from 'playwright'

/**
 * Base page is used to create custom pages to be used
 * for testing.
 */
export class BasePage {
  declare url: string
  declare visitOptions: VisitOptions
  constructor(public page: Page, public context: BrowserContext) {}
}
