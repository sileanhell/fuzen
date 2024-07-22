import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const file = join(dirname(fileURLToPath(import.meta.url)), "../../", "libs", `uws_${process.platform}_${process.arch}_${process.versions.modules}.node`);
const uws: App = createRequire(import.meta.url)(file);

export type us_listen_socket = {};
export type us_socket_context_t = {};
export type us_socket = {};

export type RecognizedString = string | ArrayBuffer | Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array;

export enum ListenOptions {
  LIBUS_LISTEN_DEFAULT = 0,
  LIBUS_LISTEN_EXCLUSIVE_PORT = 1,
}

export interface AppOptions {
  key_file_name?: RecognizedString;
  cert_file_name?: RecognizedString;
  ca_file_name?: RecognizedString;
  passphrase?: RecognizedString;
  dh_params_file_name?: RecognizedString;
  ssl_ciphers?: RecognizedString;
  ssl_prefer_low_memory_usage?: boolean;
}

export interface WebSocket<UserData> {
  send(message: RecognizedString, isBinary?: boolean, compress?: boolean): number;
  getBufferedAmount(): number;
  end(code?: number, shortMessage?: RecognizedString): void;
  close(): void;
  ping(message?: RecognizedString): number;
  subscribe(topic: RecognizedString): boolean;
  unsubscribe(topic: RecognizedString): boolean;
  isSubscribed(topic: RecognizedString): boolean;
  getTopics(): string[];
  publish(topic: RecognizedString, message: RecognizedString, isBinary?: boolean, compress?: boolean): boolean;
  cork(cb: () => void): WebSocket<UserData>;
  getRemoteAddress(): ArrayBuffer;
  getRemoteAddressAsText(): ArrayBuffer;
  getUserData(): UserData;
}

export interface HttpResponse {
  pause(): void;
  resume(): void;
  writeStatus(status: RecognizedString): HttpResponse;
  writeHeader(key: RecognizedString, value: RecognizedString): HttpResponse;
  write(chunk: RecognizedString): boolean;
  end(body?: RecognizedString, closeConnection?: boolean): HttpResponse;
  endWithoutBody(reportedContentLength?: number, closeConnection?: boolean): HttpResponse;
  tryEnd(fullBodyOrChunk: RecognizedString, totalSize: number): [boolean, boolean];
  close(): HttpResponse;
  getWriteOffset(): number;
  onWritable(handler: (offset: number) => boolean): HttpResponse;
  onAborted(handler: () => void): HttpResponse;
  onData(handler: (chunk: ArrayBuffer, isLast: boolean) => void): HttpResponse;
  getRemoteAddress(): ArrayBuffer;
  getRemoteAddressAsText(): ArrayBuffer;
  getProxiedRemoteAddress(): ArrayBuffer;
  getProxiedRemoteAddressAsText(): ArrayBuffer;
  cork(cb: () => void): HttpResponse;
  upgrade<UserData>(
    userData: UserData,
    secWebSocketKey: RecognizedString,
    secWebSocketProtocol: RecognizedString,
    secWebSocketExtensions: RecognizedString,
    context: us_socket_context_t
  ): void;
  [key: string]: any;
}

export interface HttpRequest {
  getHeader(lowerCaseKey: RecognizedString): string;
  getParameter(index: number): string;
  getUrl(): string;
  getMethod(): string;
  getCaseSensitiveMethod(): string;
  getQuery(): string;
  getQuery(key: string): string | undefined;
  forEach(cb: (key: string, value: string) => void): void;
  setYield(_yield: boolean): HttpRequest;
}

