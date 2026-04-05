interface ReportData {
  reportDate: string;
  shift: number;
  operatorName: string;
  troubleshooting: number;
  aktivasi: number;
  replacementOnu: number;
  checkOnu: number;
  notes?: string | null;
}

/**
 * Generates a WhatsApp-ready text summary of a NOC daily report.
 * Designed to be copied to clipboard by the frontend.
 */
export function generateWhatsAppSummary(data: ReportData): string {
  const dateObj = new Date(data.reportDate);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const shiftLabels: Record<number, string> = {
    1: "Shift 1 (Pagi)",
    2: "Shift 2 (Siang)",
    3: "Shift 3 (Malam)",
  };

  const lines = [
    `📊 *NOC Daily Report*`,
    `📅 ${formattedDate} | ${shiftLabels[data.shift] || `Shift ${data.shift}`}`,
    `👤 Operator: ${data.operatorName}`,
    ``,
    `── Metrics ──`,
    `🔧 Troubleshooting : ${data.troubleshooting}`,
    `✅ Aktivasi        : ${data.aktivasi}`,
    `🔄 Replacement ONU : ${data.replacementOnu}`,
    `🔍 Check ONU       : ${data.checkOnu}`,
    `📦 Total           : ${data.troubleshooting + data.aktivasi + data.replacementOnu + data.checkOnu}`,
  ];

  if (data.notes?.trim()) {
    lines.push(``, `📝 Notes: ${data.notes.trim()}`);
  }

  lines.push(``, `─────────────────────`);
  lines.push(`_NOC Sentinel Monitoring System_`);

  return lines.join("\n");
}
