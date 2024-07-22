import { Object } from "../types/global.js";
import { UserData } from "../types/websocket.js";
import { WebSocket } from "../uwebsockets/index.js";

export type IWebsocket = {
  next: Map<any, any>;
  id: string;
  remoteAddress: string;
  headers: Object;
  queries: Object;
  params: Object;
  close: () => void;
  send: (event: string, message?: unknown) => void;
};

export const websocket = (ws: WebSocket<UserData>): IWebsocket => {
  const next: Map<any, any> = new Map();

  return {
    next,
    id: ws.getUserData().id,
    remoteAddress: ws.getUserData().ip,
    headers: ws.getUserData().headers,
    queries: ws.getUserData().queries,
    params: ws.getUserData().params,
    close: () => ws.close(),
    send: (event: string, message?: unknown) => {
      const payload = JSON.stringify({ event, message });
      ws.send(payload);
    },
  };
};
