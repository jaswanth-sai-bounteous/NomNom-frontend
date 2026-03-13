import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import heroBurger from "@/assets/hero-burger.svg";
import heroPasta from "@/assets/hero-pasta.svg";
import heroPizza from "@/assets/hero-pizza.svg";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

type HeroSlide = {
  id: string;
  title: string;
  description: string;
  foodImg: string;
  price: number;
};

/*
  Input: none.
  Output: a lightweight hero carousel that rotates through a few built-in slides.

  The slide content is local and predictable, so the carousel stays reliable even if
  remote product image URLs are missing or blocked.
*/
const heroSlides: HeroSlide[] = [
  {
    id: "signature-burger",
    title: "BBQ Chicken Burger",
    description:
      "Chicken burger with smoky BBQ sauce, crisp lettuce, and a warm toasted bun for a bold and satisfying bite.",
    foodImg: heroBurger,
    price: 349,
  },
  {
    id: "signature-pizza",
    title: "Farmhouse Pizza",
    description:
      "Loaded with colorful vegetables, melted cheese, and a crisp crust that makes every slice feel freshly baked.",
    foodImg: heroPizza,
    price: 499,
  },
  {
    id: "signature-pasta",
    title: "Creamy Alfredo Pasta",
    description:
      "Rich, velvety pasta with a smooth Alfredo sauce designed to feel comforting, polished, and restaurant fresh.",
    foodImg: heroPasta,
    price: 429,
  },
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentSlide = heroSlides[currentIndex];

  /*
    Input: current carousel state.
    Output: advances to the next slide every few seconds unless the user is hovering.
  */
  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % heroSlides.length);
    }, 4500);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused]);

  return (
    <section
      className="relative overflow-hidden rounded-[36px] bg-stone-950 shadow-[0_40px_80px_-45px_rgba(28,25,23,0.9)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0">
        <ImageWithFallback
          src={currentSlide.foodImg}
          alt={currentSlide.title}
          fallbackLabel={currentSlide.title}
          className="h-full w-full object-cover opacity-55"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-900/30" />
      </div>

      <div className="relative grid min-h-[520px] items-center gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
        <div className="max-w-2xl space-y-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-300">
            Signature Dining
          </p>
          <h1 className="min-h-[3.5rem] text-4xl font-semibold leading-tight sm:min-h-[4.5rem] sm:text-5xl lg:min-h-[5.5rem] lg:text-6xl">
            {currentSlide.title}
          </h1>
          <p className="min-h-[6rem] max-w-xl text-base leading-8 text-stone-200 sm:min-h-[5.5rem] sm:text-lg">
            {currentSlide.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              asChild
              className="h-12 rounded-full bg-amber-500 px-6 text-stone-950 hover:bg-amber-400"
            >
              <Link to="/menu">
                Explore menu
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <span className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white">
              Starts at {formatCurrency(currentSlide.price)}
            </span>
          </div>
        </div>

        <div className="hidden justify-end lg:flex">
          <div className="w-full max-w-sm rounded-[32px] border border-white/15 bg-white/10 p-4 backdrop-blur">
            <ImageWithFallback
              src={currentSlide.foodImg}
              alt={currentSlide.title}
              fallbackLabel={currentSlide.title}
              className="h-[380px] w-full rounded-[24px] object-cover"
              loading="eager"
              decoding="sync"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 flex gap-2 sm:left-10">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show ${slide.title}`}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full ${
              index === currentIndex
                ? "w-10 bg-amber-400"
                : "w-2.5 bg-white/45 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
