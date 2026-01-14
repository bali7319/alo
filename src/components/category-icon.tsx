import Image from 'next/image'

type Props = {
  slug: string
  alt: string
  size?: number
  className?: string
}

export function CategoryIcon({ slug, alt, size = 56, className }: Props) {
  return (
    <div
      className={`relative ${className || ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src={`/category-icons/${slug}.svg`}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority={false}
      />
    </div>
  )
}

