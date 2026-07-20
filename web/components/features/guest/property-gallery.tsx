"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

export function PropertyGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex h-[60vh] min-h-[400px] w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        No photos yet
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Gallery Grid */}
      {images.length >= 5 ? (
        <div className="grid h-[50vh] min-h-[350px] md:h-[60vh] w-full grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
          <div 
            className="group relative col-span-4 md:col-span-2 row-span-2 cursor-pointer overflow-hidden bg-muted"
            onClick={() => {
              setActiveIndex(0)
              setLightboxOpen(true)
            }}
          >
            <Image
              src={images[0]}
              alt={title}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/10" />
          </div>
          <div 
            className="group relative hidden md:block cursor-pointer overflow-hidden bg-muted"
            onClick={() => {
              setActiveIndex(1)
              setLightboxOpen(true)
            }}
          >
            <Image src={images[1]} alt="" fill className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes="25vw" />
            <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/10" />
          </div>
          <div 
            className="group relative hidden md:block cursor-pointer overflow-hidden bg-muted"
            onClick={() => {
              setActiveIndex(2)
              setLightboxOpen(true)
            }}
          >
            <Image src={images[2]} alt="" fill className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes="25vw" />
            <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/10" />
          </div>
          <div 
            className="group relative hidden md:block cursor-pointer overflow-hidden bg-muted"
            onClick={() => {
              setActiveIndex(3)
              setLightboxOpen(true)
            }}
          >
            <Image src={images[3]} alt="" fill className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes="25vw" />
            <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/10" />
          </div>
          <div 
            className="group relative hidden md:block cursor-pointer overflow-hidden bg-muted"
            onClick={() => {
              setActiveIndex(4)
              setLightboxOpen(true)
            }}
          >
            <Image src={images[4]} alt="" fill className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes="25vw" />
            <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/10" />
          </div>
        </div>
      ) : (
        <div 
          className="group relative aspect-[16/9] h-[50vh] min-h-[350px] md:h-[60vh] w-full cursor-pointer overflow-hidden rounded-xl bg-muted"
          onClick={() => {
            setActiveIndex(0)
            setLightboxOpen(true)
          }}
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Show all photos button */}
      <Button
        variant="secondary"
        size="sm"
        className="absolute bottom-4 right-4 hidden md:flex items-center gap-2 border border-border shadow-sm hover:bg-secondary/90 bg-background text-foreground hover:bg-background/90"
        onClick={() => {
          setActiveIndex(0)
          setLightboxOpen(true)
        }}
      >
        <LayoutGrid className="size-4" />
        Show all photos
      </Button>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl bg-black/95 p-0 border-none shadow-none text-white">
          <div className="relative h-[85vh] w-full flex items-center justify-center">
            <Image
              src={images[activeIndex]}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="flex gap-2 bg-black/50 p-2 rounded-xl backdrop-blur-sm max-w-[90vw] overflow-x-auto no-scrollbar">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "relative size-16 shrink-0 overflow-hidden rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                      index === activeIndex
                        ? "ring-2 ring-white"
                        : "opacity-50 hover:opacity-100"
                    )}
                  >
                    <Image src={image} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
