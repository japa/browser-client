/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Decorator } from './types'
import { addUseMethod } from './decorators/use'
import { addVisitMethod } from './decorators/visit'
import { addPauseMethods } from './decorators/pause'
import { addAssertions } from './decorators/assertions'

/**
 * A singleton decorators collection to register decorators for
 * extending playwright
 */
class DecoratorsCollection {
  #list: Decorator[] = [addAssertions, addPauseMethods, addUseMethod, addVisitMethod]

  register(decorator: Decorator): this {
    this.#list.push(decorator)
    return this
  }

  toJSON() {
    return this.#list
  }
}

export default new DecoratorsCollection()
