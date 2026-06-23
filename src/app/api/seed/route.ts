import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// API pour initialiser la base de données avec des données de démo PNC Alerte
export async function POST(req: NextRequest) {
  try {
    // Créer l'utilisateur de test
    const testUser = await db.user.upsert({
      where: { email: 'test@pnc.cd' },
      update: {},
      create: {
        name: 'Jean Mukendi',
        email: 'test@pnc.cd',
        phone: '+243820000000',
        password: 'h_xxxxxxx_11', // password123 hash
        province: 'Kinshasa',
        commune: 'Gombe',
        carteElecteur: 'CD-2023-KIN-123456',
      },
    })

    // Créer des convocations démo
    await db.convocation.upsert({
      where: { reference: 'CONV-2026-E5G1H' },
      update: {},
      create: {
        userId: testUser.id,
        title: 'Audition — Plainte escroquerie',
        date: '2026-06-18',
        time: '10:00',
        location: 'Commissariat Central de la Gombe, Bureau N°3',
        officer: 'Commissaire Mbemba',
        reason: 'Audition dans le cadre de votre plainte PLT-2026-B7M2X pour escroquerie.',
        status: 'pending',
        reference: 'CONV-2026-E5G1H',
      },
    })

    await db.convocation.upsert({
      where: { reference: 'CONV-2026-F7J2K' },
      update: {},
      create: {
        userId: testUser.id,
        title: 'Suivi signalement vol',
        date: '2026-06-20',
        time: '14:30',
        location: 'Commissariat de Matonge, Accueil',
        officer: 'Inspecteur Kabongo',
        reason: 'Point de suivi sur le signalement SIG-2026-A3K9F.',
        status: 'pending',
        reference: 'CONV-2026-F7J2K',
      },
    })

    // Créer des notifications démo
    const notifs = [
      { type: 'urgence', title: 'Alerte sécurité', message: 'Incident signalé à 2 km de votre position — Quartier Matonge', screen: 'alertes' },
      { type: 'info', title: 'Convocation', message: 'Vous êtes convoqué au commissariat de la Gombe le 18/06/2026 à 10h00', screen: 'convocations' },
      { type: 'succes', title: 'Bienvenue !', message: 'Votre compte PNC Alerte est prêt. Explorez les services disponibles.', screen: 'dashboard' },
    ]

    for (const notif of notifs) {
      await db.appNotification.create({
        data: {
          userId: testUser.id,
          ...notif,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Base de données initialisée avec succès',
      user: { id: testUser.id, name: testUser.name, email: testUser.email },
    })
  } catch (error: any) {
    console.error('Seed error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PNC Alerte Seed API',
    info: 'POST pour initialiser les données de démo',
  })
}
