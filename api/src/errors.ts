// An error we raised on purpose, because the request was wrong.
//
// The distinction matters to the error handler: the message of an AppError is
// safe to send to the client ("No species with id 99"). Any other error is a
// bug or a database failure, and its message is not.

export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
