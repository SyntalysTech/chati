import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

export async function GET() {
  try {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured')
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
      throw new Error(`Error fetching voices: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({ voices: data.voices || [] })
  } catch (error: unknown) {
    console.error('Voices API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error al obtener las voces'
    return NextResponse.json(
      { error: errorMessage, voices: [] },
      { status: 500 }
    )
  }
}
