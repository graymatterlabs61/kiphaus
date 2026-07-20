"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { PillRadio } from "@/components/features/host/pill-radio"
import { AuthError } from "@/lib/auth"
import {
  HOST_CANCELLATION_POLICIES,
  HOST_PROPERTY_TYPES,
  createProperty,
  deletePropertyPhoto,
  fetchAmenities,
  updateProperty,
  uploadPropertyPhoto,
  type Amenity,
  type PropertyDraft,
  type PropertyPhoto,
} from "@/lib/api"

const fieldClass =
  "rounded-full h-[50px] px-5 bg-transparent border-border hover:border-graphite/50 transition-colors text-body"
const labelClass = "text-body-sm font-medium text-graphite tracking-body-sm"

export const EMPTY_PROPERTY_DRAFT: PropertyDraft = {
  title: "",
  description: "",
  propertyType: "apartment",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
  maxGuests: 1,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  pricePerNight: 0,
  cleaningFee: 0,
  minNights: 1,
  maxNights: 365,
  checkInTime: "15:00",
  checkOutTime: "11:00",
  houseRules: "",
  allowsPets: false,
  allowsSmoking: false,
  allowsParties: false,
  cancellationPolicy: "moderate",
  amenityIds: [],
}

function firstError(err: unknown): string {
  if (err instanceof AuthError) {
    const fieldError = err.errors && Object.values(err.errors)[0]?.[0]
    return fieldError ?? err.message
  }
  return err instanceof Error ? err.message : "Something went wrong."
}

