import { prisma } from '../src/lib/prisma';
import { uploadToBlob } from '../src/lib/blob';
import fs from 'fs/promises';
import path from 'path';

/**
 * Migration script to move local images to Vercel Blob
 * Run this script after setting up Vercel Blob
 */
async function migrateImagesToBlob() {
  try {
    console.log('Starting image migration to Vercel Blob...');

    // Get all images that are stored locally
    const localImages = await prisma.medErrorImage.findMany({
      where: {
        url: {
          startsWith: '/uploads/'
        }
      }
    });

    console.log(`Found ${localImages.length} local images to migrate`);

    for (const image of localImages) {
      try {
        // Read the local file
        const filePath = path.join(process.cwd(), 'public', image.url);
        const buffer = await fs.readFile(filePath);
        
        // Extract filename from URL
        const filename = path.basename(image.url);
        
        // Upload to Vercel Blob
        const blobResult = await uploadToBlob(buffer, filename);
        
        // Update the database record
        await prisma.medErrorImage.update({
          where: { id: image.id },
          data: { url: blobResult.url }
        });
        
        console.log(`Migrated: ${image.url} -> ${blobResult.url}`);
        
        // Optionally delete the local file
        // await fs.unlink(filePath);
        // console.log(`Deleted local file: ${filePath}`);
        
      } catch (error) {
        console.error(`Failed to migrate ${image.url}:`, error);
      }
    }

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateImagesToBlob();
}

export { migrateImagesToBlob }; 