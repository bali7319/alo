'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Skeleton } from './skeleton'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  isBase64?: boolean
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  sizes,
  priority = false,
  isBase64 = false,
  onError,
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority || isInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // 50px önceden yükle
        threshold: 0.01,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [priority, isInView])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true)
    if (onError) onError(e)
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <span className="text-gray-400 text-sm">Resim yüklenemedi</span>
      </div>
    )
  }

  if (fill) {
    return (
      <div ref={imgRef} className="absolute inset-0 w-full h-full">
        {isInView ? (
          isBase64 ? (
            <img
              src={src}
              alt={alt}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              onError={handleError}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              className="object-cover"
              loading={priority ? 'eager' : 'lazy'}
              onError={handleError}
            />
          )
        ) : (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
      </div>
    )
  }

  return (
    <div ref={imgRef} className={className}>
      {isInView ? (
        isBase64 ? (
          <img
            src={src}
            alt={alt}
            className={className}
            style={{ width, height }}
            loading="lazy"
            onError={handleError}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className={className}
            loading={priority ? 'eager' : 'lazy'}
            onError={handleError}
          />
        )
      ) : (
        <Skeleton className="w-full h-full" style={{ width, height }} />
      )}
    </div>
  )
}

