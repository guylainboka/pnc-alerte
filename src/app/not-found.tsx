import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Shield } from 'lucide-react';

/**
 * Page 404 — affichée quand aucune route Next.js ne matche l'URL.
 * Garde la charte PNC (vert/or) pour rester cohérent avec le reste.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-xl font-semibold">Page introuvable</h2>
          <p className="text-sm text-muted-foreground">
            La ressource demandée n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}
