/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Decorator } from '../types/main.js'

/**
 * Decorates the page object with "pauseIf" and "pauseUnless"
 * methods for conditional pausing during browser automation.
 *
 * @example
 * ```ts
 * // Pause only when a condition is true
 * await page.pauseIf(process.env.DEBUG === 'true')
 *
 * // Pause unless a condition is true
 * await page.pauseUnless(isProduction)
 * ```
 */
export const addPauseMethods = {
  /**
   * Adds pauseIf and pauseUnless methods to the page object
   *
   * @param page - The Playwright page instance to decorate
   */
  page(page) {
    /**
     * Pauses the page execution when the condition is true.
     * Useful for debugging specific scenarios.
     *
     * @param condition - The condition to evaluate
     */
    page.pauseIf = async function (condition) {
      if (condition) {
        await this.pause()
      }
    }

    /**
     * Pauses the page execution when the condition is false.
     * Useful for debugging when something is not as expected.
     *
     * @param condition - The condition to evaluate
     */
    page.pauseUnless = async function (condition) {
      if (!condition) {
        await this.pause()
      }
    }
  },
} satisfies Decorator
