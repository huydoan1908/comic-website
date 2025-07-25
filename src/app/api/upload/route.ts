import { NextRequest, NextResponse } from 'next/server';
import { uploadToImgbb, uploadMultipleToImgbb } from '@/lib/imgbb';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const single = formData.get('single') === 'true';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (single) {
      // Upload single file
      const file = files[0];
      const url = await uploadToImgbb(file);
      return NextResponse.json({ url });
    } else {
      // Upload multiple files
      const urls = await uploadMultipleToImgbb(files);
      return NextResponse.json({ urls });
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
