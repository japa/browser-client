/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Decorator } from '../types.js'

/**
 * Decorates the page object with "pauseIf" and "pauseUnless"
 * methods.
 */
export const addPauseMethods = {
  page(page) {
    page.pauseIf = async function (condition) {
      if (condition) {
        await this.pause()
      }
    }

    page.pauseUnless = async function (condition) {
      if (!condition) {
        await this.pause()
      }
    }
  },
} satisfies Decorator
