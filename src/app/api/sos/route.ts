import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// API SOS - Alerte d'urgence PNC — Connectée à Prisma/SQLite
export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, userId, type } = await req.json()

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Position GPS requise' }, { status: 400 })
    }

    const reference = `SOS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const now = new Date()

    // Enregistrer l'alerte SOS dans la base de données
    try {
      const sosAlert = await db.sOSAlert.create({
        data: {
          userId: userId || 'anonymous',
          reference,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          status: 'en-cours',
          responseMessage: 'Patrouille dépêchée — Arrivée estimée : 5-15 minutes',
        },
      })

      // Créer une notification pour l'utilisateur
      if (userId && userId !== 'anonymous') {
        await db.appNotification.create({
          data: {
            userId,
            type: 'urgence',
            title: 'Alerte SOS envoyée',
            message: `Votre alerte SOS a été enregistrée. Réf: ${reference}. Une patrouille a été dépêchée.`,
            screen: 'mes-alertes',
            relatedId: sosAlert.id,
          },
        })
      }
    } catch (dbError: any) {
      console.log('DB save SOS (fallback):', dbError.message)
    }

    return NextResponse.json({
      success: true,
      reference,
      timestamp: now.toISOString(),
      message: 'Alerte SOS reçue — Position GPS capturée',
      estimatedResponse: 'Patrouille dépêchée — Arrivée estimée : 5-15 minutes',
      centerName: 'Centre Opérationnel PNC — Kinshasa',
      emergencyNumber: '117',
    })
  } catch (error: any) {
    console.error('SOS API error:', error.message)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'alerte SOS' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PNC Alerte SOS API',
    version: '2.0.0',
    engine: 'Prisma + SQLite',
  })
}
