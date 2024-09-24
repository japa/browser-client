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
    const startTime = new Date()

    await assert.rejects(
      () =>
        retryTest(
          {
            timeout: 100,
            pollIntervals: [20],
          },
          async () => {
            throw new Error('Expected error')
          }
        ),
      /Expected error, timed out after 100ms/
    )
    const endTime = new Date()

    const actualTimeout = endTime.getTime() - startTime.getTime()
    const allowedDeviation = 50

    assert.isAtLeast(actualTimeout, 100 - allowedDeviation)
    assert.isAtMost(actualTimeout, 100 + allowedDeviation)
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
      /Expected error, timed out after 500ms/
    )

    const endTime = new Date()

    const actualTimeout = endTime.getTime() - startTime.getTime()
    const [firstAttemptDelay, ...actualPollIntervals] = attemptTimes.map((attemptTime, i) => {
      const lastAttemptTime = i === 0 ? startTime : attemptTimes[i - 1]
      return attemptTime.getTime() - lastAttemptTime.getTime()
    })
    const allowedDeviation = 25

    assert.isAtLeast(actualTimeout, 500 - allowedDeviation)
    assert.isAtMost(actualTimeout, 500 + allowedDeviation)

    assert.isAtLeast(firstAttemptDelay, 0)
    assert.isAtMost(firstAttemptDelay, 0 + allowedDeviation)

    assert.lengthOf(actualPollIntervals, 4)

    assert.isAtLeast(actualPollIntervals[0], 25 - allowedDeviation)
    assert.isAtMost(actualPollIntervals[0], 25 + allowedDeviation)

    assert.isAtLeast(actualPollIntervals[1], 100 - allowedDeviation)
    assert.isAtMost(actualPollIntervals[1], 100 + allowedDeviation)

    assert.isAtLeast(actualPollIntervals[2], 150 - allowedDeviation)
    assert.isAtMost(actualPollIntervals[2], 150 + allowedDeviation)

    assert.isAtLeast(actualPollIntervals[3], 150 - allowedDeviation)
    assert.isAtMost(actualPollIntervals[3], 150 + allowedDeviation)
  })
})
