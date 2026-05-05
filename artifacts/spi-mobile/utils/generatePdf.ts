import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { LocalEvaluation } from "@/context/DbContext";
import { FORMS } from "@/constants/forms";

const SCORE_COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#dc2626"];
const SCORE_LABELS = ["Normal", "Leve", "Moderado", "Grave"];

function scoreColor(v: number): string {
  if (v < 1 || v > 4) return "#9ca3af";
  return SCORE_COLORS[v - 1];
}

function scoreLabel(v: number): string {
  if (v < 1 || v > 4) return "—";
  return SCORE_LABELS[v - 1];
}

function clsColor(level: string): string {
  if (level === "low")    return "#16a34a";
  if (level === "medium") return "#ca8a04";
  return "#dc2626";
}

function clsBg(level: string): string {
  if (level === "low")    return "#dcfce7";
  if (level === "medium") return "#fef9c3";
  return "#fee2e2";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export async function exportEvaluationPdf(evaluation: LocalEvaluation): Promise<void> {
  const form = FORMS.find((f) => f.id === (evaluation.formId ?? 1)) ?? FORMS[0];
  const clsData = form.classify(evaluation.scoreTotal);

  // Build question rows HTML
  const questionRows = form.questions.map((q) => {
    const v = evaluation.respostas[q.id] ?? 0;
    const answered = v > 0;
    const sc = answered ? scoreColor(v) : "#9ca3af";
    const sl = answered ? scoreLabel(v) : "—";
    const selectedOpt = q.options.find((o) => o.score === v);

    return `
      <tr>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;white-space:nowrap;">
          #${q.id}
        </td>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#111827;">
          ${q.name}
        </td>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;text-align:center;">
          <span style="
            display:inline-block;
            background:${sc};
            color:#fff;
            border-radius:50%;
            width:24px;
            height:24px;
            line-height:24px;
            font-size:12px;
            font-weight:700;
            text-align:center;
          ">${answered ? v : "—"}</span>
        </td>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;font-size:11px;color:${sc};font-weight:600;white-space:nowrap;">
          ${sl}
        </td>
        <td style="padding:8px 6px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#6b7280;">
          ${selectedOpt?.text ?? "—"}
        </td>
      </tr>
    `;
  }).join("");

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Relatório de Avaliação — SPI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, 'Segoe UI', Arial, sans-serif;
      background: #ffffff;
      color: #111827;
      font-size: 13px;
      line-height: 1.5;
    }

    .page {
      max-width: 720px;
      margin: 0 auto;
      padding: 32px 28px;
    }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .header-logo {
      width: 56px;
      height: 56px;
      background: #2563eb;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      color: #fff;
    }
    .header-title { font-size: 22px; font-weight: 800; color: #2563eb; letter-spacing: 2px; }
    .header-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .header-right { text-align: right; }
    .header-date { font-size: 11px; color: #6b7280; }
    .header-badge {
      display: inline-block;
      background: ${form.accentColor}18;
      color: ${form.accentColor};
      border: 1px solid ${form.accentColor}40;
      border-radius: 20px;
      padding: 3px 12px;
      font-size: 11px;
      font-weight: 700;
      margin-top: 4px;
    }

    /* ── Sections ── */
    .section { margin-bottom: 20px; }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    /* ── Info grid ── */
    .info-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    .info-row {
      display: flex;
      padding: 10px 16px;
      border-bottom: 1px solid #f3f4f6;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { width: 130px; font-size: 12px; color: #6b7280; flex-shrink: 0; }
    .info-value { font-size: 12px; font-weight: 600; color: #111827; }

    /* ── Score card ── */
    .score-card {
      border: 2px solid ${clsData.color}40;
      border-radius: 12px;
      background: ${clsBg(clsData.level)};
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .score-number {
      font-size: 56px;
      font-weight: 800;
      color: ${clsData.color};
      line-height: 1;
      flex-shrink: 0;
    }
    .score-right { flex: 1; }
    .score-max { font-size: 13px; color: ${clsData.color}99; margin-bottom: 6px; }
    .score-label {
      display: inline-block;
      background: ${clsData.color};
      color: #fff;
      border-radius: 24px;
      padding: 6px 20px;
      font-size: 14px;
      font-weight: 700;
    }
    .score-bar-bg {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      margin-top: 12px;
      overflow: hidden;
    }
    .score-bar-fill {
      height: 100%;
      width: ${Math.round((evaluation.scoreTotal / form.maxScore) * 100)}%;
      background: ${clsData.color};
      border-radius: 4px;
    }

    /* ── Questions table ── */
    .q-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    .q-table thead tr {
      background: #f9fafb;
    }
    .q-table thead th {
      padding: 10px 6px;
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e5e7eb;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-text { font-size: 10px; color: #9ca3af; }

    /* ── Legend ── */
    .legend {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-top: 10px;
    }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280; }
    .legend-dot {
      width: 12px; height: 12px; border-radius: 50%;
      display: inline-block; flex-shrink: 0;
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="header-logo">🧠</div>
      <div>
        <div class="header-title">SPI</div>
        <div class="header-sub">Sistema de Prevalência e Indicadores de Saúde — TEA</div>
      </div>
    </div>
    <div class="header-right">
      <div class="header-date">Gerado em ${formatDate(new Date().toISOString())}</div>
      <div class="header-badge">${form.shortName} · ${form.questionCount} questões</div>
    </div>
  </div>

  <!-- Informações -->
  <div class="section">
    <div class="section-title">Informações da Avaliação</div>
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">Paciente</span>
        <span class="info-value">${evaluation.patientNome}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Avaliador</span>
        <span class="info-value">${evaluation.avaliadorNome || "—"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Data da avaliação</span>
        <span class="info-value">${formatDate(evaluation.dataAvaliacao)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Formulário</span>
        <span class="info-value">${form.name} (${form.shortName})</span>
      </div>
      <div class="info-row">
        <span class="info-label">Faixa etária alvo</span>
        <span class="info-value">${form.targetAge}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value" style="color:${evaluation.syncStatus === 'synced' ? '#16a34a' : '#ca8a04'}">
          ${evaluation.syncStatus === "synced" ? "✓ Sincronizado" : "⏳ Aguardando sincronização"}
        </span>
      </div>
    </div>
  </div>

  <!-- Resultado -->
  <div class="section">
    <div class="section-title">Resultado</div>
    <div class="score-card">
      <div class="score-number">${evaluation.scoreTotal}</div>
      <div class="score-right">
        <div class="score-max">de ${form.maxScore} pontos máximos · ${form.scaleInfo}</div>
        <div class="score-label">${clsData.label}</div>
        <div class="score-bar-bg">
          <div class="score-bar-fill"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Detalhamento -->
  <div class="section">
    <div class="section-title">Detalhamento por Dimensão</div>
    <table class="q-table">
      <thead>
        <tr>
          <th style="width:32px">#</th>
          <th>Dimensão</th>
          <th style="width:36px;text-align:center">Pont.</th>
          <th style="width:72px">Nível</th>
          <th>Resposta selecionada</th>
        </tr>
      </thead>
      <tbody>
        ${questionRows}
      </tbody>
    </table>

    <!-- Legend -->
    <div class="legend" style="margin-top:12px;">
      ${SCORE_COLORS.map((c, i) => `
        <div class="legend-item">
          <span class="legend-dot" style="background:${c}"></span>
          ${i + 1} — ${SCORE_LABELS[i]}
        </div>
      `).join("")}
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-text">
      SPI — Sistema de Prevalência e Indicadores de Saúde · Relatório gerado automaticamente
    </div>
    <div class="footer-text">
      Este documento é de uso interno e confidencial
    </div>
  </div>

</div>
</body>
</html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Avaliação — ${evaluation.patientNome}`,
      UTI: "com.adobe.pdf",
    });
  } else {
    await Print.printAsync({ uri });
  }
}
