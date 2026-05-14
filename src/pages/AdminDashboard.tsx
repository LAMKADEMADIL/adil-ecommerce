import React, { useState } from 'react';
import { Package, ShoppingBag, Users, Settings, LogOut, LayoutDashboard, Menu, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { translations } from '../translations';
import type { Language } from '../translations';
import { getImageUrl } from './StoreFront'; // Reusing the helper
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
  const [activeTab, setActiveTab] = useState('overview');
  const [lang, setLang] = useState<Language>('ar'); // Default to Arabic for admin

  const t = translations[lang];
  const isRTL = lang === 'ar';

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

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
          </button>
          <button className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')} title={isRTL ? 'المنتجات' : 'Produits'}>
            <Package size={20} />
            <span className="nav-text">{isRTL ? 'المنتجات' : 'Produits'}</span>
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
          <button className="menu-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          
          {/* محول اللغات */}
          <div className="admin-actions">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Language)}
              className="lang-select-admin"
            >
              <option value="ar">AR</option>
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
            
            <div className="admin-profile">
              <span>{isRTL ? 'مرحباً، عادل' : 'Bonjour, Adil'}</span>
              <div className="avatar">A</div>
            </div>
          </div>
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

          {activeTab !== 'overview' && (
            <div className="placeholder-section">
              <h2>{isRTL ? 'هذا القسم قيد التطوير' : 'Cette section est en cours de développement'}</h2>
              <p>{isRTL ? 'سيتم إضافة المحتوى قريباً.' : 'Le contenu sera ajouté bientôt.'}</p>
            </div>
          )}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </div>
  );
}
