const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// GET /user/profile
router.get("/profile", authMiddleware(), async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, phone, avatar, role")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /user/profile
router.put("/profile", authMiddleware(), async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ name, phone, avatar })
      .eq("id", req.user.id)
      .select("id, email, name, avatar, phone, role")
      .single();

    if (error) {
      console.error("UPDATE PROFILE ERROR:", error);
      return res.status(400).json({ message: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /user/upload-avatar
router.post(
  "/upload-avatar",
  authMiddleware(),
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không có file được gửi lên" });
      }

      const userId = req.user.id;
      const fileExt = req.file.mimetype.split("/")[1] || "jpg";
      const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return res.status(500).json({
          message: "Upload lên Supabase thất bại",
          details: error.message,
        });
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      res.json({
        success: true,
        avatarUrl: urlData.publicUrl,
      });
    } catch (err) {
      console.error("Upload avatar route error:", err);
      res.status(500).json({ message: "Lỗi server khi upload avatar" });
    }
  }
);

module.exports = router;
