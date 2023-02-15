/*
 * @japa/browser-client
 *
 * (c) Japa.dev
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http'

export class ServerFactory {
  host: string = 'localhost'
  port: number = 3000
  url: string = `http://${this.host}:${this.port}`
  declare server: Server

  create(callback: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>) {
    this.server = createServer(callback)

    return new Promise<void>((resolve) => {
      this.server.listen(this.port, this.host, () => {
        resolve()
      })
    })
  }

  close() {
    return new Promise<void>((resolve) => this.server.close(() => resolve()))
  }
}
