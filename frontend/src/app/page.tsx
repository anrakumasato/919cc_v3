import Header from "@/components/Header"
import SaleTile from "@/components/SaleTile"
import { mockSaleItems } from "@/data/mock"

export default function HomePage() {
  return (
    <>
      <Header totalCount={mockSaleItems.length} />
      <main className="max-w-9xl mx-auto px-0 md:px-2 pb-18 md:pb-8 pt-0.5 md:pt-2">
        {/* タイルグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0.5 md:gap-2">
          {mockSaleItems.map((item) => (
            <SaleTile key={item.id} item={item} />
          ))}
        </div>
      </main>
    </>
  )
}
