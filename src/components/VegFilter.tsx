// components/menu/VegFilter.tsx
import { Button } from "@/src/components/ui/button";

interface Props {
  filter: "all" | "veg" | "nonveg";
  setFilter: (f: "all" | "veg" | "nonveg") => void;
}

export const VegFilter = ({ filter, setFilter }: Props) => (
  <div className="flex justify-center gap-3 py-4 bg-white shadow-sm sticky top-0 z-30">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          className={`flex items-center gap-2 ${
            filter === "all" ? "bg-slate-500 hover:bg-slate-700" : ""
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "veg" ? "default" : "outline"}
          className={`flex items-center gap-2 ${
            filter === "veg" ? "bg-green-600 hover:bg-green-700" : ""
          }`}
          onClick={() => setFilter("veg")}
        >
          <span className="w-4 h-4 border-2 border-green-600 bg-green-500 rounded-sm flex items-center justify-center">
            <span className="w-2 h-2 bg-white rounded-full"></span>
          </span>
          Veg
        </Button>
        <Button
          variant={filter === "nonveg" ? "default" : "outline"}
          className={`flex items-center gap-2 ${
            filter === "nonveg" ? "bg-red-600 hover:bg-red-700" : ""
          }`}
          onClick={() => setFilter("nonveg")}
        >
          <span className="w-4 h-4 border-2 border-red-600 bg-red-500 rounded-sm flex items-center justify-center">
            <span className="w-2 h-2 bg-white rounded-full"></span>
          </span>
          Non-Veg
        </Button>
      </div>
);