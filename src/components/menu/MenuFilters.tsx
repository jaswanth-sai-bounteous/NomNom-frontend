import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SectionHeading from "@/components/SectionHeading";
import type { Category } from "@/types";

type MenuFiltersProps = {
  categories: Category[];
  searchQuery: string;
  activeCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

const MenuFilters = ({
  categories,
  searchQuery,
  activeCategory,
  onSearchChange,
  onCategoryChange,
}: MenuFiltersProps) => {
  return (
    <Card className="rounded-[32px] border border-stone-200 bg-white shadow-[0_24px_50px_-35px_rgba(28,25,23,0.4)]">
      <CardContent className="space-y-8 p-6 sm:p-8">
        <SectionHeading
          eyebrow="Menu"
          title="Choose your next favorite dish"
          description="Use the category tabs and search bar to quickly find starters, mains, desserts, and more."
        />

        <div className="space-y-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search dishes, drinks, or desserts"
              className="h-12 rounded-full border-stone-300 pl-11 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => onCategoryChange("all")}
              className={`rounded-full px-5 ${
                activeCategory === "all"
                  ? "bg-stone-900 text-white hover:bg-stone-800"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              All
            </Button>

            {categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.id)}
                className={`rounded-full px-5 ${
                  activeCategory === category.id
                    ? "bg-amber-500 text-stone-950 hover:bg-amber-400"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuFilters;
