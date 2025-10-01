import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.github.com/models', {
      headers: {
        'Authorization': `Bearer ${process.env.PAT_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Accept': 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API error:', error);
      return NextResponse.json(
        { error: `GitHub API error: ${response.status}`, details: error },
        { status: response.status }
      );
    }

    const models = await response.json();
    
    return NextResponse.json({ 
      success: true,
      count: models.length || 0,
      models 
    });
  } catch (error: any) {
    console.error('Error fetching GitHub models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub models', message: error.message },
      { status: 500 }
    );
  }
}
