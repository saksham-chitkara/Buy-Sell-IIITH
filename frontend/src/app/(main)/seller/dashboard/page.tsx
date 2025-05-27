"use client";

import { useState, useEffect, } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Package,
  Clock,
} from "lucide-react";
import { useSeller } from "@/hooks/useSeller";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface SalesData {
  date: string;
  revenue: number;
  bargainedRevenue: number;
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
  status: "PENDING" | "DELIVERED" | "CANCELLED" | "BARGAINING";
  date: string;
}

interface Listing {
  _id: string;
  name: string;
  price: number;
  images: string[];
  quantity: number;
  isAvailable: boolean;
  createdAt: string;
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

export default function SellerDashboard() {
  const router = useRouter();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOTP] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const {
    getDashboardStats,
    getOrders,
    getSellerItems,
    verifyDelivery,
    cancelOrder,
    respondToBargain,
    getBargainRequests,
  } = useSeller();
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<{
    pending: Order[];
    delivered: Order[];
    cancelled: Order[];
  }>({
    pending: [],
    delivered: [],
    cancelled: [],
  });
  const [bargainRequests, setBargainRequests] = useState<BargainRequest[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const [
        stats,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        sellerListings,
        bargainRequests,
      ] = await Promise.all([
        getDashboardStats(),
        getOrders("PENDING"),
        getOrders("DELIVERED"),
        getOrders("CANCELLED"),
        getSellerItems(),
        getBargainRequests(),
      ]);

      if (stats) {
        setSalesData(stats.salesData);
        setTotalEarnings(stats.totalEarnings);
      }

      setOrders({
        pending: pendingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      });

      setListings(sellerListings);
      setBargainRequests(bargainRequests);
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    const success = await cancelOrder(orderToCancel.id);
    if (success) {
      toast({
        title: "Order cancelled",
        description: "The order has been cancelled successfully.",
      });
      refreshOrders();
    }
    setShowCancelDialog(false);
    setOrderToCancel(null);
  };

  const handleBargainResponse = async (cartItemId: string, accept: boolean) => {
    const success = await respondToBargain(cartItemId, accept);
    if (success) {
      toast({
        title: accept ? "Bargain accepted" : "Bargain rejected",
        description: accept
          ? "The bargain request has been accepted"
          : "The bargain request has been rejected",
      });
      // Refresh bargain requests
      const newRequests = await getBargainRequests();
      setBargainRequests(newRequests);
    }
  };

  const handleDelivery = async (orderId: string) => {
    setShowOTPDialog(true);
    setSelectedOrder(
      orders["pending"].find((order) => order.id === orderId) || null
    );
  };

  const verifyOTP = async () => {
    if (!selectedOrder || !otp) return;

    const success = await verifyDelivery(selectedOrder.id, otp);
    if (success) {
      setShowOTPDialog(false);
      setOTP("");
      // Refresh orders
      const [pendingOrders, deliveredOrders, cancelledOrders] =
        await Promise.all([
          getOrders("PENDING"),
          getOrders("DELIVERED"),
          getOrders("CANCELLED"),
        ]);

      setOrders({
        pending: pendingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      });
    }
  };

