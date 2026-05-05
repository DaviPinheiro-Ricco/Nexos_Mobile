import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
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
import { UserRole } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

type DemoRole = {
  role: UserRole;
  label: string;
  desc: string;
  color: string;
  bg: string;
  icon: string;
  badge: string;
};

const DEMO_ROLES: DemoRole[] = [
  {
    role: "admin",
    label: "Administrador",
    desc: "Acesso total: pacientes, avaliações, usuários e configurações do servidor.",
    color: "#7c3aed",
    bg: "#f5f3ff",
    icon: "shield",
    badge: "ADMIN",
  },
  {
    role: "gestor",
    label: "Gestor",
    desc: "Gerencia pacientes, avaliações e grupos. Sem acesso às configurações do servidor.",
    color: "#0369a1",
    bg: "#f0f9ff",
    icon: "briefcase",
    badge: "GESTOR",
  },
  {
    role: "agente_saude",
    label: "Agente de Saúde",
    desc: "Cadastra pacientes e realiza avaliações. Sem acesso ao dashboard analítico.",
    color: "#15803d",
    bg: "#f0fdf4",
    icon: "user",
    badge: "AGENTE",
  },
  {
    role: "analista",
    label: "Analista",
    desc: "Apenas leitura: visualiza dashboard, pacientes e avaliações existentes.",
    color: "#b45309",
    bg: "#fffbeb",
    icon: "bar-chart-2",
    badge: "ANALISTA",
  },
];

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, loginDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Informe email e senha.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      setError((e as Error).message || "Erro ao fazer login.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (d: DemoRole) => {
    setLoadingRole(d.role);
    try {
      await loginDemo(d.label, d.role);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // AuthGate in _layout.tsx detects user !== null and navigates to /(tabs)
    } catch {
      setError("Erro ao entrar no modo demo.");
      setLoadingRole(null);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary },
    scroll: { flexGrow: 1, justifyContent: "center" },
    top: {
      paddingTop: Platform.OS === "web" ? 72 : insets.top + 56,
      paddingHorizontal: 32,
      paddingBottom: 28,
      alignItems: "center",
    },
    iconBg: {
      width: 74,
      height: 74,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    iconText: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#fff" },
    appName: {
      fontSize: 30,
      fontFamily: "Inter_700Bold",
      color: "#fff",
      marginBottom: 4,
      letterSpacing: 3,
    },
    subtitle: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.75)",
      textAlign: "center",
      lineHeight: 19,
    },
    card: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      padding: 24,
      paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 24,
      marginHorizontal: 10,
    },
    cardTitle: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 2,
    },
    label: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      marginBottom: 5,
      marginTop: 14,
    },
    input: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    error: {
      backgroundColor: "#fee2e2",
      borderRadius: 10,
      padding: 10,
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    errorText: { color: "#dc2626", fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 18,
    },
    btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 18,
      gap: 8,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground },
    demoToggle: {
      marginTop: 14,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 5,
    },
    demoToggleText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    demoBox: { marginTop: 14 },
    demoTitle: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 10,
      textAlign: "center",
    },
    roleCard: {
      borderRadius: 14,
      borderWidth: 1.5,
      padding: 14,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    roleIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    roleName: { fontSize: 14, fontFamily: "Inter_700Bold" },
    roleDesc: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 16 },
    roleBadge: {
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 3,
      alignSelf: "flex-start",
      marginTop: 4,
    },
    roleBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold" },
  });

  return (
    <View style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={s.top}>
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: 150, height: 150, marginBottom: -50 }}
              resizeMode="contain"
            />
            <Text style={s.appName}>Nexos</Text>
            <Text style={s.subtitle}>
              Sistema de Prevalência e Indicadores{"\n"}de Saúde
            </Text>
          </View>

          {/* Form card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Entrar</Text>
            <Text style={s.cardSubtitle}>Acesse com sua conta do servidor</Text>

            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              placeholder="seu@email.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={s.label}>Senha</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? (
              <View style={s.error}>
                <Feather name="alert-circle" size={15} color="#dc2626" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={[s.btn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Entrar</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>sem servidor</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Demo toggle */}
            {!showDemo ? (
              <Pressable onPress={() => setShowDemo(true)} style={s.demoToggle}>
                <Feather name="zap" size={13} color={colors.primary} />
                <Text style={s.demoToggleText}>Acesso de demonstração (offline)</Text>
              </Pressable>
            ) : (
              <View style={s.demoBox}>
                <Text style={s.demoTitle}>Escolha o perfil para demonstração</Text>

                {DEMO_ROLES.map((d) => (
                  <Pressable
                    key={d.role}
                    style={[
                      s.roleCard,
                      {
                        backgroundColor: d.bg,
                        borderColor: d.color + "50",
                        opacity: loadingRole && loadingRole !== d.role ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => handleDemo(d)}
                    disabled={loadingRole !== null}
                  >
                    <View style={[s.roleIcon, { backgroundColor: d.color + "20" }]}>
                      {loadingRole === d.role ? (
                        <ActivityIndicator size="small" color={d.color} />
                      ) : (
                        <Feather name={d.icon as any} size={18} color={d.color} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.roleName, { color: d.color }]}>{d.label}</Text>
                      <Text style={[s.roleDesc, { color: d.color + "cc" }]}>{d.desc}</Text>
                      <View style={[s.roleBadge, { backgroundColor: d.color + "20" }]}>
                        <Text style={[s.roleBadgeText, { color: d.color }]}>{d.badge}</Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={16} color={d.color + "80"} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
