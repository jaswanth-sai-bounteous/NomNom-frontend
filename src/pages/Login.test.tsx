/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Login from "@/pages/Login";

const mockNavigate = jest.fn();
const loginUser = jest.fn();
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
  loginUser: (...args: unknown[]) => loginUser(...args),
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

describe("Login page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cancelQueries.mockResolvedValue(undefined);
    loginUser.mockResolvedValue({
      token: "token-123",
      user: { id: "user-1", name: "Test User", email: "test@example.com" },
    });
    fetchCartStore.mockResolvedValue(undefined);
  });

  it("shows a validation error for an invalid form", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "bad-email" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Login" }).closest("form")!);

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Please enter a valid email");
    });

    expect(loginUser).not.toHaveBeenCalled();
  });

  it("logs in, hydrates stores, and navigates home", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "secret123",
      });
    });

    expect(cancelQueries).toHaveBeenCalled();
    expect(removeQueries).toHaveBeenCalledWith({
      predicate: expect.any(Function),
    });
    expect(saveAuth).toHaveBeenCalledWith("token-123", {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
    });
    expect(resetCartStore).toHaveBeenCalled();
    expect(fetchCartStore).toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith("Login successful");
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("shows an error toast when login fails", async () => {
    loginUser.mockRejectedValue(new Error("Invalid credentials"));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Invalid credentials");
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
