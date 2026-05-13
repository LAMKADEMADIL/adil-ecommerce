import { useState } from 'react';
import './App.css';

// بيانات مؤقتة لتجربة التصميم (Mock Data)
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Pack Voyage & Sac à Dos Cuir",
    price: "450 DH",
    image: "/bag1.jpg",
    inStock: true
  },
  {
    id: 2,
    name: "Sac à Main Élégant",
    price: "350 DH",
    image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400",
    inStock: true
  },
  {
    id: 3,
    name: "Trousse Scolaire Vintage",
    price: "80 DH",
    image: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=400",
    inStock: false
  },
  {
    id: 4,
    name: "Sac de Voyage Premium",
    price: "550 DH",
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400",
    inStock: true
  }
];

function App() {
  // حالة (State) للتحكم في النافذة المنبثقة ومعرفة المنتج الذي تم اختياره
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  return (
    <div className="app-wrapper">
      {/* منطقة الرأس - Header */}
      <header className="header">
        <div className="container header-content">
          <img src="/image.png" alt="Adil Logo" className="logo-img" />
          <h1 className="logo">Adil E-commerce</h1>
        </div>
      </header>

      {/* المحتوى الرئيسي للموقع - Main Content */}
      <main className="main-content container">
        
        {/* قسم الترحيب - Hero Section */}
        <section className="hero">
          <h2>Découvrez nos portefeuilles et sacs faits main</h2>
          <p>Qualité exceptionnelle, design moderne.</p>
        </section>
        
        {/* معرض المنتجات */}
        <section className="products-section">
          <h3 className="section-title">Notre Collection de Sacs & Portefeuilles</h3>
          <div className="products-grid">
            {MOCK_PRODUCTS.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img src={product.image} alt={product.name} className="product-image" />
                  {!product.inStock && <span className="badge out-of-stock">Rupture</span>}
                </div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-price">{product.price}</p>
                  <button 
                    className={`btn-order ${!product.inStock ? 'disabled' : ''}`}
                    disabled={!product.inStock}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.inStock ? 'Commander' : 'Indisponible'}
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
                <img src={selectedProduct.image} alt={selectedProduct.name} />
              </div>
              <div className="modal-details">
                <h2>{selectedProduct.name}</h2>
                <p className="modal-price">{selectedProduct.price}</p>
                <div className="modal-divider"></div>
                
                {/* استمارة الطلب السريع */}
                <form className="order-form" onSubmit={(e) => { 
                  e.preventDefault(); 
                  alert("🎉 Commande reçue avec succès ! Nous vous contacterons bientôt."); 
                  setSelectedProduct(null); 
                }}>
                  <h3>Commander (Paiement à la livraison)</h3>
                  <div className="form-group">
                    <input type="text" placeholder="Nom complet" required />
                  </div>
                  <div className="form-group">
                    <input type="tel" placeholder="Téléphone" required />
                  </div>
                  <div className="form-group">
                    <input type="text" placeholder="Ville / Adresse" required />
                  </div>
                  <button type="submit" className="btn-submit-order">Confirmer l'achat</button>
                </form>
                
                {/* زر الواتساب */}
                <button 
                  className="btn-whatsapp" 
                  onClick={() => window.open(`https://wa.me/212600000000?text=Bonjour, je souhaite commander : ${selectedProduct.name}`, '_blank')}
                >
                  Commander via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* منطقة التذييل - Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Adil E-commerce. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
