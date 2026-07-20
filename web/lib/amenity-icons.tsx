import {
  AirVent,
  Bath,
  Briefcase,
  Car,
  ChefHat,
  Dumbbell,
  Fan,
  Flame,
  Gamepad2,
  Layers,
  ParkingSquare,
  PawPrint,
  Shield,
  ShieldCheck,
  Snowflake,
  Sofa,
  Sparkles,
  Trees,
  Tv,
  Waves,
  WashingMachine,
  Wifi,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react"

// Amenity.icon (api/properties/models.py) is a freeform keyword the host/admin
// picks (e.g. "wifi", "pool") — this maps that keyword, or failing that a
// keyword found in the amenity's name, to a real icon instead of a blank dot.
const ICON_KEYWORD_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  internet: Wifi,
  kitchen: ChefHat,
  cooking: ChefHat,
  parking: ParkingSquare,
  car: Car,
  pool: Waves,
  swimming: Waves,
  pet: PawPrint,
  pets: PawPrint,
  workspace: Briefcase,
  desk: Briefcase,
  balcony: Trees,
  terrace: Trees,
  garden: Trees,
  ac: Snowflake,
  "air-conditioning": Snowflake,
  aircon: Snowflake,
  cooling: AirVent,
  heating: Flame,
  heater: Flame,
  tv: Tv,
  television: Tv,
  washer: WashingMachine,
  laundry: WashingMachine,
  "washing-machine": WashingMachine,
  power: Zap,
  backup: Zap,
  generator: Zap,
  geyser: Bath,
  "hot-water": Bath,
  gym: Dumbbell,
  fitness: Dumbbell,
  security: Shield,
  cctv: Shield,
  camera: Shield,
  safety: ShieldCheck,
  fan: Fan,
  ventilation: Wind,
  furniture: Sofa,
  sofa: Sofa,
  games: Gamepad2,
  entertainment: Gamepad2,
  flooring: Layers,
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[\s/]+/g, "-")
}

export function getAmenityIcon({ icon, name }: { icon?: string; name: string }): LucideIcon {
  const iconKey = icon ? normalize(icon) : ""
  if (iconKey && ICON_KEYWORD_MAP[iconKey]) return ICON_KEYWORD_MAP[iconKey]

  const nameWords = normalize(name).split("-")
  for (const word of nameWords) {
    if (ICON_KEYWORD_MAP[word]) return ICON_KEYWORD_MAP[word]
  }

  return Sparkles
}
