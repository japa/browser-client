/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { retryTest } from '../src/helpers.js'

test.group('Helpers', () => {
  test('retryTest retries until callback succeeds', async ({ assert }) => {
    const attemptTimes: Date[] = []
    const startTime = new Date()

    await assert.doesNotReject(() =>
      retryTest(
        {
          timeout: 500,
          pollIntervals: [100],
        },
        async () => {
          attemptTimes.push(new Date())
          const timeSinceStart = new Date().getTime() - startTime.getTime()
          if (timeSinceStart < 300) {
            throw new Error('Expected error')
          }
        }
      )
    )

    assert.lengthOf(attemptTimes, 4) // 0, 100, 200, 300
  })

  test('retryTest fails when not successful before end of timeout', async ({ assert }) => {
    const attemptTimes: Date[] = []
    const startTime = new Date()

    await assert.rejects(
      () =>
        retryTest(
          {
            timeout: 100,
            pollIntervals: [20],
          },
          async () => {
            attemptTimes.push(new Date())
            throw new Error('Expected error')
          }
        ),
      /Expected error/
    )
    const endTime = new Date()

    const actualTimeout = endTime.getTime() - startTime.getTime()
    const allowedVariance = 5

    assert.isAtLeast(actualTimeout, 100 - allowedVariance)
    assert.isAtMost(actualTimeout, 100 + allowedVariance)
  })

  test('retryTest retries at defined poll intervals', async ({ assert }) => {
    const attemptTimes: Date[] = []
    const startTime = new Date()

    await assert.rejects(
      () =>
        retryTest(
          {
            timeout: 500,
            pollIntervals: [25, 100, 150],
          },
          async () => {
            attemptTimes.push(new Date())
            throw new Error('Expected error')
          }
        ),
      /Expected error/
    )

    const endTime = new Date()

    const actualTimeout = endTime.getTime() - startTime.getTime()
    const [firstAttemptDelay, ...actualPollIntervals] = attemptTimes.map((attemptTime, i) => {
      const lastAttemptTime = i === 0 ? startTime : attemptTimes[i - 1]
      return attemptTime.getTime() - lastAttemptTime.getTime()
    })
    const allowedVariance = 5

    assert.isAtLeast(actualTimeout, 500 - allowedVariance)
    assert.isAtMost(actualTimeout, 500 + allowedVariance)

    assert.isAtLeast(firstAttemptDelay, 0)
    assert.isAtMost(firstAttemptDelay, 0 + allowedVariance)

    assert.lengthOf(actualPollIntervals, 4)

    assert.isAtLeast(actualPollIntervals[0], 25 - allowedVariance)
    assert.isAtMost(actualPollIntervals[0], 25 + allowedVariance)

    assert.isAtLeast(actualPollIntervals[1], 100 - allowedVariance)
    assert.isAtMost(actualPollIntervals[1], 100 + allowedVariance)

    assert.isAtLeast(actualPollIntervals[2], 150 - allowedVariance)
    assert.isAtMost(actualPollIntervals[2], 150 + allowedVariance)

    assert.isAtLeast(actualPollIntervals[3], 150 - allowedVariance)
    assert.isAtMost(actualPollIntervals[3], 150 + allowedVariance)
  })
})
