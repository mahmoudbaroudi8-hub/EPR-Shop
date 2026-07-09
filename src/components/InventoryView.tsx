import React, { useState, useRef } from 'react';
import { Product, Supplier, Transaction, PurchaseOrder } from '../types';
import { CATEGORIES } from '../data';
import { Plus, Minus, Search, Layers, Sliders, DollarSign, AlertCircle, RefreshCw, Barcode, Check, Edit2, SlidersHorizontal, Trash2, Download, Upload, Database, FileSpreadsheet } from 'lucide-react';

const PRODUCT_IMAGE_PRESETS = [
  { name: 'حليب / زبادي', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=200' },
  { name: 'جبنة ومشروم', url: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&q=80&w=200' },
  { name: 'لحوم حمراء ودواجن', url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=200' },
  { name: 'فواكه وحمضيات', url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=200' },
  { name: 'خضار وطماطم', url: 'https://images.unsplash.com/photo-1566385101042-1a0104b7b927?auto=format&fit=crop&q=80&w=200' },
  { name: 'مخبوزات وتوست', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200' },
  { name: 'مكرونة وبقوليات', url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&q=80&w=200' },
  { name: 'زيت وسمن وبصل', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200' },
  { name: 'مياه غازية وعصائر', url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=200' },
  { name: 'شاي وبن وقهوة', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=200' },
  { name: 'شوكولاتة وبسكويت', url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=200' },
  { name: 'منظفات وصابون', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200' },
  { name: 'شيبسي وسناكس', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=200' },
  { name: 'سوبرماركت عام', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200' }
];

interface InventoryViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addNewProduct: (product: Product) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  updateProductPrices: (productId: string, costPrice: number, price: number) => void;
  updateProductFull: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  
  // Backup / Excel state props
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
}

export default function InventoryView({
  products,
  setProducts,
  addNewProduct,
  updateProductStock,
  updateProductPrices,
  updateProductFull,
  deleteProduct,
  suppliers,
  setSuppliers,
  transactions,
  setTransactions,
  purchaseOrders,
  setPurchaseOrders
}: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  // Form State for New Product
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdNameEn, setNewProdNameEn] = useState('');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('groceries');
  const [newProdCostPrice, setNewProdCostPrice] = useState(0);
  const [newProdSalePrice, setNewProdSalePrice] = useState(0);
  const [newProdStock, setNewProdStock] = useState(20);
  const [newProdMinAlert, setNewProdMinAlert] = useState(5);
  const [newProdUnit, setNewProdUnit] = useState('علبة');
  const [newProdWeight, setNewProdWeight] = useState('100g');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200');

  // Editing product prices state
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [tempCostPrice, setTempCostPrice] = useState(0);
  const [tempSalePrice, setTempSalePrice] = useState(0);

  // Full Editing Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editNameAr, setEditNameAr] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editCategory, setEditCategory] = useState('groceries');
  const [editCostPrice, setEditCostPrice] = useState(0);
  const [editSalePrice, setEditSalePrice] = useState(0);
  const [editUnit, setEditUnit] = useState('علبة');
  const [editMinStock, setEditMinStock] = useState(5);
  const [editWeight, setEditWeight] = useState('');
  const [editImage, setEditImage] = useState('');

  // Accounting Summary for the Warehouse
  const totalStockItems = products.length;
  const totalCostValue = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const totalSaleValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const potentialProfit = totalSaleValue - totalCostValue;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    const matchesSearch =
      p.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    return matchesCat && matchesSearch;
  });

  // Handle barcode simulation
  const handleBarcodeScanSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const found = products.find((p) => p.barcode === scannedBarcode);
    if (found) {
      setSearchTerm(scannedBarcode);
      setScanMessage(`✅ تم العثور على المنتج: ${found.nameAr}`);
      setTimeout(() => setScanMessage(''), 4000);
    } else {
      setScanMessage('❌ هذا الباركود غير مسجل في قاعدة البيانات، يمكنك إضافته كمنتج جديد!');
      setTimeout(() => setScanMessage(''), 4000);
    }
  };

  const generateRandomBarcode = () => {
    const code = '622' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setNewProdBarcode(code);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdNameAr || !newProdNameEn || !newProdBarcode) {
      alert('يرجى ملء الحقول الإلزامية الاسم العربي والاسم الإنجليزي والباركود');
      return;
    }

    const newProduct: Product = {
      id: 'p-' + Date.now(),
      nameAr: newProdNameAr,
      nameEn: newProdNameEn,
      barcode: newProdBarcode,
      category: newProdCategory,
      costPrice: Number(newProdCostPrice),
      price: Number(newProdSalePrice),
      stock: Number(newProdStock),
      minStockAlert: Number(newProdMinAlert),
      unit: newProdUnit,
      weight: newProdWeight,
      rating: 4.5,
      image: newProdImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'
    };

    addNewProduct(newProduct);
    
    // Reset Form
    setNewProdNameAr('');
    setNewProdNameEn('');
    setNewProdBarcode('');
    setNewProdCostPrice(0);
    setNewProdSalePrice(0);
    setNewProdStock(10);
    setNewProdImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200');
    setShowAddForm(false);
  };

  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editNameAr || !editNameEn || !editBarcode) {
      alert('يرجى ملء الحقول الإلزامية الاسم العربي والاسم الإنجليزي والباركود');
      return;
    }

    const updated: Product = {
      ...editingProduct,
      nameAr: editNameAr,
      nameEn: editNameEn,
      barcode: editBarcode,
      category: editCategory,
      costPrice: Number(editCostPrice),
      price: Number(editSalePrice),
      unit: editUnit,
      minStockAlert: Number(editMinStock),
      weight: editWeight,
      image: editImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'
    };

    updateProductFull(updated);
    setEditingProduct(null);
  };

  const handleStartEditingPrices = (product: Product) => {
    setEditingProdId(product.id);
    setTempCostPrice(product.costPrice);
    setTempSalePrice(product.price);
  };

  const handleSavePrices = (productId: string) => {
    updateProductPrices(productId, tempCostPrice, tempSalePrice);
    setEditingProdId(null);
  };

  // --- Backup (JSON) & Excel (CSV) Operations ---
  const handleDownloadBackup = () => {
    const backupData = {
      products,
      suppliers,
      transactions,
      purchaseOrders,
      backupDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tazaj_mart_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
        if (Array.isArray(data.purchaseOrders)) setPurchaseOrders(data.purchaseOrders);
        alert('✅ تم استعادة جميع البيانات من ملف النسخ الاحتياطي بنجاح وتحديث قاعدة البيانات بالكامل!');
      } catch (err) {
        alert('❌ فشل قراءة ملف النسخ الاحتياطي، يرجى التأكد من صحة وصياغة الملف.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportToCSV = () => {
    const headers = ['الباركود', 'الاسم بالعربية', 'الاسم بالإنجليزية', 'القسم', 'سعر الشراء', 'سعر البيع', 'المخزون الحالي', 'حد الطلب المنخفض', 'الوحدة', 'الوزن_الحجم'];
    const rows = products.map(p => [
      p.barcode,
      p.nameAr,
      p.nameEn,
      p.category,
      p.costPrice,
      p.price,
      p.stock,
      p.minStockAlert,
      p.unit,
      p.weight || ''
    ]);

    let csvContent = '\uFEFF'; // UTF-8 BOM so Excel displays Arabic perfectly
    csvContent += headers.join(',') + '\r\n';
    rows.forEach(row => {
      const escapedRow = row.map(val => `"${String(val).replace(/"/g, '""')}"`);
      csvContent += escapedRow.join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tazaj_mart_excel_products_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length <= 1) {
          alert('الملف فارغ أو لا يحتوي على بيانات كافية!');
          return;
        }

        const importedProducts: Product[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV line parser
          const cols: string[] = [];
          let insideQuote = false;
          let currentField = '';
          for (let charIndex = 0; charIndex < line.length; charIndex++) {
            const char = line[charIndex];
            if (char === '"') {
              insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
              cols.push(currentField.trim());
              currentField = '';
            } else {
              currentField += char;
            }
          }
          cols.push(currentField.trim());

          if (cols.length < 4) continue;

          const cleanCols = cols.map(c => c.replace(/^"|"$/g, ''));
          const [barcode, nameAr, nameEn, category, costPrice, price, stock, minStockAlert, unit, weight] = cleanCols;

          if (!barcode || !nameAr) continue;

          importedProducts.push({
            id: 'p-imported-' + Date.now() + '-' + i,
            barcode,
            nameAr,
            nameEn: nameEn || barcode,
            category: category || 'groceries',
            costPrice: Number(costPrice) || 0,
            price: Number(price) || 0,
            stock: Number(stock) || 0,
            minStockAlert: Number(minStockAlert) || 5,
            unit: unit || 'علبة',
            weight: weight || '',
            rating: 4.5,
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'
          });
        }

        if (importedProducts.length === 0) {
          alert('لم يتم العثور على منتجات صالحة في ملف إكسيل! تأكد من أن الأعمدة مطابقة للترتيب الصحيح.');
          return;
        }

        setProducts(prev => {
          const filteredPrev = prev.filter(p => !importedProducts.some(imp => imp.barcode === p.barcode));
          return [...importedProducts, ...filteredPrev];
        });

        alert(`✅ تم استيراد وتحديث ${importedProducts.length} منتج بنجاح من ملف إكسيل وتخزينها محلياً وسحابياً!`);
      } catch (err) {
        console.error(err);
        alert('❌ فشل قراءة وتفسير ملف الإكسيل. يرجى التأكد من صياغة الملف بشكل صحيح.');
      }
    };
    reader.readAsText(file, 'utf-8');
  };


  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6" id="inventory-root-view">
      
      {/* 1. Header & Summary Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Layers className="text-brand-green" />
            <span>لوحة التحكم في المخزن والسلع 📦</span>
          </h2>
          <p className="text-xs text-gray-500">مراقبة مستويات الأمان، مراجعة تكلفة السلع، وتسجيل الواردات</p>
        </div>
        
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            generateRandomBarcode();
          }}
          className="bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition-all self-stretch md:self-auto justify-center"
          id="btn-toggle-add-product"
        >
          <Plus size={16} />
          <span>إدراج منتج جديد بالمخزن</span>
        </button>
      </div>

      {/* Summary Bento Widgets matching accountant design requirements */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="inventory-summary-grid">
        
        {/* Total Stock Items */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-bold">إجمالي الأنواع</p>
            <h3 className="text-xl font-extrabold text-slate-800">{totalStockItems} صنف</h3>
            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">نشط بالمحل</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-brand-green">
            <Layers size={18} />
          </div>
        </div>

        {/* Current Asset cost value */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-bold">قيمة بضاعة المخزن (بالتكلفة)</p>
            <h3 className="text-xl font-extrabold text-brand-green">{totalCostValue.toLocaleString('ar-EG')} ج.م</h3>
            <span className="text-[9px] text-gray-500">رأس المال السائل الفعلي</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-brand-green">
            <span className="font-bold text-xs">شراء</span>
          </div>
        </div>

        {/* Current Asset sale value */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-bold">القيمة السوقية (بالبيع)</p>
            <h3 className="text-xl font-extrabold text-emerald-700">{totalSaleValue.toLocaleString('ar-EG')} ج.م</h3>
            <span className="text-[9px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.2 rounded">
              الأرباح المتوقعة: +{potentialProfit.toLocaleString('ar-EG')} ج.م
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <span className="font-bold text-xs">بيع</span>
          </div>
        </div>

        {/* Low Stock count */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-bold">كميات حرجة (منخفض)</p>
            <h3 className="text-xl font-extrabold text-amber-600">{lowStockCount} منتج</h3>
            <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-medium">تحت حد الأمان</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircle size={18} />
          </div>
        </div>

        {/* Out of Stock count */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-[10px] text-gray-400 font-bold">سلع نفذت تماماً</p>
            <h3 className="text-xl font-extrabold text-red-600">{outOfStockCount} صنف</h3>
            <span className="text-[9px] text-red-600 bg-red-50 px-1.5 py-0.2 rounded font-medium">تتطلب أمر شراء عاجل</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <AlertCircle size={18} className="animate-bounce" />
          </div>
        </div>

      </div>

      {/* 1.5. Backup & Excel (CSV) Tools Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" id="backup-excel-tools-panel">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Database className="text-emerald-600" size={18} />
              <span>أدوات النسخ الاحتياطي السريع وإدارة البيانات (Excel / JSON)</span>
            </h3>
            <p className="text-[11px] text-gray-500">قم بحفظ نسخة احتياطية من بياناتك محلياً أو استيراد وتصدير منتجاتك عبر ملفات إكسيل متوافقة.</p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">لوحة تحكم إدارية</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Local Backup & Restore */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Database size={14} className="text-emerald-600" />
              <span>النسخ الاحتياطي المحلي واستعادة النظام (JSON)</span>
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              يقوم بتنزيل ملف يحتوي على كافة بيانات المخزن، الموردين، العمليات، والمشتريات لحفظها أو نقلها لجهاز آخر بشكل يدوي.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleDownloadBackup}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Download size={13} />
                <span>تنزيل نسخة احتياطية (JSON)</span>
              </button>

              <label className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm">
                <Upload size={13} className="text-emerald-600" />
                <span>استعادة من ملف نسخة احتياطية</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUploadBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Excel Import & Export */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileSpreadsheet size={14} className="text-emerald-600" />
              <span>تصدير واستيراد البضائع عبر إكسيل (Excel / CSV)</span>
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              تصدير السلع الحالية بصيغة متوافقة تماماً مع برنامج Microsoft Excel، أو استيراد سلع جديدة للمحل دفعة واحدة من ملف خارجي.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleExportToCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
              >
                <FileSpreadsheet size={13} />
                <span>تصدير المنتجات لإكسيل</span>
              </button>

              <label className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm">
                <Plus size={13} className="text-emerald-600" />
                <span>استيراد منتجات من إكسيل</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportFromCSV}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Add New Product Drawer / Form */}
      {showAddForm && (
        <div className="bg-white border-2 border-emerald-500 rounded-xl p-5 shadow-lg transition-all" id="add-product-form-container">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-extrabold text-brand-green text-sm flex items-center gap-1.5">
              <span>✍️ تسجيل وإدراج صنف جديد بقاعدة البيانات</span>
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-red-500 text-xs font-bold px-2 py-1 rounded hover:bg-slate-50"
            >
              إلغاء التراجع ×
            </button>
          </div>

          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Arabic Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الاسم باللغة العربية *</label>
              <input
                type="text"
                required
                placeholder="مثال: مكرونة ريجينيا 400 جرام"
                value={newProdNameAr}
                onChange={(e) => setNewProdNameAr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* English Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الاسم بالإنجليزية *</label>
              <input
                type="text"
                required
                placeholder="Example: Regina Pasta 400g"
                value={newProdNameEn}
                onChange={(e) => setNewProdNameEn(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Barcode (Auto-generatable or writable) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الباركود الدولي (EAN) *</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  required
                  placeholder="622..."
                  value={newProdBarcode}
                  onChange={(e) => setNewProdBarcode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={generateRandomBarcode}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 rounded text-[10px] font-bold"
                  title="توليد باركود تلقائي سريع"
                >
                  توليد باركود
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">القسم الرئيسي</label>
              <select
                value={newProdCategory}
                onChange={(e) => setNewProdCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </select>
            </div>

            {/* Cost price */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">سعر الشراء / التكلفة (ج.م) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newProdCostPrice || ''}
                onChange={(e) => setNewProdCostPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>

            {/* Sale price */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">سعر البيع للمستهلك (ج.م) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={newProdSalePrice || ''}
                onChange={(e) => setNewProdSalePrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-brand-green"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الوحدة</label>
              <select
                value={newProdUnit}
                onChange={(e) => setNewProdUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="علبة">علبة / قطعة</option>
                <option value="كجم">كجم (وزن فرط)</option>
                <option value="كيس">كيس مغلف</option>
                <option value="زجاجة">زجاجة</option>
                <option value="كرتونة">كرتونة</option>
              </select>
            </div>

            {/* Initial Stock */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الرصيد الافتتاحي بالمخزن</label>
              <input
                type="number"
                min="0"
                value={newProdStock}
                onChange={(e) => setNewProdStock(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>

            {/* Product Image Section */}
            <div className="col-span-1 md:col-span-4 border-t border-slate-100 pt-4 mt-2">
              <span className="text-xs font-bold text-slate-800 block mb-2">📸 صورة المنتج والسلعة</span>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Current Image Preview */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg h-24">
                  <img
                    src={newProdImage}
                    alt="معاينة الصورة"
                    className="max-h-16 max-w-full object-contain rounded"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                  <span className="text-[9px] text-slate-500 mt-1 font-semibold">معاينة الصورة الحالية</span>
                </div>

                {/* Custom Image URL Input */}
                <div className="lg:col-span-4">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">رابط صورة مخصص من الإنترنت</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block leading-normal">
                    يمكنك كتابة أي رابط صورة أو الاختيار من المعرض السريع أدناه لتغييرها فوراً.
                  </span>
                </div>

                {/* Fast Presets List */}
                <div className="lg:col-span-6">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">أو اختر صورة جاهزة من معرض تازه ماركت السريع:</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar max-w-full">
                    {PRODUCT_IMAGE_PRESETS.map((preset, idx) => {
                      const isSelected = newProdImage === preset.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewProdImage(preset.url)}
                          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-300'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-5 h-5 object-contain rounded-full" referrerPolicy="no-referrer" />
                          <span>{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-4 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow"
                id="btn-submit-new-product"
              >
                تأكيد وإدراج المنتج في المخزن
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Barcode Scanner Simulator & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        
        {/* Category Pill Filters inside Inventory */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat.id
                  ? 'bg-slate-100 text-slate-800 font-bold border border-slate-300'
                  : 'text-gray-500 hover:text-slate-700'
              }`}
            >
              {cat.nameAr}
            </button>
          ))}
        </div>

        {/* Barcode scanner simulator */}
        <form onSubmit={handleBarcodeScanSimulate} className="flex gap-2 items-center">
          <div className="relative">
            <span className="absolute right-3 top-2.5 text-gray-400">
              <Barcode size={16} />
            </span>
            <input
              type="text"
              placeholder="محاكاة قارئ الباركود..."
              value={scannedBarcode}
              onChange={(e) => setScannedBarcode(e.target.value)}
              className="bg-slate-50 text-xs border border-slate-200 rounded-lg pr-9 pl-4 py-2 w-56 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-gold text-brand-green font-bold text-xs px-3 py-2 rounded-lg hover:bg-amber-500 transition-colors"
          >
            مسح كود
          </button>
        </form>
      </div>

      {/* Scan Feedback Message */}
      {scanMessage && (
        <div className={`p-3 rounded-lg text-xs font-semibold ${scanMessage.includes('❌') ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>
          {scanMessage}
        </div>
      )}

      {/* 4. Products Inventory Table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden" id="inventory-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-bold">
                <th className="p-4">الصنف / المنتج</th>
                <th className="p-4">القسم والوحدة</th>
                <th className="p-4">الباركود الدولي</th>
                <th className="p-4 text-center">سعر الشراء (التكلفة)</th>
                <th className="p-4 text-center">سعر البيع للمستهلك</th>
                <th className="p-4 text-center">رصيد المخزن الحالي</th>
                <th className="p-4 text-center">مؤشر الأمان</th>
                <th className="p-4 text-center">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map((product) => {
                const isOut = product.stock === 0;
                const isLow = product.stock > 0 && product.stock <= product.minStockAlert;
                const isEditing = editingProdId === product.id;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Name and Image */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 border border-slate-100 flex items-center justify-center">
                          <img
                            src={product.image}
                            alt={product.nameAr}
                            className="max-w-[32px] max-h-[32px] object-contain rounded"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{product.nameAr}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{product.nameEn}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Unit */}
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium text-[10px]">
                        {CATEGORIES.find(c => c.id === product.category)?.nameAr || product.category}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">الوحدة: {product.unit}</p>
                    </td>

                    {/* Barcode */}
                    <td className="p-4 font-mono text-slate-500 text-[11px]">{product.barcode}</td>

                    {/* Cost Price (Purchasing Price) */}
                    <td className="p-4 text-center font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={tempCostPrice}
                          onChange={(e) => setTempCostPrice(Number(e.target.value))}
                          className="w-16 border rounded p-1 text-center bg-white"
                        />
                      ) : (
                        <span>{product.costPrice.toFixed(2)} ج.م</span>
                      )}
                    </td>

                    {/* Retail Sale Price */}
                    <td className="p-4 text-center font-bold text-brand-green">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={tempSalePrice}
                          onChange={(e) => setTempSalePrice(Number(e.target.value))}
                          className="w-16 border rounded p-1 text-center bg-white text-brand-green font-bold"
                        />
                      ) : (
                        <span>{product.price.toFixed(2)} ج.م</span>
                      )}
                    </td>

                    {/* Stock level */}
                    <td className="p-4 text-center">
                      <span className={`font-extrabold text-sm ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                        {product.stock}
                      </span>
                      <span className="text-gray-400 text-[10px] mr-1">{product.unit}</span>
                    </td>

                    {/* Stock Safety Status */}
                    <td className="p-4 text-center">
                      {isOut ? (
                        <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded text-[10px] font-bold">
                          🚫 نفذ بالكامل
                        </span>
                      ) : isLow ? (
                        <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded text-[10px] font-bold">
                          ⚠️ كمية حرجة
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold">
                          ✅ متوفر ومستقر
                        </span>
                      )}
                    </td>

                    {/* Stock auditing adjustments (Direct + / -) */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Full Edit Button */}
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setEditNameAr(product.nameAr);
                            setEditNameEn(product.nameEn);
                            setEditBarcode(product.barcode);
                            setEditCategory(product.category);
                            setEditCostPrice(product.costPrice);
                            setEditSalePrice(product.price);
                            setEditUnit(product.unit);
                            setEditMinStock(product.minStockAlert);
                            setEditWeight(product.weight || '');
                            setEditImage(product.image);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded border border-blue-200"
                          title="تعديل تفاصيل الصنف بالكامل وصورته"
                          id={`btn-edit-full-${product.id}`}
                        >
                          <Sliders size={13} />
                        </button>

                        {isEditing ? (
                          <button
                            onClick={() => handleSavePrices(product.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded"
                            title="حفظ الأسعار"
                            id={`btn-save-prices-${product.id}`}
                          >
                            <Check size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEditingPrices(product)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1.5 rounded"
                            title="تعديل الأسعار سريعا"
                            id={`btn-edit-prices-${product.id}`}
                          >
                            <Edit2 size={13} />
                          </button>
                        )}

                        {/* Decrement stock */}
                        <button
                          onClick={() => updateProductStock(product.id, Math.max(0, product.stock - 1))}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded border border-red-200"
                          title="إنقاص المخزن بـ 1"
                          id={`btn-stock-dec-${product.id}`}
                        >
                          <Minus size={13} />
                        </button>

                        {/* Increment stock */}
                        <button
                          onClick={() => updateProductStock(product.id, product.stock + 1)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded border border-emerald-200"
                          title="زيادة المخزن بـ 1"
                          id={`btn-stock-inc-${product.id}`}
                        >
                          <Plus size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`⚠️ تحذير: هل أنت متأكد من حذف المنتج [${product.nameAr}] نهائياً من قاعدة البيانات؟`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded border border-red-200"
                          title="حذف السلعة نهائياً"
                          id={`btn-delete-${product.id}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-slate-400 font-medium">
            لا توجد بضائع مسجلة تطابق محددات التصفية والبحث
          </div>
        )}
      </div>

      {/* 5. Edit Product details & Image Modal Dialog */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="bg-emerald-600 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <span>📝 تعديل تفاصيل وصورة الصنف</span>
                </h3>
                <p className="text-emerald-100 text-[10px] mt-0.5">تحديث أسعار ومخزون وصورة السلعة [{editingProduct.nameAr}]</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-white/80 hover:text-white font-black text-lg bg-emerald-700/50 hover:bg-emerald-700/80 w-8 h-8 rounded-full flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Arabic Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={editNameAr}
                    onChange={(e) => setEditNameAr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 font-mono">الاسم بالإنجليزية *</label>
                  <input
                    type="text"
                    required
                    value={editNameEn}
                    onChange={(e) => setEditNameEn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 font-mono">الباركود الدولي *</label>
                  <input
                    type="text"
                    required
                    value={editBarcode}
                    onChange={(e) => setEditBarcode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">القسم الرئيسي</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.nameAr}</option>
                    ))}
                  </select>
                </div>

                {/* Cost price */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">سعر الشراء / التكلفة (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>

                {/* Sale Price */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">سعر البيع للمستهلك (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editSalePrice}
                    onChange={(e) => setEditSalePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-bold text-emerald-600"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">الوحدة</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="علبة">علبة / قطعة</option>
                    <option value="كجم">كجم (وزن فرط)</option>
                    <option value="كيس">كيس مغلف</option>
                    <option value="زجاجة">زجاجة</option>
                    <option value="كرتونة">كرتونة</option>
                  </select>
                </div>

                {/* Min Stock Alert */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">مؤشر أمان المخزون (الإنذار)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">الوزن / الحجم</label>
                  <input
                    type="text"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    placeholder="مثال: 400g أو 1 لتر"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Edit Image URL and presets */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs font-bold text-slate-800 block mb-2">📸 تعديل صورة السلعة والمنتج</span>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-2 flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg h-24">
                    <img
                      src={editImage}
                      alt="معاينة الصورة"
                      className="max-h-16 max-w-full object-contain rounded"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                    <span className="text-[9px] text-slate-500 mt-1 font-semibold">معاينة الصورة</span>
                  </div>

                  <div className="lg:col-span-4 col-span-1 text-right">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">رابط صورة مخصص</label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 font-mono text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="lg:col-span-6 col-span-1">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">أو اختر صورة جديدة من المعرض السريع:</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar max-w-full">
                      {PRODUCT_IMAGE_PRESETS.map((preset, idx) => {
                        const isSelected = editImage === preset.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditImage(preset.url)}
                            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-300'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <img src={preset.url} alt={preset.name} className="w-4 h-4 object-contain rounded-full" referrerPolicy="no-referrer" />
                            <span>{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Delete vs Save */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`⚠️ تحذير نهائي: هل تريد حقاً حذف السلعة [${editingProduct.nameAr}] تماماً من النظام وقاعدة البيانات؟`)) {
                      deleteProduct(editingProduct.id);
                      setEditingProduct(null);
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 border border-red-200"
                >
                  <Trash2 size={14} />
                  <span>حذف هذا المنتج نهائياً من الرفوف 🗑️</span>
                </button>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-lg"
                  >
                    إلغاء التعديل
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md"
                  >
                    حفظ وتأكيد التعديلات السحابية 💾
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
