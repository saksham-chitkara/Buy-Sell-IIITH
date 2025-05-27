import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

export const ChatButton = () => (
  <Button variant="ghost" size="icon" className="relative" >
    <MessageCircle className="h-5 w-5" />
  </Button>
);
