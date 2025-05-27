"use client";

import { useState } from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useItems } from "@/hooks/useItems";

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

export default function CreateListing() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "1",
    categories: [] as string[],
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createItem } = useItems();
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length + images.length > 5) {
        toast({
          title: "Too many images",
          description: "You can upload a maximum of 5 images.",
          variant: "destructive",
        });
        return;
      }

      setImages((prev) => [...prev, ...acceptedFiles]);

      // Create previews
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagesPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    },
    [images.length, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 5 - images.length,
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast({
        title: "No images",
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    if (formData.name.length > 50 || formData.description.length > 500) {
      toast({
        title: "Character limit exceeded",
        description: "I ain't hosting no stories here. 🤨",
        variant: "destructive",
      });
      return;
    }

    if (Number(formData.price) > 99999) {
      toast({
        title: "Price too high",
        description: "Contact dev directly for large transactions. 😏",
        variant: "destructive",
      });
      return;
    }

    if (Number(formData.quantity) > 20) {
      toast({
        title: "Quantity too high",
        description: "How many factories do you own? 😭",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const newFormData = new FormData();
    newFormData.append("name", formData.name);
    newFormData.append("description", formData.description);
    newFormData.append("price", formData.price);
    newFormData.append("quantity", formData.quantity);
    newFormData.append("categories", formData.categories.join(","));

    // Append each image
    images.forEach((image) => {
      newFormData.append("itemImages", image);
    });

    const result = await createItem(newFormData);
    if (result) {
      toast({
        title: "Listing created",
        description: "Your item has been listed successfully.",
      });
      router.push("/seller/dashboard");
    } else {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Create New Listing</CardTitle>
          <CardDescription className="text-gray-400">
            Add details about your item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Item Name
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="bg-white/5 border-white/10 focus:border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="bg-white/5 border-white/10 focus:border-white/20 text-white placeholder:text-gray-500 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Price (₹)
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="bg-white/5 border-white/10 focus:border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Quantity
                </label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="bg-white/5 border-white/10 focus:border-white/20 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Categories
              </label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    categories: [...prev.categories, value],
                  }))
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-white hover:bg-white/10"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="bg-white/5 text-white"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          categories: prev.categories.filter(
                            (c) => c !== category
                          ),
                        }))
                      }
                      className="ml-2 hover:bg-white/10 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Images</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagesPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-white/10"
                  >
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-white/50 rounded-full hover:bg-white/75 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <div
                    {...getRootProps()}
                    className={`aspect-square rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 text-white cursor-pointer
              ${
                isDragActive
                  ? "border-white/50 bg-white/10"
                  : "border-white/10 hover:border-white/20"
              }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-6 h-6" />
                    <span className="text-sm text-center">
                      {isDragActive ? "Drop images here" : "Add images"}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Upload up to 5 images (PNG, JPG, WEBP)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-white/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSubmitting ? "Creating Listing..." : "Create Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
