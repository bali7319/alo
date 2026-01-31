type JsonLdProps = {
  data: unknown
  id?: string
}

/**
 * Server-safe JSON-LD injection helper.
 * Use in app router pages/layouts to add structured data for SEO.
 */
export default function SeoJsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // JSON-LD must be a raw JSON string inside the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

