import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Fuzen, IRoute, Middlewares } from "../bin/index";

const options = { host: "127.0.0.1", port: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 };
let server: Fuzen;

const example = () => {
  server = new Fuzen();

  server.use(
    Middlewares.cors({
      origin: ["test"],
      methods: ["default"],
      allowedHeaders: ["test"],
      exposedHeaders: ["test"],
      credentials: true,
      maxAge: 228,
    })
  );

  server.use(
    Middlewares.rateLimit({
      key: () => "test",
      windowMs: 60 * 1000,
      limit: 4,
      headers: true,
      response: {
        message: "Test",
        status: 228,
      },
    })
  );

  server.get("/cors", (req, res) => res.send("Test"));
  server.get("/rateLimit", (_, res, next) => res.sendJson(next.get("rateLimit")));
  const middleware1: IRoute = (req, res, next) => next.set("middleware1", true);
  const middleware2: IRoute = (req, res, next) => res.sendJson([next.get("middleware1"), true]);
  server.get("/route", middleware1, middleware2, (_, response) => response.send());

  server.listen(options, false);
};

describe("MIDDLEWARES", () => {
  beforeAll(example);
  afterAll(() => server.close());

  it("global", async () => {
    const method = await fetch(`http://localhost:${options.port}/cors`, { method: "OPTIONS" });

    expect(method.status).toBe(204);
    expect(method.headers.get("Access-Control-Allow-Origin")).toBe("test");
    expect(method.headers.get("Access-Control-Allow-Methods")).toBe("GET,HEAD,PUT,PATCH,POST,DELETE");
    expect(method.headers.get("Access-Control-Allow-Headers")).toBe("test");
    expect(method.headers.get("Access-Control-Expose-Headers")).toBe("test");
    expect(method.headers.get("Access-Control-Max-Age")).toBe("228");

    const cors = await fetch(`http://localhost:${options.port}/cors`);

    expect(cors.status).toBe(200);
    expect(cors.headers.get("Access-Control-Allow-Origin")).toBe("test");
    expect(cors.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    expect(await cors.text()).toBe("Test");

    const rateLimit = await fetch(`http://localhost:${options.port}/rateLimit`);

    expect(rateLimit.status).toBe(200);
    expect(rateLimit.headers.get("Ratelimit-Limit")).toBe("4");
    expect(rateLimit.headers.get("Ratelimit-Remaining")).toBe("1");
    expect(rateLimit.headers.get("Ratelimit-Reset")).toBeTypeOf("string");
    expect(await rateLimit.json()).toBeTypeOf("object");
  });

  it("route", async () => {
    const response = await fetch(`http://localhost:${options.port}/route`);
    const json = await response.json();

    expect(json[0]).toBe(true);
    expect(json[1]).toBe(true);
  });

  it("ratelimit", async () => {
    const response = await fetch(`http://localhost:${options.port}/route`);
    const text = await response.text();

    expect(response.status).toBe(228);
    expect(text).toBe("Test");
  });
});
