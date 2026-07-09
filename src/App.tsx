import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Transaction, PurchaseOrder, Supplier, TransactionItem } from './types';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS } from './data';
import Header from './components/Header';
import POSView from './components/POSView';
import InventoryView from './components/InventoryView';
import PurchasesView from './components/PurchasesView';
import AccountingView from './components/AccountingView';
import SuppliersView from './components/SuppliersView';
import InvoiceModal from './components/InvoiceModal';
import Login from './components/Login';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { loadUserCollection, saveUserDoc, batchSaveCollection, deleteUserDoc } from './lib/firebaseSync';
import { Sparkles, Zap, CheckCircle2, AlertTriangle, Monitor, Smartphone, Volume2, ShoppingBag, Database, CloudLightning, LogOut, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- 0. Authentication & Cloud Sync States ---
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string } | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    return localStorage.getItem('tazaj_offline_mode') === 'true';
  });
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);
  const isLoadedFromCloud = useRef<boolean>(false);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({ uid: user.uid, email: user.email || '' });
        setIsOfflineMode(false);
        localStorage.setItem('tazaj_offline_mode', 'false');
      } else {
        setCurrentUser(null);
        isLoadedFromCloud.current = false;
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 1. Persistent State Management ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tazaj_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('tazaj_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('tazaj_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('tazaj_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  // Save states to localStorage on change
  useEffect(() => {
    localStorage.setItem('tazaj_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('tazaj_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('tazaj_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('tazaj_purchases', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  // --- Cloud Sync Effects & Comparison Trackers ---
  useEffect(() => {
    if (!currentUser) {
      isLoadedFromCloud.current = false;
      return;
    }

    const syncCloudData = async () => {
      setIsLoadingCloud(true);
      try {
        const dbProducts = await loadUserCollection<Product>(currentUser.uid, 'products');
        const dbSuppliers = await loadUserCollection<Supplier>(currentUser.uid, 'suppliers');
        const dbTransactions = await loadUserCollection<Transaction>(currentUser.uid, 'transactions');
        const dbPurchases = await loadUserCollection<PurchaseOrder>(currentUser.uid, 'purchases');

        if (dbProducts.length === 0 && dbSuppliers.length === 0) {
          // First-time cloud login - upload current state to start with a standard ready-to-use dataset!
          await batchSaveCollection(currentUser.uid, 'products', products);
          await batchSaveCollection(currentUser.uid, 'suppliers', suppliers);
          await batchSaveCollection(currentUser.uid, 'transactions', transactions);
          await batchSaveCollection(currentUser.uid, 'purchases', purchaseOrders);
          showToast('☁️ تم تأسيس مستودع البيانات السحابي الجديد ومزامنة بضائعك وعملياتك إليه تلقائياً!', 'success');
        } else {
          // Sync database state into React state
          setProducts(dbProducts);
          setSuppliers(dbSuppliers);
          setTransactions(dbTransactions);
          setPurchaseOrders(dbPurchases);
          showToast('☁️ تم تحميل ومزامنة بوابتك السحابية بنجاح!', 'success');
        }
        isLoadedFromCloud.current = true;
      } catch (err) {
        console.error('Firebase pull sync failed:', err);
        showToast('⚠️ تعذر تحميل البيانات السحابية بالكامل، تواصل المزامنة المحلية.', 'warning');
      } finally {
        setIsLoadingCloud(false);
      }
    };

    syncCloudData();
  }, [currentUser]);

  // React Refs to track exact differences and prevent redundant writing loops
  const prevProductsRef = useRef<Product[]>(products);
  useEffect(() => {
    if (currentUser && isLoadedFromCloud.current) {
      // 1. Save additions and modifications
      const changed = products.filter(p => {
        const prev = prevProductsRef.current.find(old => old.id === p.id);
        if (!prev) return true;
        return (
          prev.stock !== p.stock ||
          prev.price !== p.price ||
          prev.costPrice !== p.costPrice ||
          prev.nameAr !== p.nameAr ||
          prev.nameEn !== p.nameEn ||
          prev.barcode !== p.barcode ||
          prev.category !== p.category ||
          prev.unit !== p.unit ||
          prev.weight !== p.weight ||
          prev.image !== p.image
        );
      });

      changed.forEach(p => {
        saveUserDoc(currentUser.uid, 'products', p.id, p).catch(err => console.error("Cloud product save error:", err));
      });

      // 2. Handle deleted products
      const deleted = prevProductsRef.current.filter(old => !products.some(p => p.id === old.id));
      deleted.forEach(old => {
        deleteUserDoc(currentUser.uid, 'products', old.id).catch(err => console.error("Cloud product delete error:", err));
      });
    }
    prevProductsRef.current = products;
  }, [products, currentUser]);

  const prevSuppliersRef = useRef<Supplier[]>(suppliers);
  useEffect(() => {
    if (currentUser && isLoadedFromCloud.current) {
      const changed = suppliers.filter(s => {
        const prev = prevSuppliersRef.current.find(old => old.id === s.id);
        if (!prev) return true;
        return prev.nameAr !== s.nameAr || prev.contact !== s.contact || prev.company !== s.company;
      });

      changed.forEach(s => {
        saveUserDoc(currentUser.uid, 'suppliers', s.id, s).catch(err => console.error("Cloud supplier save error:", err));
      });
    }
    prevSuppliersRef.current = suppliers;
  }, [suppliers, currentUser]);

  const prevTransactionsRef = useRef<Transaction[]>(transactions);
  useEffect(() => {
    if (currentUser && isLoadedFromCloud.current) {
      const changed = transactions.filter(t => {
        const prev = prevTransactionsRef.current.find(old => old.id === t.id);
        return !prev; // Transactions are only added, never modified
      });

      changed.forEach(t => {
        saveUserDoc(currentUser.uid, 'transactions', t.id, t).catch(err => console.error("Cloud transaction save error:", err));
      });
    }
    prevTransactionsRef.current = transactions;
  }, [transactions, currentUser]);

  const prevPurchasesRef = useRef<PurchaseOrder[]>(purchaseOrders);
  useEffect(() => {
    if (currentUser && isLoadedFromCloud.current) {
      const changed = purchaseOrders.filter(p => {
        const prev = prevPurchasesRef.current.find(old => old.id === p.id);
        return !prev; // Purchase orders are only added
      });

      changed.forEach(p => {
        saveUserDoc(currentUser.uid, 'purchases', p.id, p).catch(err => console.error("Cloud purchase save error:", err));
      });
    }
    prevPurchasesRef.current = purchaseOrders;
  }, [purchaseOrders, currentUser]);

  // --- 2. Transient UI State ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'purchases' | 'accounting' | 'suppliers'>('pos');
  
  // Automatically adjust active tab when user changes to respect role permissions
  useEffect(() => {
    if (currentUser) {
      if (currentUser.email === 'accountant@tazaj.com') {
        setActiveTab('accounting');
      } else if (currentUser.email === 'cashier@tazaj.com') {
        setActiveTab('pos');
      }
    }
  }, [currentUser]);

  const [searchQuery, setSearchQuery] = useState('');
  
  // viewMode allows simulating desktop layout, mobile layout, or standard responsive CSS layout
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'responsive'>('responsive');
  
  // Selected transaction to view/print in InvoiceModal
  const [activeInvoice, setActiveInvoice] = useState<Transaction | null>(null);

  // Success Flash Toast Notification State (specifically optimized for rapid sales workflows)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // --- 3. Core ERP Business Operations ---

  // Add product to the cart
  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      showToast(`⚠️ عذراً، المنتج "${product.nameAr}" نفذ من المخزن بالكامل!`, 'warning');
      return;
    }

    const existingCartItem = cart.find((item) => item.product.id === product.id);
    if (existingCartItem) {
      if (existingCartItem.quantity >= product.stock) {
        showToast(`⚠️ الكمية المحددة بالسلة وصلت للحد الأقصى للرصيد المتاح بالمحل (${product.stock} وحدة)`, 'warning');
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    showToast(`🛒 أضيف بنجاح: ${product.nameAr}`);
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  // Update quantity inside the cart
  const updateCartQuantity = (productId: string, quantity: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (quantity > item.product.stock) {
      showToast(`⚠️ الحد الأقصى للمخزون المتوفر هو ${item.product.stock} وحدات`, 'warning');
      return;
    }

    setCart(
      cart.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // QUICK SALE: Bypasses checkout entirely! (بيع سريع فوري بدون فاتورة)
  // Deducts 1 unit from stock, creates an instant cash transaction, shows success toast
  const triggerQuickSale = (product: Product) => {
    if (product.stock <= 0) {
      showToast(`❌ تعذر البيع السريع! المنتج "${product.nameAr}" نفذ تماماً من المخزن.`, 'warning');
      return;
    }

    // 1. Deduct stock by 1
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );

    // 2. Formulate quick transaction item
    const txItem: TransactionItem = {
      productId: product.id,
      nameAr: product.nameAr,
      quantity: 1,
      salePrice: product.price,
      costPrice: product.costPrice
    };

    // 3. Formulate the instant cash Transaction
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      invoiceNumber: 'Q-INV-' + Math.floor(100000 + Math.random() * 900000),
      type: 'quick',
      items: [txItem],
      subtotal: product.price,
      vat: 0, // Quick sales are generally tax-exempt/not logged with VAT
      discount: 0,
      total: product.price,
      paymentMethod: 'cash',
      customerName: 'عميل سريع بنقرة واحدة',
      timestamp: new Date().toISOString()
    };

    setTransactions(prevTxs => [newTx, ...prevTxs]);
    showToast(`⚡ بيع سريع فوري ناجح! تم بيع (1 ${product.unit}) كاش من [${product.nameAr}] وتحديث المخازن تلقائياً.`, 'success');
  };

  // CART QUICK CASH CHECKOUT (بيع السلة كاش فوري سريع بدون فاتورة)
  const triggerCartQuickSale = (paymentMethod: 'cash' | 'card', customerName?: string) => {
    if (cart.length === 0) return;

    // 1. Deduct stock for all items
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const cartItem = cart.find(item => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const txItems: TransactionItem[] = cart.map(item => ({
      productId: item.product.id,
      nameAr: item.product.nameAr,
      quantity: item.quantity,
      salePrice: item.product.price,
      costPrice: item.product.costPrice
    }));

    // 2. Record quick checkout transaction
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      invoiceNumber: 'Q-CART-' + Math.floor(100000 + Math.random() * 900000),
      type: 'quick',
      items: txItems,
      subtotal: subtotal,
      vat: 0,
      discount: 0,
      total: subtotal,
      paymentMethod: paymentMethod,
      customerName: customerName || 'عميل سريع للسلة',
      timestamp: new Date().toISOString()
    };

    setTransactions(prevTxs => [newTx, ...prevTxs]);
    setCart([]);
    showToast(`⚡ تم تصفية حساب السلة بالكامل كاش سريع وتخطي الفاتورة بنجاح!`, 'success');
  };

  // FULL REGULAR CHECKOUT (حساب مع إصدار فاتورة ضريبية رسمية)
  const checkoutCart = (paymentMethod: 'cash' | 'card', discount: number, includeVat: boolean, customerName: string) => {
    if (cart.length === 0) return;

    // 1. Reduce stock for all items
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const cartItem = cart.find(item => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const vat = includeVat ? subtotal * 0.14 : 0;
    const finalTotal = Math.max(0, subtotal + vat - discount);

    const txItems: TransactionItem[] = cart.map(item => ({
      productId: item.product.id,
      nameAr: item.product.nameAr,
      quantity: item.quantity,
      salePrice: item.product.price,
      costPrice: item.product.costPrice
    }));

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      invoiceNumber: 'INV-2026-' + Math.floor(10000 + Math.random() * 90000),
      type: 'regular',
      items: txItems,
      subtotal: subtotal,
      vat: vat,
      discount: discount,
      total: finalTotal,
      paymentMethod: paymentMethod,
      customerName: customerName,
      timestamp: new Date().toISOString()
    };

    // 2. Save transaction and trigger Invoice modal view for printing
    setTransactions(prevTxs => [newTx, ...prevTxs]);
    setActiveInvoice(newTx);
    setCart([]);
    showToast(`📄 تم إصدار الفاتورة الضريبية رقم (${newTx.invoiceNumber}) بنجاح!`, 'success');
  };

  // REPRINT PREVIOUS INVOICE
  const reprintInvoice = (tx: Transaction) => {
    setActiveInvoice(tx);
  };

  // INVENTORY: Add brand new product
  const addNewProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    showToast(`✨ تم تسجيل وإدراج السلعة الجديدة [${newProduct.nameAr}] في قاعدة بيانات المحل!`);
  };

  // INVENTORY: Inline quick stock editing (+ / -)
  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    showToast(`📦 تم تحديث مخزون السلعة بنجاح!`);
  };

  // INVENTORY: Inline quick price editing (Cost vs Sale)
  const updateProductPrices = (productId: string, costPrice: number, price: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, costPrice, price } : p))
    );
    showToast(`💰 تم تعديل أسعار التكلفة والمستهلك بنجاح!`);
  };

  // INVENTORY: Full product details update (Including names, barcode, prices, category, unit, image)
  const updateProductFull = (updatedProduct: Product) => {
    setProducts(prev =>
      prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    showToast(`💾 تم حفظ تعديلات السلعة [${updatedProduct.nameAr}] بنجاح!`, 'success');
  };

  // INVENTORY: Delete product completely
  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast(`🗑️ تم حذف السلعة بالكامل من قاعدة البيانات والرفوف!`, 'warning');
  };

  // PURCHASING: Register new supplier purchase invoice (Update stock and cost price)
  const addPurchaseOrder = (order: PurchaseOrder) => {
    // 1. Update quantities & cost prices of products in this order
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const itemOrdered = order.items.find((item) => item.productId === p.id);
        if (itemOrdered) {
          return {
            ...p,
            stock: p.stock + itemOrdered.quantity,
            costPrice: itemOrdered.buyPrice // Update cost price to the latest purchase cost
          };
        }
        return p;
      })
    );

    setPurchaseOrders((prev) => [order, ...prev]);
    showToast(`📥 تم توريد شحنة المورد (${order.supplierName}) وزيادة المخزون!`);
  };

  // SUPPLIERS: Add brand new supply vendor contact
  const addNewSupplier = (newSupplier: Supplier) => {
    setSuppliers(prev => [newSupplier, ...prev]);
    showToast(`👥 تم تسجيل جهة اتصال المورد (${newSupplier.company}) بنجاح!`);
  };

  if (!currentUser && !isOfflineMode) {
    return (
      <Login
        onSuccess={(uid, email) => {
          setCurrentUser({ uid, email });
          setIsOfflineMode(false);
          localStorage.setItem('tazaj_offline_mode', 'false');
        }}
        onSkip={() => {
          setIsOfflineMode(true);
          localStorage.setItem('tazaj_offline_mode', 'true');
        }}
      />
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsOfflineMode(false);
      localStorage.setItem('tazaj_offline_mode', 'false');
      showToast('👋 تم تسجيل الخروج من البوابة السحابية بنجاح.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased" id="tazaj-app-root">
      
      {/* 1. Brand Header with responsive emulator switcher */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        isLoadingCloud={isLoadingCloud}
      />

      {/* 2. Success/Warning interactive Flash Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-4 right-4 md:left-auto md:right-4 z-50 max-w-sm"
            id="global-interactive-toast"
          >
            <div className={`p-4 rounded-xl shadow-xl border flex items-center gap-3 ${
              toastType === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : toastType === 'info'
                ? 'bg-sky-50 border-sky-200 text-sky-800'
                : 'bg-emerald-50 border-emerald-200 text-brand-green'
            }`}>
              <div className="flex-shrink-0">
                {toastType === 'warning' ? (
                  <AlertTriangle size={20} className="text-amber-500" />
                ) : (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                )}
              </div>
              <div className="flex-grow text-xs font-bold leading-relaxed">
                {toastMessage}
              </div>
              <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-600 font-black text-sm">
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main ERP Navigation Screens Wrapper */}
      <main className="pb-16 pt-2" id="main-screens-viewport">
        {activeTab === 'pos' && (
          <POSView
            products={products}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateCartQuantity={updateCartQuantity}
            clearCart={clearCart}
            triggerQuickSale={triggerQuickSale}
            triggerCartQuickSale={triggerCartQuickSale}
            checkoutCart={checkoutCart}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
          />
        )}

          {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            setProducts={setProducts}
            addNewProduct={addNewProduct}
            updateProductStock={updateProductStock}
            updateProductPrices={updateProductPrices}
            updateProductFull={updateProductFull}
            deleteProduct={deleteProduct}
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            transactions={transactions}
            setTransactions={setTransactions}
            purchaseOrders={purchaseOrders}
            setPurchaseOrders={setPurchaseOrders}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesView
            products={products}
            suppliers={suppliers}
            purchaseOrders={purchaseOrders}
            addPurchaseOrder={addPurchaseOrder}
            addNewSupplier={addNewSupplier}
          />
        )}

        {activeTab === 'accounting' && (
          <AccountingView
            transactions={transactions}
            purchaseOrders={purchaseOrders}
            suppliers={suppliers}
            products={products}
            reprintInvoice={reprintInvoice}
          />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersView
            suppliers={suppliers}
            purchaseOrders={purchaseOrders}
            addNewSupplier={addNewSupplier}
          />
        )}
      </main>

      {/* 4. Overlay Invoice / Printable Supermarket Receipt Dialog */}
      <InvoiceModal
        transaction={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />

      {/* Bottom status helper bar */}
      <footer className="bg-slate-800 text-slate-400 py-3.5 px-6 border-t border-slate-700 text-[11px] font-medium flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden">
        <div>
          <span>© 2026 تازه مارت (Tazaj Mart) - نظام المحاسبة والـ ERP الشامل.</span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span>المخزن: مستقر (٩٨٪ ممتلئ)</span>
          <span className="hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 text-white font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>متصل بالخادم المركزي - القاهرة</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
