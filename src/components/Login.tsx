import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { LogIn, UserPlus, Key, Mail, Shield, AlertCircle, ArrowRight, Check, Code, User, Hammer, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onSuccess: (userId: string, email: string) => void;
  onSkip: () => void;
}

const DEMO_ACCOUNTS = [
  {
    role: 'مدير النظام والمطور (Admin)',
    email: 'admin@tazaj.com',
    pass: 'admin123',
    badge: 'صلاحيات كاملة',
    icon: Shield,
    color: 'emerald'
  },
  {
    role: 'المحاسب المالي المعتمد',
    email: 'accountant@tazaj.com',
    pass: 'accountant123',
    badge: 'عرض التقارير والتدقيق',
    icon: Code,
    color: 'blue'
  },
  {
    role: 'كاشير المحل النشط',
    email: 'cashier@tazaj.com',
    pass: 'cashier123',
    badge: 'البيع السريع والمخزن',
    icon: User,
    color: 'amber'
  }
];

export default function Login({ onSuccess, onSkip }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsOperationNotAllowed(false);

    // Simple validation
    if (!email || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف أو أكثر');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMsg('تم إنشاء الحساب بنجاح! جاري المزامنة...');
        setTimeout(() => {
          onSuccess(userCredential.user.uid, userCredential.user.email || email);
        }, 1500);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setSuccessMsg('تم تسجيل الدخول بنجاح! جاري تحميل بياناتك السحابية...');
        setTimeout(() => {
          onSuccess(userCredential.user.uid, userCredential.user.email || email);
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      let arabicError = 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.';
      if (err.code === 'auth/operation-not-allowed') {
        setIsOperationNotAllowed(true);
        arabicError = '⚠️ عذراً، تسجيل الدخول بالبريد الإلكتروني غير مفعّل في لوحة تحكم Firebase الخاصة بك حالياً.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        arabicError = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (err.code === 'auth/email-already-in-use') {
        arabicError = 'البريد الإلكتروني مستخدم بالفعل بحساب آخر';
      } else if (err.code === 'auth/invalid-email') {
        arabicError = 'صيغة البريد الإلكتروني غير صالحة';
      } else if (err.code === 'auth/weak-password') {
        arabicError = 'كلمة المرور ضعيفة للغاية';
      }
      setError(arabicError);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setError(null);
    setSuccessMsg(null);
    setIsOperationNotAllowed(false);
    setLoading(true);
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      // Try signing in first
      const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      setSuccessMsg(`🔓 تم تسجيل الدخول بنجاح بصلاحيات [${demoEmail}]!`);
      setTimeout(() => {
        onSuccess(userCredential.user.uid, userCredential.user.email || demoEmail);
      }, 1500);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setIsOperationNotAllowed(true);
        setError('⚠️ عذراً، تسجيل الدخول بالبريد الإلكتروني غير مفعّل في لوحة تحكم Firebase الخاصة بك حالياً.');
        setLoading(false);
        return;
      }

      // Auto-register demo accounts on first-ever usage so users don't face auth/user-not-found errors
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/wrong-password'
      ) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
          setSuccessMsg(`🚀 تم تفعيل وتأسيس حساب المطور [${demoEmail}] سحابياً لأول مرة تلقائياً!`);
          setTimeout(() => {
            onSuccess(userCredential.user.uid, userCredential.user.email || demoEmail);
          }, 1500);
        } catch (signUpErr: any) {
          console.error("Demo signup error:", signUpErr);
          if (signUpErr.code === 'auth/operation-not-allowed') {
            setIsOperationNotAllowed(true);
            setError('⚠️ عذراً، تسجيل الدخول بالبريد الإلكتروني غير مفعّل في لوحة تحكم Firebase الخاصة بك حالياً.');
          } else if (signUpErr.code === 'auth/email-already-in-use') {
            setError('⚠️ البريد الإلكتروني مسجل بالفعل بكلمة مرور مختلفة. يرجى كتابة كلمة المرور الصحيحة في النموذج أعلاه لتسجيل الدخول.');
          } else {
            setError('عذراً، فشل تفعيل الحساب السحابي الافتراضي. يرجى محاولة تسجيل الدخول يدوياً.');
          }
          setLoading(false);
        }
      } else {
        console.error("Demo login error:", err);
        setError('عذراً، فشل الاتصال بخادم المصادقة لتسجيل الحساب الافتراضي.');
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsOperationNotAllowed(false);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Force pop-up setup
      const userCredential = await signInWithPopup(auth, provider);
      setSuccessMsg(`🔓 تم تسجيل الدخول بنجاح عبر حساب Google!`);
      setTimeout(() => {
        onSuccess(userCredential.user.uid, userCredential.user.email || '');
      }, 1500);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(`فشل تسجيل الدخول عبر Google: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans" dir="rtl" id="login-screen-root">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header decoration */}
        <div className="bg-emerald-600 p-6 text-center text-white relative">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Shield size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">بوابة سحابة تازه مارت المتكاملة</h2>
          <p className="text-emerald-100 text-[11px] mt-1">سجل دخولك لتفعيل الخصائص المتقدمة والمزامنة الفورية لمتاجرك</p>
        </div>

        {/* Form content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-[11px] font-bold leading-relaxed">
              <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-[11px] font-bold leading-relaxed animate-pulse">
              <Check size={16} className="text-emerald-500 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isOperationNotAllowed && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-xs text-right text-amber-900 leading-relaxed shadow-sm">
              <div className="flex items-center gap-1.5 mb-2 font-black text-amber-800">
                <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
                <span>طريقة تفعيل الحسابات السحابية الجاهزة (هام):</span>
              </div>
              <p className="mb-2 text-[11px] text-amber-700 font-medium">
                يظهر هذا التنبيه لأن خيار <strong>"البريد الإلكتروني وكلمة المرور"</strong> غير مفعّل بعد في لوحة تحكم مشروع Firebase الخاص بك. يرجى تفعيله باتباع الخطوات البسيطة التالية:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] pr-1 text-amber-800 font-medium">
                <li>اذهب إلى <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-emerald-700 hover:text-emerald-800">منصة تحكم Firebase</a>.</li>
                <li>اختر المشروع الحالي: <span className="font-mono bg-amber-100/80 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-bold">gen-lang-client-0488773877</span>.</li>
                <li>من القائمة الجانبية اليسرى، اضغط على <strong>Authentication</strong> (المصادقة).</li>
                <li>انتقل إلى تبويب <strong>Sign-in method</strong> (طريقة تسجيل الدخول) في الأعلى.</li>
                <li>اضغط على زر <strong>Add new provider</strong> (إضافة موفر جديد) ثم اختر <strong>Email/Password</strong>.</li>
                <li>قم بتشغيل خيار التفعيل الأول (البريد الإلكتروني/كلمة المرور) ثم اضغط على زر <strong>Save</strong> (حفظ).</li>
              </ol>
              <div className="mt-3 pt-2.5 border-t border-amber-200 text-[10px] text-amber-800">
                💡 <strong>حل بديل فوري:</strong> بما أن الدخول باستخدام Google مفعّل افتراضياً بمشروعك، يمكنك استخدام زر <strong>"الدخول المباشر باستخدام حساب Google"</strong> بالأسفل للدخول فوراً والمزامنة دون الحاجة لتغيير الإعدادات!
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <span className="absolute right-3 top-3 text-slate-400">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-right"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">كلمة المرور</label>
              <div className="relative">
                <span className="absolute right-3 top-3 text-slate-400">
                  <Key size={14} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-right"
                  disabled={loading}
                />
              </div>
            </div>

            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <label className="block text-xs font-bold text-slate-500 mb-1 mt-2">تأكيد كلمة المرور</label>
                <div className="relative">
                  <span className="absolute right-3 top-3 text-slate-400">
                    <Key size={14} />
                  </span>
                  <input
                    type="password"
                    required={isSignUp}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-right"
                    disabled={loading}
                  />
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isSignUp ? (
                <>
                  <UserPlus size={16} />
                  <span>إنشاء الحساب وتفعيل المزامنة</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>تسجيل الدخول الآمن</span>
                </>
              )}
            </button>
          </form>

          {/* Switch Tab */}
          <div className="mt-4 text-center text-[11px]">
            <span className="text-slate-500">
              {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب مسبق؟'}
            </span>{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMsg(null);
              }}
              disabled={loading}
              className="text-emerald-600 font-bold hover:underline"
            >
              {isSignUp ? 'سجل دخولك هنا' : 'أنشئ حسابك الجديد الآن'}
            </button>
          </div>

          {/* Google Sign-In Option */}
          <div className="relative flex py-2.5 items-center my-1">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold">تسجيل سريع</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50"
            id="google-signin-btn"
          >
            {/* Google G logo with standard official colors */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.92-2.77 3.51-4.51 6.76-4.51z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.1 2.66-2.33 3.49l3.61 2.8c2.11-1.95 3.33-4.81 3.33-8.44z"
              />
              <path
                fill="#FBBC05"
                d="M5.24 14.54c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.39 6.95C.5 8.74 0 10.74 0 12s.5 3.26 1.39 5.05l3.85-2.51z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.61-2.8c-.99.66-2.27 1.07-3.79 1.07-3.25 0-5.84-1.74-6.76-4.51l-3.85 2.99C3.37 20.33 7.35 23 12 23z"
              />
            </svg>
            <span>الدخول المباشر باستخدام حساب Google</span>
          </button>

          {/* Developer Accounts Segment */}
          <div className="mt-5 border-t border-dashed border-slate-200 pt-4" id="developer-quick-accounts">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Cpu size={14} className="text-emerald-600" />
              <span className="text-xs font-black text-slate-800">حسابات المطورين والطاقم الجاهزة (ضغطة واحدة)</span>
            </div>
            
            <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
              اختر أي حساب أدناه لتسجيل الدخول به فوراً. في حال عدم وجوده على الخادم السحابي الجديد الخاص بك، سيقوم النظام بإنشائه فوراً وتأمين صلاحياته تلقائياً!
            </p>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc, index) => {
                const IconComp = acc.icon;
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin(acc.email, acc.pass)}
                    className="w-full text-right p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 rounded-xl transition-all flex items-start justify-between group disabled:opacity-50"
                  >
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-300 transition-all flex-shrink-0">
                        <IconComp size={15} />
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-slate-700 group-hover:text-emerald-900">{acc.role}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{acc.email} | {acc.pass}</div>
                      </div>
                    </div>
                    <span className="text-[9px] bg-slate-200/60 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-800 px-1.5 py-0.5 rounded font-bold transition-all">
                      {acc.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold">أو جرب بدون خادم</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Bypass login */}
          <button
            onClick={onSkip}
            disabled={loading}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold border border-slate-200 flex items-center justify-center gap-1 transition-all"
          >
            <span>استمرار كـ ضيف (وضع التدريب والتخزين المحلي)</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
