import { NextResponse } from "next/server"
import { aggregateActivity } from "@/lib/activity"

/* Same data the homepage renders; here for the client refresh and for curl. */
export const revalidate = 3600

export async function GET() {
  try {
    return NextResponse.json(await aggregateActivity())
  } catch {
    return NextResponse.json(
      { items: [], sources: {}, counts: {}, lastSync: new Date().toISOString() },
      { status: 500 },
    )
  }
}
