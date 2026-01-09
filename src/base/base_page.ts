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
 *
 * @example
 * ```ts
 * class LoginPage extends BasePage {
 *   url = 'https://example.com/login'
 *
 *   async login(email: string, password: string) {
 *     await this.page.fill('#email', email)
 *     await this.page.fill('#password', password)
 *     await this.page.click('button[type="submit"]')
 *   }
 * }
 *
 * // Usage in test
 * const loginPage = await context.visit(LoginPage)
 * await loginPage.login('user@example.com', 'password')
 * ```
 */
export class BasePage {
  /**
   * The URL to visit when instantiating this page
   */
  declare url: string

  /**
   * Options to pass to the visit method when navigating to the URL
   */
  declare visitOptions: VisitOptions

  /**
   * Creates a new instance of the page
   *
   * @param page - The Playwright page instance
   * @param context - The Playwright browser context
   */
  constructor(
    public page: Page,
    public context: BrowserContext
  ) {}
}