  const refreshOrders = async () => {
    const [pendingOrders, deliveredOrders, cancelledOrders] = await Promise.all(
      [getOrders("PENDING"), getOrders("DELIVERED"), getOrders("CANCELLED")]
    );

    setOrders({
      pending: pendingOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    });
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Earnings"
          value={`₹${totalEarnings.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
        />
        <StatsCard
          title="Pending Orders"
          value={orders["pending"].length.toString()}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatsCard
          title="Completed Orders"
          value={orders["delivered"].length.toString()}
          icon={<Package className="w-6 h-6" />}
        />
      </div>

      {/* Sales Chart */}
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Sales Overview</CardTitle>
          <CardDescription className="text-gray-400">
            Compare original vs bargained revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #333",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#fff"
                  strokeWidth={2}
                  dot={{ fill: "#fff" }}
                  name="Original Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="bargainedRevenue"
                  stroke="#666"
                  strokeWidth={2}
                  dot={{ fill: "#666" }}
                  name="After Bargaining"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Card className="bg-black border-white/10 text-white">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription className="text-gray-400">
            Manage all your orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="flex sm:grid sm:grid-cols-3 bg-white/5 overflow-x-auto w-full">
              <TabsTrigger value="pending">
                Pending ({orders.pending.length})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Delivered ({orders.delivered.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({orders.cancelled.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <OrdersTable
                orders={orders.pending}
                onDelivery={handleDelivery}
                setOrderToCancel={setOrderToCancel}
                setShowCancelDialog={setShowCancelDialog}
                type="pending"
              />
            </TabsContent>

            <TabsContent value="delivered">
              <OrdersTable orders={orders.delivered} type="delivered" />
            </TabsContent>

            <TabsContent value="cancelled">
              <OrdersTable orders={orders.cancelled} type="cancelled" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bargain Requests */}
      <Card className="bg-black border-white/10 text-white">
        <CardHeader>
          <CardTitle>Bargain Requests</CardTitle>
          <CardDescription className="text-gray-400">
            Manage price negotiations from buyers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10 bg-white/5">
                    <TableHead className="text-gray-300 font-medium">
                      Item
                    </TableHead>
                    <TableHead className="text-gray-300 font-medium">
                      Buyer
                    </TableHead>
                    <TableHead className="text-gray-300 font-medium">
                      Price Details
                    </TableHead>
                    <TableHead className="text-gray-300 font-medium">
                      Message
                    </TableHead>
                    <TableHead className="text-gray-300 font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bargainRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                            <Image
                              src={
                                process.env.NEXT_PUBLIC_UPLOADS_URL +
                                "/items/" +
                                request.itemImage
                              }
                              alt={request.itemName}
                              fill
                              className="object-cover transition-transform hover:scale-110 duration-300"
                            />
                          </div>
                          <span
                            className="font-medium text-white cursor-pointer"
                            onClick={() => {
                              router.push(`/explore/item/${request.itemId}`);
                            }}
                          >
                            {request.itemName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="space-y-1 cursor-pointer"
                          onClick={() => {
                            router.push(`/profile/${request.buyer.id}`);
                          }}
                        >
                          <p className="text-white font-medium">
                            {request.buyer.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {request.buyer.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Original:</span>
                            <span className="font-medium text-white">
                              ₹{request.originalPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Requested:</span>
                            <span className="font-medium text-white">
                              ₹{request.requestedPrice.toLocaleString()}
                            </span>
                            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full">
                              -
                              {Math.round(
                                ((request.originalPrice -
                                  request.requestedPrice) /
                                  request.originalPrice) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-gray-400 max-w-xs">
                          {request.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white transition-colors"
                            onClick={() =>
                              handleBargainResponse(request.cartItemId, true)
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors hover:text-white"
                            onClick={() =>
                              handleBargainResponse(request.cartItemId, false)
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seller Listings */}
      <Card className="bg-black border-white/10 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your item listings
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/seller/create-listing")}>
              Create New Listing
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ListingsGrid
            listings={[
              ...listings.filter((item) => item.isAvailable),
              ...listings.filter((item) => !item.isAvailable),
            ]}
          />
        </CardContent>
      </Card>

      {/* OTP Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Enter Delivery OTP</DialogTitle>
            <DialogDescription className="text-gray-400">
              Ask the buyer for the OTP to complete delivery
            </DialogDescription>
          </DialogHeader>
          <InputOTP maxLength={6} value={otp} onChange={(otp) => setOTP(otp)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOTPDialog(false);
                setOTP("");
              }}
              className="text-black m-2"
            >
              Cancel
            </Button>
            <Button onClick={verifyOTP} className="m-2">
              Verify & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setOrderToCancel(null);
              }}
              className="text-black"
            >
              No, keep it
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder}>
              Yes, cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ListingsGrid = ({ listings }: { listings: Listing[] }) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <Card
          key={listing && listing._id}
          className="bg-black border-white/10 cursor-pointer"
          onClick={() =>
            router.push(`/explore/item/${listing._id}`)
          }
        >
          <div className="relative aspect-square">
            <Image
              src={
                process.env.NEXT_PUBLIC_UPLOADS_URL +
                "/items/" +
                listing.images[0]
              }
              alt={listing && listing.name}
              fill
              className="object-cover rounded-t-lg"
            />
            <div className="absolute top-2 right-2">
              <Badge
                variant={
                  listing && listing.isAvailable ? "default" : "secondary"
                }
              >
                {listing && listing.isAvailable ? "Available" : "Sold Out"}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg text-white mb-2">
              {listing && listing.name}
            </h3>
            <div className="flex justify-between items-center">
              <p className="text-white font-bold">
                ₹{listing && listing.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-400">
                Qty: {listing && listing.quantity}
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Listed on{" "}
              {new Date(listing && listing.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface OrdersTableProps {
  orders: Order[];
  type: "pending" | "delivered" | "cancelled";
  onDelivery?: (orderId: string) => void;
  setOrderToCancel?: (order: Order) => void;
  setShowCancelDialog?: (show: boolean) => void;
}

const OrdersTable = ({
  orders,
  type,
  onDelivery,
  setOrderToCancel,
  setShowCancelDialog,
}: OrdersTableProps) => {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 bg-white/5">
              <TableHead className="text-gray-300 font-medium">Item</TableHead>
              <TableHead className="text-gray-300 font-medium">Buyer</TableHead>
              <TableHead className="text-gray-300 font-medium">Price</TableHead>
              <TableHead className="text-gray-300 font-medium">
                Status
              </TableHead>
              {type === "pending" && (
                <TableHead className="text-gray-300 font-medium">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0"
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={
                          process.env.NEXT_PUBLIC_UPLOADS_URL +
                          "/items/" +
                          order.itemImage
                        }
                        alt={order.itemName}
                        fill
                        className="object-cover transition-transform hover:scale-110 duration-300"
                      />
                    </div>
                    <span
                      className="font-medium text-white cursor-pointer"
                      onClick={() => {
                        router.push(`/explore/item/${order.itemId}`);
                      }}
                    >
                      {order.itemName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className="space-y-1 cursor-pointer"
                    onClick={() => {
                      router.push(`/profile/${order.buyer.id}`);
                    }}
                  >
                    <p className="text-white font-medium">{order.buyer.name}</p>
                    <p className="text-sm text-gray-400">{order.buyer.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {order.bargainedPrice &&
                    order.bargainedPrice !== order.originalPrice ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-white">
                          ₹{order.bargainedPrice.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm line-through text-gray-500">
                            ₹{order.originalPrice.toLocaleString()}
                          </p>
                          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full">
                            -
                            {Math.round(
                              ((order.originalPrice - order.bargainedPrice) /
                                order.originalPrice) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="font-semibold text-white">
                        ₹{order.originalPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`px-3 py-1 ${
                      order.status === "DELIVERED"
                        ? "bg-green-500/10 text-green-400"
                        : order.status === "CANCELLED"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                {type === "pending" && (
                  <TableCell>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        onClick={() => onDelivery?.(order.id)}
                      >
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors hover:text-white"
                        onClick={() => {
                          setOrderToCancel?.(order);
                          setShowCancelDialog?.(true);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatsCard = ({ title, value, icon }: StatsCardProps) => {
  return (
    <Card className="bg-black border-white/10">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold mt-1 text-white">{value}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-full text-white">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                  <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-12 w-12 bg-white/5 rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-white/5 rounded animate-pulse" />
        </CardContent>
      </Card>

      <Card className="bg-black border-white/10">
        <CardHeader>
          <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
