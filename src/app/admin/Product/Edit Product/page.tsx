// app/admin/adminpanel/components/EditProductDialog.tsx
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
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Product } from "@/src/types/Product"; // ✅ FIXED — shared Product type

// Image compression utility
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
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
      const tryCompress = () => {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const sizeKB = (dataUrl.length * 0.75) / 1024;

        if (sizeKB < 500 || quality <= 0.1) {
          resolve(dataUrl);
        } else {
          quality -= 0.1;
          setTimeout(tryCompress, 0);
        }
      };

      tryCompress();
    };

    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};

// DragDropUpload
const DragDropUpload: React.FC<{
  onAdd: (images: string[]) => void;
  previews: string[];
  onRemove: (index: number) => void;
}> = ({ onAdd, previews, onRemove }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const compressed = await Promise.all(Array.from(files).map(compressImage));
    const valid = compressed.filter((img): img is string => !!img);
    if (valid.length > 0) onAdd(valid);
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-yellow-500 bg-yellow-50"
            : "border-gray-300 hover:border-yellow-500"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() =>
          document.getElementById("edit-product-image-input")?.click()
        }
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-600 mt-2">
          {previews.length > 0
            ? "Add more images"
            : "Click or drag to add images"}
        </p>
        <p className="text-xs text-gray-500">
          Auto-compressed under 500 KB each
        </p>
      </div>

      <input
        id="edit-product-image-input"
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

interface EditProductDialogProps {
  categoryId: string;
  product: Product;
}

export default function EditProductDialog({
  categoryId,
  product,
}: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState<number | "">(product.price);
  const [halfPrice, setHalfPrice] = useState<number | "">(
    product.halfPrice || ""
  );
  const [quantity, setQuantity] = useState(product.quantity || "1");
  const [description, setDescription] = useState(product.description || "");
  const [isVeg, setIsVeg] = useState(product.isVeg);

  const [images, setImages] = useState<string[]>(
    product.imageUrls || (product.imageUrl ? [product.imageUrl] : [])
  );
  const [previews, setPreviews] = useState<string[]>(images);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(product.name);
      setPrice(product.price);
      setHalfPrice(product.halfPrice ?? "");
      setQuantity(product.quantity ?? "1");
      setDescription(product.description ?? "");
      setIsVeg(product.isVeg);

      const existing =
        product.imageUrls || (product.imageUrl ? [product.imageUrl] : []);
      setImages(existing);
      setPreviews(existing);
    }
  }, [open, product]);

  const handleAddImages = (newImages: string[]) => {
    setImages((prev) => [...prev, ...newImages]);
    setPreviews((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Name is required");
    if (!price || price <= 0) return alert("Full price required");

    setIsLoading(true);

    try {
      await updateDoc(
        doc(db, "categories", categoryId, "products", product.id),
        {
          name: name.trim(),
          price: Number(price),
          halfPrice: halfPrice ? Number(halfPrice) : null,
          quantity,
          description: description.trim() || null,
          imageUrls: images.length > 0 ? images : null,
          imageUrl: images[0] || "",
          isVeg,
        }
      );

      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
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

      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogDescription>Update product details below</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              placeholder="Enter item name"
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Full Price *</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value ? Number(e.target.value) : "")
                }
                disabled={isLoading}
                placeholder="Enter full price "
              />
            </div>
            <div className="space-y-1">
              <Label>Half Price</Label>
              <Input
                type="number"
                value={halfPrice}
                onChange={(e) =>
                  setHalfPrice(e.target.value ? Number(e.target.value) : "")
                }
                disabled={isLoading}
                placeholder="Enter half price"
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <Label>Serve</Label>
            <Input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="eg: 1-2 Person, etc"
              disabled={isLoading}
            />
          </div>

          {/* Veg Switch */}
          <div className="flex items-center space-x-3">
            <Switch
              checked={isVeg}
              onCheckedChange={setIsVeg}
              disabled={isLoading}
            />
            <Label className="font-medium">
              {isVeg ? (
                <span className="text-green-600">Veg</span>
              ) : (
                <span className="text-red-600">Non-Veg</span>
              )}
            </Label>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Images */}

          <div className="space-y-1">
            <Label>Images</Label>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* Preview Images */}
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img
                    src={src}
                    className="w-full h-36 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Upload Field (comes right after images) */}
              <div className="">
                <DragDropUpload
                  previews={previews}
                  onAdd={handleAddImages}
                  onRemove={handleRemoveImage}
                />
              </div>
            </div>
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
            disabled={isLoading || !name.trim() || !price}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
