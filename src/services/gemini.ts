import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY. Add it to your .env file.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export type Message = {
    role: 'user' | 'model';
    text: string;
};

export async function sendMessage(messages: Message[]): Promise<string> {
    const chat = model.startChat({
        history: messages.slice(0, -1).map(m => ({
            role: m.role,
            parts: [{ text: m.text }],
        })),
    });

    const lastMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessage(lastMessage);
    return result.response.text();
}
