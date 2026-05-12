import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import client from '../api/client';
import { useCart } from '../context/CartContext';

const StoreHome = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const { addToCart } = useCart() || { addToCart: () => alert('Giỏ hàng chưa được khởi tạo!') };

  useEffect(() => {
    setSearchQuery(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const { data } = await client.get('/home');
        
        // Store the raw categories so we can filter by ID
        setCategories(data.categories || []);
        
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'All') return matchesSearch;
    
    const categoryObjs = categories.filter(c => c.name === activeCategory);
    if (categoryObjs.length === 0) return matchesSearch;
    
    let validIds = [];
    categoryObjs.forEach(cat => {
      validIds.push(cat.id);
      if (cat.children) {
        cat.children.forEach(child => validIds.push(child.id));
      }
    });

    return matchesSearch && validIds.includes(p.category_id);
  });

  const categoryNames = ['All', ...new Set(categories.map(c => c.name))];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Nike</h1>
          <p style={styles.heroSubtitle}>Just Do It.</p>
          <div style={styles.heroTags}>
            <span style={styles.heroTag}>✓ 30 Days Free Return</span>
            <span style={styles.heroTag}>✓ Delivery in 2 Days</span>
          </div>
        </div>
        <div style={styles.heroImageContainer}>
          <img 
            src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80" 
            alt="Nike Hero" 
            style={styles.heroImage} 
          />
        </div>
      </div>

      <div style={styles.storeSection}>
        <h2 style={styles.sectionTitle}>All Offers from OmniMart</h2>
        
        {/* Categories & Search */}
        <div style={styles.filterBar}>
          <div style={styles.categories}>
            {categoryNames.map(category => (
              <button
                key={category}
                style={{
                  ...styles.categoryBtn,
                  ...(activeCategory === category ? styles.categoryBtnActive : {})
                }}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div style={styles.searchBox}>
            <Search size={16} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search..." 
              style={styles.searchInput} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.grid}>
          {filteredProducts.map(product => (
            <div key={product.id} style={styles.card}>
              <Link to={`/product/${product.id}`} style={styles.imageBox}>
                <img src={product.image || 'https://via.placeholder.com/250'} alt={product.name} style={styles.productImage} />
              </Link>
              <div style={styles.cardContent}>
                <Link to={`/product/${product.id}`} style={{textDecoration: 'none'}}>
                  <h3 style={styles.productName}>{product.name}</h3>
                </Link>
                <div style={styles.priceRow}>
                  <p style={styles.productPrice}>{product.price?.toLocaleString()}₫</p>
                  <button 
                    style={styles.addToCartBtn} 
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product);
                    }}
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
  hero: {
    backgroundColor: 'var(--bg-dark)',
    borderRadius: '24px',
    display: 'flex',
    overflow: 'hidden',
    height: '400px',
    marginBottom: '40px',
    color: '#fff',
  },
  heroContent: {
    flex: 1,
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: '64px',
    fontWeight: '800',
    marginBottom: '10px',
  },
  heroSubtitle: {
    fontSize: '24px',
    color: '#cbd5e1',
    marginBottom: '30px',
  },
  heroTags: {
    display: 'flex',
    gap: '20px',
    marginTop: 'auto',
  },
  heroTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    backdropFilter: 'blur(5px)',
  },
  heroImageContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  storeSection: {
    marginTop: '40px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '20px',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  categories: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '5px',
  },
  categoryBtn: {
    padding: '10px 20px',
    borderRadius: '25px',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-muted)',
    fontWeight: '600',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  categoryBtnActive: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    padding: '10px 15px 10px 40px',
    borderRadius: '25px',
    border: '1px solid var(--border)',
    outline: 'none',
    width: '250px',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.2s',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
  },
  imageBox: {
    height: '250px',
    width: '100%',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  cardContent: {
    padding: '20px',
    backgroundColor: '#fff',
  },
  productName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text-main)',
    marginBottom: '8px',
  },
  productPrice: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addToCartBtn: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }
};

export default StoreHome;
