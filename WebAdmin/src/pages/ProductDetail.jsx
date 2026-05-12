import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Store, Minus, Plus, ChevronLeft } from 'lucide-react';
import client from '../api/client';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await client.get(`/products/${id}`);
        setProduct(data);
        
        // Auto-select first variant options if available
        if (data.product_variants && data.product_variants.length > 0) {
          const firstVariant = data.product_variants[0];
          if (firstVariant.size) setSelectedSize(firstVariant.size);
          if (firstVariant.color) setSelectedColor(firstVariant.color);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    // If product has variants, require selection
    const hasSizes = product.product_variants?.some(v => v.size);
    const hasColors = product.product_variants?.some(v => v.color);

    if (hasSizes && !selectedSize) {
      alert('Vui lòng chọn kích thước');
      return;
    }
    if (hasColors && !selectedColor) {
      alert('Vui lòng chọn màu sắc');
      return;
    }

    // Find the selected variant to get accurate price/stock if needed
    let variantId = null;
    let finalPrice = product.price;

    if (product.product_variants?.length > 0) {
      const selectedVariant = product.product_variants.find(
        v => (v.size === selectedSize || !hasSizes) && (v.color === selectedColor || !hasColors)
      );
      if (selectedVariant) {
        variantId = selectedVariant.id;
        if (selectedVariant.price) finalPrice = selectedVariant.price;
      }
    }

    // Create a unique cart item ID based on variant choices
    const cartItemId = variantId ? `${product.id}-${variantId}` : product.id;
    
    // Add multiple quantities
    for (let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        id: cartItemId, // overriding ID for cart distinctness
        original_id: product.id,
        price: finalPrice,
        selectedSize,
        selectedColor,
        variantId
      });
    }
    
    // Reset quantity after adding
    setQuantity(1);
  };

  if (loading) {
    return <div style={styles.centerContainer}>Đang tải...</div>;
  }

  if (error || !product) {
    return (
      <div style={styles.centerContainer}>
        <p style={styles.errorText}>{error || 'Sản phẩm không tồn tại'}</p>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          <ChevronLeft size={20} />
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  // Extract unique sizes and colors
  const sizes = [...new Set(product.product_variants?.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(product.product_variants?.map(v => v.color).filter(Boolean))];

  // Image Gallery Logic
  const galleryImages = [
    product.image,
    ...(product.product_variants?.map(v => v.image).filter(Boolean) || [])
  ].filter((v, i, a) => v && a.indexOf(v) === i); // Deduplicate and remove nulls

  // Determine current variant based on selections
  const hasSizes = product.product_variants?.some(v => v.size);
  const hasColors = product.product_variants?.some(v => v.color);
  const selectedVariant = product.product_variants?.find(
    v => (v.size === selectedSize || !hasSizes) && (v.color === selectedColor || !hasColors)
  );

  // Determine display image: prioritize user clicked image, then selected color, then variant, then default
  let displayImage = activeImage || product.image || 'https://via.placeholder.com/600';
  if (!activeImage) {
    if (selectedColor) {
      const colorVariant = product.product_variants?.find(v => v.color === selectedColor && v.image);
      if (colorVariant) {
        displayImage = colorVariant.image;
      }
    } else if (selectedVariant?.image) {
      displayImage = selectedVariant.image;
    }
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backLink}>
        <ChevronLeft size={20} /> Quay lại
      </button>

      <div style={styles.productWrapper}>
        {/* Left: Image Gallery */}
        <div style={styles.imageSection}>
          <div style={styles.mainImageContainer}>
            <img 
              src={displayImage} 
              alt={product.name} 
              style={styles.mainImage} 
            />
          </div>
          {galleryImages.length > 1 && (
            <div style={styles.thumbnailGallery}>
              {galleryImages.map((img, idx) => (
                <button 
                  key={idx} 
                  style={{
                    ...styles.thumbnailBtn,
                    borderColor: displayImage === img ? 'var(--primary)' : 'transparent'
                  }}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} style={styles.thumbnailImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div style={styles.infoSection}>
          {product.shop && (
            <div style={styles.shopInfo}>
              <Store size={18} color="var(--primary)" />
              <span>{product.shop.name}</span>
            </div>
          )}
          
          <h1 style={styles.title}>{product.name}</h1>
          
          <div style={styles.ratingRow}>
            <div style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  fill={i < Math.floor(product.rating || 0) ? "#f59e0b" : "transparent"} 
                  color={i < Math.floor(product.rating || 0) ? "#f59e0b" : "#d1d5db"} 
                />
              ))}
            </div>
            <span style={styles.ratingText}>
              {product.rating?.toFixed(1)} ({product.rating_count} đánh giá)
            </span>
          </div>

          <p style={styles.price}>{(selectedVariant?.price || product.price)?.toLocaleString()}₫</p>
          
          <p style={styles.description}>{product.description}</p>

          <div style={styles.divider}></div>

          {/* Variants Selection */}
          {sizes.length > 0 && (
            <div style={styles.variantSection}>
              <h3 style={styles.variantTitle}>Kích thước</h3>
              <div style={styles.variantOptions}>
                {sizes.map(size => (
                  <button
                    key={size}
                    style={{
                      ...styles.variantBtn,
                      ...(selectedSize === size ? styles.variantBtnActive : {})
                    }}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div style={styles.variantSection}>
              <h3 style={styles.variantTitle}>Màu sắc</h3>
              <div style={styles.variantOptions}>
                {colors.map(color => (
                  <button
                    key={color}
                    style={{
                      ...styles.variantBtn,
                      ...(selectedColor === color ? styles.variantBtnActive : {})
                    }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div style={styles.actionSection}>
            <div style={styles.quantityControl}>
              <button 
                style={styles.qtyBtn} 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={18} />
              </button>
              <span style={styles.qtyText}>{quantity}</span>
              <button 
                style={styles.qtyBtn} 
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={18} />
              </button>
            </div>

            <button style={styles.addToCartBtn} onClick={handleAddToCart}>
              <ShoppingBag size={20} />
              <span>Thêm vào giỏ hàng</span>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  centerContainer: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'var(--danger)',
    fontSize: '18px',
    marginBottom: '20px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    color: 'var(--text-muted)',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '15px',
    marginBottom: '20px',
    padding: 0,
  },
  productWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '40px',
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: 'var(--shadow)',
  },
  imageSection: {
    flex: '1 1 40%',
    minWidth: '300px',
  },
  mainImageContainer: {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '20px',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbnailGallery: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    overflowX: 'auto',
    paddingBottom: '5px',
  },
  thumbnailBtn: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    border: '2px solid transparent',
    padding: '2px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'border-color 0.2s',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  infoSection: {
    flex: '1 1 50%',
    display: 'flex',
    flexDirection: 'column',
  },
  shopInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    marginBottom: '12px',
    fontSize: '14px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '10px',
    lineHeight: '1.2',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  stars: {
    display: 'flex',
    gap: '2px',
  },
  ratingText: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: '500',
  },
  price: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'var(--primary)',
    marginBottom: '24px',
  },
  description: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border)',
    margin: '0 0 30px 0',
  },
  variantSection: {
    marginBottom: '24px',
  },
  variantTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  variantOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  variantBtn: {
    padding: '10px 20px',
    backgroundColor: '#fff',
    border: '2px solid var(--border)',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  variantBtnActive: {
    borderColor: 'var(--primary)',
    color: 'var(--primary)',
    backgroundColor: 'rgba(227, 102, 49, 0.05)',
  },
  actionSection: {
    display: 'flex',
    gap: '20px',
    marginTop: 'auto',
    paddingTop: '30px',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: '#f1f5f9',
    borderRadius: '30px',
    padding: '5px 15px',
    border: '1px solid var(--border)',
  },
  qtyBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-main)',
    padding: '5px',
  },
  qtyText: {
    fontWeight: '700',
    fontSize: '18px',
    minWidth: '24px',
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '16px',
    borderRadius: '30px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    boxShadow: 'var(--shadow-primary)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }
};

export default ProductDetail;
