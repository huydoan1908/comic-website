# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image storage in your comic website.

## Why Cloudinary?

Cloudinary offers several advantages over imgbb:

- **Better Performance**: Automatic image optimization and CDN delivery
- **Transformations**: On-the-fly image resizing, cropping, and format conversion
- **Better Organization**: Folder structure and advanced asset management
- **Reliability**: Enterprise-grade infrastructure with 99.9% uptime
- **Analytics**: Detailed usage statistics and monitoring

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Cloud Name

1. After logging in, you'll see your dashboard
2. Note down your **Cloud name** (you'll need this for environment variables)

### 3. Create an Upload Preset

For client-side uploads, you need to create an unsigned upload preset:

1. Go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Preset name**: Choose a name (e.g., `comics_unsigned`)
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: Set to `comics` (optional, for organization)
   - **Allowed formats**: Leave default or specify `jpg,jpeg,png,webp`
   - **Transformation**: Leave default for now
5. Click **Save**

### 4. Get API Credentials (Optional)

If you plan to use server-side uploads:

1. Go to **Settings** → **API Keys**
2. Note down your:
   - **API Key**
   - **API Secret**

### 5. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Required for client-side uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name

# Optional - for server-side uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Features You Get with Cloudinary

### Automatic Optimization
- Images are automatically optimized for web delivery
- Format conversion (WebP, AVIF) based on browser support
- Quality optimization based on image content

### Image Transformations
- Resize images on-the-fly by changing the URL
- Crop, scale, and apply effects without re-uploading
- Generate thumbnails automatically

### Better Organization
- Images are stored in folders (`comics/`)
- Public IDs can be customized for better organization
- Search and filter assets easily

### CDN Delivery
- Global CDN ensures fast image loading worldwide
- Automatic caching and optimization

## Migration Benefits

By switching from imgbb to Cloudinary, you get:

1. **Better Performance**: Faster image loading with global CDN
2. **Cost Efficiency**: More generous free tier (25 GB storage, 25 GB bandwidth)
3. **Advanced Features**: Image transformations, automatic optimization
4. **Better Reliability**: Enterprise-grade infrastructure
5. **Future-Proof**: Easy to scale as your application grows

## Testing Your Setup

After configuration, test the upload functionality:

1. Start your development server: `npm run dev`
2. Go to the admin panel and try uploading a comic cover
3. Check the Cloudinary dashboard to see if images appear in the `comics/` folder

## Troubleshooting

### Common Issues

**Error: "Upload preset not found"**
- Make sure the upload preset name in your environment variables matches exactly
- Ensure the preset is set to "Unsigned"

**Error: "Invalid cloud name"**
- Check that your cloud name is correct (no spaces, special characters)
- Make sure you're using the exact cloud name from your Cloudinary dashboard

**Images not appearing**
- Check browser console for CORS errors
- Ensure your domain is added to allowed origins in Cloudinary settings

### Support

For more help:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Widget Guide](https://cloudinary.com/documentation/upload_widget)
- [Cloudinary Support](https://support.cloudinary.com/)
