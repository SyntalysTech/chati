import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, size = '1024x1024', quality = 'standard' } = await req.json()

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: size as '1024x1024' | '1792x1024' | '1024x1792',
      quality: quality as 'standard' | 'hd',
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('No se generó ninguna imagen')
    }

    return NextResponse.json({ imageUrl })
  } catch (error: unknown) {
    console.error('Image API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error al generar la imagen'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
