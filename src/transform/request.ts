import { Object } from "../types/global.js";
import { HttpRequest, HttpResponse } from "../uwebsockets/index.js";

export type IRequest = {
  method: string;
  headers: Object;
  remoteAddress: string;
  queries: Object;
  params: Object;
  body: string | Object;
};

export const request = async (request: HttpRequest, response: HttpResponse, path: string): Promise<IRequest> => {
  const method = request.getMethod();
  const remoteAddress = Buffer.from(response.getRemoteAddressAsText()).toString();

  let headers: Object = {};
  request.forEach((key, value) => (headers[key] = value));

  let queries: Object = {};
  const queryList = request.getQuery();
  if (queryList) {
    queryList.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      queries[key] = value;
    });
  }

  let params: Object = {};
  const paramRegex = /:([^\/]+)/g;
  const routeRegex = new RegExp("^" + path.replace(paramRegex, "([^/]+)") + "$");
  const match = request.getUrl().match(routeRegex);
  if (match) {
    const keys = [];
    let matchParam;
    while ((matchParam = paramRegex.exec(path)) !== null) {
      keys.push(matchParam[1]);
    }
    keys.forEach((key, index) => {
      params[key] = match[index + 1];
    });
  }

  const body: string | Object = await new Promise((resolve) => {
    let buffer: Buffer = Buffer.from([]);

    if (method === "get") {
      resolve(buffer.toString());
    } else {
      response.onData((ab, isLast) => {
        const chunk = Buffer.from(ab);
        buffer = Buffer.concat([buffer, chunk]);

        if (isLast) {
          const parsed = buffer.toString();
          try {
            resolve(JSON.parse(parsed) as Object);
          } catch {
            resolve(parsed);
          }
        }
      });
    }
  });

  return {
    method,
    headers,
    remoteAddress,
    queries,
    params,
    body,
  };
};
