import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import { CATEGORIES } from '../data';
import { ShoppingCart, Zap, Star, Search, RefreshCw, AlertCircle, CheckCircle2, User, SlidersHorizontal, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface POSViewProps {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  triggerQuickSale: (product: Product) => void;
  triggerCartQuickSale: (paymentMethod: 'cash' | 'card', customerName?: string) => void;
  checkoutCart: (paymentMethod: 'cash' | 'card', discount: number, includeVat: boolean, customerName: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'desktop' | 'mobile' | 'responsive';
}

export default function POSView({
  products,
  cart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  triggerQuickSale,
  triggerCartQuickSale,
  checkoutCart,
  searchQuery,
  setSearchQuery,
  viewMode
}: POSViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [customerName, setCustomerName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  // Filter products based on search query and active category
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // Default order
  });

  // Calculate cart metrics
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const vatRate = includeVat ? 0.14 : 0.0; // 14% Egyptian VAT
  const vatAmount = cartSubtotal * vatRate;
  const cartTotal = Math.max(0, cartSubtotal + vatAmount - cartDiscount);

  // Is mobile emulator triggered?
  const isMobileSimulated = viewMode === 'mobile';

  return (
    <div className={`p-4 ${isMobileSimulated ? 'max-w-md mx-auto bg-slate-100 rounded-3xl border-[8px] border-slate-800 shadow-2xl relative overflow-hidden min-h-[750px] my-4' : 'max-w-7xl mx-auto'}`} id="pos-root-container">
      {/* Mobile emulator notch indicator */}
      {isMobileSimulated && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className={`grid grid-cols-1 ${isMobileSimulated ? 'grid-cols-1 gap-2 pt-4' : 'lg:grid-cols-12 gap-6'}`}>
        
        {/* Left Column: Products Grid (Take 8 cols out of 12) */}
        <div className={isMobileSimulated ? 'col-span-1' : 'lg:col-span-8 space-y-4'}>
          
          {/* 1. Green Hero Banner mimicking the screenshot exactly */}
          <div className="bg-emerald-50/55 rounded-2xl overflow-hidden relative text-slate-800 p-6 shadow-sm flex items-center justify-between min-h-[140px] border border-emerald-100">
            {/* Left side content */}
            <div className="space-y-2 z-10 max-w-[65%]">
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                عروض صيف 2026
              </span>
              <h2 className="text-lg md:text-2xl font-extrabold text-emerald-950 leading-tight">
                احصل على توصيل مجاني عند التسوق بقيمة <span className="text-emerald-600 font-black">200 ج.م</span>
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                نوفر لك طاقة تشغيلية عالية لتعبئة البقالة الطازجة بأقصى سرعة وأمان.
              </p>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-colors shadow-sm">
                تصفح العروض الآن ←
              </button>
            </div>
            
            {/* Right side illustration - Food Basket */}
            <div className="absolute left-2 bottom-0 top-0 w-[40%] md:w-[35%] flex items-end justify-center pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400"
                alt="سلة السوبرماركت"
                className="w-full h-[90%] object-cover rounded-t-xl opacity-90 transition-transform duration-500 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Quick Stats bar for Cashier quick visual guide */}
          {!isMobileSimulated && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                <span>وردية الكاشير النشطة: <strong>#8126</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span>المنتجات بالمحل: <strong className="text-brand-green">{products.length} منتج</strong></span>
                <span>منخفضة المخزون: <strong className="text-red-600">{products.filter(p => p.stock <= p.minStockAlert).length} منتجات</strong></span>
              </div>
            </div>
          )}

          {/* 2. Categories Horizontal Scroller & Sorting */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-100">
            {/* Scrollable category list */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar max-w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-brand-green text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  id={`cat-btn-${cat.id}`}
                >
                  {cat.nameAr}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
              <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">الترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-600 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                id="pos-sort-select"
              >
                <option value="default">الافتراضي</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
                <option value="rating">التقييم والطلب</option>
              </select>
            </div>
          </div>

          {/* 3. Products Responsive Grid */}
          <div className={`grid gap-4 ${isMobileSimulated ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'}`} id="products-list-grid">
            {sortedProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">عذراً، لم يتم العثور على منتجات مطابقة للبحث أو القسم المحدد.</p>
              </div>
            ) : (
              sortedProducts.map((product) => {
                const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
                const isOut = product.stock === 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all relative"
                    id={`product-card-${product.id}`}
                  >
                    {/* Top status badges (Best sale / Frozen) */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10 pointer-events-none">
                      {product.isBestSeller && (
                        <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          الأكثر طلباً 🔥
                        </span>
                      )}
                      {product.isFrozen && (
                        <span className="bg-sky-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          مجمد ❄️
                        </span>
                      )}
                      {isLowStock && (
                        <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          كمية حرجة!
                        </span>
                      )}
                      {isOut && (
                        <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          نفذ تماماً
                        </span>
                      )}
                    </div>

                    {/* Product Image section with fallback container */}
                    <div className="aspect-square w-full bg-slate-50 relative overflow-hidden flex items-center justify-center pt-2">
                      <img
                        src={product.image}
                        alt={product.nameAr}
                        className={`max-h-[110px] max-w-[110px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-105 ${isOut ? 'opacity-40 grayscale' : ''}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200';
                        }}
                      />
                    </div>

                    {/* Product Metadata */}
                    <div className="p-3 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Unit / Weight Tag */}
                        <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                          <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-500">
                            {product.weight || 'حجم قياسي'}
                          </span>
                          <span className="text-slate-400 font-semibold">{product.unit}</span>
                        </div>

                        {/* Title Arabic & English */}
                        <h3 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-brand-green transition-colors">
                          {product.nameAr}
                        </h3>
                        <p className="text-[10px] text-gray-400 line-clamp-1 font-mono">
                          {product.nameEn}
                        </p>
                      </div>

                      {/* Stock indicator */}
                      <div className="my-1.5 flex justify-between items-center text-[10px]">
                        <span className="text-gray-400">الرصيد:</span>
                        <span className={`font-bold ${isOut ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-600'}`}>
                          {product.stock} {product.unit}
                        </span>
                      </div>

                      {/* Rating & Action buttons */}
                      <div className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between">
                        {/* Price (Egyptian pound ج.م) */}
                        <div className="text-right">
                          <p className="text-[9px] text-gray-400 leading-none">سعر البيع</p>
                          <p className="font-extrabold text-sm text-brand-green">
                            {product.price.toFixed(2)} <span className="text-[9px] font-medium">ج.م</span>
                          </p>
                        </div>

                        {/* Actions: Quick sale⚡ & Add to cart`+` */}
                        <div className="flex items-center gap-1">
                          {/* Quick Sale lightning button - fulfilling "بيع سريع" demand */}
                          <button
                            onClick={() => !isOut && triggerQuickSale(product)}
                            disabled={isOut}
                            className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                              isOut
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-brand-gold/15 hover:bg-brand-gold text-brand-gold hover:text-white border border-brand-gold/30'
                            }`}
                            title="بيع سريع كاش بضغطة واحدة فوراً بدون فاتورة"
                            id={`btn-quicksale-prod-${product.id}`}
                          >
                            <Zap size={14} className="fill-current" />
                          </button>

                          {/* Normal cart adding button */}
                          <button
                            onClick={() => !isOut && addToCart(product)}
                            disabled={isOut}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                              isOut
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-brand-green hover:bg-emerald-700 text-white shadow'
                            }`}
                            title="إضافة لسلة الفاتورة"
                            id={`btn-add-cart-${product.id}`}
                          >
                            <span className="font-extrabold text-sm">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Supermarket Shopping Invoice / POS Terminal (Take 4 cols out of 12) */}
        <div className={isMobileSimulated ? 'col-span-1 mt-4' : 'lg:col-span-4'}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 sticky top-28 flex flex-col justify-between min-h-[580px]" id="cart-pos-panel">
            
            {/* Cart Header */}
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-green flex items-center justify-center">
                    <ShoppingCart size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">سلة الفاتورة النشطة</h3>
                    <p className="text-[10px] text-gray-400">إجمالي العناصر المضافة: {cart.length}</p>
                  </div>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 px-1.5 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} />
                    تفريغ
                  </button>
                )}
              </div>

              {/* Customer Info (Optional for Egyptian VAT standard / Accounts delivery) */}
              <div className="my-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">اسم العميل (اختياري)</label>
                    <input
                      type="text"
                      placeholder="عميل نقدي كاش"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="bg-slate-50 text-xs border border-slate-200 rounded p-1.5 w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">طريقة الدفع</label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`text-xs py-1.5 font-bold rounded border ${
                          paymentMethod === 'cash'
                            ? 'bg-brand-green text-white border-brand-green'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        كاش
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`text-xs py-1.5 font-bold rounded border ${
                          paymentMethod === 'card'
                            ? 'bg-brand-green text-white border-brand-green'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        فيزا/شبكة
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected items list */}
              <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-50 pr-1 mt-2">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <ShoppingCart size={32} className="mx-auto text-slate-300" />
                    <p className="text-xs">سلة الفاتورة فارغة حالياً</p>
                    <p className="text-[10px] text-slate-400">انقر على زر (+) بجانب أي منتج لإضافته للفاتورة وإتمام الحساب</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="py-2.5 flex justify-between items-center gap-2">
                      <div className="flex-grow">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.nameAr}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <span className="text-brand-green font-bold">{(item.product.price * item.quantity).toFixed(2)} ج.م</span>
                          <span className="text-gray-400">({item.product.price.toFixed(2)} ج.م / {item.product.unit})</span>
                        </div>
                      </div>

                      {/* Quantity Modifier inside cart */}
                      <div className="flex items-center gap-1.5 bg-slate-100 px-1.5 py-1 rounded-lg">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs hover:bg-slate-200 shadow-sm font-bold text-slate-600"
                          id={`btn-cart-dec-${item.product.id}`}
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-extrabold px-1 text-slate-800 w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs hover:bg-slate-200 shadow-sm font-bold text-slate-600"
                          disabled={item.quantity >= item.product.stock}
                          id={`btn-cart-inc-${item.product.id}`}
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      {/* Delete item */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-slate-50 transition-colors"
                        id={`btn-cart-del-${item.product.id}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Checkout action buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-3 mt-4">
              <div className="space-y-1.5 text-xs">
                {/* Invoice Subtotal */}
                <div className="flex justify-between items-center text-slate-500">
                  <span>إجمالي المنتجات:</span>
                  <span className="font-semibold">{cartSubtotal.toFixed(2)} ج.م</span>
                </div>

                {/* Tax Option (Egyptian 14% VAT) */}
                <div className="flex justify-between items-center text-slate-500">
                  <span className="flex items-center gap-1 cursor-pointer" onClick={() => setIncludeVat(!includeVat)}>
                    <input
                      type="checkbox"
                      checked={includeVat}
                      onChange={() => setIncludeVat(!includeVat)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <span>ضريبة القيمة المضافة (14%):</span>
                  </span>
                  <span className="font-semibold">{includeVat ? vatAmount.toFixed(2) : '0.00'} ج.م</span>
                </div>

                {/* Discount input */}
                <div className="flex justify-between items-center text-slate-500 py-1">
                  <span>خصم خاص نقدي (ج.م):</span>
                  <input
                    type="number"
                    min="0"
                    max={cartSubtotal}
                    value={cartDiscount === 0 ? '' : cartDiscount}
                    onChange={(e) => setCartDiscount(Math.max(0, Number(e.target.value)))}
                    placeholder="0.00"
                    className="bg-slate-50 border border-slate-200 rounded p-1 w-20 text-center font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="cart-discount-input"
                  />
                </div>

                {/* Final Net Total */}
                <div className="flex justify-between items-center text-sm font-extrabold text-slate-800 pt-2 border-t border-dashed border-slate-100">
                  <span className="text-brand-green">صافي المطلوب سداده:</span>
                  <span className="text-lg text-brand-green">{cartTotal.toFixed(2)} ج.م</span>
                </div>
              </div>

              {/* POS Buttons: Quick checkout without bill VS Regular receipt */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {/* Quick Sale cart button - fulfilling "بيع سريع" demand */}
                <button
                  onClick={() => cart.length > 0 && triggerCartQuickSale(paymentMethod, customerName)}
                  disabled={cart.length === 0}
                  className={`py-3 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all border ${
                    cart.length === 0
                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-brand-gold/10 hover:bg-brand-gold text-amber-700 hover:text-white border-brand-gold/30 hover:border-brand-gold shadow-sm'
                  }`}
                  title="بيع كاش فوري للسلة وتحديث المخزن وتخطي شاشة الفاتورة"
                  id="btn-cart-quicksale"
                >
                  <div className="flex items-center gap-1">
                    <Zap size={14} className="fill-current" />
                    <span>بيع كاش سريع ⚡</span>
                  </div>
                  <span className="text-[9px] font-normal opacity-85">بدون طباعة فاتورة</span>
                </button>

                {/* Standard checkout with receipt */}
                <button
                  onClick={() => cart.length > 0 && checkoutCart(paymentMethod, cartDiscount, includeVat, customerName)}
                  disabled={cart.length === 0}
                  className={`py-3 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                    cart.length === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-brand-green hover:bg-brand-green-hover text-white shadow-md'
                  }`}
                  title="إصدار فاتورة ضريبية وحساب العميل مع الطباعة"
                  id="btn-cart-checkout"
                >
                  <div className="flex items-center gap-1">
                    <ShoppingCart size={14} />
                    <span>حساب وإصدار فاتورة</span>
                  </div>
                  <span className="text-[9px] font-normal text-emerald-200">فاتورة سوبرماركت كاملة</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
