import React from "react";
import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { PersonalContact } from "@/context/PersonalContactsContext";
import {
  PERSONAL_CATEGORY_META,
} from "@/constants/personalCategories";

interface PersonalContactCardProps {
  contact: PersonalContact;
  onPress: () => void;
}

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

export function PersonalContactCard({
  contact,
  onPress,
}: PersonalContactCardProps) {
  const colors = useColors();
  const meta = PERSONAL_CATEGORY_META[contact.category];
  const [avatarBg, avatarText] = getAvatarColors(contact.name);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={[styles.initials, { color: avatarText }]}>
          {getInitials(contact.name)}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {contact.name}
          </Text>
          <View style={[styles.categoryPill, { backgroundColor: meta.bg }]}>
            <Text style={[styles.categoryText, { color: meta.text }]}>
              {meta.label.toUpperCase()}
            </Text>
          </View>
        </View>

        {contact.relationship ? (
          <Text
            style={[styles.relationship, { color: meta.text }]}
            numberOfLines={1}
          >
            {contact.relationship}
          </Text>
        ) : null}

        <View style={styles.detailRow}>
          {contact.phone ? (
            <View style={styles.infoChip}>
              <Feather name="phone" size={11} color={colors.mutedForeground} />
              <Text
                style={[styles.infoChipText, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {contact.phone}
              </Text>
            </View>
          ) : null}
          {contact.birthday ? (
            <View style={styles.infoChip}>
              <Text style={styles.birthdayIcon}>🎂</Text>
              <Text
                style={[styles.infoChipText, { color: colors.mutedForeground }]}
              >
                {contact.birthday}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Feather name="chevron-right" size={18} color={colors.border} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#1C1917",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  initials: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  relationship: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
  },
  detailRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 2,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoChipText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  birthdayIcon: {
    fontSize: 11,
  },
});
