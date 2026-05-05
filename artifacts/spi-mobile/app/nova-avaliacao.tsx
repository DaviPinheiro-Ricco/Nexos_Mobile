import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useDb, LocalPatient } from "@/context/DbContext";
import { FORMS, FormDefinition, calcFormScore } from "@/constants/forms";
import { useColors } from "@/hooks/useColors";

type Step = "form-select" | "lookup" | "create" | "questions" | "result";
type SexoType = "masculino" | "feminino" | "outro";

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEP_LABELS = ["Formulário", "Paciente", "Questões"];

function StepIndicator({ current }: { current: 0 | 1 | 2 }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} style={{ flexDirection: "row", alignItems: "center", flex: i < 2 ? 1 : undefined }}>
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: done ? "#16a34a" : active ? colors.primary : colors.muted,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: active ? 0 : 0,
                }}
              >
                {done ? (
                  <Feather name="check" size={14} color="#fff" />
                ) : (
                  <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: active ? "#fff" : colors.mutedForeground }}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
                  color: active ? colors.primary : done ? "#16a34a" : colors.mutedForeground,
                  marginTop: 3,
                }}
              >
                {label}
              </Text>
            </View>
            {i < 2 && (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: done ? "#16a34a" : colors.border,
                  marginHorizontal: 6,
                  marginBottom: 16,
                  borderRadius: 2,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Form card (selection) ────────────────────────────────────────────────────
function FormCard({ form, onSelect }: { form: FormDefinition; onSelect: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: pressed ? form.accentColor : colors.border,
        padding: 0,
        marginBottom: 12,
        overflow: "hidden",
        opacity: pressed ? 0.95 : 1,
      })}
    >
      {/* Colored top accent strip */}
      <View style={{ height: 4, backgroundColor: form.accentColor }} />

      <View style={{ padding: 16 }}>
        {/* Header row */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
          {/* Short name badge */}
          <View
            style={{
              backgroundColor: form.accentColor + "18",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 5,
              marginRight: 10,
            }}
          >
            <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: form.accentColor }}>
              {form.shortName}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, lineHeight: 20 }}>
              {form.name}
            </Text>
          </View>

          {/* Demo badge OR active badge */}
          {form.isDemo ? (
            <View
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginLeft: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#6b7280" }}>
                DEMO
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: "#dcfce7",
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginLeft: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#16a34a" }}>
                ATIVO
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Inter_400Regular",
            color: colors.mutedForeground,
            lineHeight: 18,
            marginBottom: 12,
          }}
        >
          {form.description}
        </Text>

        {/* Meta row */}
        <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Feather name="users" size={12} color={colors.mutedForeground} />
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
              {form.targetAge}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Feather name="list" size={12} color={colors.mutedForeground} />
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
              {form.questionCount} questões
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Feather name="bar-chart-2" size={12} color={colors.mutedForeground} />
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
              {form.scaleInfo}
            </Text>
          </View>
        </View>

        {/* Bottom row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {form.isDemo && (
            <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, flex: 1 }}>
              Visualização — dados não são salvos
            </Text>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: form.accentColor }}>
              {form.isDemo ? "Visualizar" : "Selecionar"}
            </Text>
            <Feather name="arrow-right" size={14} color={form.accentColor} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Question card ────────────────────────────────────────────────────────────
const LIKERT_COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#dc2626"];

function QuestionCard({
  question,
  totalQuestions,
  value,
  accentColor,
  onChange,
}: {
  question: { id: number; name: string; options: { score: number; text: string }[] };
  totalQuestions: number;
  value: number | undefined;
  accentColor: string;
  onChange: (score: number) => void;
}) {
  const colors = useColors();
  const isBinary = question.options.length === 2;

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: value !== undefined ? accentColor + "80" : colors.border,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Question header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: value !== undefined ? accentColor : colors.muted,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {value !== undefined ? (
            <Feather name="check" size={14} color="#fff" />
          ) : (
            <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.mutedForeground }}>
              {question.id}
            </Text>
          )}
        </View>
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            fontFamily: "Inter_600SemiBold",
            color: colors.foreground,
            lineHeight: 20,
          }}
        >
          {question.name}
        </Text>
      </View>

      {/* Options */}
      {isBinary ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          {question.options.map((opt) => {
            const selected = value === opt.score;
            const isYes = opt.score === 0;
            const c = isYes ? "#16a34a" : "#dc2626";
            return (
              <Pressable
                key={opt.score}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 2,
                  backgroundColor: selected ? c + "15" : colors.muted,
                  borderColor: selected ? c : "transparent",
                  alignItems: "center",
                  gap: 6,
                }}
                onPress={() => { onChange(opt.score); Haptics.selectionAsync(); }}
              >
                <Feather name={isYes ? "check-circle" : "x-circle"} size={20} color={selected ? c : colors.mutedForeground} />
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter_600SemiBold",
                    color: selected ? c : colors.foreground,
                  }}
                >
                  {isYes ? "Sim" : "Não"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        question.options.map((opt) => {
          const selected = value === opt.score;
          const c = LIKERT_COLORS[(opt.score - 1) % LIKERT_COLORS.length];
          return (
            <Pressable
              key={opt.score}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                borderRadius: 12,
                padding: 12,
                marginBottom: 6,
                borderWidth: 1.5,
                backgroundColor: selected ? c + "15" : colors.muted,
                borderColor: selected ? c : "transparent",
              }}
              onPress={() => { onChange(opt.score); Haptics.selectionAsync(); }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: selected ? c : colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                  marginTop: 1,
                }}
              >
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: selected ? "#fff" : colors.mutedForeground }}>
                  {opt.score}
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontFamily: "Inter_400Regular",
                  lineHeight: 18,
                  color: selected ? c : colors.foreground,
                }}
              >
                {opt.text}
              </Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function NovaAvaliacaoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { patients, addPatient, addEvaluation } = useDb();

  const [step, setStep] = useState<Step>("form-select");
  const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null);

  // Lookup
  const [documento, setDocumento] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundPatient, setFoundPatient] = useState<LocalPatient | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Create
  const [createNome, setCreateNome] = useState("");
  const [createCpf, setCreateCpf] = useState("");
  const [createSus, setCreateSus] = useState("");
  const [createNasc, setCreateNasc] = useState("");
  const [createSexo, setCreateSexo] = useState<SexoType | null>(null);
  const [createResponsavel, setCreateResponsavel] = useState("");
  const [createTelefone, setCreateTelefone] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<LocalPatient | null>(null);

  // Questions
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Result
  const [resultScore, setResultScore] = useState(0);
  const [resultCls, setResultCls] = useState<ReturnType<FormDefinition["classify"]> | null>(null);

  const questions = selectedForm?.questions ?? [];
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const progress = total > 0 ? answered / total : 0;

  const stepIndex: 0 | 1 | 2 =
    step === "form-select" ? 0 :
    step === "lookup" || step === "create" ? 1 : 2;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectForm = (form: FormDefinition) => {
    Haptics.selectionAsync();
    setSelectedForm(form);
    setAnswers({});
    setStep("lookup");
  };

  const handleSearch = async () => {
    const query = documento.trim().replace(/[.\-\/\s]/g, "");
    if (!query) return;
    setSearching(true);
    setNotFound(false);
    setFoundPatient(null);
    await new Promise((r) => setTimeout(r, 400));
    const match = patients.find((p) => {
      const cpfClean = (p.cpf ?? "").replace(/[.\-\/\s]/g, "");
      const susClean = (p.carteiraSus ?? "").replace(/[.\-\/\s]/g, "");
      return cpfClean === query || susClean === query;
    });
    setSearching(false);
    if (match) {
      setFoundPatient(match);
    } else {
      setNotFound(true);
      if (query.length === 11) setCreateCpf(documento.trim());
      else setCreateSus(documento.trim());
    }
  };

  const handleUseFound = () => {
    if (!foundPatient) return;
    setSelectedPatient(foundPatient);
    setStep("questions");
  };

  const handleCreate = async () => {
    if (!createNome.trim()) { setCreateError("Nome é obrigatório."); return; }
    if (!createSexo) { setCreateError("Selecione o sexo."); return; }
    setCreateError("");
    setCreating(true);
    try {
      const newP = await addPatient({
        nome: createNome.trim(),
        cpf: createCpf.trim() || null,
        carteiraSus: createSus.trim() || null,
        dataNascimento: createNasc.trim() || null,
        sexo: createSexo,
        nomeResponsavel: createResponsavel.trim() || null,
        telefone: createTelefone.trim() || null,
        email: null, cep: null, estado: null, cidade: null,
        bairro: null, rua: null, numero: null, complemento: null,
        observacoes: null, groupId: null,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedPatient(newP);
      setStep("questions");
    } catch {
      setCreateError("Erro ao cadastrar paciente.");
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedForm) return;
    if (answered < total) {
      setSubmitError(`Faltam ${total - answered} questão(ões) para responder.`);
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      const score = calcFormScore(answers);
      const cls = selectedForm.classify(score);

      if (!selectedForm.isDemo) {
        await addEvaluation({
          patientId: selectedPatient.id,
          patientNome: selectedPatient.nome,
          avaliadorId: user?.id ?? 0,
          avaliadorNome: user?.nome ?? "Avaliador",
          respostas: answers,
          scoreTotal: score,
          classificacao: cls.label,
          dataAvaliacao: new Date().toISOString(),
          formId: selectedForm.id,
        });
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResultScore(score);
      setResultCls(cls);
      setStep("result");
    } catch {
      setSubmitError("Erro ao salvar avaliação.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("form-select");
    setSelectedForm(null);
    setDocumento("");
    setFoundPatient(null);
    setNotFound(false);
    setSelectedPatient(null);
    setAnswers({});
    setCreateNome(""); setCreateCpf(""); setCreateSus("");
    setCreateNasc(""); setCreateSexo(null);
    setCreateResponsavel(""); setCreateTelefone("");
    setResultCls(null);
    setSubmitError("");
  };

  // ─── Styles ──────────────────────────────────────────────────────────────
  const accent = selectedForm?.accentColor ?? colors.primary;

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
    headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1 },
    headerBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    progressOuter: { height: 4, backgroundColor: colors.border },
    content: { padding: 16, paddingBottom: insets.bottom + 32 },
    sectionLabel: {
      fontSize: 11, fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground, textTransform: "uppercase",
      letterSpacing: 1, marginBottom: 6,
    },
    sectionTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    sectionDesc: {
      fontSize: 13, fontFamily: "Inter_400Regular",
      color: colors.mutedForeground, marginBottom: 20, lineHeight: 19,
    },
    inputRow: { flexDirection: "row", gap: 8 },
    input: {
      flex: 1, backgroundColor: colors.muted, borderRadius: 12,
      paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 15, fontFamily: "Inter_400Regular", color: colors.foreground,
    },
    searchBtn: {
      width: 52, borderRadius: 12,
      alignItems: "center", justifyContent: "center",
    },
    foundCard: {
      backgroundColor: "#f0fdf4", borderRadius: 16,
      borderWidth: 1.5, borderColor: "#86efac", padding: 16, marginTop: 16,
    },
    foundHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    foundAvatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center",
    },
    foundName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#15803d" },
    foundDetail: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#16a34a", marginTop: 2 },
    foundBtn: {
      backgroundColor: "#16a34a", borderRadius: 12, paddingVertical: 14,
      alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8,
    },
    notFoundCard: {
      backgroundColor: "#fff7ed", borderRadius: 16,
      borderWidth: 1.5, borderColor: "#fed7aa",
      padding: 16, marginTop: 16, alignItems: "center",
    },
    fieldLabel: {
      fontSize: 13, fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground, marginTop: 14, marginBottom: 6,
    },
    fieldInput: {
      backgroundColor: colors.muted, borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 14, fontFamily: "Inter_400Regular", color: colors.foreground,
    },
    sexRow: { flexDirection: "row", gap: 8 },
    sexOpt: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 2 },
    error: {
      backgroundColor: "#fee2e2", borderRadius: 12, padding: 12,
      marginTop: 12, flexDirection: "row", gap: 8, alignItems: "center",
    },
    primaryBtn: {
      borderRadius: 14, paddingVertical: 16,
      alignItems: "center", marginTop: 20,
      flexDirection: "row", justifyContent: "center", gap: 8,
    },
    patientPill: {
      flexDirection: "row", alignItems: "center",
      borderRadius: 30, paddingHorizontal: 12,
      paddingVertical: 6, gap: 6, alignSelf: "flex-start", marginBottom: 16,
    },
  });

  // ─── RESULT screen ────────────────────────────────────────────────────────
  if (step === "result" && resultCls && selectedForm) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Colored header */}
        <View
          style={{
            backgroundColor: resultCls.bgColor,
            paddingTop: insets.top + 20,
            paddingBottom: 32,
            paddingHorizontal: 24,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: resultCls.color + "20",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Feather
              name={resultCls.level === "low" ? "check-circle" : resultCls.level === "medium" ? "alert-circle" : "alert-triangle"}
              size={36}
              color={resultCls.color}
            />
          </View>
          <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: resultCls.color, marginBottom: 4 }}>
            {selectedForm.shortName} · {selectedPatient?.nome}
          </Text>
          <Text style={{ fontSize: 52, fontFamily: "Inter_700Bold", color: resultCls.color }}>
            {resultScore}
          </Text>
          <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: resultCls.color + "aa" }}>
            de {selectedForm.maxScore} pontos máximos
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 32 }}>
          {/* Classification badge */}
          <View
            style={{
              borderRadius: 16,
              padding: 16,
              backgroundColor: resultCls.bgColor,
              borderWidth: 1.5,
              borderColor: resultCls.color + "40",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: resultCls.color, textAlign: "center" }}>
              {resultCls.label}
            </Text>
          </View>

          {/* Info cards */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginBottom: 4 }}>
                Formulário
              </Text>
              <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>
                {selectedForm.shortName}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.mutedForeground, marginBottom: 4 }}>
                Questões respondidas
              </Text>
              <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground }}>
                {answered}/{total}
              </Text>
            </View>
          </View>

          {/* Demo warning */}
          {selectedForm.isDemo && (
            <View
              style={{
                backgroundColor: "#fef3c7",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "#fde68a",
                flexDirection: "row",
                gap: 10,
                marginBottom: 16,
                alignItems: "flex-start",
              }}
            >
              <Feather name="info" size={16} color="#92400e" style={{ marginTop: 1 }} />
              <Text style={{ flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#92400e", lineHeight: 18 }}>
                Formulário em modo demonstração. Este resultado não foi salvo no sistema.
              </Text>
            </View>
          )}

          {!selectedForm.isDemo && (
            <View
              style={{
                backgroundColor: "#f0fdf4",
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: "#86efac",
                flexDirection: "row",
                gap: 10,
                marginBottom: 16,
                alignItems: "flex-start",
              }}
            >
              <Feather name="cloud" size={16} color="#15803d" style={{ marginTop: 1 }} />
              <Text style={{ flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#15803d", lineHeight: 18 }}>
                Avaliação salva localmente. Será sincronizada ao servidor quando houver conexão.
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {!selectedForm.isDemo && (
              <Pressable
                style={{
                  flex: 1, borderRadius: 14, paddingVertical: 15,
                  alignItems: "center", backgroundColor: colors.muted,
                  flexDirection: "row", justifyContent: "center", gap: 6,
                }}
                onPress={() => router.replace("/(tabs)/avaliacoes")}
              >
                <Feather name="list" size={16} color={colors.foreground} />
                <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                  Ver avaliações
                </Text>
              </Pressable>
            )}
            <Pressable
              style={{
                flex: 1, borderRadius: 14, paddingVertical: 15,
                alignItems: "center", backgroundColor: accent,
                flexDirection: "row", justifyContent: "center", gap: 6,
              }}
              onPress={handleReset}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>
                Nova triagem
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Main layout ──────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => {
            if (step === "form-select") router.back();
            else if (step === "lookup") setStep("form-select");
            else if (step === "create") setStep("lookup");
            else if (step === "questions") setStep("lookup");
          }}
          style={{ padding: 4 }}
        >
          <Feather
            name={step === "form-select" ? "x" : "arrow-left"}
            size={22}
            color={colors.foreground}
          />
        </Pressable>

        <Text style={s.headerTitle}>
          {step === "form-select" && "Selecionar Formulário"}
          {step === "lookup" && "Identificar Paciente"}
          {step === "create" && "Cadastrar Paciente"}
          {step === "questions" && selectedForm?.shortName}
        </Text>

        {step === "questions" && selectedForm && (
          <>
            <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
              {answered}/{total}
            </Text>
            {selectedForm.isDemo && (
              <View style={[s.headerBadge, { backgroundColor: "#f3f4f6" }]}>
                <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#6b7280" }}>DEMO</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Progress bar (questions step) */}
      {step === "questions" && (
        <View style={s.progressOuter}>
          <View
            style={{
              height: 4,
              backgroundColor: accent,
              width: `${progress * 100}%`,
              borderRadius: 2,
            }}
          />
        </View>
      )}

      {/* Step indicator (form-select, lookup, create) */}
      {step !== "questions" && (
        <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <StepIndicator current={stepIndex} />
        </View>
      )}

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* ── STEP 0: FORM SELECT ──────────────────────────────── */}
        {step === "form-select" && (
          <>
            <Text style={s.sectionLabel}>Passo 1 — Tipo de Instrumento</Text>
            <Text style={s.sectionTitle}>Escolher Formulário</Text>
            <Text style={s.sectionDesc}>
              Selecione o instrumento de triagem. O formulário SPI é o padrão do sistema. Os demais estão disponíveis como demonstração.
            </Text>
            {FORMS.map((form) => (
              <FormCard key={form.id} form={form} onSelect={() => handleSelectForm(form)} />
            ))}
          </>
        )}

        {/* ── STEP 1: LOOKUP ───────────────────────────────────── */}
        {step === "lookup" && selectedForm && (
          <>
            {/* Selected form pill */}
            <View style={[s.patientPill, { backgroundColor: selectedForm.accentColor + "15" }]}>
              <Feather name="file-text" size={12} color={selectedForm.accentColor} />
              <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: selectedForm.accentColor }}>
                {selectedForm.shortName}
              </Text>
              {selectedForm.isDemo && (
                <View style={{ backgroundColor: selectedForm.accentColor + "25", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 }}>
                  <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: selectedForm.accentColor }}>DEMO</Text>
                </View>
              )}
            </View>

            <Text style={s.sectionLabel}>Passo 2 — Identificação</Text>
            <Text style={s.sectionTitle}>Buscar Paciente</Text>
            <Text style={s.sectionDesc}>
              Informe o CPF ou Carteira do SUS. O sistema verifica se o paciente já está cadastrado.
            </Text>

            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="CPF ou N° Carteira do SUS"
                placeholderTextColor={colors.mutedForeground}
                value={documento}
                onChangeText={(t) => { setDocumento(t); setFoundPatient(null); setNotFound(false); }}
                keyboardType="numeric"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              <Pressable
                style={[s.searchBtn, { backgroundColor: selectedForm.accentColor }]}
                onPress={handleSearch}
              >
                {searching ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="search" size={20} color="#fff" />}
              </Pressable>
            </View>

            {/* Found */}
            {foundPatient && (
              <View style={s.foundCard}>
                <View style={s.foundHeader}>
                  <View style={s.foundAvatar}>
                    <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" }}>
                      {foundPatient.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.foundName}>{foundPatient.nome}</Text>
                    <Text style={s.foundDetail}>
                      {foundPatient.cpf ? `CPF: ${foundPatient.cpf}` : ""}
                      {foundPatient.carteiraSus ? `${foundPatient.cpf ? " · " : ""}SUS: ${foundPatient.carteiraSus}` : ""}
                    </Text>
                    {foundPatient.dataNascimento && (
                      <Text style={s.foundDetail}>Nasc.: {foundPatient.dataNascimento}</Text>
                    )}
                  </View>
                </View>
                <Pressable style={[s.foundBtn, { backgroundColor: selectedForm.accentColor }]} onPress={handleUseFound}>
                  <Feather name="check" size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" }}>
                    Usar este paciente → Iniciar avaliação
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Not found */}
            {notFound && (
              <View style={s.notFoundCard}>
                <Feather name="user-x" size={32} color="#ea580c" />
                <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: "#c2410c", marginTop: 8, marginBottom: 4 }}>
                  Paciente não encontrado
                </Text>
                <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: "#ea580c", textAlign: "center", marginBottom: 14 }}>
                  Nenhum cadastro com esse documento.{"\n"}Vamos criar o paciente agora.
                </Text>
                <Pressable
                  style={{ backgroundColor: "#ea580c", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", gap: 8 }}
                  onPress={() => setStep("create")}
                >
                  <Feather name="user-plus" size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" }}>
                    Cadastrar e avaliar
                  </Text>
                </Pressable>
              </View>
            )}
          </>
        )}

        {/* ── STEP 2: CREATE PATIENT ───────────────────────────── */}
        {step === "create" && (
          <>
            <Text style={s.sectionLabel}>Passo 2 — Cadastro</Text>
            <Text style={s.sectionTitle}>Novo Paciente</Text>
            <Text style={s.sectionDesc}>
              Preencha os dados básicos. Após salvar, você será encaminhado para o formulário {selectedForm?.shortName}.
            </Text>

            <Text style={s.fieldLabel}>Nome completo *</Text>
            <TextInput style={s.fieldInput} placeholder="Nome do paciente" placeholderTextColor={colors.mutedForeground} value={createNome} onChangeText={setCreateNome} autoCapitalize="words" />

            <Text style={s.fieldLabel}>CPF</Text>
            <TextInput style={s.fieldInput} placeholder="000.000.000-00" placeholderTextColor={colors.mutedForeground} value={createCpf} onChangeText={setCreateCpf} keyboardType="numeric" />

            <Text style={s.fieldLabel}>Carteira do SUS</Text>
            <TextInput style={s.fieldInput} placeholder="Número da Carteira SUS" placeholderTextColor={colors.mutedForeground} value={createSus} onChangeText={setCreateSus} keyboardType="numeric" />

            <Text style={s.fieldLabel}>Data de nascimento</Text>
            <TextInput style={s.fieldInput} placeholder="DD/MM/AAAA" placeholderTextColor={colors.mutedForeground} value={createNasc} onChangeText={setCreateNasc} keyboardType="numeric" />

            <Text style={s.fieldLabel}>Sexo *</Text>
            <View style={s.sexRow}>
              {(["masculino", "feminino", "outro"] as SexoType[]).map((sv) => (
                <Pressable
                  key={sv}
                  style={[s.sexOpt, { borderColor: createSexo === sv ? accent : colors.border, backgroundColor: createSexo === sv ? accent + "18" : colors.card }]}
                  onPress={() => setCreateSexo(sv)}
                >
                  <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: createSexo === sv ? accent : colors.foreground }}>
                    {sv.charAt(0).toUpperCase() + sv.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.fieldLabel}>Nome do responsável</Text>
            <TextInput style={s.fieldInput} placeholder="Nome do responsável (opcional)" placeholderTextColor={colors.mutedForeground} value={createResponsavel} onChangeText={setCreateResponsavel} autoCapitalize="words" />

            <Text style={s.fieldLabel}>Telefone</Text>
            <TextInput style={s.fieldInput} placeholder="(00) 00000-0000" placeholderTextColor={colors.mutedForeground} value={createTelefone} onChangeText={setCreateTelefone} keyboardType="phone-pad" />

            {createError ? (
              <View style={s.error}>
                <Feather name="alert-circle" size={16} color="#dc2626" />
                <Text style={{ color: "#dc2626", fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 }}>{createError}</Text>
              </View>
            ) : null}

            <Pressable
              style={[s.primaryBtn, { backgroundColor: accent, opacity: creating ? 0.7 : 1 }]}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Feather name="save" size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" }}>
                    Salvar e ir para avaliação
                  </Text>
                </>
              )}
            </Pressable>
          </>
        )}

        {/* ── STEP 3: QUESTIONS ────────────────────────────────── */}
        {step === "questions" && selectedForm && selectedPatient && (
          <>
            {/* Patient pill */}
            <View style={[s.patientPill, { backgroundColor: accent + "15", marginBottom: 4 }]}>
              <Feather name="user" size={12} color={accent} />
              <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: accent }}>
                {selectedPatient.nome}
              </Text>
            </View>

            {/* Progress caption */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={s.sectionLabel}>
                {answered === total ? "✓ Todas respondidas" : `${total - answered} restante${total - answered !== 1 ? "s" : ""}`}
              </Text>
              <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: accent }}>
                {Math.round(progress * 100)}%
              </Text>
            </View>

            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                totalQuestions={total}
                value={answers[q.id]}
                accentColor={accent}
                onChange={(score) => setAnswers((prev) => ({ ...prev, [q.id]: score }))}
              />
            ))}

            {submitError ? (
              <View style={s.error}>
                <Feather name="alert-circle" size={16} color="#dc2626" />
                <Text style={{ color: "#dc2626", fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 }}>{submitError}</Text>
              </View>
            ) : null}

            <Pressable
              style={[
                s.primaryBtn,
                {
                  backgroundColor: answered === total ? "#16a34a" : colors.muted,
                  opacity: submitting ? 0.7 : 1,
                  marginTop: 16,
                  marginBottom: insets.bottom + 8,
                },
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Feather name={selectedForm.isDemo ? "eye" : "send"} size={18} color={answered === total ? "#fff" : colors.mutedForeground} />
                  <Text style={{ color: answered === total ? "#fff" : colors.mutedForeground, fontSize: 16, fontFamily: "Inter_700Bold" }}>
                    {selectedForm.isDemo ? "Ver resultado (Demo)" : "Finalizar avaliação"}
                  </Text>
                </>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
