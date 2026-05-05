import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useDb } from "@/context/DbContext";
import { useSync } from "@/context/SyncContext";
import { getClassification } from "@/constants/questions";
import { useColors } from "@/hooks/useColors";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  analista: "Analista",
  agente_saude: "Agente de Saúde",
  gestor: "Gestor",
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, canViewEvaluations, canCreateEvaluations } = useAuth();
  const { patients, evaluations } = useDb();
  const { isOnline, isSyncing, pendingCount, syncNow } = useSync();

  const totalEvals = evaluations.length;
  const avgScore = totalEvals
    ? Math.round((evaluations.reduce((s, e) => s + e.scoreTotal, 0) / totalEvals) * 10) / 10
    : 0;

  const noTea = evaluations.filter((e) => e.scoreTotal <= 29.5).length;
  const mild = evaluations.filter((e) => e.scoreTotal > 29.5 && e.scoreTotal < 37).length;
  const severe = evaluations.filter((e) => e.scoreTotal >= 37).length;

  const recentEvals = [...evaluations]
    .sort((a, b) => new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime())
    .slice(0, 5);

  const webPaddingBottom = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
      paddingBottom: 24,
      paddingHorizontal: 20,
    },
    appBar: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    logoBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    logoText: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    appName: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    appSubName: {
      fontSize: 10,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.7)",
      marginTop: 1,
    },
    syncBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      gap: 5,
      marginLeft: "auto" as any,
    },
    syncDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    syncText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: "#fff",
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: 14,
      padding: 12,
      marginBottom: 16,
      gap: 12,
    },
    avatarCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255,255,255,0.25)",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    userName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
    userRole: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.75)",
      marginTop: 2,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 14,
      padding: 12,
      alignItems: "center",
    },
    statNum: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    statLabel: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.8)",
      textAlign: "center",
      marginTop: 2,
    },
    content: {
      padding: 16,
      paddingBottom: webPaddingBottom,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 12,
      marginTop: 4,
    },
    distRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },
    distCard: {
      flex: 1,
      borderRadius: 14,
      padding: 14,
      alignItems: "center",
    },
    distNum: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
    },
    distLabel: {
      fontSize: 10,
      fontFamily: "Inter_500Medium",
      textAlign: "center",
      marginTop: 3,
    },
    quickBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickBtnIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    quickBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    quickBtnSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 1,
    },
    evalItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    evalScore: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    evalScoreText: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: "#fff",
    },
    evalPatient: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    evalClass: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    evalDate: {
      marginLeft: "auto" as any,
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    pendingBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fef9c3",
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      gap: 8,
    },
    pendingText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: "#92400e",
      flex: 1,
    },
    syncBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: "#f59e0b",
      borderRadius: 8,
    },
    syncBtnText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#fff",
    },
  });

  return (
    <View style={s.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isSyncing} onRefresh={syncNow} />
        }
      >
        {/* Header */}
        <View style={s.header}>
          {/* App bar with logo */}
          <View style={s.appBar}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 100, height: 150, marginBottom: -10 }}
              resizeMode="contain"
            />
            <View>
              <Text style={s.appName}>Nexos</Text>
              <Text style={s.appSubName}>Sistema de Prevalência e Indicadores</Text>
            </View>
            <Pressable style={s.syncBadge} onPress={syncNow}>
              {isSyncing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View
                  style={[
                    s.syncDot,
                    { backgroundColor: isOnline ? "#4ade80" : "#f87171" },
                  ]}
                />
              )}
              <Text style={s.syncText}>
                {isSyncing ? "Sincronizando..." : isOnline ? "Online" : "Offline"}
              </Text>
            </Pressable>
          </View>

          {/* User card */}
          <View style={s.userRow}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarText}>
                {user?.nome?.charAt(0).toUpperCase() ?? "U"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{user?.nome ?? "Usuário"}</Text>
              <Text style={s.userRole}>
                {ROLE_LABELS[user?.role ?? ""] ?? user?.role ?? ""}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statNum}>{patients.length}</Text>
              <Text style={s.statLabel}>Pacientes</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statNum}>{totalEvals}</Text>
              <Text style={s.statLabel}>Avaliações</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statNum}>{totalEvals ? avgScore : "—"}</Text>
              <Text style={s.statLabel}>Score médio</Text>
            </View>
          </View>
        </View>

        <View style={s.content}>
          {/* Pending banner */}
          {pendingCount > 0 && (
            <View style={s.pendingBanner}>
              <Feather name="clock" size={16} color="#92400e" />
              <Text style={s.pendingText}>
                {pendingCount} item(s) pendente(s) para sincronizar
              </Text>
              <Pressable style={s.syncBtn} onPress={syncNow}>
                <Text style={s.syncBtnText}>Sincronizar</Text>
              </Pressable>
            </View>
          )}

          {/* Classification Distribution */}
          {totalEvals > 0 && (
            <>
              <Text style={s.sectionTitle}>Distribuição TEA</Text>
              <View style={s.distRow}>
                <View style={[s.distCard, { backgroundColor: "#dcfce7" }]}>
                  <Text style={[s.distNum, { color: "#16a34a" }]}>{noTea}</Text>
                  <Text style={[s.distLabel, { color: "#15803d" }]}>Sem TEA</Text>
                </View>
                <View style={[s.distCard, { backgroundColor: "#fef9c3" }]}>
                  <Text style={[s.distNum, { color: "#ca8a04" }]}>{mild}</Text>
                  <Text style={[s.distLabel, { color: "#a16207" }]}>Leve/Mod.</Text>
                </View>
                <View style={[s.distCard, { backgroundColor: "#fee2e2" }]}>
                  <Text style={[s.distNum, { color: "#dc2626" }]}>{severe}</Text>
                  <Text style={[s.distLabel, { color: "#b91c1c" }]}>Grave</Text>
                </View>
              </View>
            </>
          )}

          {/* Quick actions */}
          <Text style={s.sectionTitle}>Ações rápidas</Text>

          {/* Nova Avaliação — visible to all authenticated users */}
          <Pressable
            style={s.quickBtn}
            onPress={() => router.push("/nova-avaliacao")}
          >
            <View style={[s.quickBtnIcon, { backgroundColor: "#dbeafe" }]}>
              <Feather name="plus-circle" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={s.quickBtnText}>Nova Avaliação</Text>
              <Text style={s.quickBtnSub}>Iniciar formulário SPI (14 questões)</Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.mutedForeground}
              style={{ marginLeft: "auto" as any }}
            />
          </Pressable>

          <Pressable
            style={s.quickBtn}
            onPress={() => router.push("/(tabs)/avaliacoes")}
          >
            <View style={[s.quickBtnIcon, { backgroundColor: "#f3e8ff" }]}>
              <Feather name="list" size={20} color="#9333ea" />
            </View>
            <View>
              <Text style={s.quickBtnText}>Ver Avaliações</Text>
              <Text style={s.quickBtnSub}>{totalEvals} registro(s)</Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.mutedForeground}
              style={{ marginLeft: "auto" as any }}
            />
          </Pressable>

          <Pressable
            style={s.quickBtn}
            onPress={() => router.push("/(tabs)/pacientes")}
          >
            <View style={[s.quickBtnIcon, { backgroundColor: "#d1fae5" }]}>
              <Feather name="users" size={20} color="#059669" />
            </View>
            <View>
              <Text style={s.quickBtnText}>Pacientes</Text>
              <Text style={s.quickBtnSub}>{patients.length} cadastrado(s)</Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.mutedForeground}
              style={{ marginLeft: "auto" as any }}
            />
          </Pressable>

          {/* Recent evaluations */}
          {recentEvals.length > 0 && (
            <>
              <Text style={[s.sectionTitle, { marginTop: 8 }]}>Avaliações Recentes</Text>
              {recentEvals.map((e) => {
                const cls = getClassification(e.scoreTotal);
                return (
                  <Pressable
                    key={e.id}
                    style={s.evalItem}
                    onPress={() => router.push(`/avaliacao/${e.id}`)}
                  >
                    <View style={[s.evalScore, { backgroundColor: cls.color }]}>
                      <Text style={s.evalScoreText}>{e.scoreTotal}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.evalPatient} numberOfLines={1}>
                        {e.patientNome}
                      </Text>
                      <Text style={s.evalClass}>{e.classificacao}</Text>
                    </View>
                    <Text style={s.evalDate}>
                      {new Date(e.dataAvaliacao).toLocaleDateString("pt-BR")}
                    </Text>
                  </Pressable>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
