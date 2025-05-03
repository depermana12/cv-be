export class DataBaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataBaseError";
    Object.setPrototypeOf(this, DataBaseError.prototype);
  }
}
