/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { addUseMethod } from './use.js'
import { addVisitMethod } from './visit.js'
import { addPauseMethods } from './pause.js'
import { addAssertions } from './assertions.js'
import type { Decorator } from '../types/main.js'

/**
 * Collection of decorators to apply on an instance of playwright page,
 * context, or the response objects.
 *
 * Since, Playwright does not offer any extensible APIs, we have to apply
 * decorators on every instance.
 *
 * @example
 * ```ts
 * // Register a custom decorator
 * decoratorsCollection.register({
 *   page(page) {
 *     page.customMethod = function() {
 *       // Custom implementation
 *     }
 *   }
 * })
 * ```
 */
class DecoratorsCollection {
  /**
   * Internal list of registered decorators
   */
  #list: Decorator[] = [addAssertions, addPauseMethods, addUseMethod, addVisitMethod]

  /**
   * Register a custom decorator to extend page, context, or response objects
   *
   * @param decorator - The decorator to register
   */
  register(decorator: Decorator): this {
    this.#list.push(decorator)
    return this
  }

  /**
   * Returns the list of all registered decorators
   */
  toList() {
    return this.#list
  }
}

/**
 * Singleton instance of the decorators collection
 */
const decoratorsCollection = new DecoratorsCollection()
export { decoratorsCollection }
