/*
 * @japa/browser-client
 *
 * (c) Japa
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
 */
class DecoratorsCollection {
  #list: Decorator[] = [addAssertions, addPauseMethods, addUseMethod, addVisitMethod]

  /**
   * Register a custom decorator
   */
  register(decorator: Decorator): this {
    this.#list.push(decorator)
    return this
  }

  /**
   * Returns decorators list
   */
  toList() {
    return this.#list
  }
}

const decoratorsCollection = new DecoratorsCollection()
export { decoratorsCollection }
