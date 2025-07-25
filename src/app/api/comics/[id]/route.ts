import { NextRequest, NextResponse } from 'next/server';
import { comicsService } from '@/services/firebase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comic = await comicsService.getById(id);
    
    if (!comic) {
      return NextResponse.json(
        { error: 'Comic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(comic);
  } catch (error) {
    console.error('Error fetching comic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comic' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, author, genre, coverImageUrl } = body;

    await comicsService.update(id, {
      title,
      description,
      author,
      genre,
      coverImageUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating comic:', error);
    return NextResponse.json(
      { error: 'Failed to update comic' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await comicsService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comic:', error);
    return NextResponse.json(
      { error: 'Failed to delete comic' },
      { status: 500 }
    );
  }
}
