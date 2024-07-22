import { IRequest, IResponse } from "../index.js";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "PATCH";

type options = {
  origin?: ["*"] | string[];
  methods?: ["default"] | HttpMethod[];
  allowedHeaders?: ["auto"] | string[];
  exposedHeaders?: string[];
  credentials?: true;
  maxAge?: number;
};

export const cors = (options?: options) => (request: IRequest, response: IResponse, next: Map<any, any>) => {
  const basic = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: request.headers["Access-Control-Request-Headers".toLowerCase()],
    maxAge: 86400,
  };

  if (request.method === "options") {
    if (options) {
      if (options.origin) response.setHeader("Access-Control-Allow-Origin", options.origin.join(","));
      if (options.methods) response.setHeader("Access-Control-Allow-Methods", options.methods[0] === "default" ? basic.methods : options.methods.join(","));
      if (options.allowedHeaders) {
        const result = options.allowedHeaders[0] === "auto" ? basic.allowedHeaders : options.allowedHeaders.join(",");
        if (result) response.setHeader("Access-Control-Allow-Headers", result);
      }
      if (options.exposedHeaders) response.setHeader("Access-Control-Expose-Headers", options.exposedHeaders.join(","));
      if (options.maxAge) response.setHeader("Access-Control-Max-Age", String(options.maxAge));
    } else {
      response.setHeader("Access-Control-Allow-Origin", basic.origin);
      if (basic.methods) response.setHeader("Access-Control-Allow-Methods", basic.methods);
      if (basic.allowedHeaders) response.setHeader("Access-Control-Allow-Headers", basic.allowedHeaders);
      response.setHeader("Access-Control-Max-Age", `${basic.maxAge}`);
    }

    response.status(204).send();
  } else {
    if (options) {
      if (options.origin) response.setHeader("Access-Control-Allow-Origin", options.origin.join(","));
      if (options.credentials) response.setHeader("Access-Control-Allow-Credentials", String(options.credentials));
    } else {
      response.setHeader("Access-Control-Allow-Origin", basic.origin);
    }
  }
};
