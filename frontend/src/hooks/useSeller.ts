import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalEarnings: number;
  pendingOrdersCount: number;
  completedOrdersCount: number;
  salesData: {
    date: string;
    revenue: number;
    bargainedRevenue: number;
  }[];
}

interface Order {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  originalPrice: number;
  bargainedPrice: number | null;
  status: "PENDING" | "BARGAINING" | "DELIVERED" | "CANCELLED";
  date: string;
  quantity: number;
}

interface BargainRequest {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  originalPrice: number;
  requestedPrice: number;
  message: string;
  cartItemId: string;
}

export const useSeller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getDashboardStats = async (): Promise<DashboardStats | null> => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/seller/stats");
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch stats",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      });
      return null;
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const getOrders = async (status?: string): Promise<Order[]> => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/seller/orders", {
        params: { status },
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

  const getSellerItems = async () => {
    try {
      const { data } = await api.get("/seller/items");
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch listings",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      });
      return [];
    }
  };

  const verifyDelivery = async (orderId: string, otp: string) => {
    try {
      await api.post(`/seller/orders/${orderId}/complete`, {
        otp,
      });
      toast({
        title: "Delivery completed",
        description: "Order has been marked as delivered successfully.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.response?.data?.message || "Incorrect OTP",
        variant: "destructive",
      });
      return false;
    }
  };

  const getBargainRequests = async (): Promise<BargainRequest[]> => {
    try {
      const { data } = await api.get("/seller/bargain-requests");
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch bargain requests",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      });
      return [];
    }
  };

  const respondToBargain = async (cartItemId: string, accept: boolean) => {
    try {
      await api.post(`/seller/bargain-requests/${cartItemId}`, {
        accept,
      });
      toast({
        title: accept ? "Bargain accepted" : "Bargain rejected",
        description: accept
          ? "The price has been updated"
          : "The bargain request has been rejected",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to respond to bargain",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await api.post(`/seller/orders/${orderId}/cancel`);
      toast({
        title: "Order cancelled",
        description: "The order has been cancelled successfully",
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

  return {
    getDashboardStats,
    getOrders,
    isLoading,
    getSellerItems,
    verifyDelivery,
    getBargainRequests,
    respondToBargain,
    cancelOrder,
  };
};
