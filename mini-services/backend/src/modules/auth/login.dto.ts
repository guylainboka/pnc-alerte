// ============================================================================
// Login DTO — Validation stricte du body de POST /api/auth/login
// ============================================================================
// On valide uniquement la structure (non-vide, taille raisonnable) — pas
// la complexité du mot de passe côté login (la complexité est vérifiée à
// l'inscription). Toute erreur d'auth est ainsi renvoyée comme 401 plutôt
// que 400, ce qui évite de leak le format attendu via le code de retour.
// ============================================================================

import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom d\'utilisateur est requis' })
  @MaxLength(64)
  // Définitivement assigné par class-transformer via ValidationPipe(transform).
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MaxLength(128)
  password!: string;
}
