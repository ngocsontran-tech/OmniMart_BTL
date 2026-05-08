const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const authMiddleware = require("../middlewares/auth");
const { mapProductsImage } = require("../helpers/imageMapper");

/* ======================= DASHBOARD ======================= */
router.get("/dashboard", authMiddleware(["admin"]), async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalSellers },
      { count: totalProducts },
      { count: totalOrders },
      { data: todayOrders },
      { data: completedOrders },
      { data: platformShop },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "seller"),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("total_price")
        .gte("created_at", new Date().toISOString().split("T")[0]),
      supabase.from("orders").select("total_price").eq("status", "completed"),
      supabase.from("shops").select("balance").eq("id", 1).single(),
    ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_price, 0) || 0;
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_price, 0) || 0;
    const platformRevenue = platformShop?.balance || 0;

    res.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      todayRevenue,
      totalRevenue,
      platformRevenue,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= USERS MANAGEMENT ======================= */
router.get("/users", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = supabase
      .from("users")
      .select("id, email, name, phone, role, is_active, created_at");

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    res.json({ data, total: count || 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/users/:id/toggle-active", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("is_active")
      .eq("id", req.params.id)
      .single();
    const { data } = await supabase
      .from("users")
      .update({ is_active: !user.is_active })
      .eq("id", req.params.id)
      .select("id, is_active")
      .single();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/users/:id/role", authMiddleware(["admin"]), async (req, res) => {
  const { role } = req.body;
  if (!["customer", "seller", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  const { data } = await supabase
    .from("users")
    .update({ role })
    .eq("id", req.params.id)
    .select("id, role")
    .single();
  res.json(data);
});

/* ======================= PRODUCTS MANAGEMENT ======================= */
router.get("/products", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, image, created_at, shops(name)")
      .order("created_at", { ascending: false });
    res.json(mapProductsImage(data));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/products/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    await supabase.from("product_variants").delete().eq("product_id", req.params.id);
    await supabase.from("products").delete().eq("id", req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= ORDERS MANAGEMENT ======================= */
router.get("/orders", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { data } = await supabase
      .from("orders")
      .select("id, status, total_price, created_at, users(name, email)")
      .order("created_at", { ascending: false });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= PASSWORD RESET REQUESTS ======================= */
router.get("/password-requests", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("password_reset_requests")
      .select(`
        id, email, full_name, phone, status, requested_at,
        users!user_id (name, phone)
      `)
      .order("requested_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("GET PASSWORD REQUESTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/password-requests/:id/process", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    const fixedPassword = "123456";
    const hash = await bcrypt.hash(fixedPassword, 10);

    const { data: request, error: reqError } = await supabase
      .from("password_reset_requests")
      .select("user_id, email")
      .eq("id", id)
      .single();

    if (reqError || !request.user_id) {
      return res.status(400).json({ message: "Không tìm thấy tài khoản hợp lệ để reset" });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hash })
      .eq("id", request.user_id);

    if (updateError) throw updateError;

    const { error: statusError } = await supabase
      .from("password_reset_requests")
      .update({
        status: "processed",
        processed_at: new Date(),
        processed_by: req.user.id,
        new_password_plain: fixedPassword,
      })
      .eq("id", id);

    if (statusError) throw statusError;

    res.json({
      message: "Đã cấp mật khẩu mới thành công",
      newPassword: fixedPassword,
      email: request.email,
    });
  } catch (err) {
    console.error("PROCESS PASSWORD REQUEST ERROR:", err);
    res.status(500).json({ message: "Lỗi xử lý yêu cầu" });
  }
});

router.delete("/password-requests/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("password_reset_requests")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "Đã xóa yêu cầu thành công" });
  } catch (err) {
    console.error("DELETE PASSWORD REQUEST ERROR:", err);
    res.status(500).json({ message: "Lỗi xóa yêu cầu" });
  }
});

module.exports = router;
