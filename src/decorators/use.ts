/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BasePage } from '../base/base_page.js'
import type { Decorator } from '../types/main.js'
import { BaseInteraction } from '../base/base_interaction.js'

/**
 * Decorates the page object with "use" method.
 */
export const addUseMethod = {
  page(page) {
    page.use = function <T extends typeof BasePage | typeof BaseInteraction>(
      PageOrInteraction: T
    ): InstanceType<T> {
      return new PageOrInteraction(this, this.context()) as InstanceType<T>
    }
  },
} satisfies Decorator
