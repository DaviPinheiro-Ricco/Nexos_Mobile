import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useDb, DEMO_GROUPS, DEMO_AGENTS } from "@/context/DbContext";
import { useSync } from "@/context/SyncContext";
import { useColors } from "@/hooks/useColors";
import { API_URL_STORAGE_KEY, getEnvApiUrl } from "@/utils/apiUrl";

export default function ConfiguracoesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, isAdmin } = useAuth();
  const { patients, evaluations, seedDemoPatients, clearAllData } = useDb();
  const { isOnline, isSyncing, lastSync, pendingCount, syncNow } = useSync();
  const [apiUrl, setApiUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const admin = isAdmin();
  const envApiUrl = getEnvApiUrl();

  useEffect(() => {
    AsyncStorage.getItem(API_URL_STORAGE_KEY).then((v) => {
      if (v) setApiUrl(v);
    });
  }, []);

  const saveApiUrl = async () => {
    if (!admin) return;
    const url = apiUrl.trim().replace(/\/+$/, "");
    if (url) {
      await AsyncStorage.setItem(API_URL_STORAGE_KEY, url);
    } else {
      await AsyncStorage.removeItem(API_URL_STORAGE_KEY);
    }
    setSaved(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    const confirmed =
      Platform.OS === "web"
        ? window.confirm("Deseja realmente sair da conta?")
        : await new Promise<boolean>((resolve) =>
            Alert.alert("Sair", "Deseja realmente sair da conta?", [
              { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
              { text: "Sair", style: "destructive", onPress: () => resolve(true) },
            ])
          );
    if (confirmed) {
      await logout();
      // The tabs layout useEffect will detect user === null and navigate to /login
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDemoPatients();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setSeeding(false);
    }
  };

  const handleClearData = async () => {
    const confirmed =
      Platform.OS === "web"
        ? window.confirm("Apagar TODOS os pacientes e avaliações locais? Esta ação não pode ser desfeita.")
        : await new Promise<boolean>((resolve) =>
            Alert.alert("Apagar dados", "Apagar TODOS os pacientes e avaliações locais? Esta ação não pode ser desfeita.", [
              { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
              { text: "Apagar", style: "destructive", onPress: () => resolve(true) },
            ])
          );
    if (confirmed) {
      setClearing(true);
      try {
        await clearAllData();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } finally {
        setClearing(false);
      }
    }
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    analista: "Analista",
    agente_saude: "Agente de Saúde",
    gestor: "Gestor",
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
      paddingHorizontal: 16,
      paddingBottom: 20,
      backgroundColor: colors.primary,
    },
    appBar: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 10,
    },
    logoBox: {
      width: 36,
      height: 36,
      borderRadius: 9,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    appName: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#fff",
      justifyContent: "center",
      textAlign: "center",
      marginTop: 20,
    },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 16 },
    userCard: {
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    avatarCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "rgba(255,255,255,0.3)",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
    userName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
    userEmail: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
    userRoleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 4,
    },
    userRole: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
    adminBadge: {
      backgroundColor: "#fbbf24",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    adminBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#78350f" },
    section: { paddingHorizontal: 16, marginTop: 24 },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    rowLast: { borderBottomWidth: 0 },
    rowLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: colors.foreground },
    rowValue: { fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    inputLabel: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    inputBox: {
      backgroundColor: admin ? colors.muted : colors.background,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: admin ? colors.foreground : colors.mutedForeground,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: admin ? colors.border : colors.border,
    },
    hint: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 14,
    },
    lockedHint: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "#fef3c7",
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
    },
    lockedHintText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: "#92400e",
      flex: 1,
    },
    saveBtn: {
      backgroundColor: saved ? "#16a34a" : colors.primary,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: "center",
    },
    saveBtnDisabled: {
      backgroundColor: colors.muted,
    },
    saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
    logoutBtn: {
      backgroundColor: "#fee2e2",
      borderRadius: 14,
      padding: 16,
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 16,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    logoutText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.destructive },
  });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          {/* App bar */}
          <View style={s.appBar}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 80, height: 80, marginBottom: -30}}
              resizeMode="contain"
            />
            <Text style={s.appName}>Nexos</Text>
          </View>

          <Text style={s.title}>Configurações</Text>
          <View style={s.userCard}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarText}>
                {user?.nome?.charAt(0).toUpperCase() ?? "U"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{user?.nome}</Text>
              <Text style={s.userEmail}>{user?.email}</Text>
              <View style={s.userRoleRow}>
                <Text style={s.userRole}>{roleLabels[user?.role ?? ""] ?? user?.role}</Text>
                {admin && (
                  <View style={s.adminBadge}>
                    <Text style={s.adminBadgeText}>ADMIN</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Sync status */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sincronização</Text>
          <View style={s.card}>
            <View style={s.row}>
              <View style={[s.statusDot, { backgroundColor: isOnline ? "#4ade80" : "#f87171" }]} />
              <Text style={s.rowLabel}>Conexão com servidor</Text>
              <Text style={s.rowValue}>{isOnline ? "Online" : "Offline"}</Text>
            </View>
            <View style={s.row}>
              <Feather name="clock" size={14} color={colors.mutedForeground} />
              <Text style={s.rowLabel}>Itens pendentes</Text>
              <Text style={[s.rowValue, pendingCount > 0 && { color: "#ca8a04" }]}>
                {pendingCount} item(s)
              </Text>
            </View>
            <View style={[s.row, s.rowLast]}>
              <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
              <Text style={s.rowLabel}>Última sincronização</Text>
              <Text style={s.rowValue}>
                {lastSync
                  ? lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                  : "—"}
              </Text>
            </View>
          </View>
          <Pressable
            style={[
              s.saveBtn,
              { marginTop: 10 },
              isSyncing && s.saveBtnDisabled,
            ]}
            onPress={syncNow}
            disabled={isSyncing}
          >
            <Text style={s.saveBtnText}>
              {isSyncing ? "Sincronizando..." : "Sincronizar agora"}
            </Text>
          </Pressable>
        </View>

        {/* API config — admin only */}
        {/*<View style={s.section}>
          <Text style={s.sectionTitle}>Servidor</Text>
          <View style={s.card}>
            <View style={[s.row, s.rowLast, { flexDirection: "column", alignItems: "stretch" }]}>
              <Text style={s.inputLabel}>URL da API .NET</Text>

              {!admin && (
                <View style={s.lockedHint}>
                  <Feather name="lock" size={13} color="#92400e" />
                  <Text style={s.lockedHintText}>
                    Apenas administradores podem alterar o servidor.
                  </Text>
                </View>
              )}

              <TextInput
                style={s.inputBox}
                placeholder={envApiUrl || "http://192.168.1.100:5000"}
                placeholderTextColor={colors.mutedForeground}
                value={apiUrl}
                onChangeText={admin ? setApiUrl : undefined}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                editable={admin}
              />

              {admin && (
                <Text style={s.hint}>
                  {apiUrl.trim()
                    ? "Override manual ativo — sobrepõe o valor padrão do build."
                    : envApiUrl
                    ? `Usando URL do build: ${envApiUrl}`
                    : "Endereço do servidor .NET com SQL Server."}
                  {"\n"}
                  Deixe em branco para usar o valor padrão do build.
                </Text>
              )}

              {admin && (
                <Pressable
                  style={[s.saveBtn, saved && { backgroundColor: "#16a34a" }]}
                  onPress={saveApiUrl}
                >
                  <Text style={s.saveBtnText}>
                    {saved ? "✓ Salvo!" : apiUrl.trim() ? "Salvar override" : "Salvar (usar padrão do build)"}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View> */}

        {/* How offline works */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Modo Offline</Text>
          <View style={s.card}>
            <View style={s.row}>
              <Feather name="wifi-off" size={14} color={colors.mutedForeground} />
              <Text style={[s.rowLabel, { fontSize: 13 }]}>
                Sem conexão → dados salvos localmente
              </Text>
            </View>
            <View style={s.row}>
              <Feather name="wifi" size={14} color="#16a34a" />
              <Text style={[s.rowLabel, { fontSize: 13 }]}>
                Online → pendentes enviados automaticamente
              </Text>
            </View>
            <View style={[s.row, s.rowLast]}>
              <Feather name="refresh-cw" size={14} color={colors.primary} />
              <Text style={[s.rowLabel, { fontSize: 13 }]}>
                Verificação automática a cada 30 segundos
              </Text>
            </View>
          </View>
        </View>

        {/* Session & Demo Data */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sessão Atual</Text>
          <View style={s.card}>
            <View style={s.row}>
              <Feather name="user" size={14} color={colors.mutedForeground} />
              <Text style={s.rowLabel}>Usuário</Text>
              <Text style={s.rowValue}>{user?.nome ?? "—"}</Text>
            </View>
            <View style={s.row}>
              <Feather name="shield" size={14} color={colors.mutedForeground} />
              <Text style={s.rowLabel}>Perfil</Text>
              <Text style={s.rowValue}>{roleLabels[user?.role ?? ""] ?? user?.role}</Text>
            </View>
            <View style={s.row}>
              <Feather name="mail" size={14} color={colors.mutedForeground} />
              <Text style={s.rowLabel}>Email</Text>
              <Text style={[s.rowValue, { fontSize: 12 }]}>{user?.email ?? "—"}</Text>
            </View>
            <View style={[s.row, s.rowLast]}>
              <Feather name="key" size={14} color={colors.mutedForeground} />
              <Text style={s.rowLabel}>Token</Text>
              <Text style={[s.rowValue, { fontSize: 11, maxWidth: 180 }]} numberOfLines={1}>
                demo_token_{user?.role}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Dados Locais</Text>
          <View style={s.card}>
            <View style={s.row}>
              <Feather name="users" size={14} color={colors.mutedForeground} />
              <Text style={s.rowLabel}>Pacientes cadastrados</Text>
              <Text style={[s.rowValue, { fontFamily: "Inter_700Bold", color: colors.primary }]}>
                {patients.length}
              </Text>
            </View>
            <View style={[s.row, s.rowLast]}>
              <Feather name="clipboard" size={14} color={colors.mutedForeground} />
              <Text style={s.rowLabel}>Avaliações realizadas</Text>
              <Text style={[s.rowValue, { fontFamily: "Inter_700Bold", color: colors.primary }]}>
                {evaluations.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Pacientes cadastrados */}
        {patients.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Pacientes no Dispositivo</Text>
            <View style={s.card}>
              {patients.map((p, i) => (
                <View key={p.id} style={[s.row, i === patients.length - 1 && s.rowLast]}>
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: colors.primary + "20",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: colors.primary }}>
                      {p.nome.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                      {p.nome}
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                      {p.cpf ? `CPF: ${p.cpf}` : ""}
                      {p.carteiraSus ? `${p.cpf ? "  ·  " : ""}SUS: ${p.carteiraSus}` : ""}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: p.syncStatus === "synced" ? "#dcfce7" : "#fef9c3",
                    borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2,
                  }}>
                    <Text style={{ fontSize: 9, fontFamily: "Inter_600SemiBold",
                      color: p.syncStatus === "synced" ? "#16a34a" : "#ca8a04" }}>
                      {p.syncStatus === "synced" ? "SYNC" : "PENDING"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Groups */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Grupos de Atendimento</Text>
          <View style={s.card}>
            {DEMO_GROUPS.map((g, i) => {
              const patCount = patients.filter((p) => p.groupId === g.id).length;
              const gColors = [colors.primary, "#9333ea"];
              const gBg = ["#dbeafe", "#f3e8ff"];
              return (
                <View key={g.id} style={[s.row, i === DEMO_GROUPS.length - 1 && s.rowLast]}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: gBg[i % 2],
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Feather name="map-pin" size={14} color={gColors[i % 2]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                      {g.nome}
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                      {g.unidade}
                    </Text>
                  </View>
                  <Text style={[s.rowValue, { fontFamily: "Inter_700Bold", color: gColors[i % 2] }]}>
                    {patCount} pac.
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Agents */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Agentes de Saúde ({DEMO_AGENTS.length})</Text>
          <View style={s.card}>
            {DEMO_AGENTS.map((a, i) => {
              const evalCount = evaluations.filter((e) => e.avaliadorId === a.id).length;
              return (
                <View key={a.id} style={[s.row, i === DEMO_AGENTS.length - 1 && s.rowLast]}>
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: colors.accent,
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: colors.primary }}>
                      {a.nome.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[s.rowLabel, { fontSize: 13 }]}>{a.nome}</Text>
                  {evalCount > 0 && (
                    <View style={{ backgroundColor: "#dbeafe", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: colors.primary }}>
                        {evalCount} aval.
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Seed & Clear */}
        <View style={[s.section, { flexDirection: "row", gap: 10 }]}>
          <Pressable
            style={[{
              flex: 1, backgroundColor: "#dbeafe", borderRadius: 14,
              paddingVertical: 13, alignItems: "center",
              flexDirection: "row", justifyContent: "center", gap: 7,
            }, seeding && { opacity: 0.6 }]}
            onPress={handleSeed}
            disabled={seeding}
          >
            {seeding ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather name="database" size={15} color={colors.primary} />
            )}
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.primary }}>
              Seed demo completo
            </Text>
          </Pressable>

          <Pressable
            style={[{
              flex: 1, backgroundColor: "#fee2e2", borderRadius: 14,
              paddingVertical: 13, alignItems: "center",
              flexDirection: "row", justifyContent: "center", gap: 7,
            }, clearing && { opacity: 0.6 }]}
            onPress={handleClearData}
            disabled={clearing}
          >
            {clearing ? (
              <ActivityIndicator size="small" color={colors.destructive} />
            ) : (
              <Feather name="trash-2" size={15} color={colors.destructive} />
            )}
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.destructive }}>
              Limpar dados
            </Text>
          </Pressable>
        </View>

        <Pressable style={s.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={s.logoutText}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
