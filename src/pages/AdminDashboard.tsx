import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Users, Settings, LogOut, LayoutDashboard, Menu, X, ChevronRight, ChevronLeft, Plus, Edit, Trash2, Eye, Check } from 'lucide-react';
import { translations } from '../translations';
import type { Language } from '../translations';
import { getImageUrl, MOCK_PRODUCTS as INITIAL_PRODUCTS } from './StoreFront';
import './AdminDashboard.css';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

// بيانات وهمية للطلبات
const MOCK_ORDERS = [
  { id: '#1001', customer: 'أحمد العلمي', product: 'Pack Voyage & Sac à Dos Cuir', total: '450 DH', status: 'pending', date: '2023-10-25' },
  { id: '#1002', customer: 'ياسين بناني', product: 'Sac à Main Élégant', total: '350 DH', status: 'shipped', date: '2023-10-24' },
  { id: '#1003', customer: 'سارة محمد', product: 'Portefeuille Classique', total: '150 DH', status: 'delivered', date: '2023-10-22' },
];

// بيانات وهمية للعملاء
const MOCK_CUSTOMERS = [
  { id: '#C101', name: 'أحمد العلمي', email: 'ahmed@example.com', orders: 5, totalSpent: '2250 DH' },
  { id: '#C102', name: 'ياسين بناني', email: 'yassine@example.com', orders: 2, totalSpent: '700 DH' },
  { id: '#C103', name: 'سارة محمد', email: 'sara@example.com', orders: 1, totalSpent: '150 DH' },
];

