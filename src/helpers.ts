/*
 * @japa/browser-client
 *
 * (c) Japa
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { setTimeout } from 'node:timers/promises'

/**
 * Checks if one object is a subset of an another object
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
 * Retries async function until an invocation of the callback does not throw any error or the time
 * runs out.
 * If the time runs out, the last thrown error will be re-thrown
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
        await lastAttemptCallback
        return { error: lastError }
      }
    })

  const { error } = await Promise.race<ResultObject>([attempt(), failAfterTimeout()])

  if (error) {
    error.message += `, timed out after ${timeout}ms`
    throw error
  }
}

/**
 * Creates markup for a basic HTML document (to avoid repetition in tests)
 */
export const basicDocument = ({
  title = 'Hello world',
  body = '',
}: { title?: string; body?: string } = {}) => {
  return `
  <html>
    <head>
      <title>${title}</title>
    </head>
    <body>
      ${body}
    </body>
  </html>`
}
