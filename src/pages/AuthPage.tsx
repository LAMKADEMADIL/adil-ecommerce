import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          throw new Error('كلمات المرور غير متطابقة');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await setDoc(doc(db, "customers", userCredential.user.uid), {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      navigate('/'); // العودة للمتجر بعد النجاح
    } catch (err: any) {
      console.error(err);
      setError(err.message.includes('auth/user-not-found') ? 'الحساب غير موجود' : 'حدث خطأ، يرجى التأكد من البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        {/* Header Section */}
        <div className="auth-header-card">
          <Link to="/" className="back-btn">
            <ArrowLeft size={20} />
            <span>العودة للمتجر</span>
          </Link>
          <div className="auth-brand">
             <CheckCircle2 size={40} color="var(--primary-color)" />
             <h1>{isLogin ? 'مرحباً بك مجدداً' : 'إنشاء حساب جديد'}</h1>
             <p>{isLogin ? 'قم بتسجيل الدخول لمتابعة طلباتك' : 'انضم إلينا واستمتع بتجربة تسوق فريدة'}</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="name-fields">
                <div className="input-group">
                  <label><User size={16} /> الاسم</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    placeholder="الاسم الأول"
                  />
                </div>
                <div className="input-group">
                  <label><User size={16} /> النسب</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    placeholder="النسب"
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label><Mail size={16} /> البريد الإلكتروني</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="example@mail.com"
              />
            </div>

            <div className="input-group">
              <label><Lock size={16} /> كلمة المرور</label>
              <input 
                type="password" 
                required 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="input-group">
                <label><Lock size={16} /> تأكيد كلمة المرور</label>
                <input 
                  type="password" 
                  required 
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'جاري المعالجة...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب')}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
              <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'سجل الآن مجاناً' : 'سجل دخولك'}
              </button>
            </p>
          </div>
        </div>

        <div className="auth-footer">
          <div className="trust-badge">
            <ShieldCheck size={16} />
            <span>تسوق آمن ومشفر 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
