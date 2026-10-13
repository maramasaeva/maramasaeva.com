/* Shirt checkout. The address is collected here, mailed to the inbox that
   receives the payment, and copied onto the PayPal order. Yoycol needs every
   one of these fields to print and ship. */

export const PAYPAL = "messiermara@gmail.com"

export const SHIRTS = ["total clanker genocide", "i went to plzdontkillus"] as const

export const SIZES = ["s", "m", "l", "xl", "2xl"] as const

export const PRICES = {
  EUR: { amount: "24.00", label: "€24" },
  USD: { amount: "27.00", label: "$27" },
} as const

export type Currency = keyof typeof PRICES

/* PayPal requires a short code for these. The label is what the buyer sees. */
export const REGIONS: Record<string, readonly (readonly [string, string])[]> = {
  US: [
    ["AL", "Alabama"],
    ["AK", "Alaska"],
    ["AZ", "Arizona"],
    ["AR", "Arkansas"],
    ["CA", "California"],
    ["CO", "Colorado"],
    ["CT", "Connecticut"],
    ["DE", "Delaware"],
    ["DC", "District of Columbia"],
    ["FL", "Florida"],
    ["GA", "Georgia"],
    ["HI", "Hawaii"],
    ["ID", "Idaho"],
    ["IL", "Illinois"],
    ["IN", "Indiana"],
    ["IA", "Iowa"],
    ["KS", "Kansas"],
    ["KY", "Kentucky"],
    ["LA", "Louisiana"],
    ["ME", "Maine"],
    ["MD", "Maryland"],
    ["MA", "Massachusetts"],
    ["MI", "Michigan"],
    ["MN", "Minnesota"],
    ["MS", "Mississippi"],
    ["MO", "Missouri"],
    ["MT", "Montana"],
    ["NE", "Nebraska"],
    ["NV", "Nevada"],
    ["NH", "New Hampshire"],
    ["NJ", "New Jersey"],
    ["NM", "New Mexico"],
    ["NY", "New York"],
    ["NC", "North Carolina"],
    ["ND", "North Dakota"],
    ["OH", "Ohio"],
    ["OK", "Oklahoma"],
    ["OR", "Oregon"],
    ["PA", "Pennsylvania"],
    ["RI", "Rhode Island"],
    ["SC", "South Carolina"],
    ["SD", "South Dakota"],
    ["TN", "Tennessee"],
    ["TX", "Texas"],
    ["UT", "Utah"],
    ["VT", "Vermont"],
    ["VA", "Virginia"],
    ["WA", "Washington"],
    ["WV", "West Virginia"],
    ["WI", "Wisconsin"],
    ["WY", "Wyoming"],
  ],
  CA: [
    ["AB", "Alberta"],
    ["BC", "British Columbia"],
    ["MB", "Manitoba"],
    ["NB", "New Brunswick"],
    ["NL", "Newfoundland and Labrador"],
    ["NS", "Nova Scotia"],
    ["NT", "Northwest Territories"],
    ["NU", "Nunavut"],
    ["ON", "Ontario"],
    ["PE", "Prince Edward Island"],
    ["QC", "Quebec"],
    ["SK", "Saskatchewan"],
    ["YT", "Yukon"],
  ],
  AU: [
    ["ACT", "Australian Capital Territory"],
    ["NSW", "New South Wales"],
    ["NT", "Northern Territory"],
    ["QLD", "Queensland"],
    ["SA", "South Australia"],
    ["TAS", "Tasmania"],
    ["VIC", "Victoria"],
    ["WA", "Western Australia"],
  ],
}

/* Intl will name these, and none of them can take a parcel. */
const NOT_A_COUNTRY = new Set(["EU", "EZ", "UN", "XA", "XB", "XC", "ZZ", "QO", "QU"])

export type Order = {
  shirt: string
  size: string
  name: string
  email: string
  phone: string
  country: string
  address1: string
  address2: string
  city: string
  region: string
  postal: string
}

export function countryName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code
  } catch {
    return code
  }
}

export function countries() {
  const names = new Intl.DisplayNames(["en"], { type: "region" })
  const list: { code: string; name: string }[] = []
  for (let i = 65; i <= 90; i++) {
    for (let j = 65; j <= 90; j++) {
      const code = String.fromCharCode(i) + String.fromCharCode(j)
      if (NOT_A_COUNTRY.has(code)) continue
      let name: string | undefined
      try {
        name = names.of(code)
      } catch {
        continue
      }
      if (!name || name === code) continue
      list.push({ code, name })
    }
  }
  list.sort((a, b) => a.name.localeCompare(b.name, "en"))
  return list
}

