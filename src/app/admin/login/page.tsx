"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card } from "@/src/components/ui/card";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  // ✅ Clear previous login when coming to login page
  useEffect(() => {
    sessionStorage.removeItem("adminAuth");
  }, []);

  const handleLogin = () => {
    if (password.trim() === "Biryani@1") {
      sessionStorage.setItem("adminAuth", "true");

      // ✅ Redirect ONLY after correct password
      router.push("/admin/AdminDashboard");
    } else {
      alert("Incorrect password!");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-600 via-orange-500 to-red-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-10 shadow-2xl bg-white/95 backdrop-blur-lg border border-white/20">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-yellow-600 to-red-600">
            Biryani House
          </h1>
          <p className="text-gray-600 text-lg mt-3">Admin Login</p>
        </div>

        <div className="space-y-6">
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="text-lg h-14"
          />
          <Button
            onClick={handleLogin}
            className="w-full h-14 text-lg font-bold bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            Login to Admin Panel
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          Hint : <code className="bg-gray-200 px-2 py-1 rounded">Biryani@1</code>
        </p>
      </Card>
    </div>
  );
}
