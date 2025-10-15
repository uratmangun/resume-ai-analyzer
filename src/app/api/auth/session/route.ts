import { NextResponse } from 'next/server';
import auth0 from '@/lib/auth0';

export async function GET() {
  try {
    const session = await auth0.getSession();
    
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    return NextResponse.json({ 
      user: {
        sub: session.user.sub,
        name: session.user.name,
        email: session.user.email,
        picture: session.user.picture,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
