// app/admin/adminpanel/components/AddCategoryDialog.tsx
"use client";

import React, { useState } from "react";
import { Plus, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

// Image compression helper
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => (img.src = e.target?.result as string);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      let width = img.width;
      let height = img.height;
      const MAX_DIM = 1200;

      if (width > height && width > MAX_DIM) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      } else if (height > MAX_DIM) {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.9;
      const TARGET_KB = 500 * 1024;

      const tryCompress = () => {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const byteLength = Math.round((dataUrl.length * 3) / 4);

        if (byteLength < TARGET_KB || quality <= 0.1) {
          resolve(dataUrl);
        } else {
          quality = Math.max(quality - 0.1, 0.1);
          setTimeout(tryCompress, 0);
        }
      };

      tryCompress();
    };

    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Format name helper
const formatName = (raw: string) =>
  raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

export default function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState("");
  const [sizeInfo, setSizeInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    compressImage(file)
      .then((compressed) => {
        setImage(compressed);
        setPreview(compressed);
        const kb = (compressed.length * 0.75 / 1024).toFixed(1);
        setSizeInfo(`${kb} KB`);
      })
      .catch(() => alert("Failed to process image. Try another one."));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Category name is required.");
      return;
    }
    if (!image) {
      alert("Category image is required.");
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "categories"), {
        name: formatName(name),
        imageUrl: image,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setName("");
      setImage(null);
      setPreview("");
      setSizeInfo("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setImage(null);
    setPreview("");
    setSizeInfo("");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-red-700 hover:bg-red-500 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add New Menu Category</DialogTitle>
          <DialogDescription>
            Create a new category like "Biryani", "South Indian", "Chinese", etc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="cat-name">Category Name <span className="text-red-500">*</span></Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Biryani, Chinese, South Indian, etc"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Image Upload with Drag & Drop */}
          <div className="space-y-3">
            <Label htmlFor="cat-image">
              Category Image <span className="text-red-500">*</span>
            </Label>

            {!preview ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragging 
                    ? "border-yellow-500 bg-yellow-50" 
                    : "border-gray-300 hover:border-yellow-500"
                  }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById("cat-image")?.click()}
              >
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {isDragging ? "Drop image here" : "Click or drag image to upload"}
                </p>
                <p className="text-xs text-gray-500">Auto-compressed to less than 500 KB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Category preview"
                  className="w-full h-64 object-cover rounded-lg border-2 border-green-500"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                    setSizeInfo("");
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="text-center text-sm text-gray-600 mt-2">{sizeInfo}</p>
              </div>
            )}

            <Input
              id="cat-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || !image}
            className="bg-red-700 hover:bg-red-500"
          >
            {isLoading ? "Adding..." : "Add Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}