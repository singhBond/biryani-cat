// app/admin/adminpanel/components/ProductRow.tsx
"use client";

import React, { useState } from "react";
import { Pencil, Eye, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Dialog } from "@/src/components/ui/dialog";

// Import dialogs
import EditProductDialog from "@/src/app/admin/Product/Edit Product/page";
import ViewProductDialog from "@/src/app/admin/Product/ViewProduct/page";
import DeleteDialog from "@/src/app/admin/DeleteDialog/page";

// ✅ FIX: IMPORT FIREBASE FUNCTIONS
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

type Product = {
  id: string;
  name: string;
  price: number;
  halfPrice?: number | null;
  quantity?: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  isVeg: boolean;
};

interface ProductRowProps {
  categoryId: string;
  product: Product;
}

export default function ProductRow({ categoryId, product }: ProductRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const primaryImage = product.imageUrls?.[0] || product.imageUrl;
  const totalImages = (product.imageUrls?.length || 0) + (product.imageUrl ? 1 : 0);

  return (
    <tr className="border-b hover:bg-orange-50/60 transition-colors duration-200 ">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="font-medium text-gray-900 max-w-xs truncate">
            {product.name}
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-center">
        <span className="text-lg font-bold text-green-700">₹{product.price}</span>
      </td>

      <td className="px-4 py-4 text-center">
        {product.halfPrice ? (
          <span className="text-base font-semibold text-blue-700">₹{product.halfPrice}</span>
        ) : (
          <span className="text-gray-400 italic">—</span>
        )}
      </td>

      <td className="px-4 py-4">
        <div className="flex justify-center">
          <Badge
            variant={product.isVeg ? "default" : "destructive"}
            className={`px-3 py-1.5 font-medium ${
              product.isVeg
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            <div className="w-2 h-2 mr-1.5 rounded-full bg-white" />
            {product.isVeg ? "VEG" : "NON-VEG"}
          </Badge>
        </div>
      </td>

      <td className="px-4 py-4 text-center">
        <span className="text-sm font-medium text-gray-700">
          {product.quantity || "—"}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex justify-center">
          {primaryImage ? (
            <div className="relative group">
              <img
                src={primaryImage}
                alt={product.name}
                className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 shadow-sm transition-transform group-hover:scale-110"
              />
              {/* {totalImages > 1 && (
                <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                  {totalImages}
                </div>
              )} */}
            </div>
          ) : (
            <div className="w-14 h-14 bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">

          <Dialog open={viewOpen} onOpenChange={setViewOpen}>
            <ViewProductDialog product={product} />
          </Dialog>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <EditProductDialog categoryId={categoryId} product={product} />
          </Dialog>

          <DeleteDialog
            title="Delete Product"
            description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
            onConfirm={async () => {
              await deleteDoc(doc(db, "categories", categoryId, "products", product.id));
            }}
          >
            <Button size="icon" variant="ghost" className="h-9 w-9 text-red-600 hover:text-red-800 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </DeleteDialog>
        </div>
      </td>
    </tr>
  );
}
