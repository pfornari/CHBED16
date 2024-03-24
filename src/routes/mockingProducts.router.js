import { Router } from "express";
import { getMockProducts } from "../controllers/mockingProducts.controller.js";

const router = Router();

router.get("/", getMockProducts);

export default router;
