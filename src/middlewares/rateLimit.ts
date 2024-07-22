import Crypto from "crypto";
import { IRequest, IResponse } from "../index.js";

type options = {
  windowMs: number;
  limit: number;
  response?: { status?: number; message?: string };
  key?: (request: IRequest, next: Map<any, any>) => string;
  headers?: boolean;
  legacyHeaders?: boolean;
};

const clients = new Map<string, { connections: number; expired: number }>();
let interval: NodeJS.Timeout | number | undefined = undefined;

export const rateLimit = (options?: options) => (request: IRequest, response: IResponse, next: Map<any, any>) => {
  const config = options || { windowMs: 15 * 60 * 1000, limit: 100 };

  if (!interval) {
    interval = setInterval(() => {
      if (clients.size > 0) {
        clients.forEach((value, key) => (Date.now() >= value.expired ? clients.delete(key) : null));
      } else {
        clearInterval(interval);
        interval = undefined;
      }
    }, config.windowMs + 60 * 1000);
  }

  const key = config.key
    ? config.key(request, next)
    : (() => {
        const ip = request.headers["CF-Connecting-IP".toLowerCase()] || request.headers["X-Forwarded-For".toLowerCase()] || request.remoteAddress;
        if (!ip) return response.status(400).send("Wrong IP address.");

        const userAgent = request.headers["User-Agent".toLowerCase()];
        if (!userAgent) return response.status(400).send("Wrong User-Agent.");

        return Crypto.createHash("md5").update(`${ip}:${userAgent}`).digest("hex");
      })();

  if (!key) return response.status(500).send("Unique key not found.");

  const client = clients.get(key);

  if (client) {
    if (Date.now() >= client.expired) {
      clients.set(key, { connections: 1, expired: Date.now() + config.windowMs });
    } else if (client.connections >= config.limit) {
      return response.status(config.response?.status || 429).send(config.response?.message || "Too Many Requests.");
    } else {
      clients.set(key, { connections: client.connections + 1, expired: client.expired });
    }
  } else {
    clients.set(key, { connections: 1, expired: Date.now() + config.windowMs });
  }

  const updatedClient = clients.get(key);

  if (config.headers && updatedClient) {
    response.setHeaders({
      "RateLimit-Limit": String(config.limit),
      "RateLimit-Remaining": String(config.limit - updatedClient.connections),
      "RateLimit-Reset": String(updatedClient.expired),
    });
  }

  if (config.legacyHeaders && updatedClient) {
    response.setHeaders({
      "X-RateLimit-Limit": String(config.limit),
      "X-RateLimit-Remaining": String(config.limit - updatedClient.connections),
      "X-RateLimit-Reset": String(updatedClient.expired),
    });
  }

  next.set("rateLimit", updatedClient);
};
