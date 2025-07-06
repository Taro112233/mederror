import { put, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

export interface BlobUploadResult {
  url: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
  uploadedAt: Date;
}

export interface BlobDeleteResult {
  success: boolean;
  message?: string;
}

/**
 * Upload a file to Vercel Blob
 */
export async function uploadToBlob(
  file: File | Buffer,
  filename?: string
): Promise<BlobUploadResult> {
  try {
    let buffer: Buffer;
    let contentType: string;
    let name: string;

    if (file instanceof File) {
      buffer = Buffer.from(await file.arrayBuffer());
      contentType = file.type;
      name = filename || file.name;
    } else {
      buffer = file;
      contentType = 'application/octet-stream';
      name = filename || `file-${uuidv4()}`;
    }

    // Generate unique filename if not provided
    const uniqueFilename = filename || `${uuidv4()}-${name}`;

    const blob = await put(uniqueFilename, buffer, {
      access: 'public',
      contentType,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
      size: buffer.length,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw new Error('Failed to upload file to blob storage');
  }
}

/**
 * Delete a file from Vercel Blob
 */
export async function deleteFromBlob(url: string): Promise<BlobDeleteResult> {
  try {
    await del(url);
    return { success: true };
  } catch (error) {
    console.error('Error deleting from blob:', error);
    return { 
      success: false, 
      message: 'Failed to delete file from blob storage' 
    };
  }
}

/**
 * Upload multiple files to Vercel Blob
 */
export async function uploadMultipleToBlob(
  files: (File | Buffer)[],
  filenames?: string[]
): Promise<BlobUploadResult[]> {
  const uploadPromises = files.map((file, index) => 
    uploadToBlob(file, filenames?.[index])
  );
  
  return Promise.all(uploadPromises);
}

/**
 * Delete multiple files from Vercel Blob
 */
export async function deleteMultipleFromBlob(
  urls: string[]
): Promise<BlobDeleteResult[]> {
  const deletePromises = urls.map(url => deleteFromBlob(url));
  
  return Promise.all(deletePromises);
} 