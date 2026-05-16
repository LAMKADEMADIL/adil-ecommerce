import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { translations } from '../translations';
import type { Language } from '../translations';
import './AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Language>('fr');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error(isRTL ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await setDoc(doc(db, "customers", userCredential.user.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          createdAt: new Date().toISOString()
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        // التحقق مما إذا كان المستخدم هو المسؤول
        if (userCredential.user.email === 'adillamkadem@gmail.com') {
          navigate('/admin');
          return;
        }
      }
      navigate('/'); 
    } catch (err: any) {
      console.error(err);
      setError(isRTL ? 'حدث خطأ، يرجى التأكد من البيانات' : 'Une erreur est survenue, veuillez vérifier vos informations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-page-wrapper ${isRTL ? 'rtl-mode' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="auth-container">
        {/* Header Section */}
        <div className="auth-header-card">
          <Link to="/" className="back-btn">
            {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            <span>{t.backToStore}</span>
          </Link>
          <div className="auth-brand">
             <CheckCircle2 size={40} color="var(--primary-color)" />
             <h1>{isLogin ? t.welcomeBack : t.signup}</h1>
             <p>{isLogin ? t.loginDesc : t.signupDesc}</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
            {!isLogin && (
              <div className="name-fields">
                <div className="input-group">
                  <label><User size={16} /> {t.firstName}</label>
                  <input 
                    type="text" 
                    required 
                    autoComplete="new-password"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    placeholder={t.firstName}
                  />
                </div>
                <div className="input-group">
                  <label><User size={16} /> {t.lastName}</label>
                  <input 
                    type="text" 
                    required 
                    autoComplete="new-password"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    placeholder={t.lastName}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label><Mail size={16} /> {t.email}</label>
              <input 
                type="email" 
                required 
                autoComplete="off"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="example@mail.com"
              />
            </div>

            <div className="input-group">
              <label><Lock size={16} /> {t.password}</label>
              <input 
                type="password" 
                required 
                autoComplete="new-password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="input-group">
                <label><Lock size={16} /> {t.confirmPassword}</label>
                <input 
                  type="password" 
                  required 
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? '...' : (isLogin ? t.login : t.signup)}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              {isLogin ? t.noAccount : t.haveAccount}
              <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? t.registerNow : t.login}
              </button>
            </p>
          </div>
        </div>

        <div className="auth-footer">
          <div className="trust-badge">
            <ShieldCheck size={16} />
            <span>{t.safeShopping}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
