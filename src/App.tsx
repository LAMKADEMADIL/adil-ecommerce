import './App.css'

function App() {
  return (
    <div className="app-wrapper">
      {/* منطقة الرأس - Header */}
      <header className="header">
        <div className="container">
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
        
        {/* مساحة فارغة لمعرض المنتجات سنعمل عليها في الخطوة القادمة */}
        <section className="products-placeholder">
          <p>معرض المنتجات سيتم إضافته هنا قريباً...</p>
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
