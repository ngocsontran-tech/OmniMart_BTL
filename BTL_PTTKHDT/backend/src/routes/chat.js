const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const authMiddleware = require("../middlewares/auth");
const { SUPABASE_IMAGE_BASE } = require("../config/constants");

// GET /chat/messages/:productId - Lấy lịch sử tin nhắn
router.get("/messages/:productId", authMiddleware(), async (req, res) => {
  try {
    const { productId } = req.params;

    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        id, message, created_at, sender_id,
        users!sender_id (name, avatar)
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const { data: product } = await supabase
      .from("products")
      .select("shops(name, owner_id)")
      .eq("id", productId)
      .single();

    const shopOwnerId = product?.shops?.owner_id || null;
    const shopName = product?.shops?.name || "Cửa hàng";

    const formatted = messages.map((m) => ({
      _id: m.id,
      text: m.message,
      createdAt: m.created_at,
      user: {
        _id: m.sender_id,
        name: m.users?.name || (m.sender_id === shopOwnerId ? shopName : "Khách hàng"),
        avatar: m.users?.avatar || null,
      },
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET CHAT MESSAGES ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// POST /chat/send - Gửi tin nhắn
router.post("/send", authMiddleware(), async (req, res) => {
  try {
    const { product_id, message } = req.body;
    const sender_id = req.user.id;

    if (!product_id || !message?.trim()) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const { data: product } = await supabase
      .from("products")
      .select("id, shops(name, owner_id)")
      .eq("id", product_id)
      .single();

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const { data: newMsg, error } = await supabase
      .from("messages")
      .insert({
        product_id,
        sender_id,
        message: message.trim(),
      })
      .select(`
        id, message, created_at, sender_id,
        users!sender_id (name, avatar)
      `)
      .single();

    if (error) throw error;

    const shopOwnerId = product.shops.owner_id;
    const shopName = product.shops.name;

    const formatted = {
      _id: newMsg.id,
      text: newMsg.message,
      createdAt: newMsg.created_at,
      user: {
        _id: newMsg.sender_id,
        name: newMsg.users?.name || (newMsg.sender_id === shopOwnerId ? shopName : "Khách hàng"),
        avatar: newMsg.users?.avatar || null,
      },
    };

    res.json({ success: true, message: formatted });
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({ message: "Lỗi gửi tin nhắn" });
  }
});

// GET /chat/list - Danh sách chat
router.get("/list", authMiddleware(), async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy product_id mà user đã gửi tin
    const { data: sentMessages, error: sentError } = await supabase
      .from("messages")
      .select("product_id")
      .eq("sender_id", userId);

    if (sentError) throw sentError;

    // Lấy product_id mà user là seller
    const { data: ownedShops } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", userId);

    let ownedProductIds = [];
    if (ownedShops && ownedShops.length > 0) {
      const shopIds = ownedShops.map((s) => s.id);
      const { data: ownedProducts } = await supabase
        .from("products")
        .select("id")
        .in("shop_id", shopIds);

      ownedProductIds = ownedProducts ? ownedProducts.map((p) => p.id) : [];
    }

    // Gộp tất cả product_id duy nhất
    const sentProductIds = sentMessages ? sentMessages.map((m) => m.product_id) : [];
    const allProductIds = [...new Set([...sentProductIds, ...ownedProductIds])];

    if (allProductIds.length === 0) {
      return res.json([]);
    }

    // Lấy tin nhắn mới nhất cho từng product
    const { data: latestMessages, error: latestError } = await supabase
      .from("messages")
      .select(`
        product_id, created_at,
        products!inner (
          id, name, image,
          shops!inner ( id, name, owner_id )
        )
      `)
      .in("product_id", allProductIds)
      .order("created_at", { ascending: false });

    if (latestError) throw latestError;

    // Group và lấy tin nhắn mới nhất cho mỗi product
    const chatMap = new Map();

    latestMessages.forEach((msg) => {
      const p = msg.products;
      const shop = p.shops;
      const key = p.id;

      if (!chatMap.has(key)) {
        chatMap.set(key, {
          product_id: p.id,
          product_name: p.name,
          product_image: p.image ? `${SUPABASE_IMAGE_BASE}${p.image}` : null,
          shop_name: shop.name,
          seller_id: shop.owner_id,
          partner_name: shop.owner_id === userId ? "Khách hàng" : shop.name,
          last_message_at: msg.created_at,
        });
      }
    });

    const chatList = Array.from(chatMap.values()).sort(
      (a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)
    );

    res.json(chatList);
  } catch (err) {
    console.error("GET CHAT LIST ERROR:", err);
    res.status(500).json({ message: "Lỗi tải danh sách chat" });
  }
});

module.exports = router;
