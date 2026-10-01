'use client';

/**
 * Error Boundary global — intercepte toute erreur non gérée dans les
 * composants React de l'arbre `app/`. Affiche un message d'erreur
 * convivial au lieu d'un écran blanc avec stack trace dans la console.
 *
 * En développement, l'erreur originale est affichée pour faciliter le
 * débogage. En production, seul un message générique est affiché (la
 * stack trace reste disponible dans la console serveur).
 *
 * Ref : Next.js App Router — https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log serveur-only : pas de stack trace côté client en production.
    if (process.env.NODE_ENV !== 'production') {
      console.error('[GlobalError] erreur non gérée :', error);
    }
  }, [error]);

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            Une erreur est survenue
          </h1>
          <p className="text-sm text-muted-foreground">
            Le Centre de Commandement PNC a rencontré une erreur inattendue.
            Vous pouvez réessayer — si le problème persiste, contactez
            l&apos;administrateur système.
          </p>
        </div>

        {isDev && (
          <div className="text-left p-3 rounded-lg bg-muted border text-xs font-mono break-all max-h-40 overflow-y-auto">
            <span className="text-destructive font-semibold">Error: </span>
            <span>{error.message || 'Erreur inconnue'}</span>
            {error.digest && (
              <div className="text-muted-foreground mt-2">digest: {error.digest}</div>
            )}
          </div>
        )}

        <div className="flex justify-center gap-2">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
          >
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
