import { NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

export async function GET() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY || '',
      },
    })

    if (!response.ok) {
      throw new Error('Error fetching voices')
    }

    const data = await response.json()

    return NextResponse.json({ voices: data.voices })
  } catch (error: unknown) {
    console.error('Voices API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error al obtener las voces'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
