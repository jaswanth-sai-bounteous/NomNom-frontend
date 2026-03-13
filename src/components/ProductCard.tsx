import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import ImageWithFallback from "@/components/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden rounded-[28px] border border-stone-200 bg-white py-0 shadow-[0_18px_40px_-30px_rgba(120,53,15,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(120,53,15,0.75)]">
      <Link to={`/product/${product.id}`} className="block">
        <div className="overflow-hidden">
          <ImageWithFallback
            src={product.foodImg}
            alt={product.title}
            fallbackLabel={product.title}
            className="h-56 w-full object-cover transition duration-500 hover:scale-105"
          />
        </div>

        <CardHeader className="space-y-4 px-5 pt-5">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl font-semibold text-stone-900">
              {product.title}
            </CardTitle>
            <Badge className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 hover:bg-amber-100">
              {formatCurrency(product.price)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-5 pb-0">
          <p className="line-clamp-3 text-sm leading-6 text-stone-600">
            {product.description || "Freshly prepared and served with care."}
          </p>

          <div className="flex flex-wrap gap-2">
            {product.categories.slice(0, 2).map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="border-none bg-transparent px-5 pb-5 pt-4">
        <Button
          className="h-11 w-full rounded-full bg-stone-900 text-white hover:bg-amber-600"
          onClick={() => onAddToCart?.(product)}
        >
          <ShoppingBag className="mr-2 size-4" />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
