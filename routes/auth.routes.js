import authService from "../services/auth.service.js";
import { Router } from "express";

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    let response = await authService.signup(req.body);
    return res.status(200).json({ success: true, data: response });
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const response = await authService.login(req.body);
    return res.status(200).json({ success: true, data: response });
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

export default router;
