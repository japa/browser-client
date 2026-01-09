/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debuglog } from 'node:util'

/**
 * Debug logger for the browser-client plugin. To enable debug logs,
 * set the NODE_DEBUG environment variable to "japa:browser-client".
 *
 * @example
 * ```bash
 * NODE_DEBUG=japa:browser-client node ace test
 * ```
 */
export default debuglog('japa:browser-client')
