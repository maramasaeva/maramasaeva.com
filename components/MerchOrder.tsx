"use client"

import { useState } from "react"
import { PRICES, REGIONS, SIZES, regionLabel, validateOrder, type Currency } from "@/lib/merch"

const field =
  "mt-1 w-full border border-faint bg-transparent px-2 py-1 text-body text-fg focus:border-muted focus:outline-none"

function postPayPal(fields: Record<string, string>) {
  const form = document.createElement("form")
  form.method = "post"
  form.action = "https://www.paypal.com/cgi-bin/webscr"
  form.acceptCharset = "UTF-8"
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = name
    input.value = value
    form.append(input)
  }
  document.body.append(form)
  form.submit()
}

export default function MerchOrder({
  shirt,
  countries,
}: {
  shirt: string
  countries: { code: string; name: string }[]
}) {
  const [country, setCountry] = useState("")
  const [busy, setBusy] = useState<Currency | null>(null)
  const [error, setError] = useState<string | null>(null)
  const regions = REGIONS[country]

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    const submitter = (e.nativeEvent as SubmitEvent).submitter
    const pay = submitter instanceof HTMLButtonElement ? submitter.value : ""
    if (pay !== "EUR" && pay !== "USD") return
    const data = Object.fromEntries(new FormData(form).entries())
    data.pay = pay
    const currency = pay
    const parsed = validateOrder(data)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }
    setBusy(currency)
    setError(null)
    try {
      const res = await fetch("/api/merch/order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      })
      const body = (await res.json().catch(() => null)) as {
        paypal?: Record<string, string>
        error?: string
        skip?: boolean
      } | null
      if (body?.skip) {
        setBusy(null)
        return
      }
      if (!res.ok || !body?.paypal) throw new Error(body?.error || "could not save the address. try again")
      postPayPal(body.paypal)
    } catch (err) {
      setError(err instanceof Error ? err.message : "could not save the address. try again")
      setBusy(null)
    }
  }

  return (
    <form action="/api/merch/order" method="post" onSubmit={onSubmit} className="grid gap-3">
      <input type="hidden" name="shirt" value={shirt} />
      <input
        type="text"
        name="hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <label className="block font-sans text-meta text-muted">
        name
        <input name="name" required autoComplete="name" maxLength={80} className={field} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block font-sans text-meta text-muted">
          email
          <input name="email" type="email" required autoComplete="email" maxLength={80} className={field} />
        </label>
        <label className="block font-sans text-meta text-muted">
          phone
          <input name="phone" type="tel" required autoComplete="tel" maxLength={20} className={field} />
        </label>
      </div>
      <label className="block font-sans text-meta text-muted">
        country
        <select
          name="country"
          required
          autoComplete="country"
          defaultValue=""
          onChange={(e) => setCountry(e.target.value)}
          className={field}
        >
          <option value="" disabled />
          {countries.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block font-sans text-meta text-muted">
        address
        <input name="address1" required autoComplete="address-line1" maxLength={100} className={field} />
      </label>
      <label className="block font-sans text-meta text-muted">
        address line 2, if needed
        <input name="address2" autoComplete="address-line2" maxLength={100} className={field} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block font-sans text-meta text-muted">
          city
          <input name="city" required autoComplete="address-level2" maxLength={40} className={field} />
        </label>
        <label className="block font-sans text-meta text-muted">
          {regionLabel(country)}
          {regions ? (
            <select key={country} name="region" required autoComplete="address-level1" defaultValue="" className={field}>
              <option value="" disabled />
              {regions.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={country || "region"}
              name="region"
              required
              autoComplete="address-level1"
              maxLength={40}
              className={field}
            />
          )}
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block font-sans text-meta text-muted">
          postal code
          <input name="postal" required autoComplete="postal-code" maxLength={32} className={field} />
        </label>
        <label className="block font-sans text-meta text-muted">
          size
          <select name="size" required defaultValue="m" className={field}>
            {SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <button
          type="submit"
          name="pay"
          value="EUR"
          disabled={busy !== null}
          className="prose-link cursor-pointer disabled:cursor-default disabled:text-muted"
        >
          {busy === "EUR" ? "sending…" : `paypal or card · ${PRICES.EUR.label}`}
        </button>
        <button
          type="submit"
          name="pay"
          value="USD"
          disabled={busy !== null}
          className="prose-link cursor-pointer disabled:cursor-default disabled:text-muted"
        >
          {busy === "USD" ? "sending…" : `paypal or card · ${PRICES.USD.label}`}
        </button>
      </div>
      <p className="text-left font-sans text-meta text-muted [hyphens:none]">shipping included.</p>
      {error && <p className="text-left font-sans text-meta text-accent [hyphens:none]">{error}</p>}
    </form>
  )
}
