import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    // Add user message to the chat
    // Only add the user message to visible messages if it's not a system message
    if (!userMessage.includes("THIS IS A HIDDEN SYSTEM GENERATED MESSAGE")) {
      setMessages(prev => [...prev, { role: "user" as const, content: userMessage.trim() }]);
    }
    
    // Use the complete history for API requests
    const newMessages: Message[] = [
      ...messages,
      { role: "user" as const, content: userMessage.trim() },
    ];
    setIsLoading(true);

    try {
      const { data } = await api.post("/chat", {
        message: userMessage,
        history: newMessages,
      });

      // Extract the assistant's response
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: Array.isArray(data.reply) ? data.reply.join('\n') : data.reply },
        ]);
      } else if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      }
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error.response as any)?.data?.message
          : "Failed to get response from assistant";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      // Remove the user message if the request failed
      setMessages((prev) => prev.slice(0, -1));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
  };
};
