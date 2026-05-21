import React, { useCallback } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { usePersonalContacts } from "@/context/PersonalContactsContext";
import {
  PERSONAL_CATEGORY_META,
} from "@/constants/personalCategories";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const AVATAR_COLORS: [string, string][] = [
  ["#F5E8EF", "#8B3059"],
  ["#EEE8F5", "#5E3090"],
  ["#E8F5F0", "#1F7A55"],
  ["#F5F0E8", "#8B6220"],
  ["#F0E8F5", "#6B3090"],
];

function getAvatarColors(name: string): [string, string] {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function PersonalDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getContact, deleteContact } = usePersonalContacts();

  const contact = getContact(id);

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Remove Contact",
      `Remove ${contact?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
            await deleteContact(id);
            router.back();
          },
        },
      ]
    );
  }, [contact, deleteContact, id, router]);

  if (!contact) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.navBar, { paddingTop: topPad }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Contact not found
          </Text>
        </View>
      </View>
    );
  }

  const meta = PERSONAL_CATEGORY_META[contact.category];
  const [avatarBg, avatarText] = getAvatarColors(contact.name);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Nav bar */}
      <View
        style={[
          styles.navBar,
          {
            paddingTop: topPad + 8,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.navActions}>
          <Pressable
            onPress={() => router.push(`/personal-form?id=${contact.id}`)}
            style={({ pressed }) => [
              styles.navAction,
              {
                backgroundColor: colors.secondary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="edit-2" size={16} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.navAction,
              { backgroundColor: "#FEE2E2", opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 : insets.bottom + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: meta.bg }]}>
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={[styles.initials, { color: avatarText }]}>
              {getInitials(contact.name)}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {contact.name}
          </Text>
          {contact.relationship ? (
            <Text style={[styles.relationship, { color: meta.text }]}>
              {contact.relationship}
            </Text>
          ) : null}
          <View style={[styles.catPill, { backgroundColor: "#fff" }]}>
            <Text style={[styles.catPillText, { color: meta.text }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        {/* Contact info */}
        {(contact.phone || contact.email) ? (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.sectionLabel, { color: colors.mutedForeground }]}
            >
              CONTACT INFO
            </Text>
            {contact.phone ? (
              <View
                style={[
                  styles.infoRow,
                  { borderBottomColor: colors.border, borderBottomWidth: contact.email ? 1 : 0 },
                ]}
              >
                <View
                  style={[styles.infoIcon, { backgroundColor: meta.bg }]}
                >
                  <Feather name="phone" size={16} color={meta.text} />
                </View>
                <View style={styles.infoContent}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Phone
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: colors.foreground }]}
                  >
                    {contact.phone}
                  </Text>
                </View>
              </View>
            ) : null}
            {contact.email ? (
              <View
                style={[styles.infoRow, { borderBottomWidth: 0 }]}
              >
                <View
                  style={[styles.infoIcon, { backgroundColor: meta.bg }]}
                >
                  <Feather name="mail" size={16} color={meta.text} />
                </View>
                <View style={styles.infoContent}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Email
                  </Text>
                  <Text
                    style={[styles.infoValue, { color: colors.foreground }]}
                  >
                    {contact.email}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Birthday */}
        {contact.birthday ? (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.sectionLabel, { color: colors.mutedForeground }]}
            >
              BIRTHDAY
            </Text>
            <View style={styles.birthdayRow}>
              <Text style={styles.birthdayCake}>🎂</Text>
              <Text
                style={[styles.birthdayText, { color: colors.foreground }]}
              >
                {contact.birthday}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Notes */}
        {contact.notes ? (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.sectionLabel, { color: colors.mutedForeground }]}
            >
              NOTES
            </Text>
            <Text style={[styles.notesText, { color: colors.foreground }]}>
              {contact.notes}
            </Text>
          </View>
        ) : null}

        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          Added{" "}
          {new Date(contact.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navActions: { flexDirection: "row", gap: 8 },
  navAction: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  scroll: { padding: 16, gap: 12 },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  initials: {
    fontSize: 26,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  relationship: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 100,
    marginTop: 4,
  },
  catPillText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  birthdayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  birthdayCake: { fontSize: 22 },
  birthdayText: {
    fontSize: 17,
    fontFamily: "Inter_500Medium",
  },
  notesText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 4,
  },
});
