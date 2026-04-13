import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getAnimeCollection } from '@/lib/mongodb';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const collection = await getAnimeCollection(userId);
    const animeList = await collection.find({ userId }).toArray();

    // Map _id to id for frontend compatibility
    const mapped = animeList.map(({ _id, userId: _uid, ...rest }) => ({
      ...rest,
      id: rest.id || _id.toString(),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error('GET /api/anime error:', err);
    return NextResponse.json({ error: 'Failed to fetch anime' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate an ID if the client didn't provide one
    if (!body.id) {
      body.id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    }

    const doc = { ...body, userId };
    const collection = await getAnimeCollection(userId);
    await collection.insertOne(doc);

    // Return without _id and userId (frontend doesn't need them)
    const { _id, userId: _uid, ...response } = doc;
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error('POST /api/anime error:', err);
    return NextResponse.json({ error: 'Failed to process POST' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'ID is required to update' }, { status: 400 });
    }

    const { id, ...updates } = body;
    const collection = await getAnimeCollection(userId);

    // Only update if the document belongs to this user
    const result = await collection.findOneAndUpdate(
      { id, userId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    const { _id, userId: _uid, ...response } = result;
    return NextResponse.json({ ...response, id }, { status: 200 });
  } catch (err) {
    console.error('PUT /api/anime error:', err);
    return NextResponse.json({ error: 'Failed to process PUT' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    const collection = await getAnimeCollection(userId);
    // Only delete if the document belongs to this user (prevents cross-user deletion)
    const result = await collection.deleteOne({ id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/anime error:', err);
    return NextResponse.json({ error: 'Failed to process DELETE' }, { status: 500 });
  }
}
