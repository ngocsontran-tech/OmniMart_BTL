const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const authMiddleware = require("../middlewares/auth");
const { PLATFORM_FEE_PERCENT, PLATFORM_SHOP_ID } = require("../config/constants");
const { mapProductImage, mapShopLogo } = require("../helpers/imageMapper");

/* ======================= SELLER REGISTER ======================= */
router.post("/register", authMiddleware(), async (req, res) => {
  try {
    if (req.user.role === "seller") {
      return res.status(400).json({ message: "Already a seller" });
    }

    const { name, description, logo } = req.body;
    if (!name) return res.status(400).json({ message: "Shop name required" });

    const { data: shop, error } = await supabase
      .from("shops")
      .insert({ owner_id: req.user.id, name, description, logo })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("users").update({ role: "seller" }).eq("id", req.user.id);

    res.json(mapShopLogo(shop));
  } catch (err) {
    console.error("SELLER REGISTER ERROR:", err);
    res.status(500).json({ message: "Cannot register shop" });
  }
});

/* ======================= GET SHOP INFO ======================= */
router.get("/shop", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("owner_id", req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ message: "Shop not found" });

    res.json(mapShopLogo(data));
  } catch (err) {
    console.error("GET SHOP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= UPDATE SHOP ======================= */
router.put("/shop", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { name, description, logo } = req.body;

    const updateObj = {};
    if (name) updateObj.name = name;
    if (description) updateObj.description = description;
    if (logo) updateObj.logo = logo;

    const { data, error } = await supabase
      .from("shops")
      .update(updateObj)
      .eq("owner_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(mapShopLogo(data));
  } catch (err) {
    console.error("UPDATE SHOP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= SELLER PRODUCTS ======================= */
router.get("/products", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const { data, error } = await supabase
      .from("products")
      .select(`
        id, name, price, image, description, category_id, created_at,
        product_variants ( id, size, color, price, stock )
      `)
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = data.map((product) => ({
      ...mapProductImage(product),
      product_variants: product.product_variants || [],
    }));

    res.json(mapped);
  } catch (err) {
    console.error("SELLER PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= ADD PRODUCT ======================= */
router.post("/products", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { category_id, name, description, price, image } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });

    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    if (shopError || !shop) {
      return res.status(403).json({
        message: "Bạn chưa có cửa hàng. Vui lòng đăng ký cửa hàng trước.",
      });
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        shop_id: shop.id,
        category_id,
        name,
        description,
        price: price || 0,
        image,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(mapProductImage(data));
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: "Cannot add product", detail: err.message });
  }
});

/* ======================= UPDATE PRODUCT ======================= */
router.put("/products/:id", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { name, description, price, image, category_id } = req.body;

    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    const { data: product } = await supabase
      .from("products")
      .select("shop_id")
      .eq("id", req.params.id)
      .single();

    if (!product || product.shop_id !== shop.id)
      return res.status(403).json({ message: "Not your product" });

    const updateObj = {};
    if (name) updateObj.name = name;
    if (description) updateObj.description = description;
    if (price !== undefined) updateObj.price = price;
    if (image) updateObj.image = image;
    if (category_id) updateObj.category_id = category_id;

    const { data, error } = await supabase
      .from("products")
      .update(updateObj)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(mapProductImage(data));
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= DELETE PRODUCT ======================= */
router.delete("/products/:id", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    const { data: product } = await supabase
      .from("products")
      .select("shop_id")
      .eq("id", req.params.id)
      .single();

    if (!product || product.shop_id !== shop.id) {
      return res.status(403).json({ message: "Not your product" });
    }

    const { error } = await supabase.from("products").delete().eq("id", req.params.id);
    if (error) throw error;

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= ADD PRODUCT VARIANT ======================= */
router.post("/products/:product_id/variants", authMiddleware(["seller"]), async (req, res) => {
  try {
    const productId = Number(req.params.product_id);

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ message: "product_id không hợp lệ" });
    }

    const { size, color, price, stock, image } = req.body;

    if (price == null || stock == null) {
      return res.status(400).json({
        message: "Cần cung cấp price và stock",
        required: ["price", "stock"],
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Price phải là số không âm" });
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ message: "Stock phải là số nguyên không âm" });
    }

    // Lấy shop của seller
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    if (shopError || !shop) {
      return res.status(403).json({
        message: "Bạn chưa sở hữu cửa hàng nào hoặc không có quyền seller",
      });
    }

    // Kiểm tra sản phẩm thuộc shop
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, shop_id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    if (product.shop_id !== shop.id) {
      return res.status(403).json({ message: "Sản phẩm không thuộc cửa hàng của bạn" });
    }

    // Thêm variant
    const { data: newVariant, error: insertError } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        size: size || null,
        color: color || null,
        price: parsedPrice,
        stock: parsedStock,
        image: image || null,
      })
      .select("id, product_id, size, color, price, stock, image")
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(400).json({
        message: "Không thể thêm variant",
        error: insertError.message,
        hint: insertError.hint || "Kiểm tra lại dữ liệu",
      });
    }

    res.status(201).json({
      message: "Đã thêm biến thể thành công",
      variant: newVariant,
    });
  } catch (err) {
    console.error("ADD VARIANT CRASH:", err);
    res.status(500).json({
      message: "Lỗi server khi thêm biến thể",
      error: err.message,
    });
  }
});

