import express from "express";
const router = express.Router();

router.post("/fingerprint/scan", (req, res) => {
  const { image } = req.body; // "data:image/png;base64,...."
  if (!image) return res.status(400).json({ error: "No image provided" });

  const buffer = Buffer.from(image.replace(/^data:image\/png;base64,/, ""), "base64");

  // TODO: this is where enroll-vs-identify logic goes — see question below

  res.json({ received: buffer.length });
});

export default router;