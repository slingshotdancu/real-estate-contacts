import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Stage, STAGE_META } from "@/constants/stages";

interface StageTagProps {
  stage: Stage;
  size?: "sm" | "md";
}

export function StageTag({ stage, size = "md" }: StageTagProps) {
  const meta = STAGE_META[stage];
  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: meta.bg },
        isSmall && styles.pillSmall,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: meta.text },
          isSmall && styles.labelSmall,
        ]}
      >
        {meta.label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  pillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  labelSmall: {
    fontSize: 10,
  },
});
