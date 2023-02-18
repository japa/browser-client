/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Decorator } from '../types'

/**
 * Types for custom methods
 */
declare module '../../modules/playwright' {
  export interface Page {
    /**
     * Pause page when condition is true
     */
    pauseIf(condition: boolean): Promise<void>

    /**
     * Pause page when condition is false
     */
    pauseUnless(condition: boolean): Promise<void>
  }
}

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
