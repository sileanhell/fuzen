import { IWebsocket } from "../index.js";
import { IRoute } from "./http.js";

export type UserData = {
  id: string;
  ip: string;
  headers: { [key: string]: string };
  queries: { [key: string]: string };
  params: { [key: string]: string };
  next: Map<any, any>;
};

export type IEvent = {
  event: string;
  handler: (client: IWebsocket, message: unknown) => unknown;
};

export type WebsocketOptions = {
  events: IEvent[];
  middlewares?: IRoute[];
  onConnect?: (client: IWebsocket) => void;
  onDisconnect?: (client: IWebsocket, code: number) => void;
  onDropped?: (client: IWebsocket, event: string, message: unknown) => void;
  onDrain?: (client: IWebsocket) => void;
};
