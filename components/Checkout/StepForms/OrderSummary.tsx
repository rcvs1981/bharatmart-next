"use client";
import { setCurrentStep } from "@/redux/slices/checkoutSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

type CartItem = {
  id: string;
  title: string;
  salePrice: number | string;
  qty: number;
  imageUrl: string;
  vendorId: string;
};

type CheckoutFormData = {
  shippingCost?: number | string;
  [key: string]: unknown;
};

type StoreState = {
  checkout: {
    currentStep: number;
    checkoutFormData: CheckoutFormData;
  };
  cart: CartItem[];
};

type OrderCreateResponse = {
  id?: string;
  message?: string;
};

export default function OrderSummary() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const checkoutFormData = useSelector(
    (store: StoreState) => store.checkout.checkoutFormData
  );
  const currentStep = useSelector((store: StoreState) => store.checkout.currentStep);
  const cartItems = useSelector((store: StoreState) => store.cart);
  const dispatch = useDispatch();

  function handlePrevious() {
    dispatch(setCurrentStep(Math.max(1, currentStep - 1)));
  }

  const shippingCostValue = Number(checkoutFormData.shippingCost ?? 0);
  const shippingCost = Number.isFinite(shippingCostValue) ? shippingCostValue : 0;
  const estimatedDeliveryDays = shippingCost === 50 ? 3 : shippingCost === 75 ? 2 : 1;
  const subTotalValue = cartItems.reduce((acc, currentItem) => {
    const salePrice = Number(currentItem.salePrice ?? 0);
    const qty = Number(currentItem.qty ?? 0);
    if (!Number.isFinite(salePrice) || !Number.isFinite(qty)) return acc;
    return acc + salePrice * qty;
  }, 0);
  const totalValue = subTotalValue + shippingCost;

  async function submitData() {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const data = {
      orderItems: cartItems,
      checkoutFormData,
    };

    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = (await response
        .json()
        .catch(() => null)) as OrderCreateResponse | null;

      if (!response.ok) {
        toast.error(responseData?.message ?? "Something went wrong, please try again");
        return;
      }

      if (!responseData?.id) {
        toast.error("Order created but response is missing order id");
        return;
      }

      toast.success("Order created successfully");
      router.push(`/order-confirmation/${responseData.id}`);
    } catch {
      toast.error("Network error: failed to create order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4 dark:text-green-400">
        Order Summary
      </h2>
      {cartItems.map((cartItem) => {
        return (
          <div
            key={cartItem.id}
            className="flex items-center justify-between border-b border-slate-400  pb-3 font-semibold text-sm mb-4"
          >
            <div className="flex items-center gap-3">
              <Image
                src={cartItem.imageUrl}
                width={249}
                height={249}
                alt={cartItem.title}
                className="rounded-xl w-14 h-14"
              />
              <div className="flex flex-col">
                <h2>{cartItem.title}</h2>
              </div>
            </div>
            <div className=" rounded-xl border border-gray-400 flex gap-3 items-center ">
              <p className="flex-grow py-2 px-4">{cartItem.qty}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col justify-center">
                <h4>${(Number(cartItem.salePrice) * Number(cartItem.qty)).toFixed(2)}</h4>
                <p className="text-[10px] text-gray-300">
                  (${cartItem.salePrice}x {cartItem.qty})
                </p>
              </div>
            </div>
          </div>
        );
      })}
      {shippingCost > 0 && (
        <div className="flex items-center justify-between border-b border-slate-400  pb-3 font-semibold text-sm mb-4">
          <span>Shipping Cost </span>
          <span className="text-[12px] text-gray-300">
            The order will be delivered in {estimatedDeliveryDays} days
          </span>
          <span>${shippingCost.toFixed(2)}</span>
        </div>
      )}
      <div className="flex items-center justify-between border-b border-slate-400  pb-3 font-semibold text-sm mb-4">
        <span>Total</span>

        <span>${totalValue.toFixed(2)}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handlePrevious}
          type="button"
          className="inline-flex items-center px-6 py-3 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-slate-900 rounded-lg focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 hover:bg-slate-800 dark:bg-green-600 dark:hover:bg-green-700"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          <span>Previous</span>
        </button>
        {loading ? (
          <button
            disabled
            className="inline-flex items-center px-6 py-3 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-slate-900 rounded-lg focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 hover:bg-slate-800 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Processing Please wait...
          </button>
        ) : (
          <button
            onClick={submitData}
            disabled={loading || cartItems.length === 0}
            className="inline-flex items-center px-6 py-3 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-slate-900 rounded-lg focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 hover:bg-slate-800 dark:bg-green-600 dark:hover:bg-green-700"
          >
            <span>Proceed to Payment</span>
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}
