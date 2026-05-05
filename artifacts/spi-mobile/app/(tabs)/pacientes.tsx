import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useDb, LocalPatient, DEMO_GROUPS } from "@/context/DbContext";
import { useColors } from "@/hooks/useColors";

const GROUP_COLORS = ["#2563eb", "#9333ea"];
const GROUP_BG    = ["#dbeafe", "#f3e8ff"];

const SEX_OPTS: Array<{ value: LocalPatient["sexo"]; label: string }> = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
];

function PatientForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<LocalPatient>;
  onSave: (data: Omit<LocalPatient, "id" | "serverId" | "criadoEm" | "syncStatus">) => void;
  onCancel: () => void;
}) {
  const colors = useColors();
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [cpf, setCpf] = useState(initial?.cpf ?? "");
  const [carteiraSus, setCarteiraSus] = useState(initial?.carteiraSus ?? "");
  const [dataNascimento, setDataNascimento] = useState(initial?.dataNascimento ?? "");
  const [sexo, setSexo] = useState<LocalPatient["sexo"]>(initial?.sexo ?? null);
  const [nomeResponsavel, setNomeResponsavel] = useState(initial?.nomeResponsavel ?? "");
  const [telefone, setTelefone] = useState(initial?.telefone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? "");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!nome.trim()) { setError("Nome é obrigatório."); return; }
    if (!sexo) { setError("Selecione o sexo."); return; }
    setError("");
    onSave({
      nome: nome.trim(),
      cpf: cpf.trim() || null,
      carteiraSus: carteiraSus.trim() || null,
      dataNascimento: dataNascimento.trim() || null,
      sexo,
      nomeResponsavel: nomeResponsavel.trim() || null,
      telefone: telefone.trim() || null,
      email: email.trim() || null,
      cep: null,
      estado: null,
      cidade: null,
      bairro: null,
      rua: null,
      numero: null,
      complemento: null,
      observacoes: observacoes.trim() || null,
      groupId: null,
    });
  };

  const f = StyleSheet.create({
    label: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginTop: 14,
      marginBottom: 5,
    },
    input: {
      backgroundColor: colors.muted,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    sexRow: { flexDirection: "row", gap: 8, marginTop: 0 },
    sexOpt: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 10,
      alignItems: "center",
      borderWidth: 2,
    },
    sexOptText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
    },
    error: {
      backgroundColor: "#fee2e2",
      borderRadius: 8,
      padding: 10,
      marginTop: 12,
    },
    errorText: {
      color: "#dc2626",
      fontSize: 13,
      fontFamily: "Inter_500Medium",
    },
    btnRow: { flexDirection: "row", gap: 10, marginTop: 20 },
    cancelBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: colors.muted,
    },
    saveBtn: {
      flex: 2,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      backgroundColor: colors.primary,
    },
  });

  return (
    <KeyboardAwareScrollViewCompat keyboardShouldPersistTaps="handled" bottomOffset={20}>
      <Text style={f.label}>Nome *</Text>
      <TextInput style={f.input} placeholder="Nome completo" placeholderTextColor={colors.mutedForeground} value={nome} onChangeText={setNome} />
      <Text style={f.label}>CPF</Text>
      <TextInput style={f.input} placeholder="000.000.000-00" placeholderTextColor={colors.mutedForeground} value={cpf} onChangeText={setCpf} keyboardType="numeric" />
      <Text style={f.label}>Carteira do SUS</Text>
      <TextInput style={f.input} placeholder="Número da Carteira SUS" placeholderTextColor={colors.mutedForeground} value={carteiraSus} onChangeText={setCarteiraSus} keyboardType="numeric" />
      <Text style={f.label}>Data de nascimento</Text>
      <TextInput style={f.input} placeholder="DD/MM/AAAA" placeholderTextColor={colors.mutedForeground} value={dataNascimento} onChangeText={setDataNascimento} />
      <Text style={f.label}>Sexo *</Text>
      <View style={f.sexRow}>
        {SEX_OPTS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[
              f.sexOpt,
              { borderColor: sexo === opt.value ? colors.primary : colors.border,
                backgroundColor: sexo === opt.value ? colors.accent : colors.card },
            ]}
            onPress={() => setSexo(opt.value)}
          >
            <Text style={[f.sexOptText, { color: sexo === opt.value ? colors.primary : colors.foreground }]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={f.label}>Nome do responsável</Text>
      <TextInput style={f.input} placeholder="Nome do responsável" placeholderTextColor={colors.mutedForeground} value={nomeResponsavel} onChangeText={setNomeResponsavel} />
      <Text style={f.label}>Telefone</Text>
      <TextInput style={f.input} placeholder="(00) 00000-0000" placeholderTextColor={colors.mutedForeground} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
      <Text style={f.label}>Email</Text>
      <TextInput style={f.input} placeholder="email@exemplo.com" placeholderTextColor={colors.mutedForeground} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Text style={f.label}>Observações</Text>
      <TextInput style={[f.input, { minHeight: 80 }]} placeholder="Observações gerais..." placeholderTextColor={colors.mutedForeground} value={observacoes} onChangeText={setObservacoes} multiline />
      {error ? <View style={f.error}><Text style={f.errorText}>{error}</Text></View> : null}
      <View style={f.btnRow}>
        <Pressable style={f.cancelBtn} onPress={onCancel}>
          <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>Cancelar</Text>
        </Pressable>
        <Pressable style={f.saveBtn} onPress={handleSave}>
          <Text style={{ fontFamily: "Inter_600SemiBold", color: "#fff" }}>Salvar</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

export default function PacientesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { canManagePatients } = useAuth();
  const { patients, addPatient, deletePatient } = useDb();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = patients.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    (p.cpf && p.cpf.includes(search)) ||
    (p.carteiraSus && p.carteiraSus.includes(search))
  );

  const handleAdd = async (data: Omit<LocalPatient, "id" | "serverId" | "criadoEm" | "syncStatus">) => {
    await addPatient(data);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
  };

  const handleDelete = (p: LocalPatient) => {
    Alert.alert(
      "Remover paciente",
      `Deseja remover ${p.nome}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            await deletePatient(p.id);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, flex: 1 },
    addBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 8 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginHorizontal: 16,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    avatarText: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    pname: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    pdetail: { fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 2 },
    syncBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: "#fef9c3",
      marginLeft: 6,
    },
    syncBadgeText: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: "#92400e" },
    deleteBtn: { padding: 8, marginLeft: 4 },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: insets.bottom + 20,
      maxHeight: "90%",
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 16,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
    },
    emptyText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 12 },
    emptySubtext: { fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 4 },
    listFooter: { height: Platform.OS === "web" ? 34 : insets.bottom + 16 },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.title}>Pacientes</Text>
          {canManagePatients() && (
            <Pressable style={s.addBtn} onPress={() => setShowModal(true)}>
              <Feather name="plus" size={20} color="#fff" />
            </Pressable>
          )}
        </View>
        <View style={s.searchBar}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar por nome ou CPF..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 6 }}
        ListFooterComponent={<View style={s.listFooter} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Feather name="users" size={40} color={colors.border} />
            <Text style={s.emptyText}>Nenhum paciente</Text>
            <Text style={s.emptySubtext}>
              {search ? "Tente outra busca" : "Cadastre o primeiro paciente"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={s.item}
            onPress={() => router.push(`/paciente/${item.id}`)}
            onLongPress={() => handleDelete(item)}
          >
            <View style={s.avatar}>
              <Text style={s.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                <Text style={s.pname} numberOfLines={1}>{item.nome}</Text>
                {item.syncStatus === "pending" && (
                  <View style={s.syncBadge}>
                    <Text style={s.syncBadgeText}>PENDENTE</Text>
                  </View>
                )}
              </View>
              <Text style={s.pdetail}>
                {item.sexo ? `${item.sexo.charAt(0).toUpperCase() + item.sexo.slice(1)}` : ""}
                {item.dataNascimento ? ` · ${item.dataNascimento}` : ""}
                {item.bairro ? ` · ${item.bairro}` : ""}
              </Text>
              {item.groupId != null && (() => {
                const grp = DEMO_GROUPS.find((g) => g.id === item.groupId);
                const ci = (item.groupId - 1) % GROUP_COLORS.length;
                return grp ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <View style={{
                      backgroundColor: GROUP_BG[ci],
                      borderRadius: 6,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                    }}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: GROUP_COLORS[ci] }}>
                        {grp.nome}
                      </Text>
                    </View>
                  </View>
                ) : null;
              })()}
            </View>
            {canManagePatients() && (
              <Pressable style={s.deleteBtn} onPress={() => handleDelete(item)}>
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </Pressable>
            )}
          </Pressable>
        )}
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Novo Paciente</Text>
            <PatientForm
              onSave={handleAdd}
              onCancel={() => setShowModal(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
