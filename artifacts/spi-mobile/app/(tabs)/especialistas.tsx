import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useDb, LocalSpecialist } from "@/context/DbContext";
import { useColors } from "@/hooks/useColors";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

// ─── Specialist Form ─────────────────────────────────────────────────────────

interface FormValues {
  nome: string;
  especialidade: string;
  custoConsulta: string;
  ativo: boolean;
}

function SpecialistForm({
  initial,
  title,
  onSave,
  onCancel,
}: {
  initial?: Partial<LocalSpecialist>;
  title: string;
  onSave: (v: FormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [especialidade, setEspecialidade] = useState(initial?.especialidade ?? "");
  const [custoConsulta, setCustoConsulta] = useState(
    initial?.custoConsulta != null ? String(initial.custoConsulta) : ""
  );
  const [ativo, setAtivo] = useState(initial?.ativo ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!nome.trim()) { setError("Nome é obrigatório."); return; }
    if (!especialidade.trim()) { setError("Especialidade é obrigatória."); return; }
    const custo = parseFloat(custoConsulta.replace(",", "."));
    if (isNaN(custo) || custo < 0) { setError("Informe um custo de consulta válido."); return; }
    setError("");
    setSaving(true);
    try {
      await onSave({ nome: nome.trim(), especialidade: especialidade.trim(), custoConsulta: custoConsulta.trim(), ativo });
    } finally {
      setSaving(false);
    }
  };

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
    label: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 14, marginBottom: 4 },
    input: {
      backgroundColor: colors.muted,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
      paddingVertical: 6,
    },
    toggleLabel: { fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground },
    toggleBtns: { flexDirection: "row", gap: 8 },
    toggleOpt: {
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderWidth: 1.5,
    },
    error: { backgroundColor: "#fee2e2", borderRadius: 10, padding: 10, marginTop: 10 },
    btnRow: { flexDirection: "row", gap: 10, marginTop: 18 },
    cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center", backgroundColor: colors.muted },
    saveBtn: { flex: 2, borderRadius: 12, paddingVertical: 13, alignItems: "center", backgroundColor: colors.primary },
  });

  return (
    <ScrollView style={f.sheet} keyboardShouldPersistTaps="handled">
      <Text style={f.title}>{title}</Text>

      <Text style={f.label}>Nome *</Text>
      <TextInput
        style={f.input}
        placeholder="Nome completo do especialista"
        placeholderTextColor={colors.mutedForeground}
        value={nome}
        onChangeText={setNome}
      />

      <Text style={f.label}>Especialidade *</Text>
      <TextInput
        style={f.input}
        placeholder="Ex: Neurologia, Psicologia, Fonoaudiologia"
        placeholderTextColor={colors.mutedForeground}
        value={especialidade}
        onChangeText={setEspecialidade}
      />

      <Text style={f.label}>Custo da consulta (R$) *</Text>
      <TextInput
        style={f.input}
        placeholder="Ex: 150"
        placeholderTextColor={colors.mutedForeground}
        value={custoConsulta}
        onChangeText={setCustoConsulta}
        keyboardType="decimal-pad"
      />

      {initial?.id != null && (
        <View style={f.toggleRow}>
          <Text style={f.toggleLabel}>Status</Text>
          <View style={f.toggleBtns}>
            {[true, false].map((opt) => (
              <Pressable
                key={String(opt)}
                style={[
                  f.toggleOpt,
                  {
                    backgroundColor: ativo === opt ? (opt ? "#dcfce7" : "#fee2e2") : colors.muted,
                    borderColor: ativo === opt ? (opt ? "#16a34a" : "#dc2626") : colors.border,
                  },
                ]}
                onPress={() => setAtivo(opt)}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_600SemiBold",
                    color: ativo === opt ? (opt ? "#16a34a" : "#dc2626") : colors.mutedForeground,
                  }}
                >
                  {opt ? "Ativo" : "Inativo"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {error ? (
        <View style={f.error}>
          <Text style={{ color: "#dc2626", fontSize: 13, fontFamily: "Inter_500Medium" }}>{error}</Text>
        </View>
      ) : null}

      <View style={f.btnRow}>
        <Pressable style={f.cancelBtn} onPress={onCancel}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancelar</Text>
        </Pressable>
        <Pressable style={[f.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold" }}>{saving ? "Salvando..." : "Salvar"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function EspecialistasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAdmin, canManageSpecialists } = useAuth();
  const { specialists, addSpecialist, updateSpecialist, deactivateSpecialist } = useDb();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<LocalSpecialist | null>(null);

  // Admin-only guard
  if (!isAdmin()) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 32 }}>
        <Feather name="lock" size={40} color={colors.border} />
        <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 16, textAlign: "center" }}>
          Acesso restrito
        </Text>
        <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 8, textAlign: "center" }}>
          Somente o administrador pode acessar os especialistas.
        </Text>
      </View>
    );
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = specialists.filter((s) => {
    if (!normalizedSearch) return true;
    return (
      s.nome.toLowerCase().includes(normalizedSearch) ||
      s.especialidade.toLowerCase().includes(normalizedSearch)
    );
  });

  const handleCreate = async (v: FormValues) => {
    await addSpecialist({
      nome: v.nome,
      especialidade: v.especialidade,
      custoConsulta: parseFloat(v.custoConsulta.replace(",", ".")),
      ativo: true,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCreate(false);
  };

  const handleEdit = async (v: FormValues) => {
    if (!editTarget) return;
    await updateSpecialist(editTarget.id, {
      nome: v.nome,
      especialidade: v.especialidade,
      custoConsulta: parseFloat(v.custoConsulta.replace(",", ".")),
      ativo: v.ativo,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditTarget(null);
  };

  const handleDeactivate = (specialist: LocalSpecialist) => {
    const msg = `Desativar ${specialist.nome}? Ela não aparecerá nas opções de encaminhamento.`;
    if (Platform.OS === "web") {
      if (window.confirm(msg)) deactivateSpecialist(specialist.id);
    } else {
      Alert.alert("Desativar especialista", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desativar",
          style: "destructive",
          onPress: () => deactivateSpecialist(specialist.id),
        },
      ]);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 20 : insets.top + 8,
      paddingHorizontal: 16,
      paddingBottom: 14,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground },
    newBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    newBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
    searchBar: {
      backgroundColor: colors.muted,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    subtext: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 4 },
    list: { padding: 14 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
    },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.primary },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.foreground },
    cardSpec: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 1 },
    badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" },
    badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
    cardMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
    actionRow: { flexDirection: "row", gap: 8 },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      borderRadius: 8,
      paddingVertical: 8,
      borderWidth: 1,
    },
    actionBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" },
  });

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>Especialistas</Text>
            <Text style={s.subtext}>
              {filtered.length} exibido(s) de {specialists.length} cadastrado(s)
            </Text>
          </View>
          {canManageSpecialists() && (
            <Pressable style={s.newBtn} onPress={() => setShowCreate(true)}>
              <Feather name="plus" size={16} color="#fff" />
              <Text style={s.newBtnText}>Novo</Text>
            </Pressable>
          )}
        </View>
        <TextInput
          style={s.searchBar}
          placeholder="Buscar por nome ou especialidade…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={s.emptyWrap}>
          <Feather name="user-x" size={40} color={colors.border} />
          <Text style={s.emptyText}>
            {specialists.length === 0
              ? 'Nenhum especialista cadastrado. Toque em "Novo" para adicionar.'
              : 'Nenhum especialista encontrado para a busca.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={[s.card, !item.ativo && { opacity: 0.65 }]}>
              <View style={s.cardTop}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.cardName}>{item.nome}</Text>
                  <Text style={s.cardSpec}>{item.especialidade}</Text>
                </View>
              </View>

              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: item.ativo ? "#dcfce7" : "#f1f5f9" }]}>
                  <Text style={[s.badgeText, { color: item.ativo ? "#16a34a" : "#64748b" }]}>
                    {item.ativo ? "Ativo" : "Inativo"}
                  </Text>
                </View>
                <View style={[s.badge, { backgroundColor: colors.primary + "15" }]}>
                  <Text style={[s.badgeText, { color: colors.primary }]}>
                    {formatCurrency(item.custoConsulta)}
                  </Text>
                </View>
                <Text style={s.cardMeta}>Cadastro: {formatDate(item.criadoEm)}</Text>
              </View>

              {canManageSpecialists() && (
                <>
                  <View style={s.divider} />
                  <View style={s.actionRow}>
                    <Pressable
                      style={[s.actionBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}
                      onPress={() => setEditTarget(item)}
                    >
                      <Feather name="edit-2" size={13} color={colors.foreground} />
                      <Text style={[s.actionBtnText, { color: colors.foreground }]}>Editar</Text>
                    </Pressable>
                    {item.ativo && (
                      <Pressable
                        style={[s.actionBtn, { borderColor: "#fca5a5", backgroundColor: "#fee2e2" }]}
                        onPress={() => handleDeactivate(item)}
                      >
                        <Feather name="user-x" size={13} color="#dc2626" />
                        <Text style={[s.actionBtnText, { color: "#dc2626" }]}>Desativar</Text>
                      </Pressable>
                    )}
                  </View>
                </>
              )}
            </View>
          )}
        />
      )}

      {/* Create Modal */}
      <Modal visible={showCreate} animationType="slide" transparent onRequestClose={() => setShowCreate(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <SpecialistForm
            title="Novo especialista"
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editTarget !== null} animationType="slide" transparent onRequestClose={() => setEditTarget(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          {editTarget && (
            <SpecialistForm
              title="Editar especialista"
              initial={editTarget}
              onSave={handleEdit}
              onCancel={() => setEditTarget(null)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
