import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useOrders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getOrders = async (status?: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/orders", {
        params: { status, type: "bought" },
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch orders",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      });
      return [];
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const regenerateOTP = async (orderId: string) => {
    try {
      const { data } = await api.post(`/orders/${orderId}/regenerate-otp`);
      toast({
        title: "OTP Regenerated",
        description: `New OTP: ${data.otp}`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to regenerate OTP",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      return null;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await api.post(`/orders/${orderId}/cancel`);
      toast({
        title: "Order cancelled",
        description: "The order has been cancelled successfully.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to cancel order",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      return false;
    }
  };

  const createOrder = async (cartItemIds: string[], recaptchaToken: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/orders", {
        cartItemIds,
        recaptchaToken,
      });
      toast({
        title: "Order placed successfully",
        description: "Check your orders page for OTP and delivery status.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to place order",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  return {
    getOrders,
    regenerateOTP,
    cancelOrder,
    isLoading,
    createOrder,
  };
};