export interface TemplatedApp {
  listen(host: RecognizedString, port: number, cb: (listenSocket: us_listen_socket | false) => void | Promise<void>): TemplatedApp;
  listen(port: number, cb: (listenSocket: us_listen_socket | false) => void | Promise<void>): TemplatedApp;
  listen(port: number, options: ListenOptions, cb: (listenSocket: us_listen_socket | false) => void | Promise<void>): TemplatedApp;
  listen_unix(cb: (listenSocket: us_listen_socket) => void | Promise<void>, path: RecognizedString): TemplatedApp;
  get(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>): TemplatedApp;
  post(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>): TemplatedApp;
  options(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>): TemplatedApp;
  del(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>): TemplatedApp;
  patch(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>): TemplatedApp;
  put(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>): TemplatedApp;
  head(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>): TemplatedApp;
  connect(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>): TemplatedApp;
  trace(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>): TemplatedApp;
  any(pattern: RecognizedString, handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>): TemplatedApp;
  ws<UserData>(pattern: RecognizedString, behavior: WebSocketBehavior<UserData>): TemplatedApp;
  publish(topic: RecognizedString, message: RecognizedString, isBinary?: boolean, compress?: boolean): boolean;
  numSubscribers(topic: RecognizedString): number;
  addServerName(hostname: string, options: AppOptions): TemplatedApp;
  domain(domain: string): TemplatedApp;
  removeServerName(hostname: string): TemplatedApp;
  missingServerName(cb: (hostname: string) => void): TemplatedApp;
  filter(cb: (res: HttpResponse, count: Number) => void | Promise<void>): TemplatedApp;
  close(): TemplatedApp;
}

export interface WebSocketBehavior<UserData> {
  maxPayloadLength?: number;
  closeOnBackpressureLimit?: boolean;
  maxLifetime?: number;
  idleTimeout?: number;
  compression?: number;
  maxBackpressure?: number;
  sendPingsAutomatically?: boolean;
  upgrade?: (res: HttpResponse, req: HttpRequest, context: us_socket_context_t) => void | Promise<void>;
  open?: (ws: WebSocket<UserData>) => void | Promise<void>;
  message?: (ws: WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) => void | Promise<void>;
  dropped?: (ws: WebSocket<UserData>, message: ArrayBuffer, isBinary: boolean) => void | Promise<void>;
  drain?: (ws: WebSocket<UserData>) => void;
  close?: (ws: WebSocket<UserData>, code: number, message: ArrayBuffer) => void;
  ping?: (ws: WebSocket<UserData>, message: ArrayBuffer) => void;
  pong?: (ws: WebSocket<UserData>, message: ArrayBuffer) => void;
  subscription?: (ws: WebSocket<UserData>, topic: ArrayBuffer, newCount: number, oldCount: number) => void;
}

export interface MultipartField {
  data: ArrayBuffer;
  name: string;
  type?: string;
  filename?: string;
}

export interface App {
  App: (options?: AppOptions) => TemplatedApp;
  SSLApp: (options: AppOptions) => TemplatedApp;
  getParts: (body: RecognizedString, contentType: RecognizedString) => MultipartField[] | undefined;
  us_listen_socket_close: (listenSocket: us_listen_socket) => void;
  us_socket_local_port: (socket: us_socket) => unknown;
  DISABLED: number;
  SHARED_COMPRESSOR: number;
  SHARED_DECOMPRESSOR: number;
  DEDICATED_DECOMPRESSOR: number;
  DEDICATED_COMPRESSOR: number;
  DEDICATED_COMPRESSOR_3KB: number;
  DEDICATED_COMPRESSOR_4KB: number;
  DEDICATED_COMPRESSOR_8KB: number;
  DEDICATED_COMPRESSOR_16KB: number;
  DEDICATED_COMPRESSOR_32KB: number;
  DEDICATED_COMPRESSOR_64KB: number;
  DEDICATED_COMPRESSOR_128KB: number;
  DEDICATED_COMPRESSOR_256KB: number;
  DEDICATED_DECOMPRESSOR_32KB: number;
  DEDICATED_DECOMPRESSOR_16KB: number;
  DEDICATED_DECOMPRESSOR_8KB: number;
  DEDICATED_DECOMPRESSOR_4KB: number;
  DEDICATED_DECOMPRESSOR_2KB: number;
  DEDICATED_DECOMPRESSOR_1KB: number;
  DEDICATED_DECOMPRESSOR_512B: number;
  LIBUS_LISTEN_EXCLUSIVE_PORT: number;
}

export const { App, SSLApp } = uws;
