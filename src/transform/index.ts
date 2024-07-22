import { IRequest, request } from "./request.js";
import { IResponse, response } from "./response.js";
import { IWebsocket, websocket } from "./websocket.js";

export const Transform = { response, request, websocket };
export { IRequest, IResponse, IWebsocket };
