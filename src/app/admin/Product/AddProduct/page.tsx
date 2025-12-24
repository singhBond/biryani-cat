// app/admin/adminpanel/components/AddProductDialog.tsx
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
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

// Image Compression (unchanged)
const compressImage = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => (img.src = e.target?.result as string);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      let { width, height } = img;
      const MAX = 1200;

      if (width > height && width > MAX) {
        height = (height * MAX) / width;
        width = MAX;
      } else if (height > MAX) {
        width = (width * MAX) / height;
        height = MAX;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.9;

      const compressLoop = () => {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const sizeKB = (dataUrl.length * 0.75) / 1024;

        if (sizeKB < 500 || quality <= 0.1) {
          resolve(dataUrl);
        } else {
          quality -= 0.1;
          setTimeout(compressLoop, 0);
        }
      };

      compressLoop();
    };

    img.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });

// Updated Upload Component – upload box sits inline after previews
const DragDropUpload: React.FC<{
  onImagesChange: (imgs: string[]) => void;
  previews: string[];
  onRemove: (i: number) => void;
}> = ({ onImagesChange, previews, onRemove }) => {
  const [drag, setDrag] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const compressed = await Promise.all([...files].map(compressImage));
    const valid = compressed.filter(Boolean) as string[];

    if (valid.length > 0) onImagesChange(valid);
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        id="add-prod-img"
        type="file"
        hidden
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Previews + Upload box in one flex row */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Uploaded image previews */}
        {previews.map((src, i) => (
          <div key={i} className="relative group">
            <img
              src={src}
              alt="preview"
              className="w-28 h-28 object-cover rounded-md border"
            />
            <button
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              onClick={() => onRemove(i)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Upload / Add-more box – appears right after the last image */}
        <div
          className={`flex flex-col items-center justify-center w-28 h-28 border-2 border-dashed rounded-md cursor-pointer transition ${
            drag ? "border-yellow-500 bg-yellow-50" : "border-gray-300 hover:border-yellow-500"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => document.getElementById("add-prod-img")?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="mt-1 text-xs text-gray-600">
            {previews.length ? "Add more images"
            : "Click or drag to add images" }
          </p>
        </div>
      </div>

      {/* Optional hint below */}
      <p className="text-xs text-gray-500">Auto-compressed under 500KB</p>
    </div>
  );
};

export default function AddProductDialog({ categoryId }: { categoryId: string }) {
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [halfPrice, setHalfPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState("1");
  const [desc, setDesc] = useState("");
  const [isVeg, setVeg] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const addImages = (imgs: string[]) => {
    setImages((p) => [...p, ...imgs]);
    setPreviews((p) => [...p, ...imgs]);
  };

  const removeImage = (i: number) => {
    setImages((p) => p.filter((_, x) => x !== i));
    setPreviews((p) => p.filter((_, x) => x !== i));
  };

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Name required");
    if (!price || price <= 0) return alert("Full price required");

    setLoad(true);

    try {
      await addDoc(collection(db, "categories", categoryId, "products"), {
        name: name.trim(),
        price: Number(price),
        halfPrice: halfPrice ? Number(halfPrice) : null,
        quantity,
        description: desc.trim() || null,
        imageUrls: images.length ? images : null,
        imageUrl: images[0] || "",
        isVeg,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setName("");
      setPrice("");
      setHalfPrice("");
      setQuantity("1");
      setDesc("");
      setVeg(true);
      setImages([]);
      setPreviews([]);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add");
    } finally {
      setLoad(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-red-700 hover:bg-red-500">
          <Plus className="mr-1 h-4 w-4" /> Add Item
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
          <DialogDescription>Half price & description optional.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={load} placeholder="Enter Item Name" />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Full Price *</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                disabled={load}
                placeholder="Enter full price"
              />
            </div>
            <div className="space-y-1">
              <Label>Half Price</Label>
              <Input
                type="number"
                value={halfPrice}
                onChange={(e) => setHalfPrice(e.target.value ? Number(e.target.value) : "")}
                disabled={load}
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
              disabled={load}
              placeholder="eg: 1-2 Person, etc"
            />
          </div>

          {/* Veg */}
          <div className="flex items-center space-x-3">
                      <Switch
                        checked={isVeg}
                        onCheckedChange={setVeg}
                        // disabled={isLoading}
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
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              disabled={load}
            />
          </div>

          {/* Images – now with inline upload box */}
          <div className="space-y-1">
            <Label>Images</Label>
            <DragDropUpload
              previews={previews}
              onImagesChange={addImages}
              onRemove={removeImage}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={load}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={load || !name.trim() || !price}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {load ? "Adding…" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}