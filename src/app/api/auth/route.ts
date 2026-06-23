import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

// API d'authentification PNC Alerte — Connectée à Prisma/SQLite

function generateReference(prefix: string): string {
  return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
}

// Simple hash pour la démo (en production: bcrypt)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `h_${Math.abs(hash).toString(36)}_${str.length}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'login': {
        const { email, password } = body
        if (!email || !password) {
          return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
        }
        const user = await db.user.findUnique({ where: { email } })
        if (!user || user.password !== simpleHash(password)) {
          return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
        }
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            province: user.province,
            commune: user.commune,
            profileImage: user.profileImage,
            carteElecteur: user.carteElecteur,
            darkMode: user.darkMode,
            language: user.language,
          },
        })
      }

      case 'register': {
        const { name, email, phone, password, province, commune, carteElecteur } = body
        if (!name || !email || !phone || !password) {
          return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
        }
        const existing = await db.user.findUnique({ where: { email } })
        if (existing) {
          return NextResponse.json({ error: 'Un compte avec cet email existe déjà' }, { status: 409 })
        }
        const user = await db.user.create({
          data: {
            name,
            email,
            phone,
            password: simpleHash(password),
            province: province || 'Kinshasa',
            commune: commune || 'Gombe',
            carteElecteur: carteElecteur || null,
          },
        })

        // Créer des notifications de bienvenue
        await db.appNotification.createMany({
          data: [
            {
              userId: user.id,
              type: 'succes',
              title: 'Bienvenue sur PNC Alerte !',
              message: 'Votre compte a été créé avec succès. Vous pouvez dès à présent signaler des incidents et accéder à tous les services.',
              screen: 'dashboard',
            },
            {
              userId: user.id,
              type: 'info',
              title: 'Complétez votre profil',
              message: 'Ajoutez une photo de profil et validez votre carte d\'électeur pour accéder à toutes les fonctionnalités.',
              screen: 'profil',
            },
          ],
        })

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            province: user.province,
            commune: user.commune,
          },
        })
      }

      case 'forgot-password': {
        const { email, phone, method, code, newPassword } = body

        if (method === 'send-code') {
          const identifier = email || phone
          if (!identifier) {
            return NextResponse.json({ error: 'Email ou téléphone requis' }, { status: 400 })
          }

          // Vérifier si l'utilisateur existe
          if (email) {
            const user = await db.user.findUnique({ where: { email } })
            if (!user) {
              return NextResponse.json({ error: 'Aucun compte associé à cet email' }, { status: 404 })
            }
          }

          // Générer un code de vérification
          const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

          await db.verificationCode.create({
            data: {
              email: email || null,
              phone: phone || null,
              code: verifyCode,
              type: 'forgot-password',
              expiresAt,
            },
          })

          // En production: envoyer le code par email/SMS
          // Pour la démo, on retourne le code dans la réponse
          console.log(`[PNC Alerte] Code de vérification pour ${identifier}: ${verifyCode}`)

          return NextResponse.json({
            success: true,
            message: 'Code de vérification envoyé',
            // En démo uniquement: retourner le code
            _demoCode: verifyCode,
          })
        }

        if (method === 'verify-code') {
          if (!code || code.length !== 6) {
            return NextResponse.json({ error: 'Code invalide' }, { status: 400 })
          }

          const existingCode = await db.verificationCode.findFirst({
            where: {
              code,
              type: 'forgot-password',
              verified: false,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
          })

          if (!existingCode) {
            return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 })
          }

          // Marquer comme vérifié
          await db.verificationCode.update({
            where: { id: existingCode.id },
            data: { verified: true },
          })

          return NextResponse.json({
            success: true,
            message: 'Code vérifié',
            verificationId: existingCode.id,
          })
        }

        if (method === 'reset') {
          if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'Mot de passe trop court (min 6 caractères)' }, { status: 400 })
          }

          const { verificationId } = body
          if (!verificationId) {
            return NextResponse.json({ error: 'Vérification requise' }, { status: 400 })
          }

          const vCode = await db.verificationCode.findUnique({
            where: { id: verificationId },
          })

          if (!vCode || !vCode.verified) {
            return NextResponse.json({ error: 'Vérification non validée' }, { status: 400 })
          }

          // Trouver l'utilisateur et mettre à jour le mot de passe
          if (vCode.email) {
            await db.user.update({
              where: { email: vCode.email },
              data: { password: simpleHash(newPassword) },
            })
          }

          return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé' })
        }

        return NextResponse.json({ error: 'Méthode non reconnue' }, { status: 400 })
      }

      case 'change-password': {
        const { email: changeEmail, currentPassword, newPassword: newPwd } = body
        if (!changeEmail || !currentPassword || !newPwd) {
          return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
        }
        const user = await db.user.findUnique({ where: { email: changeEmail } })
        if (!user || user.password !== simpleHash(currentPassword)) {
          return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 })
        }
        await db.user.update({
          where: { email: changeEmail },
          data: { password: simpleHash(newPwd) },
        })
        return NextResponse.json({ success: true, message: 'Mot de passe modifié' })
      }

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Auth API error:', error.message)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PNC Alerte Auth API',
    version: '2.0.0',
    engine: 'Prisma + SQLite',
    endpoints: ['login', 'register', 'forgot-password', 'change-password'],
  })
}
