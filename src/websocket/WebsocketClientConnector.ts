import { Changes, Connector, Reference, ReplicatedStore } from "../types"

import { z } from "zod"
import { AsyncCommand } from "../async/types"
import { AsyncConnector } from "../async/AsyncConnector"

/**
 * Uses a websocket to replicate changes between the browser and the server. This implements the
 * sending of commands to the server and handles push commands received from the server
 */
export class WebsocketClientConnector<T extends Reference>
  extends AsyncConnector<T>
  implements Connector<T>
{
  constructor(
    readonly store: ReplicatedStore<T>,
    private readonly ws: WebSocket,
    private readonly T: z.ZodType<T> = z.any()
  ) {
    super()

    const DataPush = Changes(T)

    ws.onopen = () => this.init()

    ws.onclose = console.log
    ws.onerror = console.error

    ws.onmessage = (data) => {
      const message = DataPush.safeParse(JSON.parse(data.toString()))
      if (!message.success) {
        throw message.error
      }

      this.receive(message.data)
    }
  }

  send(command: AsyncCommand<T>) {
    this.ws.send(JSON.stringify(command))
  }
}
