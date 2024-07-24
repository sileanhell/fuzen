import fs from "fs";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Fuzen } from "../bin/index";

const options = { host: "127.0.0.1", port: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 };
let server: Fuzen;

const example = () => {
  server = new Fuzen();

  server.get("/setHeader", (_, response) => {
    response.setHeader("Fuzen", "2.0");
    response.send("Test");
  });

  server.get("/setHeaders", (_, response) => {
    response.setHeaders({ Fuzen: "2.0", Test: "work" });
    response.send("Test");
  });

  server.get("/setStatus", (_, response) => response.status(228).send("Test"));

  server.get("/sendStatus", (_, response) => response.status(228).send());

  server.get("/sendJson", (_, response) => response.sendJson({ work: true }));

  server.get("/send", (_, response) => response.send("Hello, World! Привет, мир! 12345 !@#$%^&*() こんにちは世界 😊🌟🚀 Hello\nWorld"));

  server.get("/pipeWeb", async (_, response) => {
    const stream = await fetch("https://api.myip.com");
    const conver = Readable.fromWeb(stream.body as ReadableStream);
    stream ? await response.pipe(conver) : response.close();
  });

  server.get("/pipeNode", async (_, response) => {
    const file = (options.port * 929292).toString();

    const stream = await (await fetch("https://jsonplaceholder.typicode.com/todos/1")).text();
    fs.writeFileSync(file, stream);

    const read = fs.createReadStream(file);
    await response.pipe(read);
    fs.unlinkSync(file);
  });

  server.listen(options, false);
};

describe("RESPONSE", () => {
  beforeAll(example);
  afterAll(() => server.close());

  it("setHeader", async () => {
    const response = await fetch(`http://localhost:${options.port}/setHeader`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Fuzen")).toBe("2.0");
    expect(text).toBe("Test");
  });

  it("setHeaders", async () => {
    const response = await fetch(`http://localhost:${options.port}/setHeaders`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Fuzen")).toBe("2.0");
    expect(response.headers.get("Test")).toBe("work");
    expect(text).toBe("Test");
  });

  it("setStatus", async () => {
    const response = await fetch(`http://localhost:${options.port}/setStatus`);
    const text = await response.text();

    expect(response.status).toBe(228);
    expect(text).toBe("Test");
  });

  it("sendStatus", async () => {
    const response = await fetch(`http://localhost:${options.port}/sendStatus`);
    const text = await response.text();

    expect(response.status).toBe(228);
    expect(text).toBe("");
  });

  it("sendJson", async () => {
    const response = await fetch(`http://localhost:${options.port}/sendJson`);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(json).toEqual({ work: true });
  });

  it("send", async () => {
    const response = await fetch(`http://localhost:${options.port}/send`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toBe("Hello, World! Привет, мир! 12345 !@#$%^&*() こんにちは世界 😊🌟🚀 Hello\nWorld");
  });

  it("pipe web", async () => {
    const response = await fetch(`http://localhost:${options.port}/pipeWeb`);
    const stream = await fetch("https://api.myip.com");

    const text1 = await response.text();
    const text2 = await stream.text();

    expect(text1).toBe(text2);
  });

  it("pipe node", async () => {
    const response = await fetch(`http://localhost:${options.port}/pipeNode`);
    const stream = await fetch("https://jsonplaceholder.typicode.com/todos/1");

    const text1 = await response.text();
    const text2 = await stream.text();

    expect(text1).toBe(text2);
  });
});
