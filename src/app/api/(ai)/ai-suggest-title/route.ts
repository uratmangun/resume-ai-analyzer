import { streamText, convertToModelMessages, type UIMessage } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, context }: { messages: UIMessage[]; context?: string } = await req.json();

    // Build system message with context
    const systemMessage = context 
      ? `You are a professional resume title generator. Based on the following resume information, suggest a professional and descriptive title for the resume.

Resume Information:
${context}

Generate only a short, professional resume title (max 60 characters). 

IMPORTANT: Return ONLY the title text. Do NOT include:
- Character counts
- Quotes around the title
- Additional commentary or suggestions
- Explanations or notes

Examples of correct format:
Senior Software Engineer - Full Stack Developer 2024
Data Scientist with ML/AI Expertise
Frontend Developer - React & TypeScript Specialist`
      : `You are a professional resume title generator. Generate a short, professional resume title (max 60 characters) based on the user's request or description. Be creative and professional.

IMPORTANT: Return ONLY the title text. Do NOT include:
- Character counts
- Quotes around the title
- Additional commentary or suggestions
- Explanations or notes

Examples of correct format:
Senior Software Engineer - Full Stack Developer 2024
Data Scientist with ML/AI Expertise
Frontend Developer - React & TypeScript Specialist
Marketing Manager - Digital Strategy Expert
Product Designer - UX/UI Specialist`;

    // Use AI Gateway with the specified model
    const result = streamText({
      model: 'meituan/longcat-flash-chat',
      system: systemMessage,
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('AI suggestion error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to generate suggestion' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

