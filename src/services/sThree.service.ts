import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, bucketName } from "../lib/aws";
import { ulid } from "ulid";

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
  const fileExtension = contentType.split("/")[1] || "jpg";
  const key = `${folder}/${ulid()}.${fileExtension}`;

  const uploadDetail = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, uploadDetail, { expiresIn: 3600 });

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
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
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
export async function listObjects(prefix: string = "uploads/"): Promise<any[]> {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);
  return response.Contents || [];
}
