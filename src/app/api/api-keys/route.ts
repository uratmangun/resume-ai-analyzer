import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

// GET - List all API keys for the current user
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const keys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(apiKeys.createdAt);

    return NextResponse.json(keys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate a secure API key
    const key = `sk_${randomBytes(32).toString('hex')}`;

    const [newKey] = await db
      .insert(apiKeys)
      .values({
        userId,
        name,
        key,
      })
      .returning();

    return NextResponse.json(newKey, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}

