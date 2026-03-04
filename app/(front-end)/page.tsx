import { auth } from "@/lib/auth";
import CategoryList from "@/components/frontend/CategoryList";
import CommunityTrainings from "@/components/frontend/CommunityTrainings";
import Hero from "@/components/frontend/Hero";
import MarketList from "@/components/frontend/MarketList";
import { getData } from "@/lib/getData";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
export default async function Home() {
  const categoriesData = await getData<any[]>("categories");
  const categories = categoriesData.filter((category: any) => {
    return (category.products?.length ?? 0) > 3;
  });
 
  try {
   
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) {
      throw error;
    }
  }
  const session = await auth();
  console.log(session?.user);
  return (
    <div className="min-h-screen">
      <Hero />
      <MarketList />

      {categories.map((category: any, i: number) => {
        return (
          <div className="py-8" key={i}>
            <CategoryList isMarketPage={false} category={category} />
          </div>
        );
      })}

     
    </div>
  );
}
