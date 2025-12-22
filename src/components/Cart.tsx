// components/menu/Cart.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { ShoppingCart, Plus, Minus, Trash2, Store, Bike, X } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  portion: "full" | "half";
  quantity: number;
  serves?: string;
  isVeg: boolean;
  imageUrl?: string;
}

export const Cart = () => {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderMode, setOrderMode] = useState<"offline" | "online">("offline");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const deliveryCharge = 50;

  // Load cart from localStorage on mount (including page refresh)
  useEffect(() => {
    const saved = localStorage.getItem("fastfood_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        localStorage.removeItem("fastfood_cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("fastfood_cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("fastfood_cart");
    }
  }, [cart]);

  // Listen for real-time cart updates from ProductItem (instant add)
  useEffect(() => {
    const handleCartUpdate = () => {
      const saved = localStorage.getItem("fastfood_cart");
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse cart on update", e);
        }
      }
    };

    // Initial load (already done above, but safe)
    handleCartUpdate();

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const updateQuantity = (id: string, portion: "full" | "half", delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.portion === portion
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string, portion: "full" | "half") => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.portion === portion)));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = orderMode === "online" ? subtotal + deliveryCharge : subtotal;

  const clearCart = () => {
    setCart([]);
    setOpen(false);
  };

  const sendWhatsAppOrder = () => {
    if (!name || !phone) {
      alert("Please enter your name and phone number!");
      return;
    }

    let message = `*New Order*%0A%0A`;
    message += `*Customer:* ${name}%0A`;
    message += `*Phone:* ${phone}%0A`;

    if (notes.trim()) {
      message += `*Notes:* ${notes.trim()}%0A`;
    }

    if (orderMode === "online" && address) {
      message += `*Address:* ${address}%0A`;
      message += `*Delivery:* Yes (+₹${deliveryCharge})%0A`;
    } else {
      message += `*Mode:* Dine-in / Takeaway%0A`;
    }

    message += `%0A*Order Details:*%0A`;

    cart.forEach((item) => {
      const portionText = item.portion === "half" ? " (Half)" : " (Full)";
      message += `• ${item.quantity}x ${item.name}${portionText} - ₹${item.price * item.quantity}%0A`;
      if (item.serves) message += `   Serves: ${item.serves}%0A`;
    });

    message += `%0A*Subtotal:* ₹${subtotal}%0A`;
    if (orderMode === "online") message += `*Delivery Charge:* ₹${deliveryCharge}%0A`;
    message += `*Total:* ₹${total}%0A%0AThank you!`;

    const whatsappUrl = `https://wa.me/919113320865?text=${message}`;
    window.open(whatsappUrl, "_blank");
    clearCart();
  };

  return (
    <main>
      {/* Floating Cart Button */}
      <div
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-50 cursor-pointer group"
      >
        <div className="relative bg-red-700 hover:bg-red-500 text-white p-5 rounded-full shadow-2xl border-4 border-white transition-all group-hover:scale-110">
          <ShoppingCart size={32} />
          {totalItems > 0 && (
            <span className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full min-w-9 h-9 flex items-center justify-center font-bold text-sm animate-pulse shadow-lg">
              {totalItems}
            </span>
          )}
        </div>
      </div>

      {/* Cart Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] w-full md:w-fit  overflow-y-auto rounded-2xl p-0 ">
          <DialogHeader className="p-4 pb-3 border-b sticky top-0 bg-white z-10">
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              <span className="flex items-center gap-3">
                <ShoppingCart size={28} />
                Your Cart ({totalItems})
              </span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X size={22} className="text-gray-600" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500 w-full">
                <ShoppingCart size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm">Add delicious items to get started!</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.portion}`}
                      className="flex gap-4 bg-gray-50 rounded-xl p-4 border"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                              {item.name}
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                {item.portion}
                              </span>
                              <div
                                className={`w-5 h-5 border-2 rounded-md flex items-center justify-center  ${
                                  item.isVeg
                                    ? "border-green-600 bg-green-500"
                                    : "border-red-600 bg-red-500"
                                }`}
                              >
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </h4>
                            {item.serves && (
                              <p className="text-xs text-gray-600 mt-1">Quantity : {item.serves}</p>
                            )}
                            <p className="text-lg font-bold text-green-600 mt-1">
                              ₹{item.price} each
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id, item.portion)}
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.portion, -1)}
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-12 text-center font-bold text-lg">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.portion, 1)}
                          >
                            <Plus size={16} />
                          </Button>
                          <span className="ml-auto font-bold text-lg">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Mode */}
                <div className="bg-gray-100 rounded-xl p-2">
                  <p className="font-semibold mb-3">Order Type</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={orderMode === "offline" ? "destructive" : "outline"}
                      className="h-14"
                      onClick={() => setOrderMode("offline")}
                    >
                      <Store size={20} />
                      Dine-in/Takeaway
                    </Button>
                    <Button
                      variant={orderMode === "online" ? "gogreen" : "outline"}
                      className="h-14"
                      onClick={() => setOrderMode("online")}
                    >
                      <Bike size={20} />
                      Delivery (+₹50)
                    </Button>
                  </div>
                </div>

                {/* Customer Info + Notes */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="notes">Special Instructions (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="E.g., Less cream, add cherry, extra chocolate..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {orderMode === "online" && (
                    <div className="space-y-1">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full address..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="bg-linear-to-r from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-300">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {orderMode === "online" && (
                    <div className="flex justify-between text-lg">
                      <span>Delivery Charge</span>
                      <span className="text-blue-600">+₹{deliveryCharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold text-green-600 mt-3 pt-3 border-t-2 border-yellow-300">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700"
                  onClick={sendWhatsAppOrder}
                  disabled={!name || !phone || cart.length === 0}
                >
                  Place Order via WhatsApp
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
};