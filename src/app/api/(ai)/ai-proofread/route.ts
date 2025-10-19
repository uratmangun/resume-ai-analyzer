import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const systemMessage = `You are a professional proofreader and editor.
Improve grammar, clarity, concision, and tone while preserving meaning and author voice.
Maintain original formatting, bullet points, and line breaks. Do not add content.
Return ONLY the corrected text without explanations, notes, or quotes.`;

    const result = streamText({
      model: openrouter.chat('z-ai/glm-4.5-air:free'),
      system: systemMessage,
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('AI proofread error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to proofread text' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

