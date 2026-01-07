"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Loader2, Upload, ImagePlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import React from "react";

export default function EnhancedImagePicker({ onImageSelect, onClose }) {
  const [query, setQuery] = useState("event");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const searchImages = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=12&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
      );
      const data = await response.json();
      setImages(data.results || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to search images");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchImages(query);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        onImageSelect(base64);
        toast.success("Image selected!");
        onClose();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect({ target: { files: [file] } });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose Cover Image</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="unsplash" className="w-full flex flex-col flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unsplash" className="gap-2">
              <Search className="w-4 h-4" />
              Unsplash
            </TabsTrigger>
            <TabsTrigger value="device" className="gap-2">
              <Upload className="w-4 h-4" />
              From Device
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unsplash" className="flex flex-col flex-1 overflow-hidden">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for images..."
                className="flex-1 glass"
              />
              <Button type="submit" variant="brand" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </form>

            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 py-4">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => {
                        onImageSelect(image.urls.regular);
                        onClose();
                      }}
                      className="relative aspect-video overflow-hidden rounded-lg border-2 border-transparent hover:border-purple-500 transition-all group"
                    >
                      <Image
                        src={image.urls.small}
                        alt={image.description || "Unsplash image"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        width={400}
                        height={300}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="bg-purple-500 text-white px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                          Select
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && images.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  Search for images to get started
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Photos from{" "}
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Unsplash
              </a>
            </p>
          </TabsContent>

          <TabsContent value="device" className="flex flex-col flex-1 overflow-hidden">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="flex-1 border-2 border-dashed border-white/20 rounded-lg p-8 flex flex-col items-center justify-center hover:border-purple-500/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Choose Image</h3>
              <p className="text-muted-foreground text-center mb-4">
                Drag and drop your image here, or click to select
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Supported formats: JPG, PNG, GIF (Max 5MB)
              </p>
              <Button
                type="button"
                variant="brand"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Select Image
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
