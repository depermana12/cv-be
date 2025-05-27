import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, bucketName } from "../lib/aws";
import { ulid } from "ulid";
import { UploadError } from "../errors/upload.error";

type S3Object = {
  key: string;
  lastModified?: Date;
  size?: number;
  etag?: string;
  storageClass?: string;
};

const ALLOWED_CONTENT_TYPE = ["image/jpeg", "image/png", "application/pdf"];
const DEFAULT_EXPIRATION = Number(process.env.S3_URL_EXPIRATION) || 3600;

function validateContentType(contentType: string) {
  if (!ALLOWED_CONTENT_TYPE.includes(contentType)) {
    throw new UploadError(
      `Unsupported content type: ${contentType}. Allowed types are: ${ALLOWED_CONTENT_TYPE.join(
        ", ",
      )}`,
    );
  }
}

function normalizeFolder(folder: string): string {
  return folder.replace(/\/+$/, ""); // Remove trailing slashes
}

/**
 * Generate a presigned URL for direct client-side uploads
 * @param contentType - The MIME type of the file to be uploaded
 * @param folder - The folder in the S3 bucket where the file will be uploaded
 * @return A promise that resolves to an object containing the presigned URL and the key of the uploaded file
 */
export async function generatePresignedUploadUrl(
  contentType: string,
  folder: string = "uploads",
): Promise<{ url: string; key: string }> {
  validateContentType(contentType);
  const fileExtension = contentType.split("/")[1] || "jpg";
  const normalizedFolder = normalizeFolder(folder);
  const key = `${normalizedFolder}/${ulid()}.${fileExtension}`;

  const uploadDetail = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, uploadDetail, {
    expiresIn: DEFAULT_EXPIRATION,
  });

  return { url, key };
}

/**
 * Generate a presigned URL for downloading a file
 * @param key - The key of the file to be downloaded
 * @return A promise that resolves to the presigned URL for the file
 */
export async function generatePresignedGetUrl(key: string): Promise<string> {
  const getDetail = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return getSignedUrl(s3Client, getDetail, { expiresIn: 3600 });
}

/**
 * Delete an object from S3
 * @param key - The key of the object to be deleted
 * @return A promise that resolves when the object is deleted
 */
export async function deleteObject(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    throw new UploadError(`Failed to delete object with key ${key}`);
  }
}

/**
 * Upload a file directly from the server to S3
 * @param buffer - The file buffer to be uploaded
 * @param fileName - The name of the file to be uploaded
 * @param contentType - The MIME type of the file to be uploaded
 * @param folder - The folder in the S3 bucket where the file will be uploaded
 * @return A promise that resolves to the key of the uploaded file
 */
export async function directUpload(
  buffer: Buffer,
  fileName: string,
  contentType: string = "image/jpeg",
  folder: string = "uploads",
): Promise<string> {
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return key;
}

/**
 * List objects in a specific folder in S3
 * @param prefix - The folder prefix to list objects from
 * @return A promise that resolves to an array of objects in the specified folder
 */
export async function listObjects(
  prefix: string = "uploads/",
): Promise<S3Object[]> {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);

  return (
    response.Contents?.filter((item) => item.Key !== undefined).map((item) => ({
      key: item.Key as string,
      lastModified: item.LastModified,
      size: item.Size,
      etag: item.ETag,
      storageClass: item.StorageClass,
    })) || []
  );
}
