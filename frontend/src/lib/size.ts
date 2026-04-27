export const sizeToSlug = (size: string): string =>
  size.replace(".", "-")

export const slugToSize = (slug: string): string =>
  slug.replace(/(\d)-(\d)/, "$1.$2")
