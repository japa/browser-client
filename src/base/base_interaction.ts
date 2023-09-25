/*
 * @japa/browser-client
 *
 * (c) Japa
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
 */
export class BaseInteraction {
  #queue: Set<() => Promise<any>> = new Set()

  constructor(
    public page: Page,
    public context: BrowserContext
  ) {}

  /**
   * Queue an action to the interaction queue
   */
  defer(action: () => Promise<any>): this {
    this.#queue.add(action)
    return this
  }

  /**
   * Execute interaction actions
   */
  async exec() {
    for (let action of this.#queue) {
      await action()
    }
  }
}
