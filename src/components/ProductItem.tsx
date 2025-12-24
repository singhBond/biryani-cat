// components/menu/ProductItem.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";

// Read More Component (unchanged)
const DescriptionWithReadMore: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 120;

  if (!text || text.length <= maxLength) {
    return <p className="text-sm text-gray-700 leading-relaxed">{text}</p>;
  }

  return (
    <div className="text-sm text-gray-700 leading-relaxed">
      <p>
        {isExpanded ? text : `${text.slice(0, maxLength)}...`}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-orange-600 font-medium hover:underline"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      </p>
    </div>
  );
};

interface Product {
  id: string;
  name: string;
  price: number;
  halfPrice?: number;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
  quantity?: string; // e.g. "1 Pound,2 Pound,3 Pound" or just "1 Pc"
  isVeg: boolean;
}

interface ProductItemProps {
  product: Product;
  onClick?: () => void;
}

export const ProductItem = ({ product, onClick }: ProductItemProps) => {
  const [open, setOpen] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempPortion, setTempPortion] = useState<"full" | "half">("full");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // NEW: For quantity selection tabs
  const [selectedQuantityOption, setSelectedQuantityOption] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTempQuantity(1);
      setTempPortion("full");
      setCurrentImageIndex(0);
      setSelectedQuantityOption(null); // reset on open
    }
  }, [open]);

  const getImageArray = () => {
    return product.imageUrls?.length
      ? product.imageUrls.filter(Boolean)
      : product.imageUrl
      ? [product.imageUrl]
      : ["/placeholder.svg"];
  };

  const images = getImageArray();

  // Parse quantity options if exists (e.g. "1 Pound,2 Pound,3 Pound")
  const quantityOptions = product.quantity
    ? product.quantity.split(",").map((q) => q.trim()).filter(Boolean)
    : [];

  const hasMultipleQuantityOptions = quantityOptions.length > 1;

  // Use selected option or fallback to first one or product.quantity
  const displayQuantity = selectedQuantityOption || quantityOptions[0] || product.quantity || "";

  const currentPrice =
    tempPortion === "half"
      ? product.halfPrice || product.price / 2
      : product.price;

  const totalPrice = currentPrice * tempQuantity;

  // INSTANT CART UPDATE + TRIGGER EVENT
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("fastfood_cart") || "[]");
    const newItem = {
      id: product.id,
      name: product.name,
      price: currentPrice,
      portion: tempPortion,
      quantity: tempQuantity,
      isVeg: product.isVeg,
      imageUrl: images[0],
      serves: displayQuantity || undefined, // send selected quantity
    };

    const existingIndex = cart.findIndex(
      (i: any) => i.id === newItem.id && i.portion === newItem.portion
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += tempQuantity;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem("fastfood_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    const toast = document.createElement("div");
    toast.innerText = `Added ${tempQuantity}x ${product.name} (${displayQuantity}) to cart!`;
    toast.className = "fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);

    setOpen(false);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    } else {
      setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    }
  };

  const firstImage = images[0];

  return (
    <>
      {/* Product Card (unchanged) */}
      <div
        onClick={() => {
          onClick?.();
          setOpen(true);
        }}
        className="overflow-hidden rounded-2xl bg-orange-50 shadow-md shadow-orange-200 hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-orange-300 relative group"
      >
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`w-6 h-6 border-2 rounded-sm flex items-center justify-center ${
              product.isVeg
                ? "border-green-600 bg-green-500"
                : "border-red-600 bg-red-500"
            }`}
          >
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>

        <div className="relative w-full h-56 bg-gray-100">
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
          />
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-bold text-green-600">
              ₹{product.price}
            </span>
            {product.halfPrice && (
              <span className="text-sm text-gray-500">
                | Half: ₹{product.halfPrice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-full w-full h-full md:max-w-2xl md:h-auto md:max-h-[85vh] rounded-none md:rounded-2xl p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 md:p-6 pb-2 shrink-0 border-b">
            <DialogTitle className="text-lg md:text-2xl font-bold flex items-center gap-3 pr-10">
              {product.name}
              <div
                className={`w-6 h-6 border-2 rounded-sm flex items-center justify-center ${
                  product.isVeg
                    ? "border-green-600 bg-green-500"
                    : "border-red-600 bg-red-500"
                }`}
              >
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-1/2 h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <img
                  src={images[currentImageIndex] || "/placeholder.svg"}
                  alt={`${product.name} - ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage("prev")}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => navigateImage("next")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between px-2 md:px-0">
                <div className="space-y-4">
                  {product.description && (
                    <div>
                      <DescriptionWithReadMore text={product.description} />
                    </div>
                  )}

                  {product.halfPrice && (
                    <div>
                      <p className="text-md font-medium text-gray-700 mb-2">Plate type:</p>
                      <div className="flex gap-3">
                        <Button
                          variant={tempPortion === "full" ? "orange" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setTempPortion("full")}
                        >
                          Full Price
                        </Button>
                        <Button
                          variant={tempPortion === "half" ? "orange" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setTempPortion("half")}
                        >
                          Half Price
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* NEW: Square Quantity Tabs */}
                  {hasMultipleQuantityOptions && (
                    <div>
                      <p className="text-md font-medium text-gray-700 mb-2">Select Quantity:</p>
                      <div className="grid grid-cols-3 gap-3">
                        {quantityOptions.map((option) => (
                          <Button
                            key={option}
                            variant={selectedQuantityOption === option ? "default" : "outline"}
                            className={`h-12 text-sm font-medium ${
                              selectedQuantityOption === option
                                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                : ""
                            }`}
                            onClick={() => setSelectedQuantityOption(option)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                      {!selectedQuantityOption && quantityOptions[0] && (
                        <p className="text-xs text-gray-500 mt-2">
                          Default: {quantityOptions[0]}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Show single quantity if no options */}
                  {!hasMultipleQuantityOptions && product.quantity && product.quantity !== "1" && (
                    <p className="text-md text-gray-600">
                      <strong>Serve :</strong> {product.quantity}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-4 mt-4">
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-green-600">
                        ₹{totalPrice.toFixed(0)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 whitespace-nowrap">Qty:</span>
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))}
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="w-12 text-center font-bold">{tempQuantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setTempQuantity(tempQuantity + 1)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 text-base mt-6"
                    onClick={addToCart}
                  >
                    Add to Cart • ₹{totalPrice.toFixed(0)}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};