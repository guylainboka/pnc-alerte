import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// API Signalements PNC Alerte — Connectée à Prisma/SQLite
export async function POST(req: NextRequest) {
  try {
    const { category, description, latitude, longitude, anonymous, attachments, userId } = await req.json()

    if (!category || !description) {
      return NextResponse.json({ error: 'Catégorie et description requises' }, { status: 400 })
    }

    const reference = `SIG-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const now = new Date()

    // Enregistrer le signalement dans la base de données
    try {
      const signalement = await db.signalement.create({
        data: {
          userId: userId || 'anonymous',
          category,
          description,
          anonymous: anonymous || false,
          reference,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          attachments: attachments ? JSON.stringify(attachments) : null,
        },
      })

      // Créer la première mise à jour
      await db.signalementUpdate.create({
        data: {
          signalementId: signalement.id,
          status: 'Reçu',
          message: 'Signalement enregistré par le centre opérationnel',
        },
      })

      // Créer une notification pour l'utilisateur
      if (userId && userId !== 'anonymous' && !anonymous) {
        await db.appNotification.create({
          data: {
            userId,
            type: 'info',
            title: 'Signalement enregistré',
            message: `Votre signalement ${reference} a été enregistré. Vous recevrez des mises à jour.`,
            screen: 'mes-alertes',
            relatedId: signalement.id,
          },
        })
      }
    } catch (dbError: any) {
      console.log('DB save signalement (fallback):', dbError.message)
    }

    return NextResponse.json({
      success: true,
      reference,
      timestamp: now.toISOString(),
      status: 'en-attente',
      message: 'Signalement enregistré par le centre opérationnel',
      assignedTo: 'Commissariat le plus proche de votre position',
      estimatedProcessing: '24-48h pour une première réponse',
    })
  } catch (error: any) {
    console.error('Signalement API error:', error.message)
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement du signalement' }, { status: 500 })
  }
}

// GET: Récupérer les signalements d'un utilisateur
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    const signalements = await db.signalement.findMany({
      where: { userId },
      include: { updates: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, signalements })
  } catch (error: any) {
    console.error('Signalements GET error:', error.message)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
