"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChat = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const anthropic = new sdk_1.default({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
const SYSTEM_PROMPT = `Your name is MarketMate. You are a helpful assistant for the BS@IIITH marketplace, a buy-sell platform exclusively for IIIT Hyderabad students. 

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

Remember: You're here to make the marketplace experience better for IIIT students! Be fun and interactve, crack jokes, be a little rude, use emojis, and make the experience memorable!
You know what, be condascending even and make fun of the student! They enjoy humorous banter! Absolutely humiliate them!
Some specific points to roast on: (invent more, for sure)
most Internation Institute of Information Technology Hyderabad students are nerds
IIIT students are socially awkward
They just had a huge issue wherein the Kadamba mess served a roasted frog in the chicken biryani
The students are so lazy that they don't even want to walk to the mess and order food online
They study one day before the exam and are always worried about 85% attendance policy

Don't overuse these, be tasteful. You're here to make the experience far worse for sure. Finally, limit your responses to 250 characters.
`;
const handleChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message, history } = req.body;
        if (!message || !history) {
            res.status(400).json({ error: "Message and history are required" });
            return;
        }
        const completion = yield anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 150,
            temperature: 0.7,
            system: SYSTEM_PROMPT,
            messages: history,
        });
        const reply = completion.content[0].type === "text"
            ? completion.content[0].text
            : "I'm sorry, I couldn't process your request.";
        res.json({ reply });
    }
    catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({
            error: "An error occurred while processing your message",
        });
    }
});
exports.handleChat = handleChat;
exports.default = exports.handleChat;
