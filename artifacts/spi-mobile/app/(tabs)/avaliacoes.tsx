import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
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
import { useDb } from "@/context/DbContext";
import { FORMS } from "@/constants/forms";
import { useColors } from "@/hooks/useColors";

type ClsFilter = "all" | "none" | "mild" | "severe";
type PeriodFilter = "all" | "today" | "week" | "month";

const CLS_CHIPS: { key: ClsFilter; label: string; color: string; bg: string }[] = [
  { key: "all",    label: "Todos",      color: "#6b7280", bg: "#f3f4f6" },
  { key: "none",   label: "Sem TEA",    color: "#16a34a", bg: "#dcfce7" },
  { key: "mild",   label: "Leve/Mod.",  color: "#ca8a04", bg: "#fef9c3" },
  { key: "severe", label: "Grave",      color: "#dc2626", bg: "#fee2e2" },
];

const PERIOD_CHIPS: { key: PeriodFilter; label: string }[] = [
  { key: "all",   label: "Todos" },
  { key: "today", label: "Hoje" },
  { key: "week",  label: "7 dias" },
  { key: "month", label: "30 dias" },
];

function getLevel(score: number, formId: number | null): "none" | "mild" | "severe" {
  const form = FORMS.find((f) => f.id === (formId ?? 1)) ?? FORMS[0];
  const cls = form.classify(score);
  if (cls.level === "low") return "none";
  if (cls.level === "medium") return "mild";
  return "severe";
}

function getClsInfo(score: number, formId: number | null) {
  const form = FORMS.find((f) => f.id === (formId ?? 1)) ?? FORMS[0];
  return form.classify(score);
}

function isWithinPeriod(dateStr: string, period: PeriodFilter): boolean {
  if (period === "all") return true;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (period === "today") return days < 1 && date.getDate() === now.getDate();
  if (period === "week")  return days <= 7;
  if (period === "month") return days <= 30;
  return true;
}

