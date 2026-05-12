const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const authMiddleware = require("../middlewares/auth");
const { mapProductsImage } = require("../helpers/imageMapper");

/* ======================= DASHBOARD ======================= */
router.get("/dashboard", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const userId = req.user.id;

    if (isAdmin) {
      const [
        { count: totalUsers },
        { count: totalSellers },
        { count: totalProducts },
        { count: totalOrders },
        { data: todayOrders },
        { data: completedOrdersData },
        { data: pendingOrdersData },
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
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("shops").select("balance").eq("id", 1).single(),
      ]);

      const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_price, 0) || 0;
      const totalRevenue = completedOrdersData.reduce((sum, o) => sum + o.total_price, 0) || 0;
      const platformRevenue = platformShop?.balance || 0;

      return res.json({
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        todayRevenue,
        totalRevenue,
        platformRevenue,
        pendingOrders: pendingOrdersData?.length || 0,
        completedOrders: completedOrdersData?.length || 0
      });
    } else {
      // Logic dành cho SELLER
      const { data: shop } = await supabase
        .from("shops")
        .select("id, balance")
        .eq("owner_id", userId)
        .single();
      
      if (!shop) return res.status(404).json({ message: "Shop not found" });

      // 1. Lấy tất cả order_items thuộc shop này kèm theo status của order
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("order_id, total_price, orders!inner(status, created_at)")
        .eq("products.shop_id", shop.id);

      const totalProductsCount = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shop.id);

      // 2. Phân loại đơn hàng theo status
      const uniqueOrderIds = new Set();
      const pendingOrderIds = new Set();
      const completedOrderIds = new Set();

      orderItems?.forEach(item => {
        uniqueOrderIds.add(item.order_id);
        if (item.orders.status === "pending") pendingOrderIds.add(item.order_id);
        if (item.orders.status === "completed") completedOrderIds.add(item.order_id);
      });

      // 3. Tính doanh thu 7 ngày qua
      const dailyRevenue = {};
      const dayNames = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
      
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        dailyRevenue[dateStr] = { name: dayNames[d.getDay()], revenue: 0 };
      }

      orderItems?.forEach(item => {
        if (item.orders.status === "completed") {
          const dateStr = item.orders.created_at.split("T")[0];
          if (dailyRevenue[dateStr]) {
            dailyRevenue[dateStr].revenue += item.total_price;
          }
        }
      });

      return res.json({
        totalProducts: totalProductsCount.count || 0,
        totalOrders: uniqueOrderIds.size,
        totalRevenue: shop.balance || 0,
        todayRevenue: 0,
        platformRevenue: 0,
        pendingOrders: pendingOrderIds.size,
        completedOrders: completedOrderIds.size,
        chartData: Object.values(dailyRevenue)
      });
    }
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

router.post("/products", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { name, price, description, image, category_id } = req.body;
    let shopId = req.body.shop_id;

    if (req.user.role === "seller") {
      // Seller chỉ được đăng vào shop của mình
      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", req.user.id)
        .single();
      
      if (!shop) return res.status(403).json({ message: "Bạn chưa có cửa hàng" });
      shopId = shop.id;
    } else if (!shopId) {
      shopId = 1; // Mặc định cho Admin là shop hệ thống
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        price,
        description: description || "Chưa có mô tả",
        image: image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category_id: category_id || 1,
        shop_id: shopId
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Không thể tạo sản phẩm" });
  }
});

/* ======================= PRODUCTS MANAGEMENT ======================= */
router.get("/products", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    let query = supabase
      .from("products")
      .select("id, name, price, description, category_id, image, created_at, shops(id, name)")
      .order("created_at", { ascending: false });

    if (req.user.role === "seller") {
      // Tìm shop của seller này
      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", req.user.id)
        .single();
      
      if (shop) {
        query = query.eq("shop_id", shop.id);
      } else {
        return res.json([]); // Không có shop thì không có sản phẩm
      }
    }

    const { data } = await query;
    res.json(mapProductsImage(data));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Product
router.put("/products/:id", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { name, price, description, image, category_id } = req.body;
    const productId = req.params.id;

    // Kiểm tra quyền sở hữu nếu là seller
    if (req.user.role === "seller") {
      const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", req.user.id).single();
      const { data: product } = await supabase.from("products").select("shop_id").eq("id", productId).single();
      
      if (!shop || !product || product.shop_id !== shop.id) {
        return res.status(403).json({ message: "Không có quyền chỉnh sửa sản phẩm này" });
      }
    }

    const { data, error } = await supabase
      .from("products")
      .update({ name, price, description, image, category_id })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Lỗi cập nhật sản phẩm" });
  }
});

/* ======================= PRODUCT VARIANTS ======================= */
// Get Variants
router.get("/products/:id/variants", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", req.params.id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tải biến thể" });
  }
});

// Add Variant
router.post("/products/:id/variants", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { size, color, price, stock, image } = req.body;
    const productId = req.params.id;

    if (req.user.role === "seller") {
      const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", req.user.id).single();
      const { data: product } = await supabase.from("products").select("shop_id").eq("id", productId).single();
      if (!shop || !product || product.shop_id !== shop.id) return res.status(403).json({ message: "Access denied" });
    }

    const { data, error } = await supabase
      .from("product_variants")
      .insert({ product_id: productId, size, color, price, stock, image })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi thêm biến thể" });
  }
});

