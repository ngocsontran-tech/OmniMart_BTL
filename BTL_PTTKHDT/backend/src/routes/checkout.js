const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const authMiddleware = require("../middlewares/auth");

// POST /checkout
router.post("/", authMiddleware(), async (req, res) => {
  try {
    const { address_id, payment_method = "cod" } = req.body;

    if (!address_id) {
      return res.status(400).json({ message: "Missing address" });
    }

    // 1. Lấy cart
    const { data: cartItems } = await supabase
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

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Tính tổng tiền
    const total_price = cartItems.reduce(
      (sum, item) => sum + item.product_variants.price * item.quantity,
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
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      variant_id: item.product_variants.id,
      price: item.product_variants.price,
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
