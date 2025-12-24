// app/admin/adminpanel/components/EditCategoryDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Pencil, X, Upload } from "lucide-react";
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
import { updateDoc, doc } from "firebase/firestore";
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
        const byteSize = Math.round((dataUrl.length * 3) / 4);

        if (byteSize < TARGET_KB || quality <= 0.1) {
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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

type Category = {
  id: string;
  name?: string;
  imageUrl?: string;
};

interface EditCategoryDialogProps {
  category: Category;
}

export default function EditCategoryDialog({ category }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category.name || "");
  const [image, setImage] = useState<string | null>(category.imageUrl || null);
  const [preview, setPreview] = useState(category.imageUrl || "");
  const [sizeInfo, setSizeInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(category.name || "");
      setImage(category.imageUrl || null);
      setPreview(category.imageUrl || "");
      setSizeInfo("");
    }
  }, [open, category]);

  const processImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    compressImage(file)
      .then((compressed) => {
        setImage(compressed);
        setPreview(compressed);
        const kb = (compressed.length * 0.75 / 1024).toFixed(1);
        setSizeInfo(`~${kb} KB`);
      })
      .catch(() => alert("Failed to process image"));
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

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Category name is required");
      return;
    }
    if (!image) {
      alert("Category image is required");
      return;
    }

    setIsLoading(true);
    try {
      await updateDoc(doc(db, "categories", category.id), {
        name: formatName(name),
        imageUrl: image,
      });

      setOpen(false);
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the category name and image
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-cat-name">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pizzas, Burgers"
              disabled={isLoading}
            />
          </div>

          {/* Image Upload with Drag & Drop */}
          <div className="space-y-3">
            <Label>
              Category Image <span className="text-red-500">*</span>
            </Label>

            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Current category"
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                    setSizeInfo("");
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
                {sizeInfo && (
                  <p className="text-center text-sm text-gray-600 mt-2">{sizeInfo}</p>
                )}
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragging 
                    ? "border-yellow-500 bg-yellow-50" 
                    : "border-gray-300 hover:border-yellow-500"
                  }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById("edit-cat-image")?.click()}
              >
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {isDragging ? "Drop image here" : "Click or drag to change image"}
                </p>
                <p className="text-xs text-gray-500">Auto-compressed less than 500 KB</p>
              </div>
            )}

            <Input
              id="edit-cat-image"
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
            onClick={handleSave}
            disabled={isLoading || !name.trim() || !image}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}