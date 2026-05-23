import { Router } from "express";
import healthRouter from "./health";
import contactsRouter from "./contacts";
import personalRouter from "./personal";

const router = Router();

router.use("/health", healthRouter);
router.use("/contacts", contactsRouter);
router.use("/personal", personalRouter);

export default router;