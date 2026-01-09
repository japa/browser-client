/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Page, BrowserContext } from 'playwright'

/**
 * Interactions can be used to de-compose actions on a page to its
 * own chainable API.
 *
 * Each interaction is a promise and actions must be added to the queue
 * using the "this.defer" method.
 *
 * @example
 * ```ts
 * class FillLoginForm extends BaseInteraction {
 *   fillEmail(email: string) {
 *     return this.defer(async () => {
 *       await this.page.fill('#email', email)
 *     })
 *   }
 *
 *   fillPassword(password: string) {
 *     return this.defer(async () => {
 *       await this.page.fill('#password', password)
 *     })
 *   }
 *
 *   submit() {
 *     return this.defer(async () => {
 *       await this.page.click('button[type="submit"]')
 *     })
 *   }
 * }
 *
 * // Usage in test
 * await page
 *   .use(FillLoginForm)
 *   .fillEmail('user@example.com')
 *   .fillPassword('password')
 *   .submit()
 *   .exec()
 * ```
 */
export class BaseInteraction {
  /**
   * Internal queue of actions to execute
   */
  #queue: Set<() => Promise<any>> = new Set()

  /**
   * Creates a new interaction instance
   *
   * @param page - The Playwright page instance
   * @param context - The Playwright browser context
   */
  constructor(
    public page: Page,
    public context: BrowserContext
  ) {}

  /**
   * Queue an action to the interaction queue. The action will be executed
   * when the exec method is called.
   *
   * @param action - The async action to queue
   */
  defer(action: () => Promise<any>): this {
    this.#queue.add(action)
    return this
  }

  /**
   * Execute all queued interaction actions in the order they were added
   */
  async exec() {
    for (let action of this.#queue) {
      await action()
    }
  }
}
