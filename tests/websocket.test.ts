import { afterAll, beforeAll, describe, expect, it } from "vitest";
import websocket from "websocket";
import { Fuzen } from "../bin/index";

const options = { host: "127.0.0.1", port: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 };
let server: Fuzen;

const example = () => {
  server = new Fuzen();
  server.ws("/", {
    events: [
      {
        event: "text",
        handler: (client, message) => {
          client.send("text", message);
        },
      },
      {
        event: "json",
        handler: (client, message) => {
          client.send("json", message);
        },
      },
    ],
  });
  server.listen(options, false);
};

describe("WEBSOCKET", () => {
  beforeAll(example);
  afterAll(() => server.close());

  it("connect", async () => {
    const socket = new websocket.w3cwebsocket(`ws://localhost:${options.port}`, "Fuzen");

    const response = await new Promise((resolve) => {
      socket.onopen = () => {
        socket.close();
        resolve(true);
      };
    });

    expect(response).toBe(true);
  });

  it("send text", async () => {
    const socket = new websocket.w3cwebsocket(`ws://localhost:${options.port}`, "Fuzen");

    const response = await new Promise((resolve) => {
      socket.onopen = () => {
        socket.send(JSON.stringify({ event: "text", message: "work" }));
      };

      socket.onmessage = (message) => {
        const payload = JSON.parse(message.data.toString());
        if (payload.event === "text") {
          resolve(payload.message);
        } else {
          resolve(false);
        }
      };
    });

    expect(response).toBe("work");
  });

  it("send json", async () => {
    const socket = new websocket.w3cwebsocket(`ws://localhost:${options.port}`, "Fuzen");

    const response = await new Promise((resolve) => {
      socket.onopen = () => {
        socket.send(JSON.stringify({ event: "json", message: { test: "work" } }));
      };

      socket.onmessage = (message) => {
        const payload = JSON.parse(message.data.toString());
        if (payload.event === "json") {
          resolve(payload.message);
        } else {
          resolve(false);
        }
      };
    });

    expect(response).toEqual({ test: "work" });
  });
});
