// ============================================================================
// Register DTO — Validation stricte du body de POST /api/auth/register
// ============================================================================
// L'inscription est ouverte au personnel PNC : tout nouveau compte est créé
// avec le rôle `agent` (moindre privilège). L'élévation de privilèges reste
// réservée aux administrateurs via la section « Utilisateurs PNC ».
// Politique de mot de passe : 8 caractères minimum, au moins une lettre et
// un chiffre (la vérification fine est faite dans AuthService.register).
// ============================================================================

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom de famille est requis' })
  @MaxLength(64)
  lastName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @MaxLength(64)
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "Le nom d'utilisateur est requis" })
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores",
  })
  username!: string;

  @IsEmail({}, { message: 'Adresse email invalide' })
  @MaxLength(128)
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Le mot de passe doit contenir au moins une lettre et un chiffre',
  })
  password!: string;

  // Optionnel — format international tolérant (+243..., espaces, tirets)
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Matches(/^[+0-9 ()-]*$/, {
    message: 'Numéro de téléphone invalide',
  })
  phone?: string;
}
