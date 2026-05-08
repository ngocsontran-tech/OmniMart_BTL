const { SUPABASE_IMAGE_BASE } = require("../config/constants");

/** Map URL ảnh đầy đủ cho 1 sản phẩm */
const mapProductImage = (product) => {
  if (!product) return product;
  return {
    ...product,
    image: product.image ? SUPABASE_IMAGE_BASE + product.image : null,
  };
};

/** Map URL ảnh cho danh sách sản phẩm */
const mapProductsImage = (products = []) => products.map(mapProductImage);

/** Map URL logo cho shop */
const mapShopLogo = (shop) => {
  if (!shop) return shop;
  return {
    ...shop,
    logo: shop.logo ? SUPABASE_IMAGE_BASE + shop.logo : null,
  };
};

module.exports = {
  mapProductImage,
  mapProductsImage,
  mapShopLogo,
};
