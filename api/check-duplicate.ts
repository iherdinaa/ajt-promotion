import { type NextRequest, NextResponse } from "next/server"
import { checkDuplicate } from "@/lib/google-sheets"

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json()

    const hasPlayed = await checkDuplicate(email, phone)

    return NextResponse.json({ hasPlayed })
  } catch (error) {
    console.error("Check duplicate error:", error)
    return NextResponse.json({ hasPlayed: false, error: String(error) })
  }
}