export function PropertyForm({
  propertyId,
  initial,
  initialPhotos = [],
  submitLabel,
  onSaved,
}: {
  propertyId?: string
  initial?: PropertyDraft
  initialPhotos?: PropertyPhoto[]
  submitLabel: string
  onSaved?: (id: string) => void
}) {
  const [draft, setDraft] = useState<PropertyDraft>(initial ?? EMPTY_PROPERTY_DRAFT)
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [photos, setPhotos] = useState<PropertyPhoto[]>(initialPhotos)
  const [savedId, setSavedId] = useState<string | undefined>(propertyId)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchAmenities().then(setAmenities).catch(() => setAmenities([]))
  }, [])

  function set<K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function toggleAmenity(id: number) {
    setDraft((d) => ({
      ...d,
      amenityIds: d.amenityIds.includes(id) ? d.amenityIds.filter((a) => a !== id) : [...d.amenityIds, id],
    }))
  }

  async function handleSubmit() {
    setIsSaving(true)
    setError(null)
    setSaved(false)
    try {
      if (savedId) {
        await updateProperty(savedId, draft)
        setSaved(true)
        onSaved?.(savedId)
      } else {
        const { id } = await createProperty(draft)
        setSavedId(id)
        setSaved(true)
        onSaved?.(id)
      }
    } catch (err) {
      setError(firstError(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePhotoDelete(photoId: string) {
    setPhotos((p) => p.filter((ph) => ph.id !== photoId))
    try {
      await deletePropertyPhoto(photoId)
    } catch (err) {
      setError(firstError(err))
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !savedId) return
    setIsUploading(true)
    setError(null)
    try {
      const photo = await uploadPropertyPhoto(savedId, file)
      setPhotos((p) => [...p, photo])
    } catch (err) {
      setError(firstError(err))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="basics">
        <h2 id="basics" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">
          Property basics
        </h2>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className={labelClass}>Listing title</Label>
            <Input id="title" value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Aravali Ridge Studio with Terrace" className={fieldClass} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className={labelClass}>Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What makes this stay worth booking?"
              className="rounded-2xl border-border bg-transparent px-5 py-4 text-body hover:border-graphite/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label className={labelClass}>Property type</Label>
            <div className="flex flex-wrap gap-2">
              {HOST_PROPERTY_TYPES.map((type) => (
                <PillRadio key={type.value} name="propertyType" value={type.value} checked={draft.propertyType === type.value} onChange={(v) => set("propertyType", v)}>
                  {type.label}
                </PillRadio>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="location">
        <h2 id="location" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Location</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address1" className={labelClass}>Address line 1</Label>
            <Input id="address1" value={draft.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} className={fieldClass} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address2" className={labelClass}>Address line 2 (optional)</Label>
            <Input id="address2" value={draft.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className={labelClass}>City</Label>
            <Input id="city" value={draft.city} onChange={(e) => set("city", e.target.value)} placeholder="Gurugram" className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region" className={labelClass}>State</Label>
            <Input id="region" value={draft.state} onChange={(e) => set("state", e.target.value)} placeholder="Haryana" className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className={labelClass}>Country</Label>
            <Input id="country" value={draft.country} onChange={(e) => set("country", e.target.value)} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal" className={labelClass}>Postal code</Label>
            <Input id="postal" value={draft.postalCode} onChange={(e) => set("postalCode", e.target.value)} className={fieldClass} />
          </div>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="capacity">
        <h2 id="capacity" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Capacity</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="guests" className={labelClass}>Guests</Label>
            <Input id="guests" type="number" min={1} value={draft.maxGuests} onChange={(e) => set("maxGuests", Number(e.target.value))} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrooms" className={labelClass}>Bedrooms</Label>
            <Input id="bedrooms" type="number" min={0} value={draft.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beds" className={labelClass}>Beds</Label>
            <Input id="beds" type="number" min={1} value={draft.beds} onChange={(e) => set("beds", Number(e.target.value))} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms" className={labelClass}>Bathrooms</Label>
            <Input id="bathrooms" type="number" min={0.5} step={0.5} value={draft.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} className={fieldClass} />
          </div>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="photos">
        <h2 id="photos" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Photos</h2>
        <p className="mt-1 text-body-sm text-smoke tracking-body-sm">
          {savedId ? "Add at least 5 photos." : "Save the listing first, then add photos."}
        </p>
        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
                {photo.image && <Image src={photo.image} alt="" fill className="object-cover" sizes="120px" />}
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => handlePhotoDelete(photo.id)}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label
          className={`mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-smoke transition-colors ${
            savedId ? "cursor-pointer hover:border-graphite/50" : "cursor-not-allowed opacity-50"
          }`}
        >
          <ImagePlus className="size-6" aria-hidden="true" />
          <span className="text-body-sm font-medium tracking-body-sm">{isUploading ? "Uploading…" : "Add photo"}</span>
          <input type="file" accept="image/*" className="sr-only" disabled={!savedId || isUploading} onChange={handlePhotoSelect} />
        </label>
      </section>

      <Separator />

      <section aria-labelledby="amenities">
        <h2 id="amenities" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Amenities & house rules</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {amenities.map((amenity) => {
            const id = `amenity-${amenity.id}`
            return (
              <div key={amenity.id} className="flex items-center gap-2">
                <Checkbox id={id} checked={draft.amenityIds.includes(amenity.id)} onCheckedChange={() => toggleAmenity(amenity.id)} />
                <Label htmlFor={id} className="text-body-sm font-normal text-graphite tracking-body-sm">{amenity.name}</Label>
              </div>
            )
          })}
        </div>
        <div className="mt-6 space-y-2">
          <Label htmlFor="house-rules" className={labelClass}>House rules</Label>
          <Textarea
            id="house-rules"
            rows={4}
            value={draft.houseRules}
            onChange={(e) => set("houseRules", e.target.value)}
            placeholder={"Check-in after 1:00 PM, check-out before 11:00 AM\nNo smoking indoors"}
            className="rounded-2xl border-border bg-transparent px-5 py-4 text-body hover:border-graphite/50 transition-colors"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Checkbox id="allows-pets" checked={draft.allowsPets} onCheckedChange={() => set("allowsPets", !draft.allowsPets)} />
            <Label htmlFor="allows-pets" className="text-body-sm font-normal text-graphite tracking-body-sm">Pets allowed</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="allows-smoking" checked={draft.allowsSmoking} onCheckedChange={() => set("allowsSmoking", !draft.allowsSmoking)} />
            <Label htmlFor="allows-smoking" className="text-body-sm font-normal text-graphite tracking-body-sm">Smoking allowed</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="allows-parties" checked={draft.allowsParties} onCheckedChange={() => set("allowsParties", !draft.allowsParties)} />
            <Label htmlFor="allows-parties" className="text-body-sm font-normal text-graphite tracking-body-sm">Parties allowed</Label>
          </div>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="pricing">
        <h2 id="pricing" className="text-heading-sm font-semibold text-ink-black leading-heading-sm">Pricing & policy</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price" className={labelClass}>Price per night (₹)</Label>
            <Input id="price" type="number" min={0} value={draft.pricePerNight} onChange={(e) => set("pricePerNight", Number(e.target.value))} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cleaning-fee" className={labelClass}>Cleaning fee (₹)</Label>
            <Input id="cleaning-fee" type="number" min={0} value={draft.cleaningFee} onChange={(e) => set("cleaningFee", Number(e.target.value))} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-nights" className={labelClass}>Minimum nights</Label>
            <Input id="min-nights" type="number" min={1} value={draft.minNights} onChange={(e) => set("minNights", Number(e.target.value))} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-nights" className={labelClass}>Maximum nights</Label>
            <Input id="max-nights" type="number" min={1} value={draft.maxNights} onChange={(e) => set("maxNights", Number(e.target.value))} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check-in" className={labelClass}>Check-in time</Label>
            <Input id="check-in" type="time" value={draft.checkInTime} onChange={(e) => set("checkInTime", e.target.value)} className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check-out" className={labelClass}>Check-out time</Label>
            <Input id="check-out" type="time" value={draft.checkOutTime} onChange={(e) => set("checkOutTime", e.target.value)} className={fieldClass} />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <Label className={labelClass}>Cancellation policy</Label>
          <div className="flex flex-wrap gap-2">
            {HOST_CANCELLATION_POLICIES.map((policy) => (
              <PillRadio key={policy.value} name="cancellationPolicy" value={policy.value} checked={draft.cancellationPolicy === policy.value} onChange={(v) => set("cancellationPolicy", v)}>
                {policy.label}
              </PillRadio>
            ))}
          </div>
        </div>
      </section>

      {error && <p className="text-body-sm text-destructive tracking-body-sm">{error}</p>}
      {saved && !error && <p className="text-body-sm text-primary tracking-body-sm">Saved.</p>}

      <div className="flex items-center gap-3">
        <Button
          className="rounded-full h-[50px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          disabled={isSaving}
          onClick={handleSubmit}
        >
          {isSaving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  )
}
