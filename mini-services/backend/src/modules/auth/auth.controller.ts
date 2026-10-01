// ============================================================================
// Auth Controller — Routes REST /api/auth/login
// ============================================================================

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Body : { "username": "admin", "password": "admin123" }
   * Réponse : { id, username, email, firstName, lastName, role, ..., accessToken }
   */
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body);
  }
}