export default function AdminDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // For mobile overlay
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop collapse
  const [activeTab, setActiveTab] = useState('products'); // Set to products by default for testing
  const [lang, setLang] = useState<Language>('fr'); // Default to French for admin
  
  const [products, setProducts] = useState<any[]>([]);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState('all');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Sacs',
    image: '',
    inStock: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerModalOpen(true);
  };

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (e) {
      console.error("Error fetching products: ", e);
    }
  };

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    } catch (e) {
      console.error("Error fetching orders: ", e);
    }
  };

  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Adil E-commerce',
    whatsapp: '+212 600000000',
    email: 'contact@adil.com',
    currency: 'DH'
  });

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, "settings", "store");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStoreSettings(docSnap.data() as any);
      }
    } catch (e) {
      console.error("Error fetching settings: ", e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "store"), storeSettings);
      alert(isRTL ? 'تم حفظ الإعدادات بنجاح!' : 'Paramètres enregistrés avec succès!');
    } catch (e) {
      console.error("Error saving settings: ", e);
      alert("Error saving settings.");
    }
  };

  const totalSales = orders.reduce((sum, order) => {
    const totalStr = order.total ? String(order.total) : '';
    const priceNum = parseFloat(totalStr.replace(/[^0-9.]/g, '')) || 0;
    return sum + priceNum;
  }, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  const extractedCustomers = orders.reduce((acc: any[], order) => {
    const existingCustomer = acc.find(c => c.phone === order.phone);
    const priceNum = parseFloat(order.total?.replace(/[^0-9.]/g, '')) || 0;
    
    if (existingCustomer) {
      existingCustomer.orders += 1;
      existingCustomer.totalSpent += priceNum;
    } else {
      acc.push({
        id: order.id,
        name: order.customer,
        phone: order.phone,
        orders: 1,
        totalSpent: priceNum
      });
    }
    return acc;
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProduct = (product: any) => {
    setNewProduct({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      inStock: product.inStock
    });
    setEditingProductId(product.id);
    setIsEditing(true);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
      } catch (e) {
        console.error("Error deleting document: ", e);
      }
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (isEditing) {
        await updateDoc(doc(db, "products", editingProductId), newProduct);
        console.log("Document updated with ID: ", editingProductId);
      } else {
        const docRef = await addDoc(collection(db, "products"), newProduct);
        console.log("Document written with ID: ", docRef.id);
      }
      setProductModalOpen(false);
      setIsEditing(false);
      setEditingProductId('');
      // Reset form
      setNewProduct({
        name: '',
        price: '',
        category: 'Sacs',
        image: '',
        inStock: true
      });
      // Refetch products
      fetchProducts();
    } catch (e) {
      console.error("Error saving document: ", e);
    }
  };
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const t = translations[lang];
  const isRTL = lang === 'ar';

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  
  const markAsDelivered = (id: string) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status: 'delivered' } : order));
  };



  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
              <Users size={30} style={{ color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{isRTL ? 'تسجيل الدخول للإدارة' : 'Connexion Admin'}</h1>
            <p style={{ color: '#64748b', marginTop: '5px' }}>{isRTL ? 'أدخل بياناتك للمتابعة' : 'Entrez vos identifiants pour continuer'}</p>
          </div>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={(e) => {
            e.preventDefault();
            if (email === 'admin@adil.com' && password === 'admin123') {
              setIsAuthenticated(true);
            } else {
              setLoginError(isRTL ? 'بيانات غير صحيحة!' : 'Identifiants incorrects!');
            }
          }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontWeight: 500 }}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@adil.com" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
            </div>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontWeight: 500 }}>{isRTL ? 'كلمة المرور' : 'Mot de passe'}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
            </div>
            
            {loginError && <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{loginError}</p>}
            
            <button type="submit" style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}>
              {isRTL ? 'دخول' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            {!isCollapsed && <span className="nav-badge">{orders.length}</span>}
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
          <button className="nav-btn logout" onClick={() => setIsAuthenticated(false)} title={isRTL ? 'تسجيل الخروج' : 'Déconnexion'}>
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
                  <p className="stat-value">{totalSales} DH</p>
                </div>
                <div className="stat-card">
                  <h3>{isRTL ? 'الطلبات الجديدة' : 'Nouvelles Commandes'}</h3>
                  <p className="stat-value">{pendingOrdersCount}</p>
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
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 600 }} title={String(order.id)}>{String(order.id).length > 6 ? `${String(order.id).substring(0, 6)}...` : String(order.id)}</td>
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
                          <img src={product.image && product.image.startsWith('data:image/') ? product.image : getImageUrl(product.image)} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
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
                            <button className="action-btn edit-btn" title={isRTL ? 'تعديل' : 'Modifier'} onClick={() => handleEditProduct(product)}>
                              <Edit size={20} />
                            </button>
                            <button className="action-btn delete-btn" title={isRTL ? 'حذف' : 'Supprimer'} onClick={() => handleDeleteProduct(product.id)}>
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
                        <td style={{ fontWeight: 600 }} title={String(order.id)}>{String(order.id).length > 6 ? `${String(order.id).substring(0, 6)}...` : String(order.id)}</td>
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
                            <button className="action-btn edit-btn" title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'} onClick={() => handleViewOrder(order)}>
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

          {activeTab === 'customers' && (
            <div className="customers-section">
              <div className="section-header" style={{ marginBottom: '20px' }}>
                <h2 className="section-title">{isRTL ? 'إدارة العملاء' : 'Gestion des Clients'}</h2>
              </div>

              <div className="table-responsive table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{isRTL ? 'الاسم' : 'Nom'}</th>
                      <th>{isRTL ? 'الهاتف' : 'Téléphone'}</th>
                      <th>{isRTL ? 'عدد الطلبات' : 'Commandes'}</th>
                      <th>{isRTL ? 'إجمالي الإنفاق' : 'Total dépensé'}</th>
                      <th>{isRTL ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td style={{ fontWeight: 500 }}>{customer.name}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.orders}</td>
                        <td style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{customer.totalSpent} DH</td>
                        <td>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="action-btn edit-btn" title={isRTL ? 'عرض التفاصيل' : 'Voir les détails'} onClick={() => handleViewCustomer(customer)}>
                              <Eye size={18} />
                            </button>
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

          {activeTab === 'settings' && (
            <div className="settings-section">
              <div className="section-header" style={{ marginBottom: '20px' }}>
                <h2 className="section-title">{isRTL ? 'الإعدادات العامة' : 'Paramètres Généraux'}</h2>
              </div>

              <div className="table-card" style={{ maxWidth: '600px' }}>
                <form className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSaveSettings}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: 500 }}>{isRTL ? 'اسم المتجر' : 'Nom de la boutique'}</label>
                    <input type="text" value={storeSettings.storeName} onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: 500 }}>{isRTL ? 'رقم الواتساب' : 'Numéro WhatsApp'}</label>
                    <input type="text" value={storeSettings.whatsapp} onChange={(e) => setStoreSettings({...storeSettings, whatsapp: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: 500 }}>{isRTL ? 'البريد الإلكتروني' : 'Email de contact'}</label>
                    <input type="email" value={storeSettings.email} onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontWeight: 500 }}>{isRTL ? 'العملة' : 'Devise'}</label>
                    <select value={storeSettings.currency} onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <option value="DH">DH (Dirham Marocain)</option>
                      <option value="$">$ (Dollar)</option>
                      <option value="€">€ (Euro)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isRTL ? 'حفظ التغييرات' : 'Enregistrer les modifications'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'products' && activeTab !== 'orders' && activeTab !== 'customers' && activeTab !== 'settings' && (
            <div className="placeholder-section">
              <h2>{isRTL ? 'هذا القسم قيد التطوير' : 'Cette section est en cours de développement'}</h2>
              <p>{isRTL ? 'سيتم إضافة المحتوى قريباً.' : 'Le contenu sera ajouté bientôt.'}</p>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal Placeholder */}
      {isProductModalOpen && (
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => { setProductModalOpen(false); setIsEditing(false); setNewProduct({ name: '', price: '', category: 'Sacs', image: '', inStock: true }); }}>
          <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{isEditing ? (isRTL ? 'تعديل المنتج' : 'Modifier le produit') : (isRTL ? 'إضافة منتج جديد' : 'Ajouter un nouveau produit')}</h2>
              <button onClick={() => { setProductModalOpen(false); setIsEditing(false); setNewProduct({ name: '', price: '', category: 'Sacs', image: '', inStock: true }); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={(e) => e.preventDefault()}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 500 }}>{isRTL ? 'اسم المنتج' : 'Nom du produit'}</label>
                <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder={isRTL ? 'مثال: حقيبة جلدية' : 'Ex: Sac en cuir'} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 500 }}>{isRTL ? 'التصنيف' : 'Catégorie'}</label>
                <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required>
                  <option value="Sacs">{isRTL ? 'حقائب' : 'Sacs'}</option>
                  <option value="Sacs à dos">{isRTL ? 'حقائب ظهر' : 'Sacs à dos'}</option>
                  <option value="Portefeuilles">{isRTL ? 'محافظ' : 'Portefeuilles'}</option>
                  <option value="Voyage">{isRTL ? 'سفر' : 'Voyage'}</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 500 }}>{isRTL ? 'السعر (DH)' : 'Prix (DH)'}</label>
                <input type="text" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} placeholder="Ex: 350 DH" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 500 }}>{isRTL ? 'صورة المنتج' : 'Image du produit'}</label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', transition: 'border-color 0.2s', position: 'relative' }}
                     onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                     onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} id="product-image-upload" onChange={handleImageChange} />
                  <label htmlFor="product-image-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {newProduct.image ? (
                      <img src={newProduct.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
                    ) : (
                      <>
                        <Package size={24} style={{ color: '#64748b' }} />
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{isRTL ? 'اضغط هنا لرفع صورة للمنتج' : 'Cliquez ici pour télécharger une image'}</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="inStock" checked={newProduct.inStock} onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="inStock" style={{ fontWeight: 500 }}>{isRTL ? 'متوفر في المخزون' : 'En stock'}</label>
              </div>
            </form>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => { setProductModalOpen(false); setIsEditing(false); setNewProduct({ name: '', price: '', category: 'Sacs', image: '', inStock: true }); }} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
                {isRTL ? 'إلغاء' : 'Annuler'}
              </button>
              <button onClick={handleSaveProduct} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer' }}>
                {isRTL ? 'حفظ' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Order Details Modal */}
      {isOrderModalOpen && selectedOrder && (
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setOrderModalOpen(false)}>
          <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{isRTL ? 'تفاصيل الطلب' : 'Détails de la commande'}</h2>
              <button onClick={() => setOrderModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'رقم الطلب:' : 'ID Commande:'}</span>
                <span>{selectedOrder.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'العميل:' : 'Client:'}</span>
                <span>{selectedOrder.customer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                <span>{selectedOrder.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'المدينة:' : 'Ville:'}</span>
                <span>{selectedOrder.city}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'المنتج:' : 'Produit:'}</span>
                <span>{selectedOrder.product}</span>
              </div>
              {(() => {
                const orderedProduct = products.find(p => p.name === selectedOrder.product);
                if (orderedProduct?.image) {
                  return (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                      <img 
                        src={orderedProduct.image.startsWith('data:image/') ? orderedProduct.image : getImageUrl(orderedProduct.image)} 
                        alt={selectedOrder.product} 
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                      />
                    </div>
                  );
                }
                return null;
              })()}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'المبلغ:' : 'Montant:'}</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{selectedOrder.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'الحالة:' : 'Statut:'}</span>
                <span className={`status-badge ${selectedOrder.status}`}>
                  {selectedOrder.status === 'pending' ? (isRTL ? 'قيد الانتظار' : 'En attente') : 
                   selectedOrder.status === 'shipped' ? (isRTL ? 'تم الشحن' : 'Expédié') : 
                   (isRTL ? 'تم التوصيل' : 'Livré')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'التاريخ:' : 'Date:'}</span>
                <span>{selectedOrder.date}</span>
              </div>
            </div>
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setOrderModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                {isRTL ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Customer Details Modal */}
      {isCustomerModalOpen && selectedCustomer && (
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setCustomerModalOpen(false)}>
          <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{isRTL ? 'تفاصيل العميل' : 'Détails du Client'}</h2>
              <button onClick={() => setCustomerModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'الاسم:' : 'Nom:'}</span>
                <span>{selectedCustomer.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'الهاتف:' : 'Téléphone:'}</span>
                <span>{selectedCustomer.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'إجمالي الطلبات:' : 'Total Commandes:'}</span>
                <span>{selectedCustomer.orders}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{isRTL ? 'إجمالي الإنفاق:' : 'Total Dépensé:'}</span>
                <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{selectedCustomer.totalSpent} DH</span>
              </div>

              <h3 style={{ marginTop: '15px', marginBottom: '10px' }}>{isRTL ? 'تاريخ الطلبات' : 'Historique des Commandes'}</h3>
              <div className="table-responsive">
                <table className="admin-table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>{isRTL ? 'الصورة' : 'Image'}</th>
                      <th>{isRTL ? 'رقم الطلب' : 'ID'}</th>
                      <th>{isRTL ? 'المنتج' : 'Produit'}</th>
                      <th>{isRTL ? 'المبلغ' : 'Montant'}</th>
                      <th>{isRTL ? 'الحالة' : 'Statut'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.phone === selectedCustomer.phone).map((order) => (
                      <tr key={order.id}>
                        <td>
                          {(() => {
                            const orderedProduct = products.find(p => p.name === order.product);
                            if (orderedProduct?.image) {
                              return (
                                <img 
                                  src={orderedProduct.image.startsWith('data:image/') ? orderedProduct.image : getImageUrl(orderedProduct.image)} 
                                  alt={order.product} 
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                                />
                              );
                            }
                            return null;
                          })()}
                        </td>
                        <td title={String(order.id)}>{String(order.id).length > 6 ? `${String(order.id).substring(0, 6)}...` : String(order.id)}</td>
                        <td>{order.product}</td>
                        <td>{order.total}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status === 'pending' ? (isRTL ? 'قيد الانتظار' : 'En attente') : 
                             order.status === 'shipped' ? (isRTL ? 'تم الشحن' : 'Expédié') : 
                             (isRTL ? 'تم التوصيل' : 'Livré')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setCustomerModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                {isRTL ? 'إغلاق' : 'Fermer'}
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
