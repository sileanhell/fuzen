import { IRequest, IResponse } from "../index.js";

export type IRoute = (request: IRequest, response: IResponse, next: Map<any, any>) => unknown;
