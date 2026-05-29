export type SizeEntry = {
  id: number
  size: string
  price: number
  standardPrice: number
  discountRate: number | null
  discountAmount: number
  isAnomaly: boolean
  affiliateUrl: string
}

export type ItemDetail = {
  featured: SizeEntry
  product: {
    id: number
    name: string
    brand: string
    imageUrl: string
    parentAsin: string
  }
  sizes: SizeEntry[]
}

export type SaleItem = {
  id: number
  slug: string
  name: string
  brand: string
  parentAsin: string
  standardPrice: number
  anomalySize: string
  anomalyPrice: number
  discountRate: number
  discountAmount: number
  affiliateUrl: string
  detectedAt: string
  imageUrl: string
}
