import { Clients } from "../index.js";
import { Transform } from "../transform/index.js";
import { UserData, WebsocketOptions } from "../types/websocket.js";
import { HttpRequest, HttpResponse, WebSocket, WebSocketBehavior, us_socket_context_t } from "../uwebsockets/index.js";

export const websocket = (path: string, options: WebsocketOptions): WebSocketBehavior<UserData> => {
  const upgrade = async (response: HttpResponse, request: HttpRequest, context: us_socket_context_t) => {
    const protocol = request.getHeader("sec-websocket-protocol");
    let isClosed = false;

    if (protocol === "Fuzen") {
      const key = request.getHeader("sec-websocket-key");
      const extensions = request.getHeader("sec-websocket-extensions");

      const next = new Map();
      const custom_request = await Transform.request(request, response, path);
      const custom_response = Transform.response(response, isClosed);

      if (options.middlewares && options.middlewares.length > 0) {
        for (let i = 0; i < options.middlewares.length; i++) {
          await options.middlewares[i](custom_request, custom_response, next);
        }
      }

      if (!isClosed) {
        response.upgrade(
          {
            id: key,
            ip: custom_request.remoteAddress,
            headers: custom_request.headers,
            queries: custom_request.queries,
            params: custom_request.params,
            next,
          },
          key,
          protocol,
          extensions,
          context
        );
      }
    } else {
      response.close();
    }
  };

  const open = (ws: WebSocket<UserData>) => {
    if (options.onConnect) options.onConnect(Transform.websocket(ws));
    Clients.set(ws.getUserData().id, Transform.websocket(ws));
  };

  const message = (ws: WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) => {
    try {
      const msg = JSON.parse(Buffer.from(message).toString()) as { event: string; message: unknown };
      const event = options.events.find((item) => item.event === msg.event);
      if (event) {
        event.handler(Transform.websocket(ws), msg.message);
      } else {
        console.log(`[ WARNING ] Unhandled websocket event: ${msg.event}`);
      }
    } catch {
      console.log(`[ WARNING ] Unsupported websocket message: ${isBinary ? message : Buffer.from(message).toString()}`);
    }
  };

  const close = (ws: WebSocket<UserData>, code: number) => {
    if (options.onDisconnect) options.onDisconnect(Transform.websocket(ws), code);
    Clients.delete(ws.getUserData().id);
  };

  const dropped = (ws: WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) => {
    if (options.onDropped) {
      try {
        const msg = JSON.parse(Buffer.from(message).toString()) as { event: string; message: unknown };
        options.onDropped(Transform.websocket(ws), msg.event, msg.message);
      } catch {
        options.onDropped(Transform.websocket(ws), "", isBinary ? message : Buffer.from(message).toString());
      }
    }
  };

  const drain = async (ws: WebSocket<UserData>) => {
    if (options.onDrain) options.onDrain(Transform.websocket(ws));
  };

  return { upgrade, open, message, close, dropped, drain };
};
