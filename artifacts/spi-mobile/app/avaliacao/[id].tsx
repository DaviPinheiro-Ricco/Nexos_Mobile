import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDb } from "@/context/DbContext";
import { useAuth } from "@/context/AuthContext";
import { FORMS } from "@/constants/forms";
import { exportEvaluationPdf } from "@/utils/generatePdf";
import { useColors } from "@/hooks/useColors";

const SCORE_COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#dc2626"];
const SCORE_LABELS = ["Normal", "Leve", "Moderado", "Grave"];

export default function AvaliacaoDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { evaluations, specialists, updateEvaluationReferral } = useDb();
  const { isAdmin } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [showReferral, setShowReferral] = useState(false);

  const evalData = evaluations.find((e) => e.id === id);

  if (!evalData) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Feather name="alert-circle" size={40} color={colors.border} />
        <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 12 }}>
          Avaliação não encontrada
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const form = FORMS.find((f) => f.id === (evalData.formId ?? 1)) ?? FORMS[0];
  const cls = form.classify(evalData.scoreTotal);

  const handleShare = async () => {
    setSharing(true);
    try {
      await exportEvaluationPdf(evalData);
    } catch (e) {
      console.warn("Erro ao gerar PDF:", e);
    } finally {
      setSharing(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: insets.top + 12,
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1 },
    shareBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: form.accentColor + "18",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: form.accentColor + "40",
    },
    shareBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: form.accentColor,
    },
    content: { padding: 16, paddingBottom: insets.bottom + 32 },
    formPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      backgroundColor: form.accentColor + "15",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
      marginBottom: 14,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
      overflow: "hidden",
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoRowLast: { borderBottomWidth: 0 },
    infoLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, textAlign: "right", flex: 1, marginLeft: 16 },
    scoreCard: {
      backgroundColor: cls.bgColor,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: cls.color + "40",
      padding: 20,
      marginBottom: 16,
    },
    scoreTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    scoreCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: cls.color,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    scoreNum: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff" },
    scoreMax: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#fff", opacity: 0.8, marginTop: 2 },
    classLabel: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: cls.color,
      flex: 1,
      flexWrap: "wrap",
    },
    progressOuter: {
      height: 8,
      backgroundColor: cls.color + "25",
      borderRadius: 4,
      overflow: "hidden",
    },
    progressInner: {
      height: 8,
      backgroundColor: cls.color,
      borderRadius: 4,
    },
    progressLabel: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: cls.color,
      textAlign: "right",
      marginTop: 4,
    },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 16,
    },
    detailTitle: {
      fontSize: 13,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 14,
    },
    qRow: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    qRowLast: { borderBottomWidth: 0 },
    qHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 4,
    },
    qNum: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    qName: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground },
    qScoreCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    qAnswer: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 17,
      paddingLeft: 34,
    },
    syncBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fef9c3",
      borderRadius: 10,
      padding: 10,
      marginBottom: 14,
      gap: 8,
    },
    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      paddingTop: 12,
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
  });

  const pct = Math.round((evalData.scoreTotal / form.maxScore) * 100);

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable style={{ padding: 4 }} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>Detalhe</Text>

        {evalData.syncStatus === "pending" && (
          <Feather name="clock" size={16} color="#ca8a04" />
        )}

        {/* Share button */}
        <Pressable
          style={[s.shareBtn, sharing && { opacity: 0.6 }]}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator size="small" color={form.accentColor} />
          ) : (
            <>
              <Feather name="share-2" size={14} color={form.accentColor} />
              <Text style={s.shareBtnText}>PDF</Text>
            </>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Sync banner */}
        {evalData.syncStatus === "pending" && (
          <View style={s.syncBanner}>
            <Feather name="clock" size={14} color="#92400e" />
            <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: "#92400e", flex: 1 }}>
              Aguardando sincronização com o servidor
            </Text>
          </View>
        )}

        {/* Form pill */}
        <View style={s.formPill}>
          <Feather name="file-text" size={12} color={form.accentColor} />
          <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: form.accentColor }}>
            {form.shortName} · {form.name}
          </Text>
        </View>

        {/* Info */}
        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Paciente</Text>
            <Text style={s.infoValue}>{evalData.patientNome}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Avaliador</Text>
            <Text style={s.infoValue}>{evalData.avaliadorNome || "—"}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Data</Text>
            <Text style={s.infoValue}>
              {new Date(evalData.dataAvaliacao).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "long", year: "numeric",
              })}
            </Text>
          </View>
          <View style={[s.infoRow, s.infoRowLast]}>
            <Text style={s.infoLabel}>Horário</Text>
            <Text style={s.infoValue}>
              {new Date(evalData.dataAvaliacao).toLocaleTimeString("pt-BR", {
                hour: "2-digit", minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {/* Score */}
        <View style={s.scoreCard}>
          <View style={s.scoreTop}>
            <View style={s.scoreCircle}>
              <Text style={s.scoreNum}>{evalData.scoreTotal}</Text>
              <Text style={s.scoreMax}>/{form.maxScore}</Text>
            </View>
            <Text style={s.classLabel}>{evalData.classificacao}</Text>
          </View>
          <View style={s.progressOuter}>
            <View style={[s.progressInner, { width: `${pct}%` }]} />
          </View>
          <Text style={s.progressLabel}>{pct}% da pontuação máxima</Text>
        </View>

        {/* Question breakdown */}
        <View style={s.detailCard}>
          <Text style={s.detailTitle}>Detalhamento por Dimensão</Text>
          {form.questions.map((q, i) => {
            const v = evalData.respostas[q.id] ?? 0;
            const answered = v > 0;
            const sc = answered ? SCORE_COLORS[v - 1] : colors.border;
            const sl = answered ? SCORE_LABELS[v - 1] : "—";
            const selectedOpt = q.options.find((o) => o.score === v);
            const isLast = i === form.questions.length - 1;

            return (
              <View key={q.id} style={[s.qRow, isLast && s.qRowLast]}>
                <View style={s.qHeader}>
                  <View style={[s.qNum, answered ? { backgroundColor: sc } : {}]}>
                    {answered ? (
                      <Feather name="check" size={12} color="#fff" />
                    ) : (
                      <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>
                        {q.id}
                      </Text>
                    )}
                  </View>
                  <Text style={s.qName} numberOfLines={2}>{q.name}</Text>
                  <View style={[s.qScoreCircle, { backgroundColor: sc }]}>
                    <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" }}>
                      {answered ? v : "—"}
                    </Text>
                  </View>
                  <Text style={{ width: 60, textAlign: "right", fontSize: 11, fontFamily: "Inter_500Medium", color: sc }}>
                    {sl}
                  </Text>
                </View>
                {selectedOpt && (
                  <Text style={s.qAnswer} numberOfLines={2}>
                    {selectedOpt.text}
                  </Text>
                )}
              </View>
            );
          })}

          {/* Legend */}
          <View style={s.legend}>
            {SCORE_COLORS.map((c, i) => (
              <View key={i} style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: c }]} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                  {i + 1} — {SCORE_LABELS[i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Referral section (admin only) ── */}
        {isAdmin() && (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 16,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingTop: 14,
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.foreground }}>
                Encaminhamento ao Especialista
              </Text>
              <Pressable
                onPress={() => setShowReferral(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: colors.primary + "15",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Feather name="edit-2" size={12} color={colors.primary} />
                <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primary }}>
                  {evalData.encaminhado != null ? "Alterar" : "Definir"}
                </Text>
              </Pressable>
            </View>

            {evalData.encaminhado === null ? (
              <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                  Nenhuma decisão de encaminhamento registrada.
                </Text>
              </View>
            ) : evalData.encaminhado === false ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <Feather name="x-circle" size={16} color="#64748b" />
                <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: "#64748b" }}>
                  Sem encaminhamento
                </Text>
              </View>
            ) : (
              <View style={{ paddingHorizontal: 16, paddingVertical: 14, gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Feather name="check-circle" size={16} color="#16a34a" />
                  <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: "#16a34a" }}>Encaminhado</Text>
                </View>
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                  {evalData.specialistNome ?? "—"}
                </Text>
                {evalData.especialidade && (
                  <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                    {evalData.especialidade}
                  </Text>
                )}
                {evalData.custoEstimado != null && (
                  <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.primary }}>
                    Custo estimado:{" "}
                    {evalData.custoEstimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Share CTA */}
        <Pressable
          style={[{
            backgroundColor: form.accentColor,
            borderRadius: 14,
            paddingVertical: 15,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            opacity: sharing ? 0.7 : 1,
          }]}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="share-2" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" }}>
                Exportar como PDF
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* Referral Modal */}
      {isAdmin() && (
        <Modal
          visible={showReferral}
          animationType="slide"
          transparent
          onRequestClose={() => setShowReferral(false)}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
            <ReferralSheet
              evalId={evalData.id}
              current={{
                encaminhado: evalData.encaminhado,
                specialistId: evalData.specialistId,
              }}
              specialists={specialists.filter((s) => s.ativo)}
              onSave={async (data) => {
                await updateEvaluationReferral(evalData.id, data);
                setShowReferral(false);
              }}
              onCancel={() => setShowReferral(false)}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

// ─── Referral Sheet ──────────────────────────────────────────────────────────

import { LocalSpecialist } from "@/context/DbContext";
import { FlatList } from "react-native";

function ReferralSheet({
  current,
  specialists,
  onSave,
  onCancel,
}: {
  evalId: string;
  current: { encaminhado: boolean | null; specialistId: string | null };
  specialists: LocalSpecialist[];
  onSave: (data: { encaminhado: boolean; specialistId: string | null }) => Promise<void>;
  onCancel: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [encaminhado, setEncaminhado] = useState<boolean | null>(current.encaminhado);
  const [selectedId, setSelectedId] = useState<string | null>(current.specialistId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (encaminhado === null) { setError("Selecione uma opção de encaminhamento."); return; }
    if (encaminhado && !selectedId) { setError("Selecione um especialista."); return; }
    setError("");
    setSaving(true);
    try {
      await onSave({ encaminhado, specialistId: encaminhado ? selectedId : null });
    } finally {
      setSaving(false);
    }
  };

  const r = StyleSheet.create({
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: Platform.OS === "web" ? 32 : insets.bottom + 16,
      maxHeight: "85%",
    },
    title: { fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 16 },
    optRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 16,
    },
    optBtn: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: "center",
      borderWidth: 1.5,
    },
    optText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
    sectionLabel: { fontSize: 12, fontFamily: "Inter_700Bold", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },
    specItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 10,
      borderWidth: 1.5,
      padding: 12,
      marginBottom: 8,
    },
    specAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    specName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    specSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    error: { backgroundColor: "#fee2e2", borderRadius: 10, padding: 10, marginBottom: 10 },
    btnRow: { flexDirection: "row", gap: 10, marginTop: 4 },
    cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center", backgroundColor: colors.muted },
    saveBtn: { flex: 2, borderRadius: 12, paddingVertical: 13, alignItems: "center", backgroundColor: colors.primary },
  });

  return (
    <ScrollView style={r.sheet} keyboardShouldPersistTaps="handled">
      <Text style={r.title}>Encaminhamento ao Especialista</Text>

      {/* Yes / No buttons */}
      <View style={r.optRow}>
        {([false, true] as const).map((opt) => (
          <Pressable
            key={String(opt)}
            style={[
              r.optBtn,
              {
                backgroundColor:
                  encaminhado === opt
                    ? opt
                      ? "#dcfce7"
                      : "#f1f5f9"
                    : colors.muted,
                borderColor:
                  encaminhado === opt
                    ? opt
                      ? "#16a34a"
                      : "#94a3b8"
                    : colors.border,
              },
            ]}
            onPress={() => { setEncaminhado(opt); if (!opt) setSelectedId(null); }}
          >
            <Feather
              name={opt ? "check-circle" : "x-circle"}
              size={16}
              color={encaminhado === opt ? (opt ? "#16a34a" : "#64748b") : colors.mutedForeground}
            />
            <Text
              style={[
                r.optText,
                { color: encaminhado === opt ? (opt ? "#16a34a" : "#64748b") : colors.mutedForeground, marginTop: 3 },
              ]}
            >
              {opt ? "Encaminhar" : "Sem encaminhamento"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Specialist list */}
      {encaminhado === true && (
        <>
          <Text style={r.sectionLabel}>Selecione o especialista</Text>
          {specialists.length === 0 ? (
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 12 }}>
              Nenhum especialista ativo cadastrado. Acesse a aba Especialistas para adicionar.
            </Text>
          ) : (
            specialists.map((s) => {
              const selected = selectedId === s.id;
              return (
                <Pressable
                  key={s.id}
                  style={[
                    r.specItem,
                    {
                      backgroundColor: selected ? colors.primary + "10" : colors.muted,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedId(s.id)}
                >
                  <View style={[r.specAvatar, { backgroundColor: selected ? colors.primary + "20" : colors.border + "40" }]}>
                    <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: selected ? colors.primary : colors.mutedForeground }}>
                      {s.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={r.specName}>{s.nome}</Text>
                    <Text style={r.specSub}>
                      {s.especialidade} ·{" "}
                      {s.custoConsulta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </Text>
                  </View>
                  {selected && <Feather name="check-circle" size={18} color={colors.primary} />}
                </Pressable>
              );
            })
          )}
        </>
      )}

      {error ? (
        <View style={r.error}>
          <Text style={{ color: "#dc2626", fontSize: 13, fontFamily: "Inter_500Medium" }}>{error}</Text>
        </View>
      ) : null}

      <View style={r.btnRow}>
        <Pressable style={r.cancelBtn} onPress={onCancel}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancelar</Text>
        </Pressable>
        <Pressable style={[r.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold" }}>{saving ? "Salvando..." : "Confirmar"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
