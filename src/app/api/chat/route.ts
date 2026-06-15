import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 })
    }

    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Tu es l'assistant virtuel de la Police Nationale Congolaise (PNC Alerte). Tu réponds en français. Tu aides les citoyens congolais avec les procédures administratives, le dépôt de plainte, les conseils de sécurité et les informations sur les services de la PNC. Si la question concerne une urgence, oriente vers le bouton SOS ou le 117.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    })

    const reply = completion.choices?.[0]?.message?.content || 'Je ne peux pas répondre pour le moment. Veuillez réessayer.'
    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('Chat API error:', error.message)
    return NextResponse.json({ reply: 'Je suis l\'assistant IA de la PNC Alerte. Je suis là pour vous aider avec les procédures administratives, le dépôt de plainte et les conseils de sécurité. Comment puis-je vous aider ?' })
  }
}
