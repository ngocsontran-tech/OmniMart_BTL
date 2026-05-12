const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const { SUPABASE_IMAGE_BASE } = require("../config/constants");
const { mapProductImage, mapProductsImage } = require("../helpers/imageMapper");

// GET /products
router.get("/", async (req, res) => {
  try {
    const { category_id, search, sort } = req.query;

    let query = supabase.from("products").select("*");

    if (category_id) query = query.eq("category_id", category_id);
    if (search) query = query.ilike("name", `%${search}%`);

    if (sort === "price_asc") query = query.order("price", { ascending: true });
    if (sort === "price_desc") query = query.order("price", { ascending: false });
    if (sort === "rating") query = query.order("rating", { ascending: false });

    const { data, error } = await query;
    if (error) return res.status(400).json({ message: error.message });

    res.json(mapProductsImage(data));
  } catch (err) {
    res.status(500).json({ message: "Products error" });
  }
});

// GET /products/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        image,
        rating,
        rating_count,
        description,
        product_variants (
          id,
          size,
          color,
          price,
          stock,
          image
        ),
        shops (
          id,
          name,
          logo
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Product not found" });
    }

    const mappedProduct = mapProductImage(data);

    const shopInfo = data.shops
      ? {
          id: data.shops.id,
          name: data.shops.name,
          logo: data.shops.logo ? SUPABASE_IMAGE_BASE + data.shops.logo : null,
        }
      : null;

    res.json({
      ...mappedProduct,
      shop: shopInfo,
    });
  } catch (err) {
    console.error("Product detail error:", err);
    res.status(500).json({ message: "Product detail error" });
  }
});

module.exports = router;
