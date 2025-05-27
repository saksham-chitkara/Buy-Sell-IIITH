"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LucideShoppingCart,
  Search,
  Package,
  User,
  Menu,
  X,
  LogOut,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProtectedRoute from "../ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { ChatButton } from "../ChatButton";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSellerMode, setIsSellerMode] = useState(
    pathname.startsWith("/seller")
  );
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const count = await getCartCount();
        setCartCount(typeof count === "number" ? count : 0);
      } catch (e) {
        setCartCount(0);
      }
    };

    fetchCartCount();
  }, [getCartCount]);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsSellerMode(pathname.startsWith("/seller"));
  }, [pathname]);

  const handleSellerModeToggle = () => {
    router.push(isSellerMode ? "/explore" : "/seller/dashboard");
  };

  const getAvatarUrl = (avatar: string | undefined) => {
    if (!avatar) return undefined;
    return avatar.startsWith("http")
      ? avatar
      : `/api/users/avatar/${avatar}`;
  };

  return (
    <ProtectedRoute>
      <motion.div
        animate={{
          backgroundColor: isSellerMode ? "#000000" : "#ffffff",
          color: isSellerMode ? "#ffffff" : "#000000",
        }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {/* Header */}
        <header
          className={`fixed top-0 right-0 w-full md:w-[calc(100%-300px)] h-16 z-50 backdrop-blur-md border-b flex items-center justify-between px-4 transition-all duration-300 ${
            isSellerMode
              ? "bg-black/75 border-white/10"
              : "bg-white/75 border-black/10"
          }`}
        >
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-full transition-colors ${
                  isSellerMode ? "hover:bg-white/10" : "hover:bg-black/10"
                }`}
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-6">
            <Link href="/chat">
              <ChatButton />
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {isSellerMode ? "Seller Mode" : "Buyer Mode"}
              </span>
              <Switch
                checked={isSellerMode}
                onCheckedChange={handleSellerModeToggle}
              />
            </div>

            {!isSellerMode && (
              <Link href="/cart">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-full transition-colors relative ${
                    isSellerMode ? "hover:bg-white/10" : "hover:bg-black/10"
                  }`}
                >
                  <LucideShoppingCart size={24} />
                  <span className="absolute top-0 right-0 bg-black text-white dark:bg-white dark:text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                </motion.div>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={`w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 transition-colors ${
                    isSellerMode ? "border-white/10" : "border-black/10"
                  }`}
                >
                  {user?.avatar ? (
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`w-[240px] ${
                  isSellerMode
                    ? "bg-black border-white/10"
                    : "bg-white border-black/10"
                }`}
              >
                <DropdownMenuItem
                  asChild
                  className={
                    isSellerMode
                      ? "text-white cursor-pointer"
                      : "text-black cursor-pointer"
                  }
                >
                  <Link
                    href="/profile"
                    className={`flex items-center ${
                      isSellerMode
                        ? "hover:bg-white/10"
                        : "hover:bg-black/10"
                    }`}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator
                  className={isSellerMode ? "bg-white/10" : "bg-black/10"}
                />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-600/10 dark:focus:bg-red-400/20 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.nav
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed left-0 ${
                isMobile ? "top-16 h-[calc(100%-64px)]" : "top-0 h-full"
              } w-[300px] z-40 border-r flex flex-col transition-colors duration-300 ${
                isSellerMode
                  ? "bg-black border-white/10"
                  : "bg-white border-black/10"
              }`}
            >
              {/* Logo Section */}
              <div
                className={`h-16 flex items-center justify-center border-b transition-colors duration-300 z-50 ${
                  isSellerMode ? "border-white/10" : "border-black/10"
                }`}
              >
                <Link href="/" className="text-2xl font-bold">
                  <img src="/logo.png" alt="logo" className="w-11 h-11" />
                </Link>
                &nbsp;by&nbsp;
                <Link
                  href="https://github.com/unignoramus11"
                  className="font-bold"
                >
                  unignoramus
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <NavigationLinks
                  isSellerMode={isSellerMode}
                  pathname={pathname}
                  setIsSidebarOpen={setIsSidebarOpen}
                  isMobile={isMobile}
                />
              </div>

              {/* User Section */}
              <div
                className={`border-t p-4 transition-colors duration-300 ${
                  isSellerMode ? "border-white/10" : "border-black/10"
                }`}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                        isSellerMode ? "hover:bg-white/10" : "hover:bg-black/10"
                      }`}
                    >
                      <div
                        className={
                          "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                        }
                      >
                        {user?.avatar ? (
                          <img
                            src={getAvatarUrl(user.avatar)}
                            alt="User avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {!authLoading &&
                            isAuthenticated &&
                            user &&
                            user.firstName}{" "}
                          {!authLoading &&
                            isAuthenticated &&
                            user &&
                            user.lastName}
                        </p>
                        <p
                          className={`text-sm ${
                            isSellerMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {!authLoading &&
                            isAuthenticated &&
                            user &&
                            user.email.split("@")[0] +
                              (user.email.split("@")[1] === "iiit.ac.in"
                                ? ""
                                : "@" + user.email.split("@")[1].split(".")[0])}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className={`w-[240px] ${
                      isSellerMode
                        ? "bg-black border-white/10"
                        : "bg-white border-black/10"
                    }`}
                  >
                    <DropdownMenuItem
                      asChild
                      className={
                        isSellerMode
                          ? "text-white cursor-pointer"
                          : "text-black cursor-pointer"
                      }
                    >
                      <Link
                        href="/profile"
                        className={`flex items-center ${
                          isSellerMode
                            ? "hover:bg-white/10"
                            : "hover:bg-black/10"
                        }`}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator
                      className={isSellerMode ? "bg-white/10" : "bg-black/10"}
                    />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-600/10 dark:focus:bg-red-400/20 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={`transition-all duration-300 ${
            isSidebarOpen ? "md:ml-[300px]" : "ml-0"
          } pt-16`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isSellerMode ? "seller" : "buyer"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </ProtectedRoute>
  );
};

const NavigationLinks = ({
  isSellerMode,
  pathname,
  setIsSidebarOpen,
  isMobile,
}: {
  isSellerMode: boolean;
  pathname: string;
  setIsSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
}) => {
  const buyerLinks = [
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/cart", label: "Cart", icon: LucideShoppingCart },
    { href: "/orders", label: "Orders", icon: Package },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const sellerLinks = [
    { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/seller/create-listing",
      label: "Create Listing",
      icon: PlusCircle,
    },
  ];

  const links = isSellerMode ? sellerLinks : buyerLinks;

  return (
    <div className="space-y-2">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => {
              if (isMobile) {
                setIsSidebarOpen(false);
              }
            }}
          >
            <motion.div
              whileHover={{ x: 6 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? isSellerMode
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : isSellerMode
                  ? "hover:bg-white/10"
                  : "hover:bg-black/10"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
};

export default MainLayout;
