/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Page, BrowserContext } from '../modules/playwright'

/**
 * Interactions can be used to de-compose actions on a page to its
 * own chainable API.
 *
 * Each interaction is a promise and actions must be added to the queue
 * using the "this.defer" method.
 */
export class BaseInteraction implements Promise<void> {
  #queue: Set<() => Promise<any>> = new Set()

  constructor(public page: Page, public context: BrowserContext) {}

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

  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected)
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ): Promise<void | TResult> {
    return this.exec().catch(onrejected)
  }

  finally(onfinally?: (() => void) | undefined | null): Promise<void> {
    return this.exec().finally(onfinally)
  }

  get [Symbol.toStringTag]() {
    return '[Promise: BaseInteraction]'
  }
}
