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
    const newMessages: Message[] = [
      ...messages,
      { role: "user" as const, content: userMessage.trim() },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data } = await api.post("/chat", {
        message: userMessage,
        history: newMessages,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
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
