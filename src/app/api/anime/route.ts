import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function getDbPath(userId: string | null) {
  if (userId) {
    return path.join(process.cwd(), 'data', 'users', userId, 'db.json');
  }
  return path.join(process.cwd(), 'data', 'db.json');
}

async function getDb(userId: string | null) {
  const p = getDbPath(userId);
  try {
    const data = await fs.readFile(p, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { anime: [] };
  }
}

async function saveDb(userId: string | null, data: any) {
  const p = getDbPath(userId);
  try {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to save DB', error);
    return false;
  }
}

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  const db = await getDb(userId);
  return NextResponse.json(db.anime);
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  try {
    const body = await request.json();
    const db = await getDb(userId);

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newAnime = { ...body };
    if (!newAnime.id) {
      newAnime.id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    }

    db.anime.push(newAnime);
    await saveDb(userId, db);

    return NextResponse.json(newAnime, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process POST' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = request.headers.get('x-user-id');
  try {
    const body = await request.json();
    const db = await getDb(userId);

    if (!body.id) {
      return NextResponse.json({ error: 'ID is required to update' }, { status: 400 });
    }

    const index = db.anime.findIndex((a: any) => a.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    db.anime[index] = { ...db.anime[index], ...body };
    await saveDb(userId, db);

    return NextResponse.json(db.anime[index], { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process PUT' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = request.headers.get('x-user-id');
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    const db = await getDb(userId);
    const initialLength = db.anime.length;
    db.anime = db.anime.filter((a: any) => a.id !== id);

    if (db.anime.length === initialLength) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    await saveDb(userId, db);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process DELETE' }, { status: 500 });
  }
}
