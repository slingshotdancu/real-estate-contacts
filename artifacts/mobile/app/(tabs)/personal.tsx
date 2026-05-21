import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { usePersonalContacts } from "@/context/PersonalContactsContext";
import { PersonalContactCard } from "@/components/PersonalContactCard";
import {
  PersonalCategory,
  PERSONAL_CATEGORY_META,
  ALL_PERSONAL_CATEGORIES,
} from "@/constants/personalCategories";

type Filter = "all" | PersonalCategory;

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: "all", label: "Everyone" },
  ...ALL_PERSONAL_CATEGORIES.map((c) => ({
    value: c as Filter,
    label: PERSONAL_CATEGORY_META[c].label,
  })),
];

export default function PersonalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { contacts, loading } = usePersonalContacts();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = contacts;
    if (filter !== "all") list = list.filter((c) => c.category === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.relationship.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, search, filter]);

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Personal
            </Text>
            <Text
              style={[styles.headerSub, { color: colors.mutedForeground }]}
            >
              Friends & Family
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/personal-form")}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: "#8B3059", opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="plus" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search people..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Category filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            const meta =
              opt.value !== "all"
                ? PERSONAL_CATEGORY_META[opt.value as PersonalCategory]
                : null;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setFilter(opt.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active
                      ? meta
                        ? meta.bg
                        : "#F5E8EF"
                      : colors.card,
                    borderColor: active
                      ? meta
                        ? meta.text
                        : "#8B3059"
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: active
                        ? meta
                          ? meta.text
                          : "#8B3059"
                        : colors.mutedForeground,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#8B3059" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            filtered.length === 0 && styles.listEmpty,
            {
              paddingBottom:
                Platform.OS === "web" ? 34 : insets.bottom + 24,
            },
          ]}
          scrollEnabled={!!filtered.length}
          renderItem={({ item }) => (
            <PersonalContactCard
              contact={item}
              onPress={() => router.push(`/personal/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: "#F5E8EF" },
                ]}
              >
                <Text style={styles.emptyEmoji}>💛</Text>
              </View>
              <Text
                style={[styles.emptyTitle, { color: colors.foreground }]}
              >
                {search || filter !== "all"
                  ? "No one found"
                  : "No people yet"}
              </Text>
              <Text
                style={[styles.emptySub, { color: colors.mutedForeground }]}
              >
                {search || filter !== "all"
                  ? "Try adjusting your search or filter"
                  : "Tap + to add a friend or family member"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
    marginTop: 1,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  filterRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: { padding: 16 },
  listEmpty: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingTop: 80,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyEmoji: { fontSize: 30 },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
