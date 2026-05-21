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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useColors } from "@/hooks/useColors";
import { usePersonalContacts } from "@/context/PersonalContactsContext";
import {
  PersonalCategory,
  PERSONAL_CATEGORY_META,
  ALL_PERSONAL_CATEGORIES,
} from "@/constants/personalCategories";

export default function PersonalFormScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getContact, addContact, updateContact } = usePersonalContacts();

  const existing = id ? getContact(id) : undefined;
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [relationship, setRelationship] = useState(
    existing?.relationship ?? ""
  );
  const [birthday, setBirthday] = useState(existing?.birthday ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [category, setCategory] = useState<PersonalCategory>(
    existing?.category ?? "friend"
  );

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a name.");
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const data = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      relationship: relationship.trim(),
      birthday: birthday.trim(),
      notes: notes.trim(),
      category,
    };
    if (isEditing && existing) {
      await updateContact(existing.id, data);
    } else {
      await addContact(data);
    }
    router.back();
  }, [
    name,
    phone,
    email,
    relationship,
    birthday,
    notes,
    category,
    isEditing,
    existing,
    addContact,
    updateContact,
    router,
  ]);

  const activeMeta = PERSONAL_CATEGORY_META[category];

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
          style={({ pressed }) => [
            styles.headerBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text
            style={[
              styles.headerBtnText,
              { color: colors.mutedForeground },
            ]}
          >
            Cancel
          </Text>
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isEditing ? "Edit Person" : "Add Person"}
        </Text>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveBtn,
            {
              backgroundColor: activeMeta.text,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.saveBtnText}>Save</Text>
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
        {/* Category selector */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            CATEGORY
          </Text>
          <View style={styles.categoryRow}>
            {ALL_PERSONAL_CATEGORIES.map((cat) => {
              const meta = PERSONAL_CATEGORY_META[cat];
              const active = category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: active ? meta.bg : colors.card,
                      borderColor: active ? meta.text : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
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
            placeholder="e.g. Karen Hackler"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            returnKeyType="next"
            autoCapitalize="words"
          />
        </View>

        {/* Relationship */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            RELATIONSHIP
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
            placeholder="e.g. Mom, Best Friend, College Roommate"
            placeholderTextColor={colors.mutedForeground}
            value={relationship}
            onChangeText={setRelationship}
            returnKeyType="next"
            autoCapitalize="words"
          />
        </View>

        {/* Phone */}
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

        {/* Email */}
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

        {/* Birthday */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            🎂 BIRTHDAY
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
            placeholder="e.g. March 12 or 03/12"
            placeholderTextColor={colors.mutedForeground}
            value={birthday}
            onChangeText={setBirthday}
            returnKeyType="next"
          />
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
            placeholder="Favorite things, reminders, anything worth remembering..."
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
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
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
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1.5,
  },
  catChipText: { fontSize: 13 },
});
