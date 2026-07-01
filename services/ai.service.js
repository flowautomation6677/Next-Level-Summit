import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../prompts/sales-assistant.js';

let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

async function getChatReply(conversationHistory) {
    if (!openai) {
        throw new Error('NOT_CONFIGURED');
    }

    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory
    ];

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using a fast, cost-effective model
        messages: messages,
        temperature: 0.2,
        max_tokens: 300
    });

    return completion.choices[0].message.content;
}

export { getChatReply };
