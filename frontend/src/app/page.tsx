import Header from "@/components/Header"
import BrandFilter from "@/components/BrandFilter"
import { getSaleItems } from "@/lib/api"

export const revalidate = 60

export default async function HomePage() {
  const items = await getSaleItems()

  return (
    <>
      <Header />
      <main className="max-w-9xl mx-auto px-0 md:px-2 pb-18 md:pb-8 pt-0.5 md:pt-2">
        <BrandFilter items={items} />
      </main>
    </>
  )
}
