import { Router } from "express";
import { db } from "@workspace/db";
import { personalContactsTable, insertPersonalContactSchema, updatePersonalContactSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/personal - Get all personal contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await db.select().from(personalContactsTable);
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

// GET /api/personal/:id - Get a single personal contact
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const [contact] = await db
      .select()
      .from(personalContactsTable)
      .where(eq(personalContactsTable.id, id));

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
});

// POST /api/personal - Create a new personal contact
router.post("/", async (req, res, next) => {
  try {
    const validatedData = insertPersonalContactSchema.parse(req.body);

    const [newContact] = await db
      .insert(personalContactsTable)
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

// PUT /api/personal/:id - Update a personal contact
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const validatedData = updatePersonalContactSchema.parse(req.body);

    const [updatedContact] = await db
      .update(personalContactsTable)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(personalContactsTable.id, id))
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

// DELETE /api/personal/:id - Delete a personal contact
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const [deletedContact] = await db
      .delete(personalContactsTable)
      .where(eq(personalContactsTable.id, id))
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