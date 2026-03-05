import CategoryList from "@/components/frontend/CategoryList";
import Hero from "@/components/frontend/Hero";
import MarketList from "@/components/frontend/MarketList";
import { getData } from "@/lib/getData";
export default async function Home() {
  const categoriesData = await getData<any[]>(
    "categories?withProducts=true&productLimit=12"
  );
  const featuredCategories = categoriesData.filter((category: any) => {
    return (category.products?.length ?? 0) > 3;
  });

  return (
    <div className="min-h-screen">
      <Hero categories={categoriesData} />
      <MarketList />

      {featuredCategories.map((category: any, i: number) => {
        return (
          <div className="py-8" key={i}>
            <CategoryList isMarketPage={false} category={category} />
          </div>
        );
      })}
    </div>
  );
}
