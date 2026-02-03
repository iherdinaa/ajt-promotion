import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.log("[v0] Preview mode: Allowing play without limit check")
      return NextResponse.json({ canPlay: true, preview: true })
    }

    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID
    const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY

    const accessToken = await getAccessToken(GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)

    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Sheet1!A:O`
    const readResponse = await fetch(readUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!readResponse.ok) {
      throw new Error(`Failed to read sheet: ${readResponse.status}`)
    }

    const sheetData = await readResponse.json()
    const rows = sheetData.values || []

    // Find the row with matching email
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][2] === email) {
        // Column C is email
        const lastPlayedDate = rows[i][14] // Column O is last played date
        const today = new Date().toISOString().split("T")[0]

        if (lastPlayedDate === today) {
          return NextResponse.json({
            canPlay: false,
            message: "You have already played today. Please come back tomorrow!",
          })
        }

        return NextResponse.json({ canPlay: true })
      }
    }

    // If no existing record, they can play
    return NextResponse.json({ canPlay: true })
  } catch (error) {
    console.error("[v0] Error checking play limit:", error)
    return NextResponse.json({ canPlay: true, preview: true })
  }
}

async function getAccessToken(serviceAccountEmail: string, privateKey: string): Promise<string> {
  let formattedPrivateKey = privateKey.trim()

  if (formattedPrivateKey.includes("\\n")) {
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, "\n")
  }

  const jwtHeader = {
    alg: "RS256",
    typ: "JWT",
  }

  const now = Math.floor(Date.now() / 1000)
  const jwtClaimSet = {
    iss: serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(jwtHeader))
  const encodedClaimSet = base64UrlEncode(JSON.stringify(jwtClaimSet))
  const unsignedToken = `${encodedHeader}.${encodedClaimSet}`

  const crypto = await import("crypto")
  const sign = crypto.createSign("RSA-SHA256")
  sign.update(unsignedToken)
  sign.end()

  const signatureBuffer = sign.sign(formattedPrivateKey)
  const encodedSignature = bufferToBase64Url(signatureBuffer)

  const jwt = `${unsignedToken}.${encodedSignature}`

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${tokenResponse.status}`)
  }

  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

function base64UrlEncode(str: string): string {
  const base64 = Buffer.from(str).toString("base64")
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function bufferToBase64Url(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}
