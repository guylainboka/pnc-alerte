/**
 * PDF export utilities for the PNC Command Center.
 *
 * Generates downloadable PDF reports of the currently filtered
 * Dossiers (cases) and Plaintes (complaints) lists.
 *
 * All generation is done CLIENT-SIDE — these helpers must only be
 * invoked from event handlers inside 'use client' components. They
 * use dynamic imports of `jspdf` and `jspdf-autotable` to avoid
 * pulling them into the server bundle (SSR).
 */

// PNC brand green (#1a5632)
const PNC_GREEN: [number, number, number] = [26, 86, 50];
const GRAY_TEXT: [number, number, number] = [110, 110, 110];
const MARGIN = 14; // mm

const ORG_TITLE = 'Police Nationale Congolaise — Centre de Commandement';

// --- Label maps (kept in sync with the section components) -----------------

const caseTypeLabels: Record<string, string> = {
  vol: 'Vol',
  homicide: 'Homicide',
  fraude: 'Fraude',
  'stupéfiants': 'Stupéfiants',
  violence: 'Violence',
  autre: 'Autre',
};

const caseStatusLabels: Record<string, string> = {
  ouvert: 'Ouvert',
  en_enquete: 'En enquête',
  en_instruction: 'En instruction',
  jugement: 'Jugement',
  cloture: 'Clôturé',
};

const complaintTypeLabels: Record<string, string> = {
  vol: 'Vol',
  agression: 'Agression',
  harassment: 'Harcèlement',
  corruption: 'Corruption',
  autre: 'Autre',
};

const complaintStatusLabels: Record<string, string> = {
  soumise: 'Soumise',
  en_revision: 'En révision',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée',
  traitee: 'Traitée',
  en_attente: 'En attente',
  en_cours: 'En cours',
  traite: 'Traité',
  rejete: 'Rejeté',
  cloture: 'Clôturé',
};

// --- Helpers ---------------------------------------------------------------

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR');
}

function truncate(text: string | null | undefined, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function escapeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

// --- Shared renderer -------------------------------------------------------

interface RenderOptions {
  subtitle: string;
  summaryLine: string;
  head: string[];
  body: string[][];
  fileName: string;
}

async function renderPdfReport(opts: RenderOptions): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Header (first page only) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...PNC_GREEN);
  doc.text(ORG_TITLE, MARGIN, MARGIN + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...GRAY_TEXT);
  doc.text(opts.subtitle, MARGIN, MARGIN + 12);

  const generatedOn = `Généré le ${new Date().toLocaleString('fr-FR')}`;
  doc.setFontSize(9);
  doc.text(generatedOn, pageWidth - MARGIN, MARGIN + 6, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(...PNC_GREEN);
  doc.setFont('helvetica', 'bold');
  doc.text(opts.summaryLine, MARGIN, MARGIN + 18);

  // --- Table ---
  const startY = MARGIN + 24;

  autoTable(doc, {
    head: [opts.head],
    body: opts.body,
    startY,
    margin: { top: MARGIN, right: MARGIN, bottom: MARGIN + 8, left: MARGIN },
    theme: 'striped',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      textColor: [30, 30, 30],
    },
    headStyles: {
      fillColor: PNC_GREEN,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [240, 244, 241],
    },
  });

  // --- Footer with the correct total page count on every page ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY_TEXT);
    const footer = `© PNC — Centre de Commandement — Page ${i}/${totalPages}`;
    doc.text(footer, pageWidth / 2, pageHeight - MARGIN / 2, { align: 'center' });
  }

  doc.save(opts.fileName);
}

// --- Public API ------------------------------------------------------------

export async function exportCasesPdf(cases: any[]): Promise<void> {
  const head = ['Référence', 'Titre', 'Type', 'Statut', 'Priorité', 'Commissariat', 'Date'];
  const body = (cases || []).map((c) => [
    escapeText(c?.reference),
    escapeText(c?.title),
    caseTypeLabels[c?.type] || escapeText(c?.type),
    caseStatusLabels[c?.status] || escapeText(c?.status),
    escapeText(c?.priority),
    escapeText(c?.commissariat?.name),
    formatDate(c?.createdAt),
  ]);

  await renderPdfReport({
    subtitle: 'Rapport des Dossiers',
    summaryLine: `Total : ${body.length} dossier(s)`,
    head,
    body,
    fileName: `pnc-dossiers-${todayStamp()}.pdf`,
  });
}

export async function exportComplaintsPdf(complaints: any[]): Promise<void> {
  const head = ['Référence', 'Type', 'Statut', 'Plaignant', 'Description', 'Commissariat', 'Date'];
  const body = (complaints || []).map((c) => [
    escapeText(c?.reference),
    complaintTypeLabels[c?.type] || escapeText(c?.type),
    complaintStatusLabels[c?.status] || escapeText(c?.status),
    escapeText(c?.plaintiffName),
    truncate(escapeText(c?.description), 60),
    escapeText(c?.commissariat?.name),
    formatDate(c?.createdAt),
  ]);

  await renderPdfReport({
    subtitle: 'Rapport des Plaintes',
    summaryLine: `Total : ${body.length} plainte(s)`,
    head,
    body,
    fileName: `pnc-plaintes-${todayStamp()}.pdf`,
  });
}
