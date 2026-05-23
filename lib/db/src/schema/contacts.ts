import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const contactsTable = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  notes: text("notes").default(""),
  properties: jsonb("properties").$type<Array<{ id: string; address: string }>>().default([]),
  stage: text("stage").notNull().default("lead"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const personalContactsTable = pgTable("personal_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  notes: text("notes").default(""),
  category: text("category").notNull().default("other"), // family, close_friend, friend, neighbor, other
  relationship: text("relationship").default(""), // e.g., "Mom", "Best friend from college"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contactsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true 
});

export const updateContactSchema = insertContactSchema.partial();

export const insertPersonalContactSchema = createInsertSchema(personalContactsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true 
});

export const updatePersonalContactSchema = insertPersonalContactSchema.partial();