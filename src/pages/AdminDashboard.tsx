import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Users, Settings, LogOut, LayoutDashboard, Menu, X, ChevronRight, ChevronLeft, Plus, Edit, Trash2, Eye, Check, EyeOff } from 'lucide-react';
import type { Language } from '../translations';
import { getImageUrl } from '../utils';
import './AdminDashboard.css';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, updatePassword, EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail } from 'firebase/auth';

// Les données factices ont été supprimées car elles ne sont plus utilisées.

export default function AdminDashboard() {
  const navigate = useNavigate();
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
    image2: '',
    image3: '',
    image4: '',
    image5: '',
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

  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "store"), storeSettings);
      
      const user = auth.currentUser;
      
      // تحديث بيانات المستخدم في مجموعة users
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const updateData: any = {
          "Nom de la boutique": storeSettings.storeName,
          "Numéro WhatsApp": storeSettings.whatsapp,
          "email": storeSettings.email,
        };
        
        // تحديث كلمة المرور في قاعدة البيانات فقط إذا تم كتابة كلمة مرور جديدة
        if (newPassword) {
          updateData["mot de passe"] = newPassword;
        }
        
        await setDoc(userDocRef, updateData, { merge: true });
      }
      const emailChanged = user && user.email !== storeSettings.email;
      
      if (emailChanged || newPassword) {
        if (!oldPassword) {
          alert(isRTL ? 'الرجاء إدخال كلمة المرور الحالية لتأكيد التغييرات الحساسة!' : 'Veuillez entrer le mot de passe actuel pour confirmer les changements sensibles !');
          return;
        }
        
        if (newPassword && newPassword !== confirmPassword) {
          alert(isRTL ? 'كلمات المرور غير متطابقة!' : 'Les mots de passe ne correspondent pas !');
          return;
        }
        
        if (user) {
          // Re-authenticate user
          const credential = EmailAuthProvider.credential(user.email!, oldPassword);
          await reauthenticateWithCredential(user, credential);
          
          // Update email if changed
          if (emailChanged) {
            await verifyBeforeUpdateEmail(user, storeSettings.email);
            alert(isRTL ? 'تم إرسال رابط تفعيل للايميل الجديد! يرجى فتح علبة الوارد للايميل الجديد والضغط على الرابط لإتمام التغيير.' : 'Un lien de vérification a été envoyé au nouvel e-mail ! Veuillez l\'ouvrir pour confirmer.');
          }
          
          // Update password if filled
          if (newPassword) {
            await updatePassword(user, newPassword);
          }
          
          alert(isRTL ? 'تم تحديث البيانات بنجاح!' : 'Données mises à jour avec succès !');
        } else {
          alert(isRTL ? 'يجب إعادة تسجيل الدخول!' : 'Veuillez vous reconnecter.');
        }
      } else {
        alert(isRTL ? 'تم حفظ الإعدادات بنجاح!' : 'Paramètres enregistrés avec succès!');
      }
      
      setNewPassword('');
      setOldPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      console.error("Error saving settings: ", e);
      if (e.code === 'auth/wrong-password') {
        alert(isRTL ? 'كلمة المرور الحالية خاطئة!' : 'Le mot de passe actuel est incorrect !');
      } else if (e.code === 'auth/requires-recent-login') {
        alert(isRTL ? 'الرجاء تسجيل الدخول مجدداً لتغيير البيانات (لدواعي أمنية).' : 'Veuillez vous reconnecter pour changer les données (sécurité).');
      } else {
        alert(`Error saving settings: ${e.message || e.code || e}`);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSettings();
  }, []);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string = 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, [fieldName]: reader.result as string });
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
      image2: product.image2 || '',
      image3: product.image3 || '',
      image4: product.image4 || '',
      image5: product.image5 || '',
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
        image2: '',
        image3: '',
        image4: '',
        image5: '',
        inStock: true
      });
      // Refetch products
      fetchProducts();
    } catch (e) {
      console.error("Error saving document: ", e);
    }
  };
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === 'adillamkadem@gmail.com') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // توجيه أي شخص آخر لصفحة تسجيل الدخول
        if (!isLoadingAuth) navigate('/login');
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (storeSettings.email) {
      // setEmail(storeSettings.email); // No longer needed
    }
  }, [storeSettings.email]);

  const isRTL = lang === 'ar';

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  
  const markAsDelivered = (id: string) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status: 'delivered' } : order));
  };



  if (isLoadingAuth) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
    return null; // سيتم التوجيه عبر useEffect
  }

  return (
    <div className={`admin-container ${isRTL ? 'rtl-layout' : 'ltr-layout'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <img src={getImageUrl("/image.png")} alt="Adil Logo" className="sidebar-logo-img" />
            {!isCollapsed && <h2 className="sidebar-logo-text">{storeSettings.storeName}</h2>}
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
              <span>{isRTL ? `مرحباً، ${storeSettings.storeName}` : `Bonjour, ${storeSettings.storeName}`}</span>
              <div className="avatar">{storeSettings.storeName.charAt(0).toUpperCase()}</div>
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
              <div className="section-header" style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h2 className="section-title">{isRTL ? 'الإعدادات العامة' : 'Paramètres Généraux'}</h2>
              </div>

              <div className="table-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSaveSettings}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                      <label style={{ fontWeight: 500 }}>{isRTL ? 'اسم المتجر' : 'Nom'}</label>
                      <input type="text" value={storeSettings.storeName} onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                      <label style={{ fontWeight: 500 }}>{isRTL ? 'رقم الواتساب' : 'Numéro WhatsApp'}</label>
                      <input type="text" value={storeSettings.whatsapp} onChange={(e) => setStoreSettings({...storeSettings, whatsapp: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                      <label style={{ fontWeight: 500 }}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                      <input type="email" value={storeSettings.email} onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                      <label style={{ fontWeight: 500 }}>{isRTL ? 'العملة' : 'Devise'}</label>
                      <select value={storeSettings.currency} onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <option value="DH">DH (Dirham Marocain)</option>
                        <option value="$">$ (Dollar)</option>
                        <option value="€">€ (Euro)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                      <label style={{ fontWeight: 500 }}>{isRTL ? 'كلمة المرور' : 'Mot de passe'}</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showOldPassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={{ padding: '10px', paddingRight: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                          {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                      <label style={{ fontWeight: 500 }}>{isRTL ? 'كلمة مرور جديدة' : 'Nouveau mot de passe'}</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ padding: '10px', paddingRight: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {newPassword.length > 0 && (
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontWeight: 500 }}>{isRTL ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'}</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ padding: '10px', paddingRight: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
 
                   <button type="submit" className="btn-primary" style={{ alignSelf: 'center', padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
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
        <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => { setProductModalOpen(false); setIsEditing(false); setNewProduct({ name: '', price: '', category: 'Sacs', image: '', image2: '', image3: '', image4: '', image5: '', inStock: true }); }}>
          <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>{isEditing ? (isRTL ? 'تعديل المنتج' : 'Modifier le produit') : (isRTL ? 'إضافة منتج جديد' : 'Ajouter un nouveau produit')}</h2>
              <button onClick={() => { setProductModalOpen(false); setIsEditing(false); setNewProduct({ name: '', price: '', category: 'Sacs', image: '', image2: '', image3: '', image4: '', image5: '', inStock: true }); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
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

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 500 }}>{isRTL ? 'صور إضافية (اختياري)' : 'Images supplémentaires (Optionnel)'}</label>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {[2, 3, 4, 5].map(num => (
                    <div key={num} style={{ 
                      minWidth: '80px', height: '80px', 
                      border: '2px dashed #cbd5e1', borderRadius: '8px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', position: 'relative', overflow: 'hidden'
                    }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        id={`upload-img-${num}`} 
                        onChange={(e) => handleImageChange(e, `image${num}`)} 
                      />
                      <label htmlFor={`upload-img-${num}`} style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(newProduct as any)[`image${num}`] ? (
                          <img src={(newProduct as any)[`image${num}`]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Extra ${num}`} />
                        ) : (
                          <Plus size={20} style={{ color: '#64748b' }} />
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="inStock" checked={newProduct.inStock} onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="inStock" style={{ fontWeight: 500 }}>{isRTL ? 'متوفر في المخزون' : 'En stock'}</label>
              </div>
            </form>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => { setProductModalOpen(false); setIsEditing(false); setNewProduct({ name: '', price: '', category: 'Sacs', image: '', image2: '', image3: '', image4: '', image5: '', inStock: true }); }} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
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
