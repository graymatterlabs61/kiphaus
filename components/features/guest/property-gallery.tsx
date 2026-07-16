"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function PropertyGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        No photos yet
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label={`View full-screen photo of ${title}`}
        className="group relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Image
          src={images[activeIndex]}
          alt={title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="100vw"
          priority
        />
        {images.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-md bg-background/90 px-2 py-1 text-xs text-foreground">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </button>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1} of ${images.length}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                index === activeIndex
                  ? "ring-2 ring-ring ring-offset-2"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="sm:max-w-3xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image
              src={images[activeIndex]}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
