export class DataBaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataBaseError";
  }
}
