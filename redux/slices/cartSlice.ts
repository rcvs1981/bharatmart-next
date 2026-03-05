import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  title: string;
  salePrice: number;
  imageUrl: string;
  qty: number;
  vendorId: string;
};

type AddToCartPayload = {
  id: string;
  title: string;
  salePrice: number;
  imageUrl: string;
  userId: string;
};

function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem("cart");
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persistCart(state: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(state));
  }
}

const initialState: CartItem[] = readCartFromStorage();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { id, title, salePrice, imageUrl, userId } = action.payload;
      const vendorId = userId;
      const existingItem = state.find((item) => item.id === id);

      if (existingItem) {
        existingItem.qty += 1;
      } else {
        state.push({ id, title, salePrice, imageUrl, qty: 1, vendorId });
      }

      persistCart([...state]);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const cartId = action.payload;
      const newState = state.filter((item) => item.id !== cartId);
      persistCart(newState);
      return newState;
    },
    incrementQty: (state, action: PayloadAction<string>) => {
      const cartId = action.payload;
      const cartItem = state.find((item) => item.id === cartId);
      if (!cartItem) return;

      cartItem.qty += 1;
      persistCart([...state]);
    },
    decrementQty: (state, action: PayloadAction<string>) => {
      const cartId = action.payload;
      const cartItem = state.find((item) => item.id === cartId);
      if (!cartItem || cartItem.qty <= 1) return;

      cartItem.qty -= 1;
      persistCart([...state]);
    },
  },
});

export const { addToCart, removeFromCart, incrementQty, decrementQty } =
  cartSlice.actions;
export default cartSlice.reducer;
