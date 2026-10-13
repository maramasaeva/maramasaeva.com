import assert from "node:assert/strict"
import test from "node:test"
import { mailFields, paypalFields, validateOrder } from "./merch.ts"

const order = {
  shirt: "total clanker genocide",
  size: "m",
  name: "Ada Buyer",
  email: "ada@example.com",
  phone: "+32 470 12 34 56",
  country: "BE",
  address1: "Rue de la Loi 16",
  address2: "",
  city: "Bruxelles",
  region: "Bruxelles",
  postal: "1000",
}

test("a complete address is accepted and an incomplete one is not", () => {
  const ok = validateOrder(order)
  assert.equal(ok.ok, true)
  assert.equal(validateOrder({ ...order, phone: "12" }).ok, false)
  assert.equal(validateOrder({ ...order, country: "US", region: "California" }).ok, false)
  assert.equal(validateOrder({ ...order, country: "US", region: "NY", city: "New York", postal: "10001" }).ok, true)
  assert.equal(validateOrder({ ...order, shirt: "fossil fuels" }).ok, false)
})

test("paypal is paid the inbox and locked to the address we collected", () => {
  const ok = validateOrder(order)
  assert.equal(ok.ok, true)
  if (!ok.ok) return
  const fields = paypalFields(ok.order, "abc123", "EUR")
  assert.equal(fields.business, "messiermara@gmail.com")
  assert.equal(fields.amount, "24.00")
  assert.equal(fields.currency_code, "EUR")
  assert.equal(fields.address_override, "1")
  assert.equal(fields.no_shipping, "0")
  assert.equal(fields.address1, "Rue de la Loi 16")
  assert.equal(fields.invoice, "abc123")
  assert.match(fields.custom, /^abc123 \+32 470 12 34 56$/)
  assert.equal(fields.os0, "m")
  assert.equal(fields.on1, "phone")
  assert.equal(fields.os1, "+32 470 12 34 56")
  assert.equal(fields.night_phone_b, "+32 470 12 34 56")
  assert.equal(fields.first_name, "Ada")
  assert.equal(fields.last_name, "Buyer")
  assert.equal("address2" in fields, false)

  const dollars = paypalFields(ok.order, "abc123", "USD")
  assert.equal(dollars.amount, "27.00")
  assert.equal(dollars.currency_code, "USD")

  const mail = mailFields(ok.order, "abc123", "EUR")
  assert.match(mail.Note, /abc123/)
  assert.equal(mail.Phone, "+32 470 12 34 56")
  assert.equal(mail.Country, "Belgium (BE)")
})
