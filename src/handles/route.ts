import { Transform } from "../transform/index.js";
import { IRoute } from "../types/http.js";
import { HttpRequest, HttpResponse } from "../uwebsockets/index.js";

export const route = async (request: HttpRequest, response: HttpResponse, middlewares: IRoute[], routes: Map<string, { [key: string]: IRoute[] }>) => {
  let currentRoute;
  let isClosed = false;

  response.onAborted(() => {
    isClosed = true;
  });

  routes.forEach((_, key) => {
    if (new RegExp("^" + key.replace(/:([^\/]+)/g, "([^/]+)") + "$").test(request.getUrl())) return (currentRoute = key);
  });

  if (currentRoute) {
    const next = new Map();
    const custom_request = await Transform.request(request, response, currentRoute);
    const custom_response = Transform.response(response, isClosed);

    middlewares.forEach((middleware) => middleware(custom_request, custom_response, next));

    const methods = routes.get(currentRoute);
    if (!methods) return;

    const handlers: IRoute[] | undefined = methods[custom_request.method];
    if (!handlers) return;

    for (let i = 0; i < handlers.length; i++) {
      await handlers[i](custom_request, custom_response, next);
      if (isClosed) return;
      if (i === handlers.length - 1 && !isClosed) custom_response.close();
    }
  } else {
    response.writeStatus("404").end();
  }
};
