import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
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
import { useAuth } from "@/context/AuthContext";
import { useDb, LocalPatient, DEMO_GROUPS } from "@/context/DbContext";
import { useColors } from "@/hooks/useColors";
import { FORMS } from "@/constants/forms";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import {
  TextInput,
} from "react-native";

const GROUP_COLORS = ["#2563eb", "#9333ea"];
const GROUP_BG = ["#dbeafe", "#f3e8ff"];

const SEX_OPTS: Array<{ value: LocalPatient["sexo"]; label: string }> = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
];

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
      <Text style={{ fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular" }}>{label}</Text>
      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#0f172a", flex: 1, textAlign: "right", marginLeft: 16 }}>{value}</Text>
    </View>
  );
}

export default function PacienteDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patients, evaluations, updatePatient, deletePatient } = useDb();
  const { canManagePatients } = useAuth();
  const [showEdit, setShowEdit] = useState(false);

  const patient = patients.find((p) => p.id === id);
  const patientEvals = evaluations
    .filter((e) => e.patientId === id)
    .sort((a, b) => new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime());

  if (!patient) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Feather name="alert-circle" size={40} color={colors.border} />
        <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 12 }}>
          Paciente não encontrado
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const group = DEMO_GROUPS.find((g) => g.id === patient.groupId);
  const ci = patient.groupId != null ? (patient.groupId - 1) % GROUP_COLORS.length : 0;

  const handleDelete = () => {
    Alert.alert(
      "Excluir paciente",
      `Deseja excluir ${patient.nome}? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deletePatient(patient.id);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          },
        },
      ]
    );
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: Platform.OS === "web" ? 20 : insets.top + 8,
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1 },
    scroll: { padding: 16, paddingBottom: insets.bottom + 40 },
    heroCard: {
      backgroundColor: colors.primary,
      borderRadius: 18,
      padding: 20,
      alignItems: "center",
      marginBottom: 16,
    },
    avatar: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
    heroName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
    heroBadgeRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap", justifyContent: "center" },
    heroBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "rgba(255,255,255,0.2)" },
    heroBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
    section: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
      paddingHorizontal: 16,
      overflow: "hidden",
    },
    sectionTitle: {
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1,
      paddingTop: 14,
      paddingBottom: 4,
    },
    evalCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    evalScore: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    evalScoreText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
    evalInfo: { flex: 1 },
    evalFormName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    evalDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    evalCls: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 2 },
    emptyEval: { alignItems: "center", paddingVertical: 24, gap: 8 },
    emptyEvalText: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
  });

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>Paciente</Text>
        {canManagePatients() && (
          <Pressable onPress={() => setShowEdit(true)} hitSlop={10} style={{ marginRight: 4 }}>
            <Feather name="edit-2" size={18} color={colors.primary} />
          </Pressable>
        )}
        {canManagePatients() && (
          <Pressable onPress={handleDelete} hitSlop={10}>
            <Feather name="trash-2" size={18} color={colors.destructive} />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={s.heroCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{patient.nome.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.heroName}>{patient.nome}</Text>
          <View style={s.heroBadgeRow}>
            {patient.sexo && (
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>{patient.sexo.charAt(0).toUpperCase() + patient.sexo.slice(1)}</Text>
              </View>
            )}
            {patient.dataNascimento && (
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>{patient.dataNascimento}</Text>
              </View>
            )}
            {group && (
              <View style={[s.heroBadge, { backgroundColor: GROUP_BG[ci] }]}>
                <Text style={[s.heroBadgeText, { color: GROUP_COLORS[ci] }]}>{group.nome}</Text>
              </View>
            )}
            {patient.syncStatus === "pending" && (
              <View style={[s.heroBadge, { backgroundColor: "#fef9c3" }]}>
                <Text style={[s.heroBadgeText, { color: "#92400e" }]}>Pendente</Text>
              </View>
            )}
          </View>
        </View>

        {/* Dados pessoais */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Dados pessoais</Text>
          <InfoRow label="CPF" value={patient.cpf} />
          <InfoRow label="Carteira SUS" value={patient.carteiraSus} />
          <InfoRow label="Responsável" value={patient.nomeResponsavel} />
          <InfoRow label="Telefone" value={patient.telefone} />
          <InfoRow label="E-mail" value={patient.email} />
          {!patient.cpf && !patient.carteiraSus && !patient.nomeResponsavel && !patient.telefone && !patient.email && (
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Nenhum dado de contato cadastrado</Text>
            </View>
          )}
        </View>

        {/* Endereço */}
        {(patient.rua || patient.bairro || patient.cidade) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Endereço</Text>
            <InfoRow label="CEP" value={patient.cep} />
            <InfoRow label="Estado" value={patient.estado} />
            <InfoRow label="Cidade" value={patient.cidade} />
            <InfoRow label="Bairro" value={patient.bairro} />
            <InfoRow label="Rua" value={patient.rua} />
            <InfoRow
              label="Número"
              value={[patient.numero, patient.complemento].filter(Boolean).join(" — ") || null}
            />
          </View>
        )}

        {/* Observações */}
        {patient.observacoes ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Observações</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, paddingVertical: 12, lineHeight: 20 }}>
              {patient.observacoes}
            </Text>
          </View>
        ) : null}

        {/* Avaliações */}
        <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 10 }}>
          Avaliações ({patientEvals.length})
        </Text>

        {patientEvals.length === 0 ? (
          <View style={s.emptyEval}>
            <Feather name="clipboard" size={32} color={colors.border} />
            <Text style={s.emptyEvalText}>Nenhuma avaliação para este paciente</Text>
            <Pressable
              onPress={() => router.push("/nova-avaliacao")}
              style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 }}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Nova Avaliação</Text>
            </Pressable>
          </View>
        ) : (
          patientEvals.map((ev) => {
            const form = FORMS.find((f) => f.id === (ev.formId ?? 1)) ?? FORMS[0];
            const cls = form.classify(ev.scoreTotal);
            const dateStr = new Date(ev.dataAvaliacao).toLocaleDateString("pt-BR");
            return (
              <Pressable
                key={ev.id}
                style={s.evalCard}
                onPress={() => router.push(`/avaliacao/${ev.id}`)}
              >
                <View style={[s.evalScore, { backgroundColor: cls.color }]}>
                  <Text style={s.evalScoreText}>{ev.scoreTotal}</Text>
                </View>
                <View style={s.evalInfo}>
                  <Text style={s.evalFormName}>{form.name}</Text>
                  <Text style={[s.evalCls, { color: cls.color }]}>{cls.label}</Text>
                  <Text style={s.evalDate}>{dateStr} · {ev.avaliadorNome}</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.border} />
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Edit modal */}
      <Modal visible={showEdit} animationType="slide" transparent onRequestClose={() => setShowEdit(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <EditPatientSheet
            patient={patient}
            onSave={async (data) => {
              await updatePatient(patient.id, data);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setShowEdit(false);
            }}
            onCancel={() => setShowEdit(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

function EditPatientSheet({
  patient,
  onSave,
  onCancel,
}: {
  patient: LocalPatient;
  onSave: (data: Partial<LocalPatient>) => Promise<void>;
  onCancel: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [nome, setNome] = useState(patient.nome);
  const [cpf, setCpf] = useState(patient.cpf ?? "");
  const [carteiraSus, setCarteiraSus] = useState(patient.carteiraSus ?? "");
  const [dataNascimento, setDataNascimento] = useState(patient.dataNascimento ?? "");
  const [sexo, setSexo] = useState<LocalPatient["sexo"]>(patient.sexo);
  const [nomeResponsavel, setNomeResponsavel] = useState(patient.nomeResponsavel ?? "");
  const [telefone, setTelefone] = useState(patient.telefone ?? "");
  const [email, setEmail] = useState(patient.email ?? "");
  const [observacoes, setObservacoes] = useState(patient.observacoes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const f = StyleSheet.create({
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: Platform.OS === "web" ? 32 : insets.bottom + 16,
      maxHeight: "90%",
    },
    title: { fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 },
    label: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 12, marginBottom: 4 },
    input: {
      backgroundColor: colors.muted,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    sexRow: { flexDirection: "row", gap: 8, marginTop: 4 },
    sexOpt: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 9,
      alignItems: "center",
      borderWidth: 1.5,
    },
    sexOptText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    btnRow: { flexDirection: "row", gap: 10, marginTop: 18 },
    cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center", backgroundColor: colors.muted },
    saveBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center", backgroundColor: colors.primary },
    error: { backgroundColor: "#fee2e2", borderRadius: 10, padding: 10, marginTop: 10 },
  });

  const handleSave = async () => {
    if (!nome.trim()) { setError("Nome é obrigatório."); return; }
    if (!sexo) { setError("Selecione o sexo."); return; }
    setError("");
    setSaving(true);
    try {
      await onSave({
        nome: nome.trim(),
        cpf: cpf.trim() || null,
        carteiraSus: carteiraSus.trim() || null,
        dataNascimento: dataNascimento.trim() || null,
        sexo,
        nomeResponsavel: nomeResponsavel.trim() || null,
        telefone: telefone.trim() || null,
        email: email.trim() || null,
        observacoes: observacoes.trim() || null,
        syncStatus: "pending",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat style={f.sheet}>
      <Text style={f.title}>Editar paciente</Text>
      <Text style={f.label}>Nome *</Text>
      <TextInput style={f.input} value={nome} onChangeText={setNome} placeholder="Nome completo" placeholderTextColor={colors.mutedForeground} />
      <Text style={f.label}>Sexo *</Text>
      <View style={f.sexRow}>
        {SEX_OPTS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[f.sexOpt, {
              backgroundColor: sexo === opt.value ? colors.primary + "15" : colors.muted,
              borderColor: sexo === opt.value ? colors.primary : colors.border,
            }]}
            onPress={() => setSexo(opt.value)}
          >
            <Text style={[f.sexOptText, { color: sexo === opt.value ? colors.primary : colors.mutedForeground }]}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={f.label}>Data de nascimento</Text>
      <TextInput style={f.input} value={dataNascimento} onChangeText={setDataNascimento} placeholder="DD/MM/AAAA" placeholderTextColor={colors.mutedForeground} />
      <Text style={f.label}>CPF</Text>
      <TextInput style={f.input} value={cpf} onChangeText={setCpf} placeholder="000.000.000-00" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
      <Text style={f.label}>Carteira SUS</Text>
      <TextInput style={f.input} value={carteiraSus} onChangeText={setCarteiraSus} placeholder="000 0000 0000 0000" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
      <Text style={f.label}>Nome do responsável</Text>
      <TextInput style={f.input} value={nomeResponsavel} onChangeText={setNomeResponsavel} placeholder="Nome do responsável" placeholderTextColor={colors.mutedForeground} />
      <Text style={f.label}>Telefone</Text>
      <TextInput style={f.input} value={telefone} onChangeText={setTelefone} placeholder="(00) 00000-0000" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" />
      <Text style={f.label}>E-mail</Text>
      <TextInput style={f.input} value={email} onChangeText={setEmail} placeholder="email@exemplo.com" placeholderTextColor={colors.mutedForeground} keyboardType="email-address" autoCapitalize="none" />
      <Text style={f.label}>Observações</Text>
      <TextInput style={[f.input, { minHeight: 72, textAlignVertical: "top" }]} value={observacoes} onChangeText={setObservacoes} placeholder="Informações adicionais..." placeholderTextColor={colors.mutedForeground} multiline />
      {error ? <View style={f.error}><Text style={{ color: "#dc2626", fontSize: 13, fontFamily: "Inter_500Medium" }}>{error}</Text></View> : null}
      <View style={f.btnRow}>
        <Pressable style={f.cancelBtn} onPress={onCancel}><Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancelar</Text></Pressable>
        <Pressable style={[f.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold" }}>{saving ? "Salvando..." : "Salvar"}</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}
