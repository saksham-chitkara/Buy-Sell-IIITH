"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, ArrowUpDown } from "lucide-react";
import { useItems } from "@/hooks/useItems";
import { useAuth } from "@/contexts/AuthContext";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define types
interface Item {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  seller: {
    firstName: string;
    lastName: string;
    email: string;
    rating?: number;
  };
  categories: string[];
  images: string[];
  createdAt?: string;
}

interface SortOption {
  value: string;
  label: string;
}

const categories = [
  "Academic Materials", // Textbooks, course materials, practice papers, lab manuals
  "Electronics", // Laptops, calculators, arduino kits, tablets, phones
  "Room Essentials", // Mattresses, pillows, reading lamps, storage boxes
  "Study Equipment", // Study tables, chairs, whiteboards, desk organizers
  "Sports & Fitness", // Cricket gear, gym equipment, sports shoes, badminton rackets
  "Lab Equipment", // Lab coats, components, project materials
  "Entertainment", // Musical instruments, gaming consoles, board games
  "Bicycles", // Common mode of transport around campus
  "Apparel", // College hoodies, t-shirts, formal wear for presentations
  "Tech Accessories", // Hard drives, pen drives, laptop accessories, cables
  "Books & Magazines", // Novels, magazines, competitive exam books
  "Food & Appliances", // Mini fridges, electric kettles, induction plates
  "Art & Stationery", // Drawing supplies, notebooks, project materials
  "Event Equipment", // Speakers, lights, cameras for college events
  "Transportation", // Bike/car pooling, local travel passes
  "Others", // Miscellaneous items
];

const sortOptions: SortOption[] = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Seller Rating" },
  { value: "newest", label: "Newest First" },
];

export default function ExplorePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const { user, isLoading: isAuthLoading } = useAuth();
  const { items: fetchedItems, loading: isLoading } = useItems();

  // Add state for max price to set slider range
  const [maxPrice, setMaxPrice] = useState(100000);

  useEffect(() => {
    if (fetchedItems && fetchedItems.length > 0) {
      setItems(fetchedItems);
      // Find the highest price among items
      const highestPrice = Math.max(...fetchedItems.map((item: Item) => item.price), 1000);
      setMaxPrice(highestPrice);
      
      // Only update price range if it's still at the default or if the new max is higher
      if (priceRange[1] === 100000 || priceRange[1] < highestPrice) {
        setPriceRange([0, highestPrice]);
      }
    }
  }, [fetchedItems, priceRange]);

  // Filter and sort items
  useEffect(() => {
    let result = [...items];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((item) =>
        item.categories.some((cat) => selectedCategories.includes(cat))
      );
    }

    // Apply price range filter
    result = result.filter(
      (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    // Filter out user's own items
    result = result.filter(
      (item) => !isAuthLoading && user && item.seller.email !== user.email
    );

    // Apply sorting
    result = result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating-desc":
          return (b.seller.rating || 0) - (a.seller.rating || 0);
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredItems(result);
  }, [items, searchQuery, selectedCategories, priceRange, sortBy, isAuthLoading, user]);

  return (
    <div className="min-h-screen p-6">
      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto mb-8 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 w-full h-12 text-lg"
          />
        </div>

        {/* Filters and Sort Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Price Range Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Price Range: ₹{Math.round(priceRange[0])} - ₹{Math.round(priceRange[1])}
            </label>
            <Slider
              min={0}
              max={maxPrice}
              step={100}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={(newValue: number[]) => setPriceRange([newValue[0], newValue[1]])}
              className="w-full"
            />
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Active Filters Count */}
          <div className="text-right text-sm text-gray-500">
            {selectedCategories.length > 0 && (
              <span className="mr-2">
                {selectedCategories.length} categories selected
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <span>• Price filter active</span>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <motion.div
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm ${
                    isSelected
                      ? "bg-black text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => {
                    setSelectedCategories(
                      isSelected
                        ? selectedCategories.filter((c) => c !== category)
                        : [...selectedCategories, category]
                    );
                  }}
                >
                  {category}
                  {isSelected && <X className="ml-2 h-4 w-4 inline-block" />}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
                  ))
              : filteredItems.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ItemCard item={item} />
                  </motion.div>
                ))}
          </div>
        </AnimatePresence>

        {/* No Results */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold mb-2">No items found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/explore/item/${item._id}`}>
      <CardContainer className="w-full hover:shadow-xl transition-shadow duration-300">
        <CardBody className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 relative group/card w-full rounded-xl p-6">
          <CardItem
            translateZ="50"
            className="text-xl font-bold text-black dark:text-white line-clamp-1"
          >
            {item.name}
          </CardItem>

          <CardItem
            translateZ="60"
            className="text-neutral-500 text-sm mt-2 dark:text-neutral-300 line-clamp-1"
          >
            {item.description}
          </CardItem>

          <CardItem translateZ="100" className="w-full mt-4">
            {item.images[0] && (
              <Image
                src={item.images[0]}
                alt={item.name}
                height={300}
                width={400}
                className="w-full h-[200px] object-cover rounded-lg"
                priority
              />
            )}
          </CardItem>

          <CardItem
            translateZ="50"
            className="text-xl font-bold text-black dark:text-white mt-4"
          >
            ₹{item.price}
          </CardItem>

          {item.seller.rating && (
            <CardItem
              translateZ="50" 
              className="absolute top-4 right-4 bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded text-sm"
            >
              ⭐ {item.seller.rating.toFixed(1)}
            </CardItem>
          )}
        </CardBody>
      </CardContainer>
    </Link>
  );
}
