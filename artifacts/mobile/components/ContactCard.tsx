import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { StageTag } from "@/components/StageTag";
import { Contact } from "@/context/ContactsContext";

interface ContactCardProps {
  contact: Contact;
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

export function ContactCard({ contact, onPress }: ContactCardProps) {
  const colors = useColors();

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
      <View style={[styles.avatar, { backgroundColor: colors.navy }]}>
        <Text style={[styles.initials, { color: colors.primary }]}>
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
          <StageTag stage={contact.stage} size="sm" />
        </View>

        {contact.phone ? (
          <View style={styles.infoRow}>
            <Feather name="phone" size={13} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              {contact.phone}
            </Text>
          </View>
        ) : null}

        {contact.email ? (
          <View style={styles.infoRow}>
            <Feather name="mail" size={13} color={colors.mutedForeground} />
            <Text
              style={[styles.infoText, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {contact.email}
            </Text>
          </View>
        ) : null}

        {contact.properties.length > 0 ? (
          <View style={styles.infoRow}>
            <Feather name="home" size={13} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              {contact.properties.length}{" "}
              {contact.properties.length === 1 ? "property" : "properties"}
            </Text>
          </View>
        ) : null}
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
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
});
