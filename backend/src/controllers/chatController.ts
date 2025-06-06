import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const conversationSessions = new Map();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

// Use a valid model name for your API key
const SYSTEM_PROMPT = `Your name is ShopBot. You are a helpful assistant for the CampusMart marketplace, a buy-sell platform exclusively for IIIT Hyderabad students. 

Key features of the platform:
1. Users can buy and sell items within the IIIT community
2. Only IIIT email addresses (@iiit.ac.in) are allowed
3. Users can bargain on items
4. OTP verification for delivery completion
5. Rating system for users
6. Multiple images per item
7. Categories include: "Academic Materials", "Electronics", "Room Essentials", "Study Equipment", "Sports & Fitness", "Lab Equipment", "Entertainment", "Bicycles", "Apparel", "Tech Accessories", "Books & Magazines", "Food & Appliances", "Art & Stationery", "Event Equipment", "Transportation", "Others"

Your role:
- Help users understand how to use the platform
- Explain features like bargaining, OTP verification, and ratings
- Provide tips for buying and selling
- Answer questions about policies and procedures
- Maintain a friendly, helpful tone
- Be concise but informative

Important policies:
- Users cannot buy their own items
- Sellers must verify delivery with buyer's OTP
- Bargaining is allowed but must be respectful
- Images are required for listings
- Only IIIT community members can participate

If you're unsure about something, admit it and suggest contacting support.

Remember: You're here to provide professional assistance to IIIT Hyderabad students using the CampusMart platform. Maintain a formal, helpful tone at all times. Be concise and informative when answering questions.

- Always respond with respect and courtesy
- Provide clear and accurate information about the marketplace
- Address students professionally
- Use complete sentences and proper grammar
- Be thorough yet concise in your explanations
- Focus on providing value through your responses

Please limit your responses to approximately 250 characters to ensure clarity and readability.
`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const handleChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message, sessionId = Date.now().toString() } = req.body;

    // Initialize session if it doesn't exist
    if (!conversationSessions.has(sessionId)) {
      const initialSession: ChatMessage[] = [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        }
      ];
      conversationSessions.set(sessionId, initialSession);
    }

    const session: ChatMessage[] = conversationSessions.get(sessionId);

    // If this is the first message, add welcome message
    if (session.length === 1 && !message) {
      res.json({
        response: "Welcome to CampusMart. I'm ShopBot, your assistant for the IIIT-H marketplace. How may I help you today?"
      });
      return;
    }

    // Add user message to history
    session.push({
      role: 'user',
      content: message
    });

    // Format chat history for Gemini (latest API)
    const formattedHistory = session.map((msg: ChatMessage) => ({
      role: msg.role === 'system' ? 'user' : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Generate response using the latest API
    const result = await model.generateContent({
      contents: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
        topK: 40,
        topP: 0.95,
      },
    });

    const aiResponse = result.response.text();

    // Add AI response to history
    session.push({
      role: 'assistant',
      content: aiResponse
    });

    // Maintain a reasonable history size
    const MAX_HISTORY = 20;
    if (session.length > MAX_HISTORY) {
      // Keep system message and last (MAX_HISTORY-1) messages
      session.splice(1, session.length - MAX_HISTORY);
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Failed to generate response"
    });
  }
};

export const createNewSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sessionId = Date.now().toString();
  res.json({ sessionId });
};
