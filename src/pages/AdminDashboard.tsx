import React, { useState } from 'react';
import { Package, ShoppingBag, Users, Settings, LogOut, LayoutDashboard, Menu, X, ChevronRight, ChevronLeft, Plus, Edit, Trash2, Eye, Check } from 'lucide-react';
import { translations } from '../translations';
import type { Language } from '../translations';
import { getImageUrl, MOCK_PRODUCTS as INITIAL_PRODUCTS } from './StoreFront';
import './AdminDashboard.css';

// بيانات وهمية للطلبات
const MOCK_ORDERS = [
  { id: '#1001', customer: 'أحمد العلمي', product: 'Pack Voyage & Sac à Dos Cuir', total: '450 DH', status: 'pending', date: '2023-10-25' },
  { id: '#1002', customer: 'ياسين بناني', product: 'Sac à Main Élégant', total: '350 DH', status: 'shipped', date: '2023-10-24' },
  { id: '#1003', customer: 'سارة محمد', product: 'Portefeuille Classique', total: '150 DH', status: 'delivered', date: '2023-10-22' },
];

export default function AdminDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // For mobile overlay
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop collapse
  const [activeTab, setActiveTab] = useState('products'); // Set to products by default for testing
  const [lang, setLang] = useState<Language>('ar'); // Default to Arabic for admin
  
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [orderFilter, setOrderFilter] = useState('all');

  const t = translations[lang];
  const isRTL = lang === 'ar';

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const markAsDelivered = (id: string) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status: 'delivered' } : order));
  };

  const filteredOrders = orders.filter(order => orderFilter === 'all' || order.status === orderFilter);

  return (
    <div className={`admin-container ${isRTL ? 'rtl-layout' : 'ltr-layout'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <img src={getImageUrl("/image.png")} alt="Adil Logo" className="sidebar-logo-img" />
            {!isCollapsed && <h2 className="sidebar-logo-text">Adil E-commerce</h2>}
          </div>
          <button className="close-sidebar" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} title={isRTL ? 'نظرة عامة' : 'Vue d\'ensemble'}>
            <LayoutDashboard size={20} />
            <span className="nav-text">{isRTL ? 'نظرة عامة' : 'Vue d\'ensemble'}</span>
          </button>
          <button className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} title={isRTL ? 'الطلبات' : 'Commandes'}>
            <ShoppingBag size={20} />
            <span className="nav-text">{isRTL ? 'الطلبات' : 'Commandes'}</span>
            {!isCollapsed && <span className="nav-badge">{MOCK_ORDERS.length}</span>}
          </button>
          <button className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')} title={isRTL ? 'المنتجات' : 'Produits'}>
            <Package size={20} />
            <span className="nav-text">{isRTL ? 'المنتجات' : 'Produits'}</span>
            {!isCollapsed && <span className="nav-badge">{products.length}</span>}
          </button>
          <button className={`nav-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')} title={isRTL ? 'العملاء' : 'Clients'}>
            <Users size={20} />
            <span className="nav-text">{isRTL ? 'العملاء' : 'Clients'}</span>
          </button>
          <button className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title={isRTL ? 'الإعدادات' : 'Paramètres'}>
            <Settings size={20} />
            <span className="nav-text">{isRTL ? 'الإعدادات' : 'Paramètres'}</span>
          </button>
        </nav>
        
        {/* Collapse toggle button */}
        <button className="collapse-toggle-btn" onClick={toggleCollapse}>
          {isRTL ? (isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />) : (isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)}
        </button>

        <div className="sidebar-footer">
          <button className="nav-btn logout" title={isRTL ? 'تسجيل الخروج' : 'Déconnexion'}>
            <LogOut size={20} />
            <span className="nav-text">{isRTL ? 'تسجيل الخروج' : 'Déconnexion'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-start" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="menu-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            
            <div className="admin-profile">
              <span>{isRTL ? 'مرحباً، عادل' : 'Bonjour, Adil'}</span>
              <div className="avatar">A</div>
            </div>
          </div>
          
          {/* محول اللغات في الجهة الأخرى */}
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as Language)}
            className="lang-select-admin"
          >
            <option value="ar">AR</option>
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </header>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2 className="section-title">{isRTL ? 'نظرة عامة' : 'Vue d\'ensemble'}</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{isRTL ? 'إجمالي المبيعات' : 'Ventes Totales'}</h3>
                  <p className="stat-value">4,500 DH</p>
                </div>
                <div className="stat-card">
                  <h3>{isRTL ? 'الطلبات الجديدة' : 'Nouvelles Commandes'}</h3>
                  <p className="stat-value">12</p>
                </div>
                <div className="stat-card">
                  <h3>{isRTL ? 'الزوار اليوم' : 'Visiteurs Aujourd\'hui'}</h3>
                  <p className="stat-value">150</p>
                </div>
              </div>

              <div className="recent-orders">
                <h3 className="section-title">{isRTL ? 'أحدث الطلبات' : 'Dernières Commandes'}</h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>{isRTL ? 'رقم الطلب' : 'ID Commande'}</th>
                        <th>{isRTL ? 'العميل' : 'Client'}</th>
                        <th>{isRTL ? 'المنتج' : 'Produit'}</th>
                        <th>{isRTL ? 'المبلغ' : 'Montant'}</th>
                        <th>{isRTL ? 'الحالة' : 'Statut'}</th>
                        <th>{isRTL ? 'التاريخ' : 'Date'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ORDERS.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.customer}</td>
                          <td>{order.product}</td>
                          <td>{order.total}</td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status === 'pending' ? (isRTL ? 'قيد الانتظار' : 'En attente') : 
                               order.status === 'shipped' ? (isRTL ? 'تم الشحن' : 'Expédié') : 
                               (isRTL ? 'تم التوصيل' : 'Livré')}
                            </span>
                          </td>
                          <td>{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-section">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>{isRTL ? 'إدارة المنتجات' : 'Gestion des Produits'}</h2>
                <button className="btn-primary" onClick={() => setProductModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  <Plus size={18} />
                  {isRTL ? 'إضافة منتج' : 'Ajouter un Produit'}
                </button>
              </div>

              <div className="table-responsive table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{isRTL ? 'الصورة' : 'Image'}</th>
                      <th>{isRTL ? 'الاسم' : 'Nom'}</th>
                      <th>{isRTL ? 'التصنيف' : 'Catégorie'}</th>
                      <th>{isRTL ? 'السعر' : 'Prix'}</th>
                      <th>{isRTL ? 'المخزون' : 'Stock'}</th>
                      <th>{isRTL ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                        </td>
                        <td style={{ fontWeight: 500 }}>{product.name}</td>
                        <td>{product.category}</td>
                        <td style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{product.price}</td>
                        <td>
                          <span className={`status-badge ${product.inStock ? 'delivered' : 'pending'}`}>
                            {product.inStock ? (isRTL ? 'متوفر' : 'En stock') : (isRTL ? 'نفد' : 'Rupture')}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="action-btn edit-btn" title={isRTL ? 'تعديل' : 'Modifier'}>
                              <Edit size={20} />
                            </button>
                            <button className="action-btn delete-btn" title={isRTL ? 'حذف' : 'Supprimer'}>
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <div className="section-header" style={{ marginBottom: '20px' }}>
                <h2 className="section-title">{isRTL ? 'إدارة الطلبات' : 'Gestion des Commandes'}</h2>
              </div>

              {/* التبويبات للفلترة */}
              <div className="orders-filters" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`} onClick={() => setOrderFilter('all')}>
                  {isRTL ? 'الكل' : 'Tous'}
                </button>
                <button className={`filter-btn ${orderFilter === 'pending' ? 'active' : ''}`} onClick={() => setOrderFilter('pending')}>
                  {isRTL ? 'قيد الانتظار' : 'En attente'}
                </button>
                <button className={`filter-btn ${orderFilter === 'delivered' ? 'active' : ''}`} onClick={() => setOrderFilter('delivered')}>
                  {isRTL ? 'تم الاستلام' : 'Livrés'}
                </button>
              </div>

              <div className="table-responsive table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{isRTL ? 'رقم الطلب' : 'ID Commande'}</th>
                      <th>{isRTL ? 'العميل' : 'Client'}</th>
                      <th>{isRTL ? 'المنتج' : 'Produit'}</th>
                      <th>{isRTL ? 'المبلغ' : 'Montant'}</th>
                      <th>{isRTL ? 'الحالة' : 'Statut'}</th>
                      <th>{isRTL ? 'التاريخ' : 'Date'}</th>
                      <th>{isRTL ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.product}</td>
                        <td style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{order.total}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status === 'pending' ? (isRTL ? 'قيد الانتظار' : 'En attente') : 
                             order.status === 'shipped' ? (isRTL ? 'تم الشحن' : 'Expédié') : 
                             (isRTL ? 'تم التوصيل' : 'Livré')}
                          </span>
                        </td>
                        <td>{order.date}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="action-btn edit-btn" title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'}>
                              <Eye size={18} />
                            </button>
                            {order.status !== 'delivered' && (
                              <button className="action-btn check-btn" onClick={() => markAsDelivered(order.id)} title={isRTL ? 'تحديد كمستلم' : 'Marquer comme livré'}>
                                <Check size={18} />
                              </button>
                            )}
                            <button className="action-btn delete-btn" title={isRTL ? 'حذف' : 'Supprimer'}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'products' && activeTab !== 'orders' && (
            <div className="placeholder-section">
              <h2>{isRTL ? 'هذا القسم قيد التطوير' : 'Cette section est en cours de développement'}</h2>
              <p>{isRTL ? 'سيتم إضافة المحتوى قريباً.' : 'Le contenu sera ajouté bientôt.'}</p>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal Placeholder */}
      {isProductModalOpen && (
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setProductModalOpen(false)}>
          <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{isRTL ? 'إضافة منتج جديد' : 'Ajouter un nouveau produit'}</h2>
              <button onClick={() => setProductModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 500 }}>{isRTL ? 'اسم المنتج' : 'Nom du produit'}</label>
                <input type="text" placeholder={isRTL ? 'مثال: حقيبة جلدية' : 'Ex: Sac en cuir'} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 500 }}>{isRTL ? 'التصنيف' : 'Catégorie'}</label>
                <select style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required>
                  <option value="Sacs">{isRTL ? 'حقائب' : 'Sacs'}</option>
                  <option value="Sacs à dos">{isRTL ? 'حقائب ظهر' : 'Sacs à dos'}</option>
                  <option value="Portefeuilles">{isRTL ? 'محافظ' : 'Portefeuilles'}</option>
                  <option value="Voyage">{isRTL ? 'سفر' : 'Voyage'}</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 500 }}>{isRTL ? 'السعر (DH)' : 'Prix (DH)'}</label>
                <input type="text" placeholder="Ex: 350 DH" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 500 }}>{isRTL ? 'صورة المنتج' : 'Image du produit'}</label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', transition: 'border-color 0.2s' }}
                     onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                     onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} id="product-image-upload" />
                  <label htmlFor="product-image-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Package size={24} style={{ color: '#64748b' }} />
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{isRTL ? 'اضغط هنا لرفع صورة للمنتج' : 'Cliquez ici pour télécharger une image'}</span>
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="inStock" defaultChecked style={{ width: '18px', height: '18px' }} />
                <label htmlFor="inStock" style={{ fontWeight: 500 }}>{isRTL ? 'متوفر في المخزون' : 'En stock'}</label>
              </div>
            </form>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setProductModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
                {isRTL ? 'إلغاء' : 'Annuler'}
              </button>
              <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer' }}>
                {isRTL ? 'حفظ' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </div>
  );
}
