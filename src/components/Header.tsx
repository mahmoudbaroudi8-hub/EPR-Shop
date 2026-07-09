import React from 'react';
import { Store, Monitor, Smartphone, Sliders, MapPin, Search, ChevronDown, User, Truck, Cloud, Database, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  viewMode: 'desktop' | 'mobile' | 'responsive';
  setViewMode: (mode: 'desktop' | 'mobile' | 'responsive') => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  
  // Cloud Sync and Auth Props
  currentUser: { uid: string; email: string } | null;
  onLogout: () => void;
  isLoadingCloud: boolean;
}

export default function Header({
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  cartCount,
  currentUser,
  onLogout,
  isLoadingCloud
}: HeaderProps) {
  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-40 shadow-sm" id="main-header">
      {/* Top microbar */}
      <div className="bg-slate-50 px-4 py-1.5 text-xs flex justify-between items-center border-b border-slate-200 text-slate-600">
        <div className="flex items-center gap-4">
          <span className="text-emerald-600 font-bold">⚡ نظام إدارة تازه مارت المتكامل v2.5</span>
          <span className="hidden md:inline text-slate-500">⏱️ التوقيت المحلي للقاهرة: {new Date().toLocaleDateString('ar-EG')}</span>
          
          {/* Live Cloud Database Connection Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm" style={{
            backgroundColor: currentUser ? '#ecfdf5' : '#fef2f2',
            color: currentUser ? '#047857' : '#b91c1c',
            border: currentUser ? '1px solid #a7f3d0' : '1px solid #fecaca'
          }}>
            {isLoadingCloud ? (
              <>
                <RefreshCw size={11} className="animate-spin text-emerald-600" />
                <span>جاري المزامنة مع السحابة...</span>
              </>
            ) : currentUser ? (
              <>
                <Cloud size={11} className="text-emerald-600 animate-pulse" />
                <span>متصل ومؤمن بالكامل سحابياً ({currentUser.email})</span>
              </>
            ) : (
              <>
                <AlertTriangle size={11} className="text-red-500" />
                <span>وضع تجريبي أوفلاين (غير مزامن سحابياً)</span>
              </>
            )}
          </div>
        </div>
        
        {/* Simulator controls - Highly useful for demonstrating responsive design to the user */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-md p-1 border border-slate-200">
          <span className="text-slate-500 text-[10px] ml-1 font-medium">وضع العرض المحاكي:</span>
          
          <button
            onClick={() => setViewMode('responsive')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              viewMode === 'responsive'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="يتكيف تلقائياً مع حجم الشاشة الحالي"
            id="btn-view-responsive"
          >
            تلقائي (كامل)
          </button>
          
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              viewMode === 'desktop'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="فرض عرض الكمبيوتر المكتبي الكبير"
            id="btn-view-desktop"
          >
            <Monitor size={10} />
            كمبيوتر
          </button>
          
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              viewMode === 'mobile'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="محاكاة واجهة الهاتف المحمول اليمين"
            id="btn-view-mobile"
          >
            <Smartphone size={10} />
            موبايل (تليفون)
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Brand Logo & Name matching screenshot style */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('pos')}>
            {/* Custom SVG logo mimicking TazajMart yellow leaf logo */}
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-inner">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#F59E0B" stroke="#059669" strokeWidth="1" />
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 12V3z" fill="#10B981" opacity="0.3" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1">
                <span className="text-slate-900">تازه مارت</span>
                <span className="text-emerald-700 text-xs font-semibold px-1.5 py-0.2 bg-emerald-50 rounded">Tazaj Mart</span>
              </h1>
              <p className="text-[10px] text-slate-500">نظام المحاسبة ونقاط البيع المتكامل</p>
            </div>
          </div>

          {/* Location status badge resembling "Delivery to Abu Dhabi" from screenshot */}
          <div className="flex items-center gap-1.5 bg-slate-50 text-xs px-3 py-1.5 rounded-full text-slate-700 border border-slate-200">
            <MapPin size={12} className="text-emerald-600" />
            <div className="text-right">
              <p className="text-[9px] text-slate-400 leading-none">موقع السوبر ماركت</p>
              <p className="font-semibold text-[11px] leading-tight">فرع القاهرة الجديدة، مصر</p>
            </div>
            <ChevronDown size={12} className="text-slate-400" />
          </div>
        </div>

        {/* Global Instant Search Bar matching screenshot */}
        <div className="w-full md:max-w-md relative">
          <span className="absolute right-3 top-2.5 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="بحث عن المنتجات بالاسم، الباركود أو القسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 pr-10 pl-4 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            id="global-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs py-0.5 px-1.5 bg-slate-200 rounded"
            >
              مسح
            </button>
          )}
        </div>

        {/* Cashier / User profile */}
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            {currentUser ? (
              <>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                    currentUser.email === 'admin@tazaj.com' ? 'bg-emerald-100 text-emerald-800' :
                    currentUser.email === 'accountant@tazaj.com' ? 'bg-blue-100 text-blue-800' :
                    currentUser.email === 'cashier@tazaj.com' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {currentUser.email === 'admin@tazaj.com' ? 'مدير (Admin)' :
                     currentUser.email === 'accountant@tazaj.com' ? 'محاسب' :
                     currentUser.email === 'cashier@tazaj.com' ? 'كاشير' : 'مالك'}
                  </span>
                  <p className="text-slate-400">حساب السحابة النشط</p>
                </div>
                <p className="font-bold text-slate-700 truncate max-w-[150px]">{currentUser.email}</p>
                <button
                  onClick={onLogout}
                  className="text-red-600 font-bold text-[10px] flex items-center gap-0.5 mt-0.5 hover:underline"
                >
                  <LogOut size={10} />
                  <span>تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-slate-400">وضع العمل الحالي</p>
                <p className="font-bold text-amber-600">زائر (غير متصل بالخادم)</p>
                <button
                  onClick={() => {
                    localStorage.setItem('tazaj_offline_mode', 'false');
                    window.location.reload();
                  }}
                  className="text-emerald-600 font-bold text-[10px] flex items-center gap-0.5 mt-0.5 hover:underline"
                >
                  <span>تسجيل دخول سحابي</span>
                </button>
              </>
            )}
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-sm shadow-sm flex-shrink-0">
            {currentUser ? currentUser.email[0].toUpperCase() : 'Z'}
          </div>
        </div>
      </div>

      {/* Main ERP Tabs Navigation */}
      <div className="bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-1">
          {/* POS is available for admin and cashier */}
          {( !currentUser || currentUser.email === 'admin@tazaj.com' || currentUser.email === 'cashier@tazaj.com' ) && (
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'pos'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id="tab-pos"
            >
              <Store size={16} className={activeTab === 'pos' ? 'text-emerald-600' : 'text-slate-400'} />
              نقطة البيع (POS)
            </button>
          )}
          
          {/* Inventory is available for admin and cashier (accountant can see, read-only is done dynamically or hid) */}
          {( !currentUser || currentUser.email === 'admin@tazaj.com' || currentUser.email === 'cashier@tazaj.com' || currentUser.email === 'accountant@tazaj.com' ) && (
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'inventory'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id="tab-inventory"
            >
              <Sliders size={16} className={activeTab === 'inventory' ? 'text-emerald-600' : 'text-slate-400'} />
              المخزن والمنتجات
            </button>
          )}
          
          {/* Purchases is available for admin and accountant */}
          {( !currentUser || currentUser.email === 'admin@tazaj.com' || currentUser.email === 'accountant@tazaj.com' ) && (
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'purchases'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id="tab-purchases"
            >
              <Truck size={16} className={activeTab === 'purchases' ? 'text-emerald-600' : 'text-slate-400'} />
              المشتريات والتوريد
            </button>
          )}
          
          {/* Accounting is available for admin and accountant */}
          {( !currentUser || currentUser.email === 'admin@tazaj.com' || currentUser.email === 'accountant@tazaj.com' ) && (
            <button
              onClick={() => setActiveTab('accounting')}
              className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all relative ${
                activeTab === 'accounting'
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id="tab-accounting"
            >
              <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.2 rounded-full absolute -mr-1 -mt-3.5 animate-pulse">محاسب</span>
              لوحة الإدارة والحسابات
            </button>
          )}

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'suppliers'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="tab-suppliers"
          >
            موردين السوبرماركت
          </button>
        </div>
      </div>
    </header>
  );
}
