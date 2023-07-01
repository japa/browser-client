/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Decorator } from './types.js'
import { addUseMethod } from './decorators/use.js'
import { addVisitMethod } from './decorators/visit.js'
import { addPauseMethods } from './decorators/pause.js'
import { addAssertions } from './decorators/assertions.js'

/**
 * A singleton decorators collection to register decorators for
 * extending playwright
 */
class DecoratorsCollection {
  private list: Decorator[] = [addAssertions, addPauseMethods, addUseMethod, addVisitMethod]

  register(decorator: Decorator): this {
    this.list.push(decorator)
    return this
  }

  toJSON() {
    return this.list
  }
}

const decoratorsCollection = new DecoratorsCollection()
export { decoratorsCollection }
