/**
 * API Mobile - Statut du backend
 * GET /api/mobile/status
 *
 * Permet à l'application mobile de vérifier la disponibilité du backend
 * et de connaître le mode de fonctionnement (Supabase / local).
 */

import { NextResponse } from 'next/server';
import { getBackendStatus } from '@/lib/repositories';

export async function GET() {
  const status = getBackendStatus();
  return NextResponse.json({
    service: 'PNC Command Center - Mobile Gateway',
    version: '1.0.0',
    backend: status.mode,
    supabase: status.configured,
    supabaseUrl: status.supabaseUrl,
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/mobile/auth/{register,login,me}',
      alerts: '/api/mobile/alerts',
      complaints: '/api/mobile/complaints',
      commissariats: '/api/mobile/commissariats',
      criminals: '/api/mobile/criminals/wanted',
    },
  });
}
