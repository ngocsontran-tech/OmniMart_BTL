const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const authMiddleware = require("../middlewares/auth");

// POST /checkout
router.post("/", authMiddleware(), async (req, res) => {
  try {
    const { address_id, payment_method = "cod", items } = req.body;

    if (!address_id) {
      return res.status(400).json({ message: "Missing address" });
    }

    let cartItemsToCheckout = [];

    // Nếu frontend gửi mảng items trực tiếp (như Web React LocalStorage)
    if (items && Array.isArray(items) && items.length > 0) {
      cartItemsToCheckout = items.map(item => ({
        variant_id: item.variantId || item.variant_id, // Support different naming
        price: item.price,
        quantity: item.quantity
      }));
    } else {
      // 1. Lấy cart từ DB (như Mobile App)
      const { data: dbCartItems } = await supabase
        .from("cart")
        .select(`
          id,
          quantity,
          product_variants (
            id,
            price
          )
        `)
        .eq("user_id", req.user.id);

      if (!dbCartItems || dbCartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      cartItemsToCheckout = dbCartItems.map(item => ({
        variant_id: item.product_variants.id,
        price: item.product_variants.price,
        quantity: item.quantity
      }));
    }

    if (cartItemsToCheckout.length === 0) {
      return res.status(400).json({ message: "No items to checkout" });
    }

    // 2. Tính tổng tiền
    const total_price = cartItemsToCheckout.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 3. Tạo ORDER
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: req.user.id,
        address_id,
        total_price,
        status: "pending",
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 4. Tạo ORDER ITEMS
    const orderItems = cartItemsToCheckout.map((item) => ({
      order_id: order.id,
      variant_id: item.variant_id,
      price: item.price,
      quantity: item.quantity,
    }));

    await supabase.from("order_items").insert(orderItems);

    // 5. Tạo PAYMENT
    await supabase.from("payments").insert({
      order_id: order.id,
      method: payment_method,
      status: "pending",
    });

    // 6. Xoá CART
    await supabase.from("cart").delete().eq("user_id", req.user.id);

    res.json({
      message: "Order created",
      order_id: order.id,
    });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ message: "Checkout failed" });
  }
});

module.exports = router;
