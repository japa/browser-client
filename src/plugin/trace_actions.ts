/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import type { Test } from '@japa/runner'
import slugify from '@sindresorhus/slugify'

import type { PluginConfig } from '../types'

/**
 * Tests hook to trace actions
 */
export async function traceActions(config: PluginConfig, test: Test) {
  if (!config.tracing?.enabled) {
    return
  }

  /**
   * Trace action when tracing is enabled
   */
  await test.context.browserContext.tracing.start({
    title: test.title,
    screenshots: true,
    snapshots: true,
    sources: true,
  })

  /**
   * Store tracing artefacts on disk on error
   * when "tracing.event === 'onError'"
   */
  if (config.tracing.event === 'onError') {
    return async (error: any) => {
      if (error) {
        await test.context.browserContext.tracing.stop({
          path: join(config.tracing!.outputDirectory, `${slugify(test.title)}.zip`),
        })
      } else {
        await test.context.browserContext.tracing.stop()
      }
    }
  }

  /**
   * Store tracing artefacts on disk everyone
   * when "tracing.event === 'onTest'"
   */
  return async () => {
    await test.context.browserContext.tracing.stop({
      path: join(config.tracing!.outputDirectory, `${slugify(test.title)}.zip`),
    })
  }
}
