import { useState, useEffect } from 'react';
import { Bike, Briefcase, Banknote, MessageCircle, Phone, Mail, Search, ShoppingCart, X, Plus, Minus, Trash2, Clock, ShieldCheck, Truck, RotateCcw, Flame } from 'lucide-react';
import { translations } from '../translations';
import type { Language } from '../translations';
import '../App.css';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

// دالة مساعدة لإصلاح مسار الصور في GitHub Pages
export const getImageUrl = (url: string) => {
  if (url.startsWith('http')) return url;
  const base = import.meta.env.BASE_URL || '/';
  return url.startsWith('/') ? `${base}${url.slice(1)}` : `${base}${url}`;
};

export default function StoreFront() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [lang, setLang] = useState<Language>('fr');
  const [searchTerm, setSearchTerm] = useState('');
  
  // سلة التسوق
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImage(selectedProduct.image);
    }
  }, [selectedProduct]);

  // منطق العداد التنازلي (Urgency Timer)
  const [timeLeft, setTimeLeft] = useState(900); // 15 دقيقة بالثواني

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');

  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Adil E-commerce',
    whatsapp: '212600000000',
    email: 'contact@adil.com',
    currency: 'DH'
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (e) {
        console.error("Error fetching products: ", e);
      }
    };

    const fetchSettings = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(db, "settings", "store");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStoreSettings(docSnap.data() as any);
        }
      } catch (e) {
        console.error("Error fetching settings: ", e);
      }
    };

    fetchProducts();
    fetchSettings();

    // استرجاع السلة من التخزين المحلي
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[^0-9]/g, ''));
    return sum + (price * item.quantity);
  }, 0);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderItems = isCartOpen ? cart : [selectedProduct];
      const totalAmount = isCartOpen ? cartTotal : parseInt(selectedProduct.price.replace(/[^0-9]/g, ''));

      await addDoc(collection(db, "orders"), {
        customer: customerName,
        phone: customerPhone,
        city: customerCity,
        product: orderItems.map(i => `${i.name} (x${i.quantity || 1})`).join(', '),
        total: `${totalAmount} ${storeSettings.currency}`,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      });

      alert(t.successMsg);
      if (isCartOpen) {
        setCart([]);
        setIsCartOpen(false);
      } else {
        setSelectedProduct(null);
      }
      setCustomerName('');
      setCustomerPhone('');
      setCustomerCity('');
    } catch (e) {
      console.error("Error adding order: ", e);
      alert("Error submitting order. Please try again.");
    }
  };

  const filteredProducts = products.filter(p => {
    return p.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className={`app-wrapper ${isRTL ? 'rtl-layout' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo-section">
            <img src={getImageUrl("/image.png")} alt="Adil Logo" className="logo-img" />
            <h1 className="logo">{storeSettings.storeName}</h1>
          </div>
          
          <div className="header-actions">
            <div className="search-container">
              <Search size={18} color="#64748b" />
              <input 
                type="text" 
                placeholder={isRTL ? 'بحث...' : 'Rechercher...'} 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={24} />
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>

            <div className="lang-switcher">
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="lang-select"
              >
                <option value="fr">FR</option>
                <option value="ar">AR</option>
                <option value="en">EN</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content container">
        <section className="hero">
          <h2>{t.heroTitle}</h2>
          <p>{t.heroDesc}</p>
        </section>
        
        <section className="trust-badges">
          <div className="badge-item">
            <span className="badge-icon"><Bike size={40} strokeWidth={1.5} color="var(--primary-color)" /></span>
            <h4>{t.delivery}</h4>
            <p>{t.deliveryDesc}</p>
          </div>
          <div className="badge-item">
            <span className="badge-icon"><Briefcase size={40} strokeWidth={1.5} color="var(--primary-color)" /></span>
            <h4>{t.leather}</h4>
            <p>{t.leatherDesc}</p>
          </div>
          <div className="badge-item">
            <span className="badge-icon"><Banknote size={40} strokeWidth={1.5} color="var(--primary-color)" /></span>
            <h4>{t.cod}</h4>
            <p>{t.codDesc}</p>
          </div>
        </section>
        
        <section className="products-section">
          <h3 className="section-title">{t.collection}</h3>
          
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  {product.inStock && product.id.toString().includes('2') && <span className="product-badge badge-sale">SALE</span>}
                  {product.inStock && product.id.toString().includes('1') && <span className="product-badge badge-new">NEW</span>}
                  {product.inStock && product.id.toString().includes('3') && <span className="product-badge badge-hot">HOT</span>}
                  
                  <img 
                    src={product.image && product.image.startsWith('data:image/') ? product.image : getImageUrl(product.image)} 
                    alt={product.name} 
                    className="product-image" 
                    onClick={() => setSelectedProduct(product)}
                    style={{cursor: 'pointer'}}
                  />
                  {!product.inStock && <span className="badge out-of-stock">{t.rupture}</span>}
                </div>
                <div className="product-info">
                  <h4 className="product-name" onClick={() => setSelectedProduct(product)} style={{cursor: 'pointer'}}>{product.name}</h4>
                  <p className="product-price">{product.price}</p>
                  <button 
                    className={`btn-order ${!product.inStock ? 'disabled' : ''}`}
                    disabled={!product.inStock}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.inStock ? (isRTL ? 'اطلب الآن' : 'Commander') : t.indisponible}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal تفاصيل المنتج */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedProduct(null)}>&times;</button>
            <div className="modal-body">
              <div className="modal-image-wrapper">
                <div className="main-image-container">
                  <img 
                    src={activeImage && activeImage.startsWith('data:image/') ? activeImage : getImageUrl(activeImage || selectedProduct.image)} 
                    alt={selectedProduct.name} 
                    key={activeImage} // Force re-animation on change
                  />
                </div>
                {/* معرض الصور المصغرة */}
                <div className="thumbnail-gallery">
                  {/* حالياً نعرض الصورة الأساسية وصور إضافية إذا وجدت في الداتا */}
                  {[selectedProduct.image, selectedProduct.image2, selectedProduct.image3].filter(Boolean).map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img src={img && img.startsWith('data:image/') ? img : getImageUrl(img)} alt={`Thumb ${idx}`} />
                    </div>
                  ))}
                  {/* محاكاة صور إضافية لأغراض العرض إذا لم تكن موجودة */}
                  {!selectedProduct.image2 && (
                    <>
                      <div className="thumbnail" style={{opacity: 0.5, border: '1px dashed #ccc'}}>
                         <img src={getImageUrl(selectedProduct.image)} alt="demo" style={{filter: 'grayscale(1)'}} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-details">
                <div className="urgency-timer">
                  <div className="timer-text">
                    <Clock size={18} /> {isRTL ? 'ينتهي العرض خلال:' : 'L\'offre se termine dans :'} {formatTime(timeLeft)}
                  </div>
                </div>

                <h2>{selectedProduct.name}</h2>
                <p className="modal-price">{selectedProduct.price}</p>
                <div className="stock-alert">
                   <Flame size={16} /> {isRTL ? 'بقي 4 قطع فقط في المخزن!' : 'Plus que 4 articles en stock !'}
                </div>

                <div className="modal-divider"></div>
                
                <p style={{color: '#64748b', marginBottom: '20px'}}>
                  {isRTL ? 'منتج عالي الجودة مصنوع من الجلد الطبيعي، مثالي للاستخدام اليومي.' : 'Produit de haute qualité en cuir véritable, idéal pour un usage quotidien.'}
                </p>

                <button className="btn-submit-order" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setIsCartOpen(true); }}>
                  {isRTL ? 'إضافة للسلة وشراء الآن' : 'Ajouter au panier et Acheter'}
                </button>
                
                <div className="checkout-trust-badges">
                  <div className="trust-item-mini">
                    <Truck size={20} />
                    <div>{isRTL ? 'شحن سريع' : 'Livraison'}</div>
                  </div>
                  <div className="trust-item-mini">
                    <ShieldCheck size={20} />
                    <div>{isRTL ? 'جودة مضمونة' : 'Qualité'}</div>
                  </div>
                  <div className="trust-item-mini">
                    <RotateCcw size={20} />
                    <div>{isRTL ? 'إرجاع سهل' : 'Retour'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer سلة التسوق الجانبية */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>{isRTL ? 'سلة التسوق' : 'Votre Panier'} ({cart.length})</h3>
              <button onClick={() => setIsCartOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={24} /></button>
            </div>
            
            <div className="cart-items">
              {cart.length === 0 ? (
                <div style={{textAlign: 'center', marginTop: '50px', color: '#64748b'}}>
                  <ShoppingCart size={48} style={{marginBottom: '15px', opacity: 0.3}} />
                  <p>{isRTL ? 'السلة فارغة' : 'Votre panier est vide'}</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image && item.image.startsWith('data:image/') ? item.image : getImageUrl(item.image)} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-price">{item.price}</p>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}><Plus size={14} /></button>
                        <button onClick={() => removeFromCart(item.id)} style={{marginLeft: 'auto', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'}}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total" style={{marginBottom: '10px'}}>
                  <span>{isRTL ? 'المجموع:' : 'Total :'}</span>
                  <span>{cartTotal} {storeSettings.currency}</span>
                </div>
                
                <div className="urgency-timer" style={{padding: '5px', marginBottom: '15px'}}>
                  <div className="timer-text" style={{fontSize: '0.8rem'}}>
                    <Clock size={14} /> {isRTL ? 'أكمل الطلب خلال:' : 'Finissez la commande dans :'} {formatTime(timeLeft)}
                  </div>
                </div>

                <form className="order-form" onSubmit={handleOrderSubmit}>
                  <div className="form-group">
                    <input type="text" placeholder={t.formName} value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <input type="tel" placeholder={t.formPhone} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <input type="text" placeholder={t.formCity} value={customerCity} onChange={(e) => setCustomerCity(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn-submit-order" style={{backgroundColor: 'var(--primary-color)'}}>{isRTL ? 'تأكيد الطلب الآن' : 'Confirmer la commande'}</button>
                </form>

                <div className="checkout-trust-badges">
                  <div className="trust-item-mini">
                    <Truck size={16} />
                    <div>{isRTL ? 'شحن سريع' : 'Livraison'}</div>
                  </div>
                  <div className="trust-item-mini">
                    <ShieldCheck size={16} />
                    <div>{isRTL ? 'جودة' : 'Qualité'}</div>
                  </div>
                  <div className="trust-item-mini">
                    <RotateCcw size={16} />
                    <div>{isRTL ? 'إرجاع' : 'Retour'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Contacts */}
      <div className="floating-contacts">
        <a href={`https://wa.me/${storeSettings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="floating-btn wa-btn" rel="noreferrer" aria-label="WhatsApp">
          <MessageCircle size={24} />
        </a>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content-grid">
          <div className="footer-brand">
            <h2 className="logo" style={{color: 'white', marginBottom: '15px'}}>{storeSettings.storeName}</h2>
            <p>{t.heroDesc}</p>
          </div>
          <div className="footer-links">
            <h3>{t.footerLinks}</h3>
            <ul>
              <li><a href="#">{t.cats['Tous']}</a></li>
              <li><a href="#">{t.footerAbout}</a></li>
              <li><a href="#">{t.footerPolicy}</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h3>{t.footerContact}</h3>
            <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Phone size={18} color="var(--primary-color)" /> {storeSettings.whatsapp}</p>
            <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Mail size={18} color="var(--primary-color)" /> {storeSettings.email}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {storeSettings.storeName}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
