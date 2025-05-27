"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, DEFAULT_AVATAR_URL } from "@/utils/image-helpers";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useOrders } from "@/hooks/useOrders";
import { useCart } from "@/hooks/useCart";
import { useSeller } from "@/hooks/useSeller";

const CHATBOT_NAME = "MarketMate";

interface CloudinaryImage {
  url: string;
  public_id?: string;
}

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  age: number;
  contactNumber: string;
  avatar: string | CloudinaryImage;
  overallRating: number;
  sellerReviews: Review[];
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewer: {
    avatar: string | CloudinaryImage;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function ChatPage() {
  const { messages, sendMessage, isLoading } = useChat();
  const initializedRef = useRef(false);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { getProfile } = useProfile();
  const { getOrders } = useOrders();
  const { getCart } = useCart();
  const {
    getDashboardStats,
    getOrders: getSellerOrders,
    getSellerItems,
    getBargainRequests,
  } = useSeller();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [isLoading]);

  useEffect(() => {
    const fetchProfileAndInitializeChat = async () => {
      if (initializedRef.current || !user) return;
      initializedRef.current = true;

      const data = await getProfile(user.id);
      const orders = await getOrders();
      const cart = await getCart();
      const sellerStats = await getDashboardStats();
      const sellerOrders = await getSellerOrders();
      const sellerItems = await getSellerItems();
      const sellerBargainRequests = await getBargainRequests();

      if (data) {
        const message = `THIS IS A HIDDEN SYSTEM GENERATED MESSAGE, USE THIS INFO FOR GIVING INFORMED REPLIES. ALSO, GREET THE USER NOW. BE SARCASTIC IF YOU WISH, THOUGH. YOU CAN USE THE INFO FROM THEIR REVIEWS TO BE EVEN MORE SPECIFICALLY MEAN.
          Hi, I'm ${user.firstName} ${user.lastName}. My email is ${
          user.email
        }. Here's all you need to know about me.: ${
          "Profile: " +
          JSON.stringify(data.user as UserProfile) +
          "Cart: " +
          JSON.stringify(cart) +
          "Reviews: " +
          JSON.stringify(data.reviews as Review[]) +
          "Orders: " +
          JSON.stringify(orders) +
          "My seller stats: " +
          JSON.stringify(sellerStats) +
          "My sold orders: " +
          JSON.stringify(sellerOrders) +
          "My sold items: " +
          JSON.stringify(sellerItems) +
          "My bargain requests (I am the seller for these): " +
          JSON.stringify(sellerBargainRequests)
        }.`;
        await sendMessage(message);
      }
    };

    fetchProfileAndInitializeChat();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-8rem-16px)] text-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg h-full flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-8 w-8 text-blue-500" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {CHATBOT_NAME}
              </h2>
              <p className="text-sm text-gray-600">
                Your friendly marketplace assistant
              </p>
            </div>
          </div>
        </div>

        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1 p-4 overflow-y-auto space-y-4"
        >
          {messages.map((message, index) => (
            <AnimatePresence key={index}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  message.role === "user"
                    ? "flex-row-reverse"
                    : "items-start"
                }`}
              >
                {message.role === "user" ? (
                  user && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={getAvatarUrl(user.avatar)}
                        alt={`${user.firstName}'s avatar`}
                      />
                    </Avatar>
                  )
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </motion.div>
            </AnimatePresence>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <motion.form
          onSubmit={handleSubmit}
          className="p-4 border-t border-border flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </motion.form>
      </motion.div>
    </div>
  );
}
