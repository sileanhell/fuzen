import { IRequest, IResponse } from "../index.js";

export const slowDown = () => (request: IRequest, response: IResponse, next: Map<any, any>) => {};
