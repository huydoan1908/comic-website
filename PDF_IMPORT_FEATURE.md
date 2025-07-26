# PDF Import Feature for Comic Chapters

This document explains the new PDF import feature that allows uploading PDF files and automatically splitting them into individual page images for comic chapters.

## Features

### 1. PDF File Upload
- Users can now upload PDF files in addition to individual image files
- PDF files are automatically processed and split into individual pages
- Each page is converted to a high-quality JPEG image

### 2. Automatic Page Extraction
- PDF pages are rendered at high resolution (2x scale) for crisp quality
- Pages are automatically numbered and named consistently
- Preview images are generated for immediate feedback

### 3. Mixed Upload Support
- Users can upload both PDF files and individual images in the same session
- All files are processed and combined in the order they were uploaded
- Files are sorted alphabetically when uploaded together

## How to Use

### For Users (Admin Interface)

1. **Navigate to Add New Chapter**
   - Go to Admin > Comics > [Select Comic] > Add New Chapter

2. **Upload Options**
   - **Individual Images**: Use the left upload area for PNG, JPG, GIF files
   - **PDF Files**: Use the right upload area (blue border) for PDF files

3. **PDF Processing**
   - Select a PDF file using the "Upload PDF" button
   - The system will show a "Processing PDF file(s)..." message
   - Pages will automatically appear in the preview grid once processed

4. **Page Management**
   - All pages (from images and PDFs) appear in the same preview grid
   - Use the X button to remove unwanted pages
   - Pages are displayed in upload order

5. **Submit Chapter**
   - Fill in chapter number and optional title
   - Click "Create Chapter" to upload all pages to Cloudinary and save

### Technical Details

#### File Processing
- **PDF Quality**: 0.9 JPEG quality for optimal file size vs quality balance
- **Resolution**: 2x scale rendering for high-DPI displays
- **Naming Convention**: `{comicName}_chap{chapterNumber}_page_{pageNumber}.jpg`

#### Supported Formats
- **PDF**: `.pdf` files with `application/pdf` MIME type
- **Images**: PNG, JPG, GIF, WebP, and other browser-supported image formats

#### File Size Limits
- Individual image files: Up to 10MB each
- PDF files: No specific limit set (limited by browser memory and Cloudinary)

## Implementation Details

### New Files
- `src/lib/pdf-utils.ts`: Core PDF processing utilities
- Enhanced `src/app/admin/comics/[id]/chapters/new/page.tsx`: Updated UI and logic

### Key Functions

#### `convertPDFToImages(pdfFile, quality, scale)`
Converts a PDF file to an array of image blobs with preview URLs.

```typescript
const images = await convertPDFToImages(pdfFile, 0.9, 2);
// Returns: PDFPageImage[] with pageNumber, blob, and dataUrl
```

#### `convertPDFImagesToFiles(pdfImages, baseName)`
Converts PDF page images to File objects for upload.

```typescript
const files = convertPDFImagesToFiles(images, 'comic_chapter_1');
// Returns: File[] ready for upload
```

#### `isPDFFile(file)`
Validates if a file is a PDF based on MIME type or file extension.

```typescript
const isPDF = isPDFFile(file);
// Returns: boolean
```

### Dependencies Added
- `pdfjs-dist`: Mozilla's PDF.js library for client-side PDF processing
- No server-side dependencies required

## Error Handling

### Common Issues
1. **Invalid PDF**: User receives alert about invalid PDF file
2. **Processing Error**: User receives alert to try again
3. **Memory Issues**: Large PDFs may cause browser memory issues

### Error Messages
- "Failed to process PDF file. Please make sure it's a valid PDF and try again."
- Processing status is shown with spinner during PDF conversion

## Performance Considerations

### Memory Usage
- Large PDF files are processed in memory
- Consider file size limits for production use
- Pages are processed sequentially to manage memory

### Network Upload
- All pages are uploaded to Cloudinary after processing
- Progress feedback during chapter creation
- Failed uploads will show error message

## Future Enhancements

### Potential Improvements
1. **Drag & Drop**: Add drag-and-drop support for files
2. **Page Reordering**: Allow users to reorder pages after upload
3. **Bulk Operations**: Support for multiple PDF files at once
4. **Progress Indicators**: Show upload progress for individual files
5. **Quality Settings**: Allow users to adjust image quality/resolution
6. **Page Range Selection**: Allow selecting specific pages from PDF

### Security Considerations
1. **File Validation**: Ensure uploaded files are actually PDFs
2. **Size Limits**: Implement reasonable file size limits
3. **Content Scanning**: Consider scanning for malicious content in production

## Browser Compatibility

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Requirements
- JavaScript enabled
- Canvas API support
- File API support
- Web Workers support (for PDF.js)

## Troubleshooting

### Common Problems

1. **PDF not processing**
   - Check browser console for errors
   - Ensure PDF is not password-protected
   - Try with a smaller PDF file

2. **Poor image quality**
   - PDF may have low-resolution images
   - Try adjusting scale parameter in code

3. **Browser freezing**
   - PDF file may be too large
   - Try processing smaller PDF files

4. **Upload fails**
   - Check internet connection
   - Verify Cloudinary configuration
   - Check browser console for errors
