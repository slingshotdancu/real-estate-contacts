import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useColors } from "@/hooks/useColors";
import { useContacts } from "@/context/ContactsContext";
import { Property } from "@/context/ContactsContext";
import { Stage, STAGE_META, ALL_STAGES } from "@/constants/stages";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function FormScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getContact, addContact, updateContact } = useContacts();

  const existing = id ? getContact(id) : undefined;
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [stage, setStage] = useState<Stage>(existing?.stage ?? "prospect");
  const [properties, setProperties] = useState<Property[]>(
    existing?.properties ?? []
  );

  const topPad =
    Platform.OS === "web"
      ? Math.max(insets.top, 67)
      : insets.top;

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter the contact's name.");
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const data = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      stage,
      properties,
    };
    if (isEditing && existing) {
      await updateContact(existing.id, data);
    } else {
      await addContact(data);
    }
    router.back();
  }, [name, phone, email, notes, stage, properties, isEditing, existing, addContact, updateContact, router]);

  const addProperty = useCallback(() => {
    setProperties((prev) => [...prev, { id: generateId(), address: "" }]);
  }, []);

  const updateProperty = useCallback((propId: string, address: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propId ? { ...p, address } : p))
    );
  }, []);

  const removeProperty = useCallback((propId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propId));
  }, []);

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
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[styles.headerBtnText, { color: colors.mutedForeground }]}>
            Cancel
          </Text>
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isEditing ? "Edit Contact" : "New Contact"}
        </Text>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
            Save
          </Text>
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 : insets.bottom + 32,
          },
        ]}
      >
        {/* Name */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            FULL NAME *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="e.g. Sarah Johnson"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            returnKeyType="next"
            autoCapitalize="words"
          />
        </View>

        {/* Phone + Email */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            PHONE
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="(415) 555-0000"
            placeholderTextColor={colors.mutedForeground}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            EMAIL
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="name@email.com"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        {/* Stage */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            BUYING STAGE
          </Text>
          <View style={styles.stageRow}>
            {ALL_STAGES.map((s) => {
              const meta = STAGE_META[s];
              const active = stage === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setStage(s)}
                  style={[
                    styles.stageChip,
                    {
                      backgroundColor: active ? meta.bg : colors.card,
                      borderColor: active ? meta.text : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stageChipText,
                      {
                        color: active ? meta.text : colors.mutedForeground,
                        fontFamily: active
                          ? "Inter_600SemiBold"
                          : "Inter_400Regular",
                      },
                    ]}
                  >
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Properties */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            POTENTIAL PROPERTIES
          </Text>
          {properties.map((prop, idx) => (
            <View
              key={prop.id}
              style={[
                styles.propInputRow,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[styles.propNum, { backgroundColor: colors.secondary }]}
              >
                <Text style={[styles.propNumText, { color: colors.primary }]}>
                  {idx + 1}
                </Text>
              </View>
              <TextInput
                style={[styles.propInput, { color: colors.foreground }]}
                placeholder="Property address..."
                placeholderTextColor={colors.mutedForeground}
                value={prop.address}
                onChangeText={(t) => updateProperty(prop.id, t)}
                returnKeyType="next"
              />
              <Pressable
                onPress={() => removeProperty(prop.id)}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Feather name="x" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={addProperty}
            style={({ pressed }) => [
              styles.addPropBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.addPropText, { color: colors.primary }]}>
              Add Property
            </Text>
          </Pressable>
        </View>

        {/* Notes */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            NOTES
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="Preferences, budget, timeline, special notes..."
            placeholderTextColor={colors.mutedForeground}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  headerBtnText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  scroll: { padding: 20, gap: 20 },
  fieldGroup: { gap: 8 },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  notesInput: {
    minHeight: 110,
    paddingTop: 13,
  },
  stageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stageChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1.5,
  },
  stageChipText: {
    fontSize: 13,
  },
  propInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  propNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  propNumText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  propInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  addPropBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: "dashed",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  addPropText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
