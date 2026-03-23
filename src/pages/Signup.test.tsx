/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Signup from "@/pages/Signup";

const mockNavigate = jest.fn();
const signupUser = jest.fn();
const fetchCartStore = jest.fn();
const resetCartStore = jest.fn();
const saveAuth = jest.fn();
const toastSuccess = jest.fn();
const toastError = jest.fn();
const cancelQueries = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
const removeQueries = jest.fn();

jest.mock("@/assets/NomNom.png", () => "nomnom-logo.png");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/api", () => ({
  signupUser: (...args: unknown[]) => signupUser(...args),
}));

jest.mock("@/lib/auth", () => ({
  saveAuth: (...args: unknown[]) => saveAuth(...args),
}));

jest.mock("@/store/cartStore", () => ({
  useCartStore: {
    getState: () => ({
      fetchCart: () => fetchCartStore(),
      resetCart: () => resetCartStore(),
    }),
  },
}));

jest.mock("@/lib/queryClient", () => ({
  queryClient: {
    cancelQueries: () => cancelQueries(),
    removeQueries: (...args: unknown[]) => removeQueries(...args),
  },
}));

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

describe("Signup page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cancelQueries.mockResolvedValue(undefined);
    fetchCartStore.mockResolvedValue(undefined);
  });

  it("shows a validation error for an invalid form", async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: "A" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "bad-email" },
    });
    fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), {
      target: { value: "123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Sign up" }).closest("form")!);

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Name must be at least 2 characters");
    });

    expect(signupUser).not.toHaveBeenCalled();
  });

  it("signs up, hydrates stores, and navigates home when auth is returned", async () => {
    signupUser.mockResolvedValue({
      token: "token-456",
      user: { id: "user-2", name: "Jane Doe", email: "jane@example.com" },
    });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => {
      expect(signupUser).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "secret123",
      });
    });

    expect(cancelQueries).toHaveBeenCalled();
    expect(removeQueries).toHaveBeenCalledWith({
      predicate: expect.any(Function),
    });
    expect(saveAuth).toHaveBeenCalledWith("token-456", {
      id: "user-2",
      name: "Jane Doe",
      email: "jane@example.com",
    });
    expect(resetCartStore).toHaveBeenCalled();
    expect(fetchCartStore).toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith("Account created successfully");
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("navigates to login when signup returns a message only", async () => {
    signupUser.mockResolvedValue({
      message: "Account created. Please sign in.",
    });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith("Account created. Please sign in.");
    });

    expect(saveAuth).not.toHaveBeenCalled();
    expect(fetchCartStore).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("shows an error toast when signup fails", async () => {
    signupUser.mockRejectedValue(new Error("Email already exists"));

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("Your full name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Email already exists");
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
