import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// دالة سحرية لتحويل الصورة إلى دائرة في شريط المتصفح
function setCircularFavicon(imgUrl: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.src = imgUrl;
  img.onload = () => {
    // 1. رسم الإطار الأزرق الخارجي (رفيع جداً)
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#2563eb'; // لون الإطار الأزرق
    ctx.fill();
    ctx.closePath();

    // 2. رسم الفراغ الأبيض (رفيع جداً)
    ctx.beginPath();
    ctx.arc(32, 32, 31, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();

    // 3. قص الصورة على شكل دائرة لتوضع في المنتصف
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.clip();
    
    // رسم الصورة بحجم أكبر بكثير لتكون واضحة
    const size = Math.min(img.width, img.height);
    const x = (img.width - size) / 2;
    const y = (img.height - size) / 2;
    
    ctx.drawImage(img, x, y, size, size, 2, 2, 60, 60);
    
    // وضع الصورة كـ Favicon
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = canvas.toDataURL('image/png');
  };
}

// تنفيذ الدالة على صورتك
setCircularFavicon('/image.png');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
