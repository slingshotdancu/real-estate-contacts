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
import { useContacts } from "@/context/ContactsContext";
import { StageTag } from "@/components/StageTag";
import { STAGE_META, STAGE_PROGRESSION, Stage } from "@/constants/stages";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function DetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getContact, deleteContact } = useContacts();

  const contact = getContact(id);

  const topPad =
    Platform.OS === "web"
      ? Math.max(insets.top, 67)
      : insets.top;

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Contact",
      `Remove ${contact?.name} from your contacts?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
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

  const stageIndex = STAGE_PROGRESSION.indexOf(contact.stage as Stage);
  const showProgression =
    contact.stage !== "inactive" && stageIndex !== -1;

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
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.navActions}>
          <Pressable
            onPress={() => router.push(`/form?id=${contact.id}`)}
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
              {
                backgroundColor: "#FEE2E2",
                opacity: pressed ? 0.7 : 1,
              },
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
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: colors.navy }]}>
            <Text style={[styles.initials, { color: colors.primary }]}>
              {getInitials(contact.name)}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {contact.name}
          </Text>
          <StageTag stage={contact.stage} size="md" />
        </View>

        {/* Stage progression */}
        {showProgression ? (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              BUYING JOURNEY
            </Text>
            <View style={styles.progression}>
              {STAGE_PROGRESSION.map((s, i) => {
                const meta = STAGE_META[s];
                const isPast = i <= stageIndex;
                const isCurrent = i === stageIndex;
                const isLast = i === STAGE_PROGRESSION.length - 1;
                return (
                  <React.Fragment key={s}>
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepDot,
                          {
                            backgroundColor: isPast
                              ? meta.text
                              : colors.border,
                            borderColor: isPast ? meta.text : colors.border,
                            transform: [{ scale: isCurrent ? 1.3 : 1 }],
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.stepLabel,
                          {
                            color: isPast
                              ? meta.text
                              : colors.mutedForeground,
                            fontFamily: isCurrent
                              ? "Inter_600SemiBold"
                              : "Inter_400Regular",
                          },
                        ]}
                      >
                        {meta.label}
                      </Text>
                    </View>
                    {!isLast ? (
                      <View
                        style={[
                          styles.stepLine,
                          {
                            backgroundColor:
                              i < stageIndex ? colors.primary : colors.border,
                          },
                        ]}
                      />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Contact info */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            CONTACT INFO
          </Text>
          {contact.phone ? (
            <View
              style={[styles.infoRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Feather name="phone" size={16} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[styles.infoLabel, { color: colors.mutedForeground }]}
                >
                  Phone
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>
                  {contact.phone}
                </Text>
              </View>
            </View>
          ) : null}
          {contact.email ? (
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Feather name="mail" size={16} color={colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[styles.infoLabel, { color: colors.mutedForeground }]}
                >
                  Email
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>
                  {contact.email}
                </Text>
              </View>
            </View>
          ) : null}
          {!contact.phone && !contact.email ? (
            <Text style={[styles.emptyField, { color: colors.mutedForeground }]}>
              No contact info
            </Text>
          ) : null}
        </View>

        {/* Properties */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            POTENTIAL PROPERTIES
          </Text>
          {contact.properties.length > 0 ? (
            contact.properties.map((prop, idx) => (
              <View
                key={prop.id}
                style={[
                  styles.propRow,
                  {
                    borderBottomColor: colors.border,
                    borderBottomWidth:
                      idx < contact.properties.length - 1 ? 1 : 0,
                  },
                ]}
              >
                <View
                  style={[
                    styles.propNum,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text
                    style={[styles.propNumText, { color: colors.primary }]}
                  >
                    {idx + 1}
                  </Text>
                </View>
                <Text
                  style={[styles.propAddress, { color: colors.foreground }]}
                >
                  {prop.address}
                </Text>
              </View>
            ))
          ) : (
            <Text
              style={[styles.emptyField, { color: colors.mutedForeground }]}
            >
              No properties added yet
            </Text>
          )}
        </View>

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

        {/* Meta */}
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
  hero: { alignItems: "center", gap: 10, paddingVertical: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
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
  progression: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  stepLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginBottom: 18,
    marginHorizontal: -2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
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
  propRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  propNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  propNumText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  propAddress: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 20,
  },
  emptyField: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
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
