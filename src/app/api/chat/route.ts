import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content || 'No response'

    return NextResponse.json({ content })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar el chat'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
