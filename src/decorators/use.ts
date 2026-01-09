/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type BasePage } from '../base/base_page.js'
import type { Decorator } from '../types/main.js'
import { type BaseInteraction } from '../base/base_interaction.js'

/**
 * Decorates the page object with "use" method to instantiate page objects
 * or interactions with the current page and context.
 *
 * @example
 * ```ts
 * // Using a page object
 * const loginPage = page.use(LoginPage)
 * await loginPage.login('user@example.com', 'password')
 *
 * // Using an interaction
 * await page
 *   .use(FillLoginForm)
 *   .fillEmail('user@example.com')
 *   .fillPassword('password')
 *   .submit()
 *   .exec()
 * ```
 */
export const addUseMethod = {
  /**
   * Adds the use method to the page object
   *
   * @param page - The Playwright page instance to decorate
   */
  page(page) {
    /**
     * Creates an instance of a page object or interaction bound to this page
     *
     * @param PageOrInteraction - The page or interaction class to instantiate
     */
    page.use = function <T extends typeof BasePage | typeof BaseInteraction>(
      PageOrInteraction: T
    ): InstanceType<T> {
      return new PageOrInteraction(this, this.context()) as InstanceType<T>
    }
  },
} satisfies Decorator
