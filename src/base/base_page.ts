/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { VisitOptions } from '../types/main.js'
import type { Page, BrowserContext } from 'playwright'

/**
 * Base page is used to create class based pages that can be
 * used to abstract page interactions.
 */
export class BasePage {
  /**
   * The URL to visit
   */
  declare url: string

  /**
   * Options to pass to the visit method
   */
  declare visitOptions: VisitOptions
  constructor(public page: Page, public context: BrowserContext) {}
}
