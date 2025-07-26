import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker for Next.js
if (typeof window !== 'undefined') {
  // Use local worker file served from public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  
  // Alternative fallback configuration
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    console.warn('PDF.js worker not configured, using fallback');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

export interface PDFPageImage {
  pageNumber: number;
  blob: Blob;
  dataUrl: string;
}

/**
 * Convert a PDF file to an array of image blobs
 * @param pdfFile - The PDF file to convert
 * @param quality - Image quality (0.1 to 1.0), default 0.8
 * @param scale - Scale factor for rendering, default 2 for high DPI
 * @returns Promise array of image data for each page
 */
export async function convertPDFToImages(
  pdfFile: File,
  quality: number = 0.8,
  scale: number = 2
): Promise<PDFPageImage[]> {
  try {
    // Read the PDF file as array buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const images: PDFPageImage[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      // Get page viewport
      const viewport = page.getViewport({ scale });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Failed to get canvas context');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/jpeg',
          quality
        );
      });
      
      // Create data URL for preview
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      images.push({
        pageNumber: pageNum,
        blob,
        dataUrl,
      });
    }
    
    return images;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw new Error('Failed to convert PDF to images. Please make sure the file is a valid PDF.');
  }
}

/**
 * Convert PDF page images to File objects
 * @param pdfImages - Array of PDF page images
 * @param baseName - Base name for the files (without extension)
 * @returns Array of File objects
 */
export function convertPDFImagesToFiles(
  pdfImages: PDFPageImage[],
  baseName: string = 'page'
): File[] {
  return pdfImages.map((image) => {
    const fileName = `${baseName}_${String(image.pageNumber).padStart(3, '0')}.jpg`;
    return new File([image.blob], fileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  });
}

/**
 * Validate if a file is a PDF
 * @param file - File to validate
 * @returns boolean indicating if file is a PDF
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}