// Update Variant
router.put("/variants/:id", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { size, color, price, stock, image } = req.body;
    const variantId = req.params.id;

    if (req.user.role === "seller") {
      const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", req.user.id).single();
      const { data: variant } = await supabase.from("product_variants").select("products(shop_id)").eq("id", variantId).single();
      if (!shop || !variant || variant.products.shop_id !== shop.id) return res.status(403).json({ message: "Access denied" });
    }

    const { data, error } = await supabase
      .from("product_variants")
      .update({ size, color, price, stock, image })
      .eq("id", variantId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật biến thể" });
  }
});

// Delete Variant
router.delete("/variants/:id", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const variantId = req.params.id;

    if (req.user.role === "seller") {
      const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", req.user.id).single();
      const { data: variant } = await supabase.from("product_variants").select("products(shop_id)").eq("id", variantId).single();
      if (!shop || !variant || variant.products.shop_id !== shop.id) return res.status(403).json({ message: "Access denied" });
    }

    const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
    if (error) throw error;
    res.json({ message: "Variant deleted" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa biến thể" });
  }
});

router.delete("/products/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    const productId = req.params.id;

    // 1. Tìm các biến thể liên quan
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);
    
    if (variants && variants.length > 0) {
      const variantIds = variants.map(v => v.id);
      
      // 2. Xóa các mục trong đơn hàng (Dành cho môi trường test/dev)
      await supabase.from("order_items").delete().in("variant_id", variantIds);
    }

    // 3. Xóa dữ liệu trong giỏ hàng (Cart)
    await supabase.from("cart_items").delete().eq("product_id", productId);

    // 4. Xóa đánh giá (Reviews)
    await supabase.from("reviews").delete().eq("product_id", productId);

    // 5. Xóa các biến thể (Variants)
    await supabase.from("product_variants").delete().eq("product_id", productId);

    // 6. Xóa sản phẩm chính
    const { error: prodErr } = await supabase.from("products").delete().eq("id", productId);
    if (prodErr) throw prodErr;

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("FORCE DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Lỗi hệ thống khi xóa sản phẩm" });
  }
});

/* ======================= ORDERS MANAGEMENT ======================= */
router.get("/orders", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    let query = supabase
      .from("orders")
      .select("id, status, total_price, created_at, users(name, email)")
      .order("created_at", { ascending: false });

    if (req.user.role === "seller") {
      // 1. Lấy shop_id của seller
      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", req.user.id)
        .single();
      
      if (!shop) return res.json([]);

      // 2. Lấy danh sách order_id có chứa sản phẩm của shop này
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("order_id, products!inner(shop_id)")
        .eq("products.shop_id", shop.id);
      
      const orderIds = [...new Set(orderItems.map(item => item.order_id))];
      
      if (orderIds.length === 0) return res.json([]);
      
      query = query.in("id", orderIds);
    }

    const { data } = await query;
    res.json(data);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
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

/* ======================= ORDERS MANAGEMENT ======================= */
router.get("/orders", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    let query = supabase
      .from("orders")
      .select("*, users(name, email), order_items(*, products(*))")
      .order("created_at", { ascending: false });

    if (req.user.role === "seller") {
      // Tìm shop của seller này
      const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", req.user.id).single();
      // Lọc các order có chứa sản phẩm của shop này
      query = query.filter("order_items.products.shop_id", "eq", shop.id);
    }

    const { data } = await query;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/orders/:id/status", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= VOUCHERS MANAGEMENT ======================= */
router.get("/vouchers", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { data } = await supabase.from("vouchers").select("*").order("created_at", { ascending: false });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/vouchers", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { code, discount_percent, max_discount, min_order, expired_at } = req.body;
    const { data, error } = await supabase.from("vouchers").insert({
      code, discount_percent, max_discount, min_order, expired_at
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/vouchers/:id", authMiddleware(["admin"]), async (req, res) => {
  try {
    await supabase.from("vouchers").delete().eq("id", req.params.id);
    res.json({ message: "Voucher deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= CATEGORIES MANAGEMENT ======================= */
router.get("/categories", authMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { data } = await supabase.from("categories").select("*").order("name");
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/categories", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const { data, error } = await supabase.from("categories").insert({ name, icon, description }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= SHOPS MANAGEMENT ======================= */
router.get("/shops", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { data } = await supabase.from("shops").select("*, users(name, email, is_active)").order("created_at", { ascending: false });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/shops/:id/toggle-active", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { data: shop } = await supabase.from("shops").select("owner_id").eq("id", req.params.id).single();
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const { data: user } = await supabase.from("users").select("is_active").eq("id", shop.owner_id).single();
    const { data } = await supabase.from("users").update({ is_active: !user.is_active }).eq("id", shop.owner_id).select().single();
    
    res.json({ id: req.params.id, is_active: data.is_active });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
