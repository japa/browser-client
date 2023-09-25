/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { rm } from 'node:fs/promises'
import slugify from '@sindresorhus/slugify'
import type { Suite, Test } from '@japa/runner/core'

import debug from '../../debug.js'
import type { PluginConfig } from '../../types/main.js'

/**
 * Tests hook to trace actions
 */
export async function traceActionsHook(
  tracingConfig: Exclude<PluginConfig['tracing'], undefined>,
  test: Test
) {
  const suiteName = test.options.meta.suite.name

  /**
   * Trace action when tracing is enabled
   */
  await test.context!.browserContext.tracing.start({
    title: test.title,
    screenshots: true,
    snapshots: true,
    sources: true,
  })

  /**
   * Store tracing artefacts on disk on error
   * when "tracing.event === 'onError'"
   */
  if (tracingConfig.event === 'onError') {
    return async (hasError: boolean) => {
      if (hasError) {
        await test.context!.browserContext.tracing.stop({
          path: join(tracingConfig.outputDirectory, suiteName, `${slugify(test.title)}.zip`),
        })
      } else {
        await test.context!.browserContext.tracing.stop()
      }
    }
  }

  /**
   * Store tracing artifact on disk everyone
   * when "tracing.event === 'onTest'"
   */
  return async () => {
    await test.context!.browserContext.tracing.stop({
      path: join(tracingConfig.outputDirectory, suiteName, `${slugify(test.title)}.zip`),
    })
  }
}

/**
 * Suite hook to clean traces output directory
 */
export async function cleanTracesHook(suite: Suite, outputDirectory: string) {
  const suiteDirectory = join(outputDirectory, suite.name)
  debug('removing traces output from %s location', suiteDirectory)
  await rm(suiteDirectory, { recursive: true, force: true, maxRetries: 4 })
}
