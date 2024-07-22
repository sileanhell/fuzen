import chalk from "chalk";
import { Handlers } from "./handles/index.js";
import { IRequest, IResponse, IWebsocket } from "./transform/index.js";
import { IRoute } from "./types/http.js";
import { IEvent, WebsocketOptions } from "./types/websocket.js";
import { App, AppOptions, RecognizedString, SSLApp, TemplatedApp } from "./uwebsockets/index.js";

import { cors } from "./middlewares/cors.js";
import { rateLimit } from "./middlewares/rateLimit.js";
import { slowDown } from "./middlewares/slowDown.js";

const uWS = { App, SSLApp };
const Middlewares = { cors, rateLimit, slowDown };
const Clients: Map<string, IWebsocket> = new Map();

class Fuzen {
  private server: TemplatedApp;
  private middlewares: IRoute[] = [];
  private routes: Map<string, { [key: string]: IRoute[] }> = new Map();

  constructor(options?: AppOptions) {
    this.server = options ? SSLApp(options) : App();
  }

  use(module: IRoute) {
    this.middlewares.push(module);
  }

  get(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, get: handlers });
  }

  post(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, post: handlers });
  }

  options(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, options: handlers });
  }

  delete(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, delete: handlers });
  }

  patch(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, patch: handlers });
  }

  put(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, put: handlers });
  }

  head(path: string, ...handlers: IRoute[]) {
    const old = this.routes.get(path);
    this.routes.set(path, { ...old, head: handlers });
  }

  ws(path: string, options: WebsocketOptions) {
    this.server.ws(path, Handlers.websocket(path, options));
  }

  listen(options?: { host?: RecognizedString; port?: number }, logo: boolean = true) {
    const host = options?.host || "0.0.0.0";
    const port = options?.port || 3000;
    this.server.any("/*", (response, request) => Handlers.route(request, response, this.middlewares, this.routes));
    this.server.listen(host, port, (listenSocket) => {
      if (listenSocket) {
        if (logo) {
          console.log(chalk.blue.bold(" _____ _____ _____ _____ _____"));
          console.log(chalk.blue.bold("|   __|  |  |__   |   __|   | |"));
          console.log(chalk.blue.bold("|   __|  |  |   __|   __| | | |"));
          console.log(chalk.blue.bold("|__|  |_____|_____|_____|_|___|"));
          console.log(chalk.white.bold(`\nLink: http://localhost:${port}\n`));
        }
      } else {
        console.log(chalk.red.bold("Fatal error."));
      }
    });
  }

  close() {
    this.server.close();
  }
}

export { Clients, Fuzen, IEvent, IRequest, IResponse, IRoute, IWebsocket, Middlewares, uWS };
