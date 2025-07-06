# Vercel Blob Setup Guide

This guide will help you set up Vercel Blob for image storage in the MedError application.

## Prerequisites

1. A Vercel account
2. Your project deployed on Vercel (or local development setup)

## Step 1: Create Vercel Blob Store

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to the **Storage** tab
4. Click **Create Store**
5. Select **Blob** as the store type
6. Choose a name for your store (e.g., `mederror-images`)
7. Select your preferred region
8. Click **Create**

## Step 2: Get Your Blob Token

1. After creating the store, go to the **Settings** tab
2. Copy the **Read/Write Token**
3. This token will be used in your environment variables

## Step 3: Set Environment Variables

### Local Development

Create a `.env.local` file in your project root:

```bash
# Database
DATABASE_URL="your_database_url_here"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your_blob_token_here"
```

### Production (Vercel)

1. Go to your project settings in Vercel Dashboard
2. Navigate to **Environment Variables**
3. Add the following variables:
   - `BLOB_READ_WRITE_TOKEN`: Your blob token from Step 2

## Step 4: Test the Integration

1. Start your development server: `pnpm dev`
2. Try uploading an image through the MedError form
3. Check that the image is stored in Vercel Blob and accessible via URL

## Step 5: Migrate Existing Images (Optional)

If you have existing images stored locally, you can migrate them to Vercel Blob:

```bash
pnpm run migrate:images
```

This script will:
- Find all local images in the database
- Upload them to Vercel Blob
- Update the database with the new URLs
- Optionally delete local files (commented out by default)

## Features

### What's Included

1. **Automatic Image Upload**: Images are automatically uploaded to Vercel Blob when creating MedError reports
2. **Image Deletion**: When a MedError is deleted, associated images are automatically removed from blob storage
3. **Fallback Support**: The system supports both local and blob URLs for backward compatibility
4. **Error Handling**: Graceful error handling for upload failures
5. **Migration Tools**: Scripts to migrate existing local images to blob storage

### File Structure

```
src/
├── lib/
│   ├── blob.ts              # Vercel Blob utilities
│   └── image-utils.ts       # Image URL handling utilities
├── app/
│   └── api/
│       ├── mederror/
│       │   ├── route.ts     # Updated to use blob storage
│       │   └── [id]/
│       │       └── route.ts # Delete endpoint with blob cleanup
scripts/
└── migrate-images-to-blob.ts # Migration script
```

## Troubleshooting

### Common Issues

1. **"BLOB_READ_WRITE_TOKEN is not defined"**
   - Make sure you've set the environment variable correctly
   - Restart your development server after adding the variable

2. **"Failed to upload file to blob storage"**
   - Check your internet connection
   - Verify the blob token is correct
   - Ensure the blob store is active in your Vercel dashboard

3. **Images not displaying**
   - Check that the image URLs are accessible
   - Verify the blob store permissions are set to public
   - Check browser console for CORS errors

### Debug Mode

To enable debug logging, add this to your environment variables:

```bash
DEBUG_BLOB=true
```

## Security Considerations

1. **Token Security**: Never commit your blob token to version control
2. **Access Control**: The current setup uses public access for images. Consider implementing access control if needed
3. **File Validation**: The system validates file types and sizes before upload
4. **Cleanup**: Images are automatically deleted when associated MedError records are removed

## Performance

- Images are served directly from Vercel's CDN
- No additional server processing required for image serving
- Automatic optimization and caching by Vercel
- Global edge distribution for faster loading times

## Cost Considerations

- Vercel Blob pricing is based on storage and bandwidth usage
- Check [Vercel's pricing page](https://vercel.com/pricing) for current rates
- Consider implementing image compression if storage costs become a concern 