import { Readable } from "stream";
import { Object } from "../types/global.js";
import { HttpResponse, RecognizedString } from "../uwebsockets/index.js";

export type IResponse = {
  close: () => void;
  setHeader: (key: string, value: string) => void;
  setHeaders: (headers: Object) => void;
  status: (code: number) => IResponse;
  send: (payload?: RecognizedString) => void;
  sendJson: (payload: Object | Object[]) => void;
  pipe: (stream: Readable) => Promise<void>;
};

export const response = (response: HttpResponse, isClosed: boolean): IResponse => {
  const variables: {
    headers: Map<string, string>;
    status: string;
  } = {
    headers: new Map(),
    status: "200",
  };

  const end = (payload?: RecognizedString) => {
    if (!isClosed) {
      isClosed = true;
      response.cork(() => {
        response.writeStatus(variables.status);
        variables.headers.forEach((value, key) => response.writeHeader(key, value));
        response.end(payload);
      });
    }
  };

  return {
    close: function () {
      if (!isClosed) {
        isClosed = true;
        response.cork(() => {
          response.close();
        });
      }
    },

    setHeader: function (key: string, value: string) {
      variables.headers.set(key, value);
    },

    setHeaders: function (headers: Object) {
      for (const [key, value] of Object.entries(headers)) {
        variables.headers.set(key, value);
      }
    },

    status: function (code: number) {
      variables.status = code.toString();
      return this;
    },

    send: function (payload?: RecognizedString) {
      if (!isClosed) {
        end(payload);
      }
    },

    sendJson: function (payload: Object | Object[]) {
      if (!isClosed) {
        variables.headers.set("Content-Type", "application/json");
        end(JSON.stringify(payload, null, 2));
      }
    },

    pipe: function (stream: Readable): Promise<void> {
      return new Promise((resolve) => {
        response.onAborted(() => {
          stream.destroy();
          resolve();
        });

        stream.on("data", (chunk) => {
          response.cork(() => response.write(Buffer.from(chunk)));
        });

        stream.on("end", () => {
          end();
          resolve();
        });
      });
    },
  };
};
