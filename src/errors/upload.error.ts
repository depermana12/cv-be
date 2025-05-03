export class UploadError extends Error {
  public status: number;
  public cause?: unknown;
  constructor(message: string, status: number = 400, cause?: unknown) {
    super(message);
    this.name = "UploadError";
    this.status = status;
    this.cause = cause;

    Object.setPrototypeOf(this, UploadError.prototype);
  }
}
