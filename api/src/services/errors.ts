export class ServiceError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const errors = {
  notFound(code: string, message: string) {
    return new ServiceError(code, message, 404);
  },
  badRequest(code: string, message: string) {
    return new ServiceError(code, message, 400);
  },
  unavailable(code: string, message: string) {
    return new ServiceError(code, message, 503);
  }
};
