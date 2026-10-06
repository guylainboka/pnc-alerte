// ============================================================================
// Auth Controller — Routes REST /api/auth/login + /api/auth/register
// ============================================================================
// Login publie un vrai JWT signé (24h) après vérification bcrypt du mot de
// passe. Le throttler limite à 100 tentatives / 15 minutes / IP.
// Register crée un compte agent (moindre privilège) et retourne la même
// charge utile que login ; il est throttlé à 10 requêtes / 15 min / IP.
// ============================================================================

import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Body : { "username": "<votre identifiant>", "password": "<votre mot de passe>" }
   * Réponse : { id, username, email, firstName, lastName, role, ..., accessToken }
   */
  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 100, ttl: 900000 } }) // 100 requêtes / 15 min / IP
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  /**
   * POST /api/auth/register
   * Body : { firstName, lastName, username, email, password, phone? }
   * Réponse : même contrat que login (accessToken inclus) — session ouverte.
   * Throttle renforcé : 10 inscriptions / 15 min / IP.
   */
  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
}
