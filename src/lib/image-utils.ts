/**
 * Check if an image URL is from Vercel Blob
 */
export function isBlobUrl(url: string): boolean {
  return url.includes('blob.vercel-storage.com') || url.includes('vercel-storage.com');
}

/**
 * Check if an image URL is a local upload
 */
export function isLocalUploadUrl(url: string): boolean {
  return url.startsWith('/uploads/');
}

/**
 * Get the appropriate image URL with fallback
 */
export function getImageUrl(url: string): string {
  // If it's already a full URL (blob or external), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a local upload, prepend the base URL
  if (isLocalUploadUrl(url)) {
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${url}`;
  }
  
  // Fallback to the original URL
  return url;
}

/**
 * Validate if a URL is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's a valid URL
  try {
    new URL(url);
  } catch {
    // If it's not a valid URL, check if it's a local path
    if (!url.startsWith('/')) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get image dimensions from URL (placeholder for future implementation)
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = getImageUrl(url);
  });
} 