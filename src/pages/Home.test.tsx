/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Home from "@/pages/Home";

const products = [
  {
    id: "product-1",
    title: "Paneer Bowl",
    description: "Popular bowl",
    price: 220,
    foodImg: "paneer.jpg",
    categories: [],
  },
  {
    id: "product-2",
    title: "Masala Fries",
    description: "Popular fries",
    price: 120,
    foodImg: "fries.jpg",
    categories: [],
  },
  {
    id: "product-3",
    title: "Mango Lassi",
    description: "Popular drink",
    price: 90,
    foodImg: "lassi.jpg",
    categories: [],
  },
  {
    id: "product-4",
    title: "Extra Dish",
    description: "Should be trimmed",
    price: 150,
    foodImg: "extra.jpg",
    categories: [],
  },
] as const;

type ProductsResponse = { products: typeof products };
type StoreState = {
  items: Array<{
    id: string;
    quantity: number;
    product: (typeof products)[number];
  }>;
};

const fetchProductsPage = jest.fn<Promise<ProductsResponse>, []>();
const addProduct = jest.fn<Promise<void>, [(typeof products)[number], number]>();
const useCartStore = jest.fn();

jest.mock("@/api", () => ({
  fetchProductsPage: () => fetchProductsPage(),
}));

jest.mock("@/store/cartStore", () => ({
  getCartQuantityTotal: (items: Array<{ quantity: number }>) =>
    items.reduce((total, item) => total + item.quantity, 0),
  useCartStore: (selector: (state: { items: unknown[]; addProduct: typeof addProduct }) => unknown) =>
    useCartStore(selector),
}));

jest.mock("@/components/HeroCarousel", () => () => <div>Hero Carousel</div>);
jest.mock("@/components/About", () => () => <div>About Section</div>);
jest.mock("@/components/SectionHeading", () => ({
  __esModule: true,
  default: ({
    eyebrow,
    title,
    description,
  }: {
    eyebrow: string;
    title: string;
    description: string;
  }) => (
    <div>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));
jest.mock("@/components/ProductCard", () => ({
  __esModule: true,
  default: ({
    product,
    onAddToCart,
    isInCart,
  }: {
    product: { id: string; title: string };
    onAddToCart?: (product: { id: string; title: string }) => void;
    isInCart?: boolean;
  }) => (
    <div data-testid={`product-${product.id}`}>
      <span>{product.title}</span>
      <span>{isInCart ? "In cart" : "Not in cart"}</span>
      <button type="button" onClick={() => onAddToCart?.(product)}>
        Add {product.title}
      </button>
    </div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchProductsPage.mockResolvedValue({ products });
    useCartStore.mockImplementation((selector: (state: StoreState & { addProduct: typeof addProduct }) => unknown) =>
      selector({ items: [], addProduct }),
    );
  });

  it("renders landing page sections and popular picks", async () => {
    render(<Home />, { wrapper: createWrapper() });

    expect(screen.getByText("Hero Carousel")).toBeInTheDocument();
    expect(screen.getByText("Chef-crafted plates")).toBeInTheDocument();
    expect(
      screen.getByText("A few dishes guests keep coming back for"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Paneer Bowl")).toBeInTheDocument();
    });

    expect(screen.getByText("Masala Fries")).toBeInTheDocument();
    expect(screen.getByText("Mango Lassi")).toBeInTheDocument();
    expect(screen.queryByText("Extra Dish")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /see full menu/i })).toHaveAttribute(
      "href",
      "/menu",
    );
  });

  it("shows current cart count and marks products already in cart", async () => {
    useCartStore.mockImplementation((selector: (state: StoreState & { addProduct: typeof addProduct }) => unknown) =>
      selector({
        items: [
          {
            id: "cart-item-1",
            quantity: 2,
            product: products[0],
          },
        ],
        addProduct,
      }),
    );

    render(<Home />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Paneer Bowl")).toBeInTheDocument();
    });

    expect(screen.getByText("Your current cart has 2 items.")).toBeInTheDocument();
    expect(screen.getByText("In cart")).toBeInTheDocument();
  });

  it("calls addProduct when a popular pick add button is clicked", async () => {
    render(<Home />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add Paneer Bowl" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Paneer Bowl" }));

    expect(addProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "product-1",
        title: "Paneer Bowl",
      }),
      1,
    );
  });
});
