import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      messages,
      fromLanguage,
      toLanguage,
    }: {
      messages: UIMessage[];
      fromLanguage?: string;
      toLanguage?: string;
    } = await req.json();

    const systemMessage = `You are a precise translation assistant.
Translate the user's text from ${fromLanguage?.trim() || 'auto-detected source language'} to ${toLanguage?.trim() || 'English'}.
Preserve the original meaning, tone, formatting, and code blocks. Keep bullet points and line breaks.
Return ONLY the translated text without explanations, notes, or quotes.`;

    const result = streamText({
      model: openrouter.chat('openai/gpt-5-nano'),
      system: systemMessage,
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('AI translate error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to translate text' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