export function regionLabel(country: string) {
  if (country === "US" || country === "AU") return "state"
  if (country === "CA") return "province"
  return "region"
}

export function regionName(country: string, region: string) {
  const hit = REGIONS[country]?.find(([code]) => code === region)
  return hit ? `${hit[1]} (${hit[0]})` : region
}

function clean(value: unknown) {
  return String(typeof value === "string" ? value : "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function splitName(name: string) {
  const parts = name.split(" ")
  const first = parts[0] ?? name
  const last = parts.slice(1).join(" ") || first
  return { first_name: first.slice(0, 32), last_name: last.slice(0, 64) }
}

export function validateOrder(input: Record<string, unknown>): { ok: true; order: Order } | { ok: false; error: string } {
  const shirt = clean(input.shirt)
  const size = clean(input.size).toLowerCase()
  const name = clean(input.name)
  const email = clean(input.email).toLowerCase()
  const phone = clean(input.phone)
  const country = clean(input.country).toUpperCase()
  const address1 = clean(input.address1)
  const address2 = clean(input.address2)
  const city = clean(input.city)
  const region = clean(input.region)
  const postal = clean(input.postal)

  if (!SHIRTS.includes(shirt as (typeof SHIRTS)[number])) return { ok: false, error: "pick a shirt" }
  if (!SIZES.includes(size as (typeof SIZES)[number])) return { ok: false, error: "pick a size" }
  if (name.length < 2 || name.length > 80 || !/\p{L}/u.test(name)) return { ok: false, error: "add the full name" }
  if (email.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "add an email address" }
  const digits = phone.replace(/\D/g, "")
  if (phone.length > 20 || digits.length < 6 || digits.length > 15) return { ok: false, error: "add a phone number" }
  if (!/^[A-Z]{2}$/.test(country) || NOT_A_COUNTRY.has(country) || countryName(country) === country)
    return { ok: false, error: "pick a country" }
  if (address1.length < 4 || address1.length > 100) return { ok: false, error: "add the street address" }
  if (address2.length > 100) return { ok: false, error: "that second address line is too long" }
  if (city.length < 2 || city.length > 40) return { ok: false, error: "add the city" }
  const regions = REGIONS[country]
  if (regions) {
    if (!regions.some(([code]) => code === region)) return { ok: false, error: `pick a ${regionLabel(country)}` }
  } else if (region.length < 2 || region.length > 40 || !/[\p{L}\p{N}]/u.test(region)) {
    return { ok: false, error: "add the region" }
  }
  if (postal.length < 2 || postal.length > 32) return { ok: false, error: "add the postal code" }

  return {
    ok: true,
    order: { shirt, size, name, email, phone, country, address1, address2, city, region, postal },
  }
}

export function currencyOf(value: unknown): Currency | null {
  return value === "EUR" || value === "USD" ? value : null
}

/* Fields for PayPal Website Payments Standard. address_override locks the
   shipping address to the one just collected, so the payment and the print
   order name the same place. */
export function paypalFields(order: Order, id: string, currency: Currency): Record<string, string> {
  const price = PRICES[currency]
  const fields: Record<string, string> = {
    cmd: "_xclick",
    business: PAYPAL,
    charset: "utf-8",
    item_name: order.shirt,
    item_number: id,
    invoice: id,
    custom: `${id} ${order.phone}`.slice(0, 256),
    amount: price.amount,
    currency_code: currency,
    shipping: "0",
    no_shipping: "0",
    address_override: "1",
    on0: "size",
    os0: order.size,
    on1: "phone",
    os1: order.phone,
    email: order.email,
    ...splitName(order.name),
    address1: order.address1,
    city: order.city,
    state: order.region,
    zip: order.postal,
    country: order.country,
    night_phone_b: order.phone,
    return: "https://maramasaeva.com/merch?sent=1",
    cancel_return: "https://maramasaeva.com/merch",
  }
  if (order.address2) fields.address2 = order.address2
  return fields
}

export function mailFields(order: Order, id: string, currency: Currency): Record<string, string> {
  return {
    _subject: `shirt ${id} · ${order.shirt} · ${order.size}`,
    _template: "table",
    _captcha: "false",
    _replyto: order.email,
    Order: id,
    Shirt: order.shirt,
    Size: order.size,
    Quantity: "1",
    Charge: PRICES[currency].label,
    Name: order.name,
    Email: order.email,
    Phone: order.phone,
    Address: order.address1,
    "Line 2": order.address2 || "—",
    City: order.city,
    Region: regionName(order.country, order.region),
    "Postal code": order.postal,
    Country: `${countryName(order.country)} (${order.country})`,
    Note: `Print only after PayPal shows order ${id} as paid. Ship to this address.`,
  }
}
