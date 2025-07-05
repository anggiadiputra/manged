import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const domain = searchParams.get('domain')

  if (!domain) {
    return NextResponse.json(
      { error: 'Domain is required' },
      { status: 400 }
    )
  }

  try {
    const whoisRes = await fetch(`https://get.indexof.id/api/whois?domain=${encodeURIComponent(domain)}`)
    if (!whoisRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch WHOIS' },
        { status: whoisRes.status }
      )
    }
    const data = await whoisRes.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
} 