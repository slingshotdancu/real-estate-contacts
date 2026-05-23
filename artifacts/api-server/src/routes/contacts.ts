import { Router } from "express";
import { db } from "@workspace/db";
import { contactsTable, insertContactSchema, updateContactSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/contacts - Get all contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await db.select().from(contactsTable);
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

// GET /api/contacts/:id - Get a single contact
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const [contact] = await db
      .select()
      .from(contactsTable)
      .where(eq(contactsTable.id, id));

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
});

// POST /api/contacts - Create a new contact
router.post("/", async (req, res, next) => {
  try {
    const validatedData = insertContactSchema.parse(req.body);

    const [newContact] = await db
      .insert(contactsTable)
      .values(validatedData)
      .returning();

    res.status(201).json(newContact);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Validation error", details: error });
    }
    next(error);
  }
});

// PUT /api/contacts/:id - Update a contact
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const validatedData = updateContactSchema.parse(req.body);

    const [updatedContact] = await db
      .update(contactsTable)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(contactsTable.id, id))
      .returning();

    if (!updatedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(updatedContact);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Validation error", details: error });
    }
    next(error);
  }
});

// DELETE /api/contacts/:id - Delete a contact
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const [deletedContact] = await db
      .delete(contactsTable)
      .where(eq(contactsTable.id, id))
      .returning();

    if (!deletedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully", contact: deletedContact });
  } catch (error) {
    next(error);
  }
});

export default router;