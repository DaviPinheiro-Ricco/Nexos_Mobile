import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDb } from "@/context/DbContext";
import { FORMS } from "@/constants/forms";
import { exportEvaluationPdf } from "@/utils/generatePdf";
import { useColors } from "@/hooks/useColors";

const SCORE_COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#dc2626"];
const SCORE_LABELS = ["Normal", "Leve", "Moderado", "Grave"];

export default function AvaliacaoDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { evaluations } = useDb();
  const [sharing, setSharing] = useState(false);

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
    </View>
  );
}
