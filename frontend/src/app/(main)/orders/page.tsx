"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ShoppingBag
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getItemImageUrl, handleImageError } from "@/utils/image-helpers";

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  categories: string[];
  seller: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Order {
  _id: string;
  item: Item;
  buyer: User;
  seller: User;
  quantity: number;
  price: number;
  bargainedPrice?: number;
  status: "PENDING" | "DELIVERED" | "CANCELLED";
  otp?: string;
  otpExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [orders, setOrders] = useState<Order[]>([]);
  const { getOrders, regenerateOTP, isLoading, cancelOrder } = useOrders();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    let status;
    switch (activeTab) {
      case "pending":
        status = "PENDING";
        break;
      case "delivered":
        status = "DELIVERED";
        break;
      case "cancelled":
        status = "CANCELLED";
        break;
      default:
        status = undefined;
    }

    const data = await getOrders(status);
    if (data) {
      setOrders(data);
    }
  };

  const handleRegenerateOTP = async (orderId: string) => {
    const result = await regenerateOTP(orderId);
    if (result) {
      fetchOrders();
    }
  };

  const getFilteredOrders = (type: string) => {
    switch (type) {
      case "pending":
        return orders.filter((order) => order.status === "PENDING");
      case "delivered":
        return orders.filter((order) => order.status === "DELIVERED");
      case "cancelled":
        return orders.filter((order) => order.status === "CANCELLED");
      default:
        return [];
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const result = await cancelOrder(orderId);
    if (result) {
      toast({
        title: "Order cancelled",
        description: "The order has been cancelled successfully.",
      });
      fetchOrders();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="pending" className="relative">
            Pending
            {getFilteredOrders("pending").length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getFilteredOrders("pending").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait" key={activeTab}>
          <TabsContent value={activeTab}>
            {isLoading ? (
              <OrdersSkeleton />
            ) : getFilteredOrders(activeTab).length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center h-[400px] w-full gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    className="relative"
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <motion.div 
                        className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-full"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <ShoppingBag size={48} className="text-gray-400 dark:text-gray-500 relative z-10" />
                    </div>
                  </motion.div>
                  <div className="text-center space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {activeTab === "pending" 
                        ? "No Pending Orders" 
                        : activeTab === "delivered"
                        ? "No Delivered Orders"
                        : "No Cancelled Orders"}
                    </h3>
                    <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      {activeTab === "pending" 
                        ? "When you place orders, they will appear here until they are delivered." 
                        : activeTab === "delivered"
                        ? "Items you've received will be listed here after successful delivery."
                        : "Any orders you or the seller cancel will be shown in this section."}
                    </p>
                    {activeTab === "pending" && (
                      <Button
                        onClick={() => router.push("/explore")}
                        className="mt-4"
                      >
                        Browse Items
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`orders-${activeTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {getFilteredOrders(activeTab).map((order) => (
                  <OrderCard
                    key={`order-${order._id}-${activeTab}`}
                    order={order}
                    type={activeTab as "pending" | "bought"}
                    onRegenerateOTP={handleRegenerateOTP}
                    onCancelOrder={handleCancelOrder}
                  />
                ))}
              </motion.div>
            )}
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  type: "pending" | "bought" | "sold";
  onRegenerateOTP: (orderId: string) => void;
  onCancelOrder: (orderId: string) => Promise<void>;
}

const OrderCard = ({
  order,
  type,
  onRegenerateOTP,
  onCancelOrder,
}: OrderCardProps) => {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    await onCancelOrder(order._id);
    setIsCancelling(false);
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "DELIVERED":
        return "text-green-600 bg-green-50 border-green-200";
      case "CANCELLED":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "DELIVERED":
        return <CheckCircle2 className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="p-0 cursor-pointer"
        onClick={() => router.push(`/explore/item/${order.item._id}`)}
      >
        <div className="relative h-48 w-full">
          <Image
            src={getItemImageUrl(order.item.images[0])}
            alt={order.item.name}
            fill
            className="object-cover"
            onError={handleImageError}
          />
          <div
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
              order.status
            )}`}
          >
            <div className="flex items-center gap-1.5">
              {getStatusIcon(order.status)}
              {order.status}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-col flex flex-1">
        <div className="space-y-6 h-full flex flex-col justify-between">
          <div
            className="cursor-pointer space-y-6"
            onClick={() => router.push(`/explore/item/${order.item._id}`)}
          >
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">
                {order.item.name}
              </h3>
              <p className="text-sm text-gray-500">
                {format(new Date(order.createdAt), "PPP")}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <div className="flex items-center gap-2">
                  {order.bargainedPrice &&
                    order.bargainedPrice !== order.price ? (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{order.price.toLocaleString()}
                      </span>
                    ) : null}
                  {false && false}
                  <span className="text-lg font-bold">
                    ₹{(order.bargainedPrice ?? order.price).toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-semibold text-right">{order.quantity}</p>
              </div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-gray-500">
                {type === "sold" ? "Buyer" : "Seller"}
              </p>
              <p className="font-medium">
                {type === "sold"
                  ? order.buyer.firstName + " " + order.buyer.lastName
                  : order.seller.firstName + " " + order.seller.lastName}
              </p>
              <p className="text-sm text-gray-500 ">
                {type === "sold" ? order.buyer.email : order.seller.email}
              </p>
            </div>
          </div>
        </div>
        {/* OTP Section for Pending Orders */}
        {type === "pending" && order.status === "PENDING" && (
          <div className="space-y-2 mt-4 overflow-x-auto py-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onRegenerateOTP(order._id)}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Regenerate OTP
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Order"
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this order? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep order</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>
                      Yes, cancel order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const OrdersSkeleton = () => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className="relative h-48">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-md w-3/4 animate-pulse" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-md w-1/2 mt-2 animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-md w-1/4 animate-pulse" />
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-md w-1/4 animate-pulse" />
                </div>
                <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-md animate-pulse" />
                <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-md animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
