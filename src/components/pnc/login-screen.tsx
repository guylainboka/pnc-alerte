'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export function LoginScreen() {
  const login = useAppStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion');
        toast.error(data.error || 'Erreur de connexion');
        return;
      }

      login(data.user);
      toast.success(`Bienvenue, ${data.user.firstName} ${data.user.lastName}`);
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (user: string) => {
    setUsername(user);
    setPassword(user === 'admin' ? 'admin123' : 'police123');
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
              <div className="relative w-20 h-20">
                <Image
                  src="/pnc-logo.png"
                  alt="PNC Logo"
                  width={80}
                  height={80}
                  className="rounded-2xl shadow-lg"
                  priority
                />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-primary">PNC</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Police Nationale Congolaise
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Centre de Commandement
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Demo accounts */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center mb-2">
                Comptes de démonstration :
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => fillDemo('admin')}
                >
                  Administrateur
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => fillDemo('jmukendi')}
                >
                  Commissaire
                </Button>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground/60 text-center pt-2">
              Accès réservé au personnel autorisé de la PNC
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
