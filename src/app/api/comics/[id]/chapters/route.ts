import { NextRequest, NextResponse } from 'next/server';
import { chaptersService } from '@/services/firebase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapters = await chaptersService.getByComicId(id);
    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { chapterNumber, title, pageImageUrls } = body;

    if (!chapterNumber || !pageImageUrls || !Array.isArray(pageImageUrls)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const chapterId = await chaptersService.create(id, {
      chapterNumber,
      title,
      pageImageUrls,
    });

    return NextResponse.json({ id: chapterId }, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { error: 'Failed to create chapter' },
      { status: 500 }
    );
  }
}
