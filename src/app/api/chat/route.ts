import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 })
    }

    // Use z-ai-web-dev-sdk for AI chat
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Tu es l'assistant virtuel de la Police Nationale Congolaise (PNC Alerte). Tu réponds en français. Tu aides les citoyens congolais avec:
- Les procédures administratives (dépôt de plainte, déclarations, vérifications)
- Les conseils de sécurité et de prévention
- Les informations sur les services de la PNC
- Les questions sur l'utilisation de l'application PNC Alerte

Sois professionnel, courtois et précis. Si la question concerne une urgence, oriente vers le bouton SOS ou le 117. Ne fournis pas de conseils juridiques, oriente vers les services compétents.`,
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

    // Fallback responses for common questions
    const fallbacks: Record<string, string> = {
      plainte: 'Pour déposer une plainte en ligne, utilisez la section "Dépôt de plainte" dans l\'application. Vous serez guidé en 5 étapes : Type de plainte > Détails des faits > Identification du suspect > Pièces justificatives > Validation. Vous recevrez un numéro de dossier unique au format PNCP-2026-XXXXX.',
      vol: 'En cas de vol, signalez immédiatement l\'incident via la section "Signalement" ou activez le SOS si vous êtes en danger. Déposez ensuite une plainte en ligne ou au commissariat le plus proche. Conservez tous les preuves et témoignages.',
      document: 'Les documents requis varient selon la démarche. Pour une déclaration de perte : pièce d\'identité. Pour une plainte : pièce d\'identité + preuves éventuelles. Pour une vérification de véhicule : numéro de plaque ou de châssis.',
      commissariat: 'Utilisez la section "Commissariats" pour trouver le commissariat le plus proche. Vous pouvez les rechercher par nom ou localisation, obtenir l\'itinéraire GPS et consulter les horaires d\'ouverture.',
      urgence: 'En cas d\'urgence, appuyez immédiatement sur le bouton SOS de l\'application. Vous pouvez aussi appeler directement : Police (117), SAMU (118), Pompiers (119).',
      contact: 'Vous pouvez contacter la PNC via : Police (117), ou en vous rendant au commissariat le plus proche. L\'application PNC Alerte vous permet aussi de déposer des plaintes et de signaler des incidents en ligne.',
    }

    const lowerMsg = (error?.message || '').toLowerCase()
    let reply = 'Je suis l\'assistant IA de la PNC Alerte. Je suis là pour vous aider avec les procédures administratives, le dépôt de plainte, les vérifications de documents et les conseils de sécurité. Comment puis-je vous aider ?'

    for (const [key, value] of Object.entries(fallbacks)) {
      if (lowerMsg.includes(key) || message.toLowerCase().includes(key)) {
        reply = value
        break
      }
    }

    return NextResponse.json({ reply })
  }
}
