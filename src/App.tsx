import './App.css'

// بيانات مؤقتة لتجربة التصميم (Mock Data)
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Portefeuille Classique Cuir",
    price: "150 DH",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400",
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
          <h3 className="section-title">Nos Collections Spéciales</h3>
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
                  >
                    {product.inStock ? 'Commander' : 'Indisponible'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

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
