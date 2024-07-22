import fs from "fs";
import { generate } from "selfsigned";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Fuzen } from "../bin/index";
import https from "https";

const pemsFiles = [`${Date.now()}${(Math.random() * 1e8).toFixed()}`, `${Date.now()}${(Math.random() * 1e8).toFixed()}`];
const options = { host: "127.0.0.1", port: Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000 };
let server: Fuzen;

const example = () => {
  const pems = generate();
  fs.writeFileSync(pemsFiles[0], pems.cert);
  fs.writeFileSync(pemsFiles[1], pems.private);

  server = new Fuzen({ cert_file_name: pemsFiles[0], key_file_name: pemsFiles[1] });
  server.get("/", (_, response) => response.send());
  server.listen(options, false);
};

const end = () => {
  server.close();
  fs.unlinkSync(pemsFiles[0]);
  fs.unlinkSync(pemsFiles[1]);
};

describe("HTTPS", () => {
  beforeAll(example);
  afterAll(end);

  it("server", async () => {
    const response = await new Promise((resolve, reject) => {
      const req = https.get(`https://localhost:${options.port}`, { agent: new https.Agent({ rejectUnauthorized: false }) }, (data) => resolve(data.statusCode));
      req.on("error", reject);
    });
    expect(response).toBe(200);
  });
});
