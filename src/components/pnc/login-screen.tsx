'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Lock,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  UserPlus,
  BadgeCheck,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

/**
 * Écran d'accès au Centre de Commandement PNC.
 * Deux onglets : Connexion (comptes existants) et Inscription (nouvel agent).
 * L'inscription crée un compte réel côté backend NestJS (bcrypt + JWT) avec
 * le rôle « agent » ; la session est ouverte immédiatement après succès.
 */
export function LoginScreen() {
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);

  // --- Connexion ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Inscription ---
  const [regLastName, setRegLastName] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // login() appelle POST /api/auth/login?XTransformPort=3001 (backend NestJS)
      // et lève une Error en cas d'identifiants invalides.
      await login(username, password);
      toast.success('Connexion réussie');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    // Validations côté client (les mêmes règles sont réappliquées côté serveur)
    if (regPassword !== regConfirm) {
      setRegError('Les mots de passe ne correspondent pas');
      return;
    }
    if (regPassword.length < 8 || !/[A-Za-z]/.test(regPassword) || !/\d/.test(regPassword)) {
      setRegError(
        'Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre'
      );
      return;
    }

    setRegLoading(true);
    try {
      await register({
        firstName: regFirstName,
        lastName: regLastName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        phone: regPhone || undefined,
      });
      toast.success('Inscription réussie — bienvenue au Centre de Commandement');
      // Le store ouvre la session automatiquement (accessToken retourné).
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Échec de l'inscription";
      setRegError(message);
      toast.error(message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      {/* Background decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="space-y-4 text-center pb-4">
            <div className="flex justify-center">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-gold/40 shadow-lg">
                {/* Logo officiel PNC — image originale, non modifiée */}
                <Image
                  src="/pnc-logo.png"
                  alt="Logo Police Nationale Congolaise"
                  width={80}
                  height={80}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary">PNC Alerte</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Police Nationale Congolaise
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Centre de Commandement
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="gap-1.5">
                  <Shield className="w-4 h-4" />
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Inscription
                </TabsTrigger>
              </TabsList>

              {/* ============================ CONNEXION ============================ */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Entrez votre nom d'utilisateur"
                        className="pl-9"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Entrez votre mot de passe"
                        className="pl-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Se connecter
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* ============================ INSCRIPTION ============================ */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Nom + Prénom */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="reg-lastname">Nom</Label>
                      <Input
                        id="reg-lastname"
                        type="text"
                        placeholder="Kabongo"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        required
                        maxLength={64}
                        autoComplete="family-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-firstname">Prénom</Label>
                      <Input
                        id="reg-firstname"
                        type="text"
                        placeholder="Patrick"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        required
                        maxLength={64}
                        autoComplete="given-name"
                      />
                    </div>
                  </div>

                  {/* Nom d'utilisateur */}
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Nom d&apos;utilisateur</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-username"
                        type="text"
                        placeholder="pkabongo"
                        className="pl-9"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        required
                        maxLength={64}
                        pattern="[a-zA-Z0-9._-]+"
                        title="Lettres, chiffres, points, tirets et underscores uniquement"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email professionnel</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="p.kabongo@pnc.cd"
                        className="pl-9"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        maxLength={128}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Téléphone (optionnel) */}
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">
                      Téléphone{' '}
                      <span className="text-muted-foreground font-normal">(optionnel)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="+243 812 345 678"
                        className="pl-9"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        maxLength={32}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {/* Mot de passe + confirmation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="8+ caractères"
                          className="pl-9"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          minLength={8}
                          maxLength={128}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm">Confirmation</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reg-confirm"
                          type="password"
                          placeholder="Répétez le mot de passe"
                          className="pl-9"
                          value={regConfirm}
                          onChange={(e) => setRegConfirm(e.target.value)}
                          required
                          minLength={8}
                          maxLength={128}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 leading-snug">
                    Au moins 8 caractères, dont une lettre et un chiffre.
                  </p>

                  {/* Error message */}
                  {regError && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={regLoading}
                  >
                    {regLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Créer mon compte
                      </>
                    )}
                  </Button>

                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80">
                    <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                    Tout nouveau compte est créé avec le rôle « agent ».
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-[10px] text-muted-foreground/60 text-center pt-4 border-t mt-4">
              Accès réservé au personnel autorisé de la PNC
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
