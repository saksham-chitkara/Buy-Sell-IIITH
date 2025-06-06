import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useItems = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createItem = async (formData: FormData) => {
    setIsLoading(true);
    try {
      // Always set quantity to 1
      formData.set("quantity", "1");
      const name = formData.get("name");
      const quantity = "1"; // Hard-coded to 1
      
      // Store original images
      const originalImages: File[] = [];
      for (const pair of formData.entries()) {
        if (pair[0] === "itemImages" && pair[1] instanceof File) {
          originalImages.push(pair[1] as File);
        }
      }
      
      // Print all formData key-value pairs for backend debug
      console.log("[DEBUG] FormData being sent to backend:");
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: [File] name=${pair[1].name}, size=${pair[1].size}`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }

      // Always create just one item
      for (let i = 0; i < 1; i++) {
        const currentFormData = new FormData();
        
        // Copy all non-file entries
        for (const [key, value] of formData.entries()) {
          if (!(value instanceof File)) {
            currentFormData.append(key, value);
          }
        }
        
        // No need to modify the name since quantity is always 1
        
        // Add all images to this item's form data
        originalImages.forEach(image => {
          currentFormData.append("itemImages", image);
        });
        
        console.debug("[createItem] Posting item:", {
          name: currentFormData.get("name"),
          quantity: currentFormData.get("quantity"),
        });
        
        try {
          // Ensure the token is in the headers
          const token = localStorage.getItem("token");
          const response = await api.post("/items", currentFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": token ? `Bearer ${token}` : undefined
            },
          });
          console.debug("[createItem] Response:", response);
        } catch (err) {
          console.error("[createItem] Error in POST /items:", err);
          throw err;
        }
      }

      toast({
        title: "Item created",
        description: "Your item has been listed successfully.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Failed to create item",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      console.error("[createItem] Final error:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const getItems = async (params?: any) => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/items", { params });
      console.log("API Response:", data); // Debug log
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid response format");
      }
      return data;
    } catch (error: any) {
      console.error("Error fetching items:", error); // Debug log
      toast({
        title: "Failed to fetch items",
        description: error.response?.data?.message || "Error fetching items",
        variant: "destructive",
      });
      return []; // Return empty array on error
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const deleteItem = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/items/${id}`);
      toast({
        title: "Item deleted",
        description: "Your item has been removed successfully.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to delete item",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  return { createItem, getItems, isLoading, deleteItem };
};
