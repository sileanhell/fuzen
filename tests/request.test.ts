import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Fuzen } from "../bin/index";

const options = { host: "127.0.0.1", port: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 };
let server: Fuzen;

const example = () => {
  server = new Fuzen();

  server.get("/getMethod", (request, response) => response.send(request.method));
  server.get("/getRemoteAddress", (request, response) => response.send(request.remoteAddress));
  server.get("/getHeader", (request, response) => response.send(request.headers["Test".toLowerCase()]));
  server.get("/getHeaders", (request, response) => response.sendJson(request.headers));
  server.get("/getQuery", (request, response) => response.send(request.queries["test"]));
  server.get("/getQueries", (request, response) => response.sendJson(request.queries));
  server.get("/getParam/:test", (request, response) => response.send(request.params["test"]));
  server.get("/getParams/:test1/:test2", (request, response) => response.sendJson(request.params));
  server.post("/body", async (request, response) => {
    const body = request.body;
    response.sendJson(typeof body === "string" ? { body } : body);
  });

  server.listen(options, false);
};

describe("REQUEST", () => {
  beforeAll(example);
  afterAll(() => server.close());

  it("getMethod", async () => {
    const response = await fetch(`http://localhost:${options.port}/getMethod`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("get");
  });

  it("getRemoteAddress", async () => {
    const response = await fetch(`http://localhost:${options.port}/getRemoteAddress`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("127.0.0.1");
  });

  it("getHeader", async () => {
    const random = { Test: crypto.randomUUID() };
    const response = await fetch(`http://localhost:${options.port}/getHeader`, { headers: random });
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe(random.Test);
  });

  it("getHeaders", async () => {
    const random = { Fuzen: crypto.randomUUID(), Test: crypto.randomUUID() };
    const response = await fetch(`http://localhost:${options.port}/getHeaders`, { headers: random });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json["fuzen"]).toBe(random.Fuzen);
    expect(json["test"]).toBe(random.Test);
  });

  it("getQuery", async () => {
    const random = crypto.randomUUID();
    const response = await fetch(`http://localhost:${options.port}/getQuery?test=${random}`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe(random);
  });

  it("getQueries", async () => {
    const random = { test1: crypto.randomUUID(), test2: crypto.randomUUID() };
    const response = await fetch(`http://localhost:${options.port}/getQueries?test1=${random.test1}&test2=${random.test2}`);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(random);
  });

  it("getParam", async () => {
    const random = crypto.randomUUID();
    const response = await fetch(`http://localhost:${options.port}/getParam/${random}`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe(random);
  });

  it("getParams", async () => {
    const random = { test1: crypto.randomUUID(), test2: crypto.randomUUID() };
    const response = await fetch(`http://localhost:${options.port}/getParams/${random.test1}/${random.test2}`);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(random);
  });

  it("body", async () => {
    const random = crypto.randomUUID();
    const response = await fetch(`http://localhost:${options.port}/body`, { method: "POST", body: random });
    const json1 = await response.json();

    expect(response.status).toBe(200);
    expect(json1.body).toBe(random);

    const response2 = await fetch(`http://localhost:${options.port}/body`, { method: "POST", body: JSON.stringify({ test1: random, test2: random }) });
    const json2 = await response2.json();

    expect(response2.status).toBe(200);
    expect(json2).toEqual({ test1: random, test2: random });
  });
});