function FilterChip({
  label,
  active,
  color,
  bg,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  bg?: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: active ? (bg ?? colors.primary + "18") : colors.muted,
        borderWidth: active ? 1.5 : 1,
        borderColor: active ? (color ?? colors.primary) : "transparent",
        marginRight: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
          color: active ? (color ?? colors.primary) : colors.mutedForeground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function AvaliacoesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { canCreateEvaluations, user } = useAuth();
  const { evaluations } = useDb();

  const [search, setSearch] = useState("");
  const [clsFilter, setClsFilter] = useState<ClsFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [avaliadorFilter, setAvaliadorFilter] = useState<string>("all");

  // Unique avaliadores from the data
  const avaliadores = useMemo(() => {
    const names = new Set(evaluations.map((e) => e.avaliadorNome).filter(Boolean));
    return Array.from(names) as string[];
  }, [evaluations]);

  const showAvaliadorFilter = avaliadores.length > 1;

  const filtered = useMemo(() => {
    return evaluations
      .filter((e) => {
        if (search) {
          const q = search.toLowerCase();
          const matchName = e.patientNome.toLowerCase().includes(q);
          const matchCls  = e.classificacao.toLowerCase().includes(q);
          const matchAval = e.avaliadorNome.toLowerCase().includes(q);
          if (!matchName && !matchCls && !matchAval) return false;
        }
        if (clsFilter !== "all") {
          const level = getLevel(e.scoreTotal, e.formId ?? null);
          if (level !== clsFilter) return false;
        }
        if (periodFilter !== "all") {
          if (!isWithinPeriod(e.dataAvaliacao, periodFilter)) return false;
        }
        if (avaliadorFilter !== "all") {
          if (e.avaliadorNome !== avaliadorFilter) return false;
        }
        return true;
      })
      .sort((a, b) =>
        new Date(b.dataAvaliacao).getTime() - new Date(a.dataAvaliacao).getTime()
      );
  }, [evaluations, search, clsFilter, periodFilter, avaliadorFilter]);

  const activeFiltersCount = [
    clsFilter !== "all",
    periodFilter !== "all",
    avaliadorFilter !== "all",
  ].filter(Boolean).length;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    title: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      flex: 1,
    },
    addBtn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      padding: 8,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 12,
      gap: 8,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
    },
    filterSection: {
      marginBottom: 4,
    },
    filterLabel: {
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    item: {
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginHorizontal: 16,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemMain: {
      flexDirection: "row",
      alignItems: "center",
    },
    scoreCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      flexShrink: 0,
    },
    patientName: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    itemFooter: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    footerItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    footerText: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    syncBadge: {
      marginLeft: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: "#fef9c3",
    },
    syncBadgeText: {
      fontSize: 9,
      fontFamily: "Inter_600SemiBold",
      color: "#92400e",
    },
    formBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
    },
    listFooter: {
      height: Platform.OS === "web" ? 34 : insets.bottom + 16,
    },
    countBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
  });

  return (
    <View style={s.container}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.title}>Avaliações</Text>
          {canCreateEvaluations() && (
            <Pressable style={s.addBtn} onPress={() => router.push("/nova-avaliacao")}>
              <Feather name="plus" size={20} color="#fff" />
            </Pressable>
          )}
        </View>

        {/* Search */}
        <View style={s.searchBar}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar paciente, avaliador ou classificação..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Classification filter */}
        <View style={s.filterSection}>
          <Text style={s.filterLabel}>Classificação</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CLS_CHIPS.map((chip) => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                active={clsFilter === chip.key}
                color={chip.color}
                bg={chip.bg}
                onPress={() => setClsFilter(chip.key)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Period filter */}
        <View style={[s.filterSection, { marginTop: 10 }]}>
          <Text style={s.filterLabel}>Período</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PERIOD_CHIPS.map((chip) => (
              <FilterChip
                key={chip.key}
                label={chip.label}
                active={periodFilter === chip.key}
                onPress={() => setPeriodFilter(chip.key)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Avaliador filter (only if multiple avaliadores) */}
        {showAvaliadorFilter && (
          <View style={[s.filterSection, { marginTop: 10 }]}>
            <Text style={s.filterLabel}>Avaliador</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterChip
                label="Todos"
                active={avaliadorFilter === "all"}
                onPress={() => setAvaliadorFilter("all")}
              />
              {avaliadores.map((nome) => (
                <FilterChip
                  key={nome}
                  label={nome}
                  active={avaliadorFilter === nome}
                  onPress={() => setAvaliadorFilter(nome)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ── Count bar ──────────────────────────────────── */}
      <View style={s.countBar}>
        <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
          {filtered.length} avaliação{filtered.length !== 1 ? "ões" : ""}
          {activeFiltersCount > 0 ? ` · ${activeFiltersCount} filtro${activeFiltersCount > 1 ? "s" : ""} ativo${activeFiltersCount > 1 ? "s" : ""}` : ""}
        </Text>
        {activeFiltersCount > 0 && (
          <Pressable
            onPress={() => {
              setClsFilter("all");
              setPeriodFilter("all");
              setAvaliadorFilter("all");
              setSearch("");
            }}
          >
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.primary }}>
              Limpar filtros
            </Text>
          </Pressable>
        )}
      </View>

      {/* ── List ───────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 2 }}
        ListFooterComponent={<View style={s.listFooter} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Feather name="clipboard" size={40} color={colors.border} />
            <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 12 }}>
              Nenhuma avaliação
            </Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginTop: 4 }}>
              {activeFiltersCount > 0 || search ? "Tente ajustar os filtros" : "Inicie uma nova avaliação"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const cls = getClsInfo(item.scoreTotal, item.formId ?? null);
          const form = FORMS.find((f) => f.id === (item.formId ?? 1)) ?? FORMS[0];
          const dateStr = new Date(item.dataAvaliacao).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "short", year: "numeric",
          });
          const timeStr = new Date(item.dataAvaliacao).toLocaleTimeString("pt-BR", {
            hour: "2-digit", minute: "2-digit",
          });

          return (
            <Pressable
              style={({ pressed }) => [s.item, { opacity: pressed ? 0.9 : 1 }]}
              onPress={() => router.push(`/avaliacao/${item.id}`)}
            >
              {/* Main row */}
              <View style={s.itemMain}>
                <View style={[s.scoreCircle, { backgroundColor: cls.color }]}>
                  <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" }}>
                    {item.scoreTotal}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={s.patientName} numberOfLines={1}>
                      {item.patientNome}
                    </Text>
                    {item.syncStatus === "pending" && (
                      <View style={s.syncBadge}>
                        <Text style={s.syncBadgeText}>PENDENTE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: cls.color, marginTop: 2 }}>
                    {item.classificacao}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </View>

              {/* Footer row */}
              <View style={s.itemFooter}>
                {/* Date + time */}
                <View style={s.footerItem}>
                  <Feather name="calendar" size={11} color={colors.mutedForeground} />
                  <Text style={s.footerText}>{dateStr} · {timeStr}</Text>
                </View>

                {/* Avaliador */}
                {item.avaliadorNome ? (
                  <View style={s.footerItem}>
                    <Feather name="user" size={11} color={colors.mutedForeground} />
                    <Text style={s.footerText} numberOfLines={1}>{item.avaliadorNome}</Text>
                  </View>
                ) : null}

                {/* Form badge */}
                <View style={{ marginLeft: "auto" }}>
                  <View style={[s.formBadge, { backgroundColor: form.accentColor + "18" }]}>
                    <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: form.accentColor }}>
                      {form.shortName}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
