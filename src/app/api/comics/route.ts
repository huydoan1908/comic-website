import { NextRequest, NextResponse } from 'next/server';
import { comicsService } from '@/services/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const genre = searchParams.get('genre');

    let comics;
    if (search) {
      comics = await comicsService.search(search);
    } else if (genre) {
      comics = await comicsService.getByGenre(genre);
    } else {
      comics = await comicsService.getAll();
    }

    return NextResponse.json(comics);
  } catch (error) {
    console.error('Error fetching comics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, author, genre, coverImageUrl } = body;

    if (!title || !description || !author || !genre || !coverImageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const comicId = await comicsService.create({
      title,
      description,
      author,
      genre,
      coverImageUrl,
    });

    return NextResponse.json({ id: comicId }, { status: 201 });
  } catch (error) {
    console.error('Error creating comic:', error);
    return NextResponse.json(
      { error: 'Failed to create comic' },
      { status: 500 }
    );
  }
}
