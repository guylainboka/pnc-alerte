// ============================================================================
// Auth Controller — Routes REST /api/auth/login
// ============================================================================
// Login publie un vrai JWT signé (24h) après vérification bcrypt du mot de
// passe. Le throttler limite à 100 tentatives / 15 minutes / IP.
// ============================================================================

import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

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
}
