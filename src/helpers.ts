/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { setTimeout } from 'node:timers/promises'

/**
 * Checks if one object is a subset of another object. This function
 * performs a deep comparison for nested objects.
 *
 * @param superset - The object that should contain all properties from the subset
 * @param subset - The object to check if it's contained within the superset
 *
 * @example
 * ```ts
 * isSubsetOf({ a: 1, b: 2 }, { a: 1 }) // true
 * isSubsetOf({ a: 1 }, { a: 1, b: 2 }) // false
 * isSubsetOf({ user: { name: 'John', age: 30 } }, { user: { name: 'John' } }) // true
 * ```
 */
export const isSubsetOf = (superset: Record<string, any>, subset: Record<string, any>): boolean => {
  if (
    typeof superset !== 'object' ||
    superset === null ||
    typeof subset !== 'object' ||
    subset === null
  ) {
    return false
  }

  return Object.keys(subset).every((key) => {
    if (!superset.propertyIsEnumerable(key)) {
      return false
    }

    const subsetItem = subset[key]
    const supersetItem = superset[key]

    if (typeof subsetItem === 'object' && subsetItem !== null) {
      return isSubsetOf(supersetItem, subsetItem)
    }
    if (supersetItem !== subsetItem) {
      return false
    }
    return true
  })
}

/**
 * Retries an async function until an invocation of the callback does not throw
 * any error or the timeout is reached. If the time runs out, the last thrown
 * error will be re-thrown.
 *
 * This is used internally by assertion methods to provide automatic retries.
 *
 * @param options - Configuration object
 * @param options.pollIntervals - Array of intervals (in ms) to wait between retries
 * @param options.timeout - Maximum time (in ms) to keep retrying
 * @param callback - The async function to retry
 *
 * @example
 * ```ts
 * await retryTest(
 *   { pollIntervals: [100, 250, 500], timeout: 5000 },
 *   async () => {
 *     const element = await page.locator('.button')
 *     if (!await element.isVisible()) {
 *       throw new Error('Element not visible')
 *     }
 *   }
 * )
 * ```
 */
export async function retryTest(
  options: {
    pollIntervals: number[]
    timeout: number
  },
  callback: () => Promise<void>
) {
  type ResultObject = { error?: Error }

  const { pollIntervals, timeout } = options
  const remainingIntervals = pollIntervals.slice(0, -1)
  const repeatedLastInterval = pollIntervals[pollIntervals.length - 1]
  let hasStopped = false
  let lastError: Error
  let lastAttemptCallback: Promise<any>

  // Attempt until callback does not throw, or `hasStopped` has been set due to timeout
  const attempt = async () => {
    try {
      lastAttemptCallback = callback()
      await lastAttemptCallback
      hasStopped = true
      return {}
    } catch (error) {
      if (hasStopped) return {} // Better not schedule a useless timeout if we can avoid it

      lastError = error
      const currentInterval = remainingIntervals.shift() ?? repeatedLastInterval
      await setTimeout(currentInterval)

      if (hasStopped) return {}
      return attempt()
    }
  }

  // Fail after timeout, but only if `hasStopped` was not set by a successful attempt
  const failAfterTimeout = () =>
    setTimeout(timeout).then(async () => {
      if (hasStopped) return {}

      hasStopped = true

      // If there's no last error, it means that the first callback invocation never finished,
      // let's not wait for it.
      if (!lastError) {
        return { error: new Error('retryTest: Callback ran out of time') }
      } else {
        // Otherwise lets wait for the last attempt to finish cleanly
        await lastAttemptCallback.catch((e) => (lastError = e))
        return { error: lastError }
      }
    })

  const { error } = await Promise.race<ResultObject>([attempt(), failAfterTimeout()])

  if (error) {
    error.message += `, timed out after ${timeout}ms`
    throw error
  }
}
