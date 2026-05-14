import { useState } from 'react';
import { Bike, Briefcase, Banknote, MessageCircle } from 'lucide-react';
import { translations } from './translations';
import type { Language } from './translations';
import './App.css';

// بيانات مؤقتة لتجربة التصميم (Mock Data)
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Pack Voyage & Sac à Dos Cuir",
    category: "Voyage",
    price: "450 DH",
    image: "/bag1.jpg",
    inStock: true
  },
  {
    id: 2,
    name: "Sac à Main Élégant",
    category: "Sacs",
    price: "350 DH",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400",
    inStock: true
  },
  {
    id: 3,
    name: "Portefeuille Classique Cuir",
    category: "Portefeuilles",
    price: "150 DH",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400",
    inStock: false
  },
  {
    id: 4,
    name: "Sac à Dos Premium",
    category: "Sacs à dos",
    price: "550 DH",
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400",
    inStock: true
  }
];

// دالة مساعدة لإصلاح مسار الصور في GitHub Pages
const getImageUrl = (url: string) => {
  if (url.startsWith('http')) return url;
  const base = import.meta.env.BASE_URL || '/';
  return url.startsWith('/') ? `${base}${url.slice(1)}` : `${base}${url}`;
};

function App() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [lang, setLang] = useState<Language>('fr');

  const t = translations[lang];
  const isRTL = lang === 'ar';

  // تصفية المنتجات حسب التصنيف
  const filteredProducts = activeCategory === 'Tous' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className={`app-wrapper ${isRTL ? 'rtl-layout' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* منطقة الرأس - Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo-section">
            <img src={getImageUrl("/image.png")} alt="Adil Logo" className="logo-img" />
            <h1 className="logo">Adil E-commerce</h1>
          </div>
          
          {/* محول اللغات (Select Dropdown) */}
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
      </header>

      {/* المحتوى الرئيسي للموقع - Main Content */}
      <main className="main-content container">
        
        {/* قسم الترحيب - Hero Section */}
        <section className="hero">
          <h2>{t.heroTitle}</h2>
          <p>{t.heroDesc}</p>
        </section>
        
        {/* شريط المميزات والثقة */}
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
        
        {/* معرض المنتجات */}
        <section className="products-section">
          <h3 className="section-title">{t.collection}</h3>
          
          {/* أزرار التصفية (Category Filters) */}
          <div className="category-filters">
            {['Tous', 'Sacs', 'Sacs à dos', 'Portefeuilles', 'Voyage'].map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {t.cats[cat as keyof typeof t.cats]}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img src={getImageUrl(product.image)} alt={product.name} className="product-image" />
                  {!product.inStock && <span className="badge out-of-stock">{t.rupture}</span>}
                </div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-price">{product.price}</p>
                  <button 
                    className={`btn-order ${!product.inStock ? 'disabled' : ''}`}
                    disabled={!product.inStock}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.inStock ? t.commander : t.indisponible}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* نافذة تفاصيل المنتج والطلب (Modal Pop-up) */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedProduct(null)}>&times;</button>
            <div className="modal-body">
              <div className="modal-image-wrapper">
                {/* هنا الصورة تأخذ راحتها بالكامل دون أي قص */}
                <img src={getImageUrl(selectedProduct.image)} alt={selectedProduct.name} />
              </div>
              <div className="modal-details">
                <h2>{selectedProduct.name}</h2>
                <p className="modal-price">{selectedProduct.price}</p>
                <div className="modal-divider"></div>
                
                {/* استمارة الطلب السريع */}
                <form className="order-form" onSubmit={(e) => { 
                  e.preventDefault(); 
                  alert(t.successMsg); 
                  setSelectedProduct(null); 
                }}>
                  <h3>{t.formTitle}</h3>
                  <div className="form-group">
                    <input type="text" placeholder={t.formName} required />
                  </div>
                  <div className="form-group">
                    <input type="tel" placeholder={t.formPhone} required />
                  </div>
                  <div className="form-group">
                    <input type="text" placeholder={t.formCity} required />
                  </div>
                  <button type="submit" className="btn-submit-order">{t.formSubmit}</button>
                </form>
                
                {/* زر الواتساب */}
                <button 
                  className="btn-whatsapp" 
                  onClick={() => window.open(`https://wa.me/212600000000?text=${isRTL ? 'مرحباً، أريد طلب:' : 'Bonjour, je souhaite commander :'} ${selectedProduct.name}`, '_blank')}
                  style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                >
                  <MessageCircle size={20} /> {t.whatsappBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* زر الواتساب العائم */}
      <a href="https://wa.me/212600000000" target="_blank" className="floating-whatsapp" rel="noreferrer">
        <MessageCircle size={32} color="white" />
      </a>

      {/* منطقة التذييل الاحترافية - Professional Footer */}
      <footer className="footer">
        <div className="container footer-content-grid">
          <div className="footer-brand">
            <h2 className="logo" style={{color: 'white', marginBottom: '15px'}}>Adil E-commerce</h2>
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
            <p>📞 +212 60 00 00 00</p>
            <p>📧 contact@adil-ecommerce.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Adil E-commerce. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