/* ======================= UPDATE VARIANT ======================= */
router.put("/variants/:id", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { size, color, price, stock, image } = req.body;

    const { data: variant } = await supabase
      .from("product_variants")
      .select("product_id, products ( shop_id )")
      .eq("id", req.params.id)
      .single();

    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    if (!variant || variant.products.shop_id !== shop.id)
      return res.status(403).json({ message: "Not your variant" });

    const updateObj = {};
    if (size) updateObj.size = size;
    if (color) updateObj.color = color;
    if (price) updateObj.price = price;
    if (stock !== undefined) updateObj.stock = stock;
    if (image) updateObj.image = image;

    const { data, error } = await supabase
      .from("product_variants")
      .update(updateObj)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("UPDATE VARIANT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= DELETE VARIANT ======================= */
router.delete("/variants/:id", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { data: variant } = await supabase
      .from("product_variants")
      .select("product_id, products ( shop_id )")
      .eq("id", req.params.id)
      .single();

    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    if (!variant || variant.products.shop_id !== shop.id)
      return res.status(403).json({ message: "Not your variant" });

    const { error } = await supabase.from("product_variants").delete().eq("id", req.params.id);
    if (error) throw error;

    res.json({ message: "Variant deleted" });
  } catch (err) {
    console.error("DELETE VARIANT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= SELLER ORDERS ======================= */
router.get("/orders", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select(`
        id, quantity, price, variant_id, order_id,
        product_variants!inner (
          size, color,
          products!inner ( name, image )
        ),
        orders!inner (
          id, created_at, status, total_price, address_id, user_id,
          payments ( status, method ),
          addresses ( full_name, phone, address ),
          users ( name, phone )
        )
      `)
      .eq("product_variants.products.shop_id", shop.id);

    if (error) {
      console.error("SUPABASE QUERY ERROR:", error);
      throw error;
    }

    if (!orderItems || orderItems.length === 0) {
      return res.json([]);
    }

    // Group by order_id
    const ordersMap = {};

    orderItems.forEach((item) => {
      const order = item.orders;
      const orderId = order.id;

      if (!ordersMap[orderId]) {
        ordersMap[orderId] = {
          id: order.id,
          created_at: order.created_at,
          status: order.status,
          total_price: order.total_price,
          address: order.addresses || { full_name: "Không rõ", phone: "", address: "" },
          customer: order.users || { name: "Khách lẻ", phone: "" },
          payment: order.payments?.[0] || { status: "pending", method: "cod" },
          items: [],
        };
      }

      const product = item.product_variants.products;
      const variant = item.product_variants;

      ordersMap[orderId].items.push({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        variant_id: item.variant_id,
        size: variant.size || null,
        color: variant.color || null,
        product_name: product.name || "Sản phẩm",
        product_image: product.image ? mapProductImage(product).image : null,
      });
    });

    const orders = Object.values(ordersMap).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.json(orders);
  } catch (err) {
    console.error("SELLER ORDERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================= SELLER UPDATE ORDER STATUS ======================= */
router.put("/orders/:id/status", authMiddleware(["seller"]), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["shipped", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const orderId = req.params.id;

    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    if (!shop) return res.status(404).json({ message: "Không tìm thấy cửa hàng" });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("status, total_price")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    // Kiểm tra quyền
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("variant_id")
      .eq("order_id", orderId)
      .limit(1)
      .maybeSingle();

    if (!orderItem) {
      return res.status(404).json({ message: "Đơn hàng trống" });
    }

    const { data: variant } = await supabase
      .from("product_variants")
      .select("product_id")
      .eq("id", orderItem.variant_id)
      .maybeSingle();

    if (!variant) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const { data: product } = await supabase
      .from("products")
      .select("shop_id")
      .eq("id", variant.product_id)
      .maybeSingle();

    if (!product || product.shop_id !== shop.id) {
      return res.status(403).json({ message: "Đây không phải đơn hàng của bạn" });
    }

    if (status === "shipped") {
      if (order.status === "shipped") {
        return res.json({ message: "Đơn đã được giao trước đó" });
      }

      const platformFee = order.total_price * PLATFORM_FEE_PERCENT;
      const shopRevenue = order.total_price * (1 - PLATFORM_FEE_PERCENT);

      // Cộng tiền cho shop
      const { data: currentShop, error: shopError } = await supabase
        .from("shops")
        .select("balance")
        .eq("id", shop.id)
        .single();

      if (shopError || !currentShop) {
        return res.status(500).json({ message: "Lỗi lấy balance shop" });
      }

      const newShopBalance = Number(currentShop.balance || 0) + shopRevenue;

      const { error: shopUpdateError } = await supabase
        .from("shops")
        .update({ balance: newShopBalance })
        .eq("id", shop.id);

      if (shopUpdateError) throw shopUpdateError;

      console.log(
        `Đơn #${orderId} → Shop nhận ${shopRevenue.toLocaleString()}₫ | Sàn thu ${platformFee.toLocaleString()}₫`
      );
    }

    // Cập nhật trạng thái đơn hàng
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (updateError) throw updateError;

    res.json({
      message:
        status === "shipped"
          ? "Đã giao hàng thành công! Doanh thu đã được chuyển cho shop"
          : "Đơn hàng đã được hủy",
    });
  } catch (err) {
    console.error("SELLER UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
