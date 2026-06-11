import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  User, 
  MapPin, 
  Filter, 
  Search, 
  RefreshCw, 
  Trash2, 
  X, 
  Check, 
  Smartphone, 
  Truck, 
  Clock, 
  ChevronRight, 
  MessageSquare, 
  SlidersHorizontal,
  Plus,
  Minus,
  Info,
  ExternalLink,
  Star,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Product, CartItem, CheckoutDetails, OrderTrackInfo } from './types';

export default function App() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(200000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nigerianVendorsOnly, setNigerianVendorsOnly] = useState<boolean>(false);

  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'shop' | 'styling' | 'tracking'>('shop');
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'info'} | null>(null);

  // AI & Crawler states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<{
    answer: string;
    recommendedProductIds: string[];
    stylingTips: string[];
    suggestedAesthetic: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [crawlerTrend, setCrawlerTrend] = useState('');
  const [crawlerStatus, setCrawlerStatus] = useState<string>('');
  const [crawlerLoading, setCrawlerLoading] = useState(false);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);

  // Checkout states
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails>({
    fullName: '',
    email: 'i.agent.kachi@gmail.com',
    phone: '',
    address: '',
    city: 'Lagos',
    deliveryMethod: 'Standard',
    paymentGateway: 'Paystack'
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderConfirmedData, setOrderConfirmedData] = useState<{
    orderId: string;
    gateway: string;
    estimatedDelivery: string;
    shippingFee: number;
    totalAmount: number;
  } | null>(null);

  // Tracker State
  const [trackingIdInput, setTrackingIdInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<OrderTrackInfo | null>(null);
  const [trackingError, setTrackingError] = useState('');

  // Drop countdown simulator
  const [countdown, setCountdown] = useState({ hr: 8, min: 42, sec: 19 });

  useEffect(() => {
    fetchProducts();
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { ...prev, min: 59, sec: 59, hr: prev.hr };
        if (prev.hr > 0) return { hr: prev.hr - 1, min: 59, sec: 59 };
        return { hr: 24, min: 0, sec: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerNotification = (msg: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedCategory) q.append('category', selectedCategory);
      if (selectedGender) q.append('gender', selectedGender);
      if (selectedBrand) q.append('brand', selectedBrand);
      if (selectedSize) q.append('size', selectedSize);
      if (searchQuery) q.append('search', searchQuery);
      q.append('maxPrice', priceRange.toString());

      const res = await fetch(`/api/products?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        let filteredBytes = data.products;
        if (nigerianVendorsOnly) {
          // Filter listings out from international giants like Zara Nigeria, prioritizing native brands
          filteredBytes = filteredBytes.filter((p: Product) => 
            p.sourceSite !== 'Zara Lagos Boutique' && p.sourceSite !== 'Zara Nigeria listings'
          );
        }
        setProducts(filteredBytes);
      }
    } catch (err) {
      console.error('Failed to query products', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-run search/filter queries whenever parameters shift
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedGender, selectedBrand, selectedSize, priceRange, nigerianVendorsOnly]);

  // Execute AI fashion recommendation query
  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.success) {
        setAiResponse({
          answer: data.answer,
          recommendedProductIds: data.recommendedProductIds || [],
          stylingTips: data.stylingTips || [],
          suggestedAesthetic: data.suggestedAesthetic || 'High-Street Editorial'
        });
        if (data.recommendedProductIds && data.recommendedProductIds.length > 0) {
          setHighlightIds(data.recommendedProductIds);
          triggerNotification(`Jupiter Styling AI suggested ${data.recommendedProductIds.length} premium pieces!`, 'success');
        }
      }
    } catch (err) {
      console.error(err);
      triggerNotification('AI Styling Service temporarily offline.', 'info');
    } finally {
      setAiLoading(false);
    }
  };

  // Execute automated Lagos/Abuja crawler & de-duplicator
  const handleAggregatorCrawl = async () => {
    setCrawlerLoading(true);
    setCrawlerStatus('Initializing secure scraper websockets...');
    setTimeout(() => {
      setCrawlerStatus('Scanning Jumia and Ashluxe designer listings...');
    }, 1000);
    setTimeout(() => {
      setCrawlerStatus('Eliminating duplicate merchant listings & hotkeys...');
    }, 2000);

    try {
      const res = await fetch('/api/products/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTrend: crawlerTrend || 'Oversized Streetwear' })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification('Web-aggregator completed. Added 1 de-duplicated design drop!', 'success');
        setCrawlerStatus(`Successfully updated: ${data.message}`);
        setCrawlerTrend('');
        fetchProducts(); // refresh catalog with new data in-place
      }
    } catch (err) {
      console.error(err);
      setCrawlerStatus('');
      triggerNotification('Failed connection to vendor aggregator portals.', 'info');
    } finally {
      setTimeout(() => {
        setCrawlerLoading(false);
        setCrawlerStatus('');
      }, 3500);
    }
  };

  // Add items securely to Nigerian cart
  const addToCart = (product: Product, size: string, color: string) => {
    if (!size || !color) {
      triggerNotification('Please select available size & color specs first.', 'info');
      return;
    }
    const cartItemId = `${product.id}-${size}-${color}`;
    const existing = cart.find(item => item.id === cartItemId);
    if (existing) {
      setCart(cart.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: cartItemId, product, quantity: 1, selectedSize: size, selectedColor: color }]);
    }
    triggerNotification(`Added 1x ${product.name} to luxury catalog bundle!`, 'success');
  };

  // Adjust cart items
  const updateCartQuantity = (id: string, change: number) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    const nextQty = item.quantity + change;
    if (nextQty <= 0) {
      setCart(cart.filter(c => c.id !== id));
      triggerNotification('Item removed from selection.', 'info');
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, quantity: nextQty } : c));
    }
  };

  // Toggle favorite listings
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(x => x !== id));
      triggerNotification('Removed from elite fashion wishlist.', 'info');
    } else {
      setFavorites([...favorites, id]);
      triggerNotification('Saved to elite fashion wishlist!', 'success');
    }
  };

  // Calculate prices
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryChargesMap = {
    'Lagos': checkoutDetails.deliveryMethod === 'Express' ? 5000 : 2500,
    'Abuja': checkoutDetails.deliveryMethod === 'Express' ? 7500 : 4500,
    'Port Harcourt': checkoutDetails.deliveryMethod === 'Express' ? 8000 : 5000,
    'Benin': checkoutDetails.deliveryMethod === 'Express' ? 7000 : 4000,
    'Other': checkoutDetails.deliveryMethod === 'Express' ? 12000 : 7000,
  };
  const currentDeliveryFee = deliveryChargesMap[checkoutDetails.city] || 3500;
  const cartTotalSum = cartSubtotal + (cartSubtotal > 0 ? currentDeliveryFee : 0);

  // Submit secure gateway checkout
  const handlePaymentCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!checkoutDetails.fullName || !checkoutDetails.phone || !checkoutDetails.address) {
      triggerNotification('Please fill in required delivery information.', 'info');
      return;
    }

    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, addressDetails: checkoutDetails })
      });
      const data = await res.json();
      if (data.success) {
        setOrderConfirmedData({
          orderId: data.orderId,
          gateway: data.gateway,
          estimatedDelivery: data.estimatedDelivery,
          shippingFee: data.shippingFee,
          totalAmount: cartTotalSum
        });
        setCart([]);
        triggerNotification('Payment authorization successful!', 'success');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('Could not connect to payment gateway API.', 'info');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Query order tracking portal
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingIdInput.trim()) {
      setTrackingError('Please specify order reference ID.');
      return;
    }
    setTrackingError('');
    
    // Check if it's the current order
    if (orderConfirmedData && trackingIdInput.trim().toUpperCase() === orderConfirmedData.orderId) {
      setTrackedOrder({
        orderId: orderConfirmedData.orderId,
        status: 'Received',
        estimatedDelivery: orderConfirmedData.estimatedDelivery,
        trackerLogs: [
          { time: '09:12 AM', statusDescription: 'Order received & approved via Paystack/Flutterwave' },
          { time: 'Pending', statusDescription: 'Logistics packet designated at Ikeja dispatch hub' }
        ],
        products: [],
        totalAmount: orderConfirmedData.totalAmount
      });
    } else {
      // Return a simulated high-fidelity Nigerian route response
      const randomHours = new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
      setTrackedOrder({
        orderId: trackingIdInput.toUpperCase(),
        status: 'In Transit',
        estimatedDelivery: 'Tomorrow, Evening Delivery Promised',
        trackerLogs: [
          { time: '06:00 AM', statusDescription: 'Cleared Garki Abuja consolidation warehouse outer boundary' },
          { time: '11:45 AM', statusDescription: 'En route to dispatch destination via GIG Logistics aviation link' },
          { time: `${randomHours}`, statusDescription: 'In transit - Passed local toll gateway checkpoint' }
        ],
        products: [
          { name: 'Kano Tactical Cargo Parachute Pants', quantity: 1, price: 125000 }
        ],
        totalAmount: 128500
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans antialiased selection:bg-[#D4AF37] selection:text-black">
      {/* Editorial Marquee */}
      <div className="bg-white text-black py-2.5 overflow-hidden border-b border-white/10 z-50">
        <div className="flex animate-marquee whitespace-nowrap text-xs font-black tracking-widest uppercase">
          <span className="mx-8 font-display">⚡ NEW DROP: WAFFLESNCREAM SKATE DENIM LIVE NOW FROM LAGOS FLAGSHIP </span>
          <span className="mx-8 font-display">✦ SECURE VIA FLUTTERWAVE & PAYSTACK GATEWAYS </span>
          <span className="mx-8 font-display">⚡ LIMITED COUPE DISPATCH TO ABUJA, PORT HARCOURT & BENIN CITY </span>
          <span className="mx-8 font-display">✦ HOUSE OF JOJO SS26 HIGH-STREET PANTS PRE-ORDER IN PROGRESS </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav id="nav-jthreads" className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-12 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline space-x-3">
          <span className="text-3xl font-black tracking-tighter uppercase font-display select-none">
            JUPITER<span className="text-[#D4AF37]">.</span>THREADS
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/45 font-mono">
            BY HOUSE OF JOJO
          </span>
        </div>

        {/* Navigation Categories */}
        <div className="hidden md:flex space-x-10 text-[11px] uppercase tracking-[0.2em] font-semibold">
          <button 
            onClick={() => { setActiveTab('shop'); setSelectedCategory(''); }} 
            className={`transition-colors hover:text-[#D4AF37] ${activeTab === 'shop' && !selectedCategory ? 'text-[#D4AF37] font-black underline decoration-[#D4AF37] underline-offset-4' : 'text-white/70'}`}
          >
            The Archive
          </button>
          <button 
            onClick={() => { setActiveTab('shop'); setSelectedCategory('Cargo'); }}
            className={`transition-colors hover:text-[#D4AF37] ${selectedCategory === 'Cargo' ? 'text-[#D4AF37]' : 'text-white/70'}`}
          >
            Tactical Utility
          </button>
          <button 
            onClick={() => { setActiveTab('shop'); setSelectedCategory('Wide-legged'); }}
            className={`transition-colors hover:text-[#D4AF37] ${selectedCategory === 'Wide-legged' ? 'text-[#D4AF37]' : 'text-white/70'}`}
          >
            Wide Leg
          </button>
          <button 
            onClick={() => { setActiveTab('shop'); setSelectedCategory('Asymmetrical'); }}
            className={`transition-colors hover:text-[#D4AF37] ${selectedCategory === 'Asymmetrical' ? 'text-[#D4AF37]' : 'text-white/70'}`}
          >
            Asymmetrical
          </button>
          <button 
            onClick={() => setActiveTab('styling')} 
            className={`flex items-center space-x-1.5 transition-colors hover:text-[#D4AF37] ${activeTab === 'styling' ? 'text-[#D4AF37]' : 'text-white/70'}`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#D4AF37]" />
            <span>AI Concierge</span>
          </button>
          <button 
            onClick={() => setActiveTab('tracking')} 
            className={`transition-colors hover:text-[#D4AF37] ${activeTab === 'tracking' ? 'text-[#D4AF37]' : 'text-white/70'}`}
          >
            Order Tracking
          </button>
        </div>

        {/* Cart & Quick Utilities */}
        <div className="flex items-center space-x-6">
          <div className="hidden lg:block text-[11px] font-bold tracking-widest bg-white/5 py-1.5 px-3 rounded border border-white/10 text-white/80 font-mono">
            🇳🇬 NGN (₦)
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-transform hover:scale-105"
            aria-label="View shopping bag"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-[#050505] text-[9.5px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-black">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          <a 
            href="https://wa.me/2349000000000?text=Hi%20Jupiter%20Threads%20I%20need%20help%20with%20my%20styling" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-2 bg-[#25D366] hover:bg-[#20ba5a] text-black text-[11px] px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>WhatsApp Support</span>
          </a>
        </div>
      </nav>

      {/* Floating System Notifications */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#0a0a0a] border-l-4 border-[#D4AF37] p-4 shadow-2xl rounded text-xs leading-relaxed transform transition-all translate-y-0 opacity-100 flex items-start gap-3">
          <Info className="text-[#D4AF37] w-4.5 h-4.5 shrink-0" />
          <div>
            <p className="font-semibold text-white/95 uppercase tracking-wider mb-0.5">Jupiter System Broadcast</p>
            <p className="text-white/70">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Drop countdown section */}
      <div className="bg-[#0b0b0b] border-b border-white/5 py-4 px-4 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Tag className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs uppercase tracking-wide text-white/70">
            Next Premium Trouser Drop: <span className="text-[#D4AF37] font-semibold">House of JoJo Custom Asymmetric</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">LOCKS IN:</span>
          <div className="flex space-x-2 text-xs font-mono">
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-bold">{String(countdown.hr).padStart(2, '0')}h</span>
            <span className="text-white/45">:</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-white font-bold">{String(countdown.min).padStart(2, '0')}m</span>
            <span className="text-white/45">:</span>
            <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10 text-[#D4AF37] font-bold">{String(countdown.sec).padStart(2, '0')}s</span>
          </div>
        </div>
      </div>

      {/* TAB CONTENT SPACES */}
      {activeTab === 'styling' && (
        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-12">
          {/* AI Page Head styling */}
          <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-2 block">Computational Editorial Stylist</span>
              <h1 className="text-5xl font-black tracking-tighter uppercase font-display italic">
                AI CONCIERGE <span className="text-transparent stroke-text">STUDIO</span>
              </h1>
            </div>
            <p className="text-white/50 text-xs max-w-md leading-relaxed">
              Jupiter Threads combines advanced Gemini intelligence with tailored local street looks in Ikoyi, VI, and Garki. Type high-street preferences for prompt matching.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Chat Form */}
            <div className="lg:col-span-4 bg-[#0a0a0a] border border-white/10 p-6 lg:p-8 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full filter blur-xl"></div>
              
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Tell the AI your vibe</span>
              </h3>
              
              <form onSubmit={handleAISubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-mono">Sample requests:</label>
                  <div className="space-y-2 mb-4">
                    <button 
                      type="button" 
                      onClick={() => setAiPrompt("Find a loose cargo utility trouser for dry-season streetwear in Lekki Phase 1.")}
                      className="w-full text-left p-2.5 bg-white/5 hover:bg-white/10 rounded text-[11px] text-white/80 transition-colors border border-white/5 font-serif italic"
                    >
                      &ldquo;Find a loose cargo utility trouser for dry-season streetwear in Lekki Phase 1.&rdquo;
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAiPrompt("I need upscale asymmetrical pants under 150,000 NGN for an Abuja art gallery opening.")}
                      className="w-full text-left p-2.5 bg-white/5 hover:bg-white/10 rounded text-[11px] text-white/80 transition-colors border border-white/5 font-serif italic"
                    >
                      &ldquo;Asymmetrical luxury pants under 150k for an Abuja dynamic art exhibition.&rdquo;
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="styling-prompt" className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5 font-mono">Custom Input Context</label>
                  <textarea 
                    id="styling-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., I want wide leg silk palazzo trousers configured with custom local Nigerian dyes..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] font-sans"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={aiLoading}
                  className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#b08e28] text-black font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center space-x-2 rounded"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                      <span>Synthesizing Aesthetics...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Request Styling Advice</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Response Showcase */}
            <div className="lg:col-span-8 space-y-6">
              {aiLoading ? (
                <div id="ai-generating-loader" className="border border-white/10 p-12 text-center rounded-lg bg-[#080808] flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin"></div>
                  </div>
                  <h4 className="font-display font-bold uppercase tracking-widest text-sm">Consulting House of JoJo Archive</h4>
                  <p className="text-white/40 text-xs font-mono max-w-sm">Generating fabric weight profiles, tropical climate matchers, and Nigerian boutique pricing tags...</p>
                </div>
              ) : aiResponse ? (
                <div id="ai-results-pane" className="border border-white/10 bg-[#080808] rounded-lg overflow-hidden">
                  {/* Styling Header bar */}
                  <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-xs uppercase tracking-widest font-bold">Suggested Look: <span className="font-mono text-[#D4AF37]">{aiResponse.suggestedAesthetic}</span></span>
                    </div>
                    <div className="bg-white/5 py-1 px-3 border border-white/10 rounded text-[9px] uppercase tracking-wide text-white/60 font-mono">
                      Calculated under hot climate parameters
                    </div>
                  </div>

                  {/* Body textual recommendations */}
                  <div className="p-6 lg:p-8 space-y-6">
                    <div className="prose prose-invert max-w-none text-xs leading-relaxed text-white/80 space-y-3 font-serif italic">
                      <p className="border-l-2 border-[#D4AF37] pl-4 py-1 bg-white/[0.01]">
                        {aiResponse.answer}
                      </p>
                    </div>

                    {/* Actionable Tips Column */}
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-3">PROFESSIONAL STYLING TIPS</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {aiResponse.stylingTips.map((tip, idx) => (
                          <li key={idx} className="bg-white/5 rounded border border-white/5 p-3 flex items-start space-x-2.5">
                            <span className="text-xs font-bold text-[#D4AF37] font-mono mt-0.5">{idx + 1}.</span>
                            <span className="text-[11px] text-white/70 leading-relaxed font-sans">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Matching inventory spotlights */}
                    <div className="pt-4 border-t border-white/10">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white mb-4">RECOMMENDED MATCHING INVENTORY ({aiResponse.recommendedProductIds.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products
                          .filter(p => aiResponse.recommendedProductIds.includes(p.id))
                          .map(p => (
                            <div key={p.id} className="border border-[#D4AF37]/50 bg-white/5 rounded p-3 flex gap-4 hover:border-[#D4AF37] transition-all">
                              <img src={p.image} alt={p.name} className="w-16 h-20 object-cover rounded bg-white/5 shrink-0" />
                              <div className="flex flex-col justify-between min-w-0">
                                <div>
                                  <div className="flex items-center space-x-1.5 mb-1 bg-[#D4AF37]/10 px-2 py-0.5 text-[8px] uppercase tracking-widest text-[#D4AF37] font-mono w-max">
                                    <Star className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
                                    <span>AI Selected Match</span>
                                  </div>
                                  <p className="text-xs font-bold uppercase truncate">{p.name}</p>
                                  <p className="text-[10px] text-white/50">{p.brand} &bull;&nbsp;{p.sourceSite}</p>
                                </div>
                                <div className="flex items-baseline justify-between gap-2 mt-2">
                                  <span className="text-xs font-bold text-[#D4AF37] font-mono">₦{p.price.toLocaleString('en-NG')}</span>
                                  <button 
                                    onClick={() => setSelectedProduct(p)}
                                    className="text-[10px] text-white underline hover:text-[#D4AF37] uppercase font-bold tracking-wider"
                                  >
                                    Inspect Page
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-white/10 p-12 text-center rounded-lg bg-[#080808] flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-white/5 rounded-full border border-white/10">
                    <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <h4 className="font-display font-black text-lg uppercase tracking-wider">Awaiting Stylist Query</h4>
                  <p className="text-white/40 text-xs max-w-sm leading-relaxed">
                    Simply type your preferences in the leftmost panel or select a quick starter above to configure high-end curated outfits instantly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-12">
          {/* Tracker header */}
          <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-2 block font-mono">Lagos & Abuja Dispatch Center</span>
              <h1 className="text-5xl font-black tracking-tighter uppercase font-display italic">
                SECURE ORDER <span className="text-transparent stroke-text">TRACKING</span>
              </h1>
            </div>
            <p className="text-white/50 text-xs max-w-sm leading-relaxed">
              Verify real-time courier statuses, airport consolidation transit clearances, and dispatch delivery windows directly from the House of JoJo Lagos logistics node.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Inquiry Form */}
            <div className="lg:col-span-4 bg-[#0a0a0a] border border-white/10 p-6 lg:p-8 rounded-lg">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-4 font-mono">Live Dispatch Status Checker</h3>
              <form onSubmit={handleTrackSubmit} className="space-y-4">
                <div>
                  <label htmlFor="order-id-input" className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-mono">ENTER ORDER REFERENCE OR DISPATCH TAG</label>
                  <input 
                    id="order-id-input"
                    type="text" 
                    value={trackingIdInput}
                    onChange={(e) => setTrackingIdInput(e.target.value)}
                    placeholder="E.g., JT-ORD-749281"
                    className="w-full bg-white/5 border border-white/10 rounded p-3 text-xs text-white placeholder-white/30 tracking-wider uppercase font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                  {trackingError && <p className="text-red-400 text-[10px] mt-1.5">{trackingError}</p>}
                </div>

                <div className="bg-white/[0.02] p-3 border border-white/5 rounded text-[10px] text-white/40 leading-relaxed font-mono">
                  💡 Have no order ID yet? Submit a query with <span className="text-[#D4AF37] cursor-pointer hover:underline font-bold" onClick={() => setTrackingIdInput('JT-ORD-928420')}>JT-ORD-928420</span> to checkout a simulated transit route from Lagos to Abuja air corridors!
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-white hover:bg-[#D4AF37] text-black font-black uppercase tracking-widest text-xs transition-colors rounded"
                >
                  Locate Live Courier
                </button>
              </form>
            </div>

            {/* Tracking Status Display */}
            <div className="lg:col-span-8">
              {trackedOrder ? (
                <div className="border border-white/10 bg-[#080808] rounded-lg p-6 lg:p-8 space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-white/40 block">Tracking Order Reference</span>
                      <h4 className="text-xl font-bold font-mono tracking-wider text-white">{trackedOrder.orderId}</h4>
                    </div>
                    <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 rounded">
                      <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full animate-ping"></div>
                      <span className="text-[11px] uppercase tracking-widest font-black text-[#D4AF37] font-mono">{trackedOrder.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/10">
                    <div className="flex items-start space-x-3">
                      <Truck className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-white/40">Estimated Arrival Gateway</span>
                        <p className="text-xs font-bold text-white mt-1 font-mono">{trackedOrder.estimatedDelivery}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-white/40">Dispatch Fee Balance Paid</span>
                        <p className="text-xs font-bold text-white mt-1 font-mono">FREE / Paystack settlement cleared</p>
                      </div>
                    </div>
                  </div>

                  {/* Logistics Timelines */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#D4AF37] font-mono">COURIER DISPATCH LOG BOOK</h5>
                    <div className="border-l border-white/10 space-y-6 pl-4 ml-2.5">
                      {trackedOrder.trackerLogs.map((log, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[24.5px] top-1 w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
                          <div className="bg-white/5 border border-white/5 p-3 rounded">
                            <span className="text-[9px] uppercase font-mono text-white/40">{log.time}</span>
                            <p className="text-xs font-bold text-white/90 mt-1">{log.statusDescription}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-white/10 p-12 text-center rounded-lg bg-[#080808] flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-white/5 rounded-full border border-white/10">
                    <Truck className="w-8 h-8 text-white/40" />
                  </div>
                  <h4 className="font-display font-black text-lg uppercase tracking-wider">No Order Highlighted</h4>
                  <p className="text-white/40 text-xs max-w-sm leading-relaxed">
                    Once you checkout your premium garments, utilize the order reference coupon to review immediate logistics progression.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shop' && (
        <>
          {/* Central Editorial Showcase Hero Banner */}
          <header className="relative py-28 px-4 lg:px-12 overflow-hidden border-b border-white/10 flex items-center justify-start min-h-[480px]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-30 select-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#050505]/70 to-transparent"></div>
            
            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="text-xs uppercase tracking-[0.44em] text-[#D4AF37] font-black font-mono block">Featured Runway Archive</span>
              <h2 className="text-6xl md:text-8xl font-black italic uppercase leading-[0.85] tracking-tighter font-display">
                The<br/>Wide-Leg<br/><span className="text-transparent stroke-text">Edit</span>
              </h2>
              <p className="text-sm md:text-base text-white/70 max-w-lg leading-relaxed font-serif italic">
                A premium sartorial study of exaggerated structures, asymmetrical draping, and military tactical parachute cargo pants sourced directly from Lagos runways.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => {
                    setSelectedCategory('Wide-legged');
                    triggerNotification('Filtered to premium wide-leg trousers.', 'success');
                  }}
                  className="px-8 py-3.5 bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  Inspect Wide Leg
                </button>
                <button 
                  onClick={() => {
                    setSelectedCategory('Cargo');
                    triggerNotification('Filtered to premium tactical cargo trousers.', 'success');
                  }}
                  className="px-8 py-3.5 bg-white/5 border border-white/20 text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  Inspect Cargo
                </button>
              </div>
            </div>
          </header>

          {/* Interactive Web Aggregator Spindle */}
          <section className="bg-[#0a0a0a] border-b border-white/10 px-4 lg:px-12 py-8">
            <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
                  <span className="text-xs uppercase tracking-[0.25em] font-black font-mono">Live Scraper Sync Active</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Automatically aggregative indexing: syncing pricing catalog pipelines from <span className="text-white/80 font-bold">Ashluxe</span>, <span className="text-white/80 font-bold">Orange Culture</span>, <span className="text-white/80 font-bold">WafflesnCream</span>, and <span className="text-white/80 font-bold">Instagram Vendors</span>.
                </p>
              </div>

              {/* Crawl Control Block */}
              <div className="bg-white/5 p-4 rounded border border-white/10 flex flex-wrap items-center gap-4 flex-1 max-w-2xl">
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="aggregate-search-term" className="block text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1.5 font-mono">AUTOMATED SPOT CRAWLER</label>
                  <div className="relative">
                    <input 
                      id="aggregate-search-term"
                      type="text" 
                      placeholder="Enter Lagos style (e.g. Asymmetric, Cord)" 
                      value={crawlerTrend}
                      onChange={(e) => setCrawlerTrend(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 p-2.5 rounded text-xs text-white placeholder-white/30 font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAggregatorCrawl}
                  disabled={crawlerLoading}
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-[#b08e28] text-black font-black uppercase text-[10px] tracking-widest transition-colors flex items-center space-x-2 shrink-0 rounded"
                >
                  {crawlerLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>CRAWLING RUNWAYS...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AGGREGATE NEW DROP</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {crawlerStatus && (
              <div className="max-w-7xl mx-auto mt-3 bg-black border border-white/10 p-2.5 rounded font-mono text-[10px] text-green-400 animate-pulse">
                ⚙️ [CRAWLER SYSTEM LOG]: {crawlerStatus}
              </div>
            )}
          </section>

          {/* Search, Filter & Product Grid Main Content */}
          <main className="max-w-7xl mx-auto px-4 lg:px-12 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Filter Sidebar */}
              <aside className="lg:col-span-1 space-y-6">
                
                {/* Advanced Search Bar */}
                <div className="space-y-2">
                  <label htmlFor="shop-search" className="block text-[10px] uppercase tracking-widest text-white/40 font-mono">Direct Keyword Search</label>
                  <div className="relative">
                    <input 
                      id="shop-search"
                      type="text" 
                      placeholder="Search pants, brand..." 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        fetchProducts();
                      }}
                      className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] font-mono"
                    />
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
                  </div>
                </div>

                {/* Aesthetic Categories */}
                <div className="border border-white/10 bg-[#080808] p-5 rounded">
                  <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-[#D4AF37] mb-4 font-mono">STYLE CLASSIFIER</h3>
                  <div className="space-y-2.5">
                    {[
                      { value: '', label: 'All Archive Trousers' },
                      { value: 'Cargo', label: 'Cargo & Tactical' },
                      { value: 'Wide-legged', label: 'Wide Leveled Silhouette' },
                      { value: 'Asymmetrical', label: 'Asymmetrical / Drapes' },
                      { value: 'Palazzo', label: 'Accordion Palazzo' },
                      { value: 'Baggy', label: 'Yaba Baggy Trousers' },
                      { value: 'Korean', label: 'Korean-inspired Clean' },
                      { value: 'Luxury Casual', label: 'Luxury Casual Craft' }
                    ].map(style => (
                      <button 
                        key={style.value}
                        onClick={() => setSelectedCategory(style.value)}
                        className={`w-full flex items-center justify-between text-xs py-1 transition-colors ${selectedCategory === style.value ? 'text-[#D4AF37] font-black' : 'text-white/60 hover:text-white'}`}
                      >
                        <span>{style.label}</span>
                        {selectedCategory === style.value && <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price cap slider */}
                <div className="border border-white/10 bg-[#080808] p-5 rounded">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-white font-mono">BUDGET SCALE</h3>
                    <span className="text-xs font-bold text-[#D4AF37] font-mono">₦{priceRange.toLocaleString('en-NG')}</span>
                  </div>
                  <input 
                    type="range" 
                    min={40000} 
                    max={250000} 
                    step={10000} 
                    value={priceRange} 
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#D4AF37] bg-white/10 h-1 outline-none"
                    aria-label="Price range filter"
                  />
                  <div className="flex justify-between text-[9px] text-white/30 font-mono mt-1.5">
                    <span>₦40K</span>
                    <span>₦250K+</span>
                  </div>
                </div>

                {/* Interactive Gender Badging */}
                <div className="border border-white/10 bg-[#080808] p-5 rounded">
                  <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-white mb-4 font-mono">GENDER SELECTION</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: '', label: 'All' },
                      { value: 'unisex', label: 'Unisex' },
                      { value: 'men', label: 'Men' },
                      { value: 'women', label: 'Women' }
                    ].map(g => (
                      <button 
                        key={g.value} 
                        onClick={() => setSelectedGender(g.value)}
                        className={`py-2 px-1 text-[10px] uppercase tracking-wider font-mono border transition-all ${selectedGender === g.value ? 'bg-white text-black border-white font-bold' : 'bg-transparent border-white/10 hover:border-white/30'}`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Sizing */}
                <div className="border border-white/10 bg-[#080808] p-5 rounded">
                  <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-white mb-4 font-mono">FILTER BY SIZE</h3>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'L', 'XL', '28', '30', '32', '34', '36'].map(size => (
                      <button 
                        key={size} 
                        onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                        className={`w-9 h-9 text-xs font-bold font-mono rounded flex items-center justify-center border transition-all ${selectedSize === size ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 hover:border-white/30'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Native Pride Toggle */}
                <div className="bg-white/5 border border-white/10 p-4 rounded flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider">Local Artisans Only</p>
                    <p className="text-[10px] text-white/40">Exclude international listings</p>
                  </div>
                  <button 
                    onClick={() => {
                      setNigerianVendorsOnly(!nigerianVendorsOnly);
                      triggerNotification(nigerianVendorsOnly ? 'Listing all vendors' : 'Prioritizing Nigerian design brands');
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${nigerianVendorsOnly ? 'bg-[#D4AF37]' : 'bg-white/10'}`}
                    aria-label="Filter local artisans only"
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 transform ${nigerianVendorsOnly ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </aside>

              {/* Product Listing Catalog */}
              <div className="lg:col-span-3 space-y-8">
                
                {/* Active Filters Display */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a0a0a] p-4 border border-white/10 rounded">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold font-mono">SHOWING:</span>
                    <span className="text-xs text-white/80 font-mono">{products.length} Runway Garments Found</span>
                    
                    {(selectedCategory || selectedGender || searchQuery || selectedSize || nigerianVendorsOnly) && (
                      <button 
                        onClick={() => {
                          setSelectedCategory('');
                          setSelectedGender('');
                          setSelectedSize('');
                          setSearchQuery('');
                          setNigerianVendorsOnly(false);
                          triggerNotification('Cleared search filtering preferences.');
                        }}
                        className="text-[10px] text-[#D4AF37] underline hover:no-underline font-bold uppercase ml-2"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-white/40">Base Currency:</span>
                    <span className="text-xs font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded border border-[#D4AF37]/20 font-mono">🇳🇬 NGN (₦)</span>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                      <div key={idx} className="border border-white/5 p-4 rounded bg-white/5 animate-pulse space-y-4">
                        <div className="bg-white/10 h-72 w-full rounded"></div>
                        <div className="h-4 bg-white/10 rounded w-2/3"></div>
                        <div className="h-3 bg-white/10 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="border border-white/10 p-16 text-center rounded-lg bg-[#080808] space-y-4">
                    <p className="text-3xl font-display font-medium uppercase text-white/50">Zero Matching Trousers</p>
                    <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                      Try expanding search terms, lifting budget scales, or requesting active scanning from the Live Scraper Sync tool.
                    </p>
                    <button 
                      onClick={() => {
                        setSelectedCategory('');
                        setPriceRange(200000);
                        setSearchQuery('');
                        setNigerianVendorsOnly(false);
                      }}
                      className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37]"
                    >
                      Reset Catalog Display
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                      const isHighlighted = highlightIds.includes(product.id);
                      return (
                        <article 
                          key={product.id} 
                          className={`group flex flex-col bg-white/[0.02] border transition-all relative rounded-lg overflow-hidden ${isHighlighted ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/15 hover:border-white/40'}`}
                        >
                          {/* Top floating tags */}
                          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                            <span className="bg-[#050505] text-white text-[9px] font-black border border-white/10 px-2.5 py-1 tracking-widest uppercase font-mono rounded">
                              {product.sourceSite}
                            </span>
                            {product.stockStatus === 'Low Stock' && (
                              <span className="bg-yellow-600 text-black text-[9px] font-black px-2 py-0.5 tracking-wider uppercase font-mono rounded">
                                LIMIT DROPOUT
                              </span>
                            )}
                            {isHighlighted && (
                              <span className="bg-[#D4AF37] text-black text-[9px] font-black px-2 py-0.5 tracking-wider uppercase font-mono rounded">
                                STYLIST RECO
                              </span>
                            )}
                          </div>

                          {/* Hover Image swap block */}
                          <div className="h-80 md:h-[350px] relative overflow-hidden bg-black cursor-pointer" onClick={() => setSelectedProduct(product)}>
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="object-cover w-full h-full opacity-80 group-hover:scale-105 group-hover:opacity-0 transition-all duration-700" 
                            />
                            <img 
                              src={product.hoverImage} 
                              alt={`${product.name} alternate view`} 
                              className="absolute inset-0 object-cover w-full h-full opacity-0 scale-95 group-hover:opacity-90 group-hover:scale-100 transition-all duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                              <span className="text-[10px] text-black bg-white uppercase font-black tracking-widest py-2.5 px-6 rounded shadow-xl">
                                QUICK INSPECT
                              </span>
                            </div>
                          </div>

                          {/* Info Card Block */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-[9.5px] font-bold text-white/40 uppercase tracking-widest font-mono">
                                  {product.brand} &bull; {product.category}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                                  <span className="text-[10px] text-white/50 font-mono font-bold">{product.rating}</span>
                                </div>
                              </div>
                              
                              <h3 className="text-sm font-black uppercase text-white/95 group-hover:text-[#D4AF37] transition-colors leading-tight line-clamp-2">
                                {product.name}
                              </h3>
                              
                              <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed line-clamp-2">
                                {product.description}
                              </p>
                            </div>

                            {/* Prices & Actions */}
                            <div className="border-t border-white/5 pt-4">
                              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                                <div className="flex items-center space-x-2">
                                  <span className="text-base font-black text-[#D4AF37] font-mono">
                                    ₦{product.price.toLocaleString('en-NG')}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-xs text-white/30 line-through font-mono">
                                      ₦{product.originalPrice.toLocaleString('en-NG')}
                                    </span>
                                  )}
                                </div>

                                <button 
                                  onClick={() => setSelectedProduct(product)}
                                  className="text-[10px] uppercase font-black text-white hover:text-[#D4AF37] tracking-wider underline underline-offset-4"
                                >
                                  Runway Specs &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </main>
        </>
      )}

      {/* QUICK PREVIEW / IN-PLACE SPECS DIALOG */}
      {selectedProduct && (
        <div id="product-modal-spec" className="fixed inset-0 z-50 bg-[#030303]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
            
            {/* Close trigger button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-40 bg-black/60 p-2.5 rounded-full border border-white/10 hover:border-white/50 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4.5 h-4.5 text-white" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Left Image Showcaser */}
              <div className="md:col-span-5 bg-black relative">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-64 md:h-full object-cover min-h-[350px] md:min-h-[500px]" 
                />
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md p-3 border border-white/10 text-[10px] uppercase font-mono max-w-[200px]">
                  <p className="text-white/40">Verified Sourced From:</p>
                  <p className="font-bold text-[#D4AF37]">{selectedProduct.sourceSite}</p>
                </div>
              </div>

              {/* Right Specifications Engine */}
              <div className="md:col-span-7 p-6 lg:p-8 flex flex-col justify-between space-y-6">
                
                {/* Brand & Runway Headings */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/5 text-white/70 text-[9px] uppercase tracking-[0.2em] font-mono px-2.5 py-1 rounded border border-white/10">
                      {selectedProduct.brand}
                    </span>
                    <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] uppercase tracking-[0.2em] font-mono px-2.5 py-1 rounded border border-[#D4AF37]/20">
                      {selectedProduct.category}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black uppercase text-white font-display tracking-tight leading-tight">
                    {selectedProduct.name}
                  </h3>

                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-black text-[#D4AF37] font-mono">
                      ₦{selectedProduct.price.toLocaleString('en-NG')}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-white/30 line-through font-mono">
                        ₦{selectedProduct.originalPrice.toLocaleString('en-NG')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Substantive Description & Composition */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold font-mono mb-1">Tailoring Composition</h4>
                    <p className="text-xs text-white/80 leading-relaxed font-sans">{selectedProduct.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-3 border border-white/5 rounded font-mono text-[11px]">
                    <div>
                      <span className="text-white/30 block text-[9px] uppercase">Fabric Composition</span>
                      <span className="text-white/90 font-medium">{selectedProduct.fabric}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block text-[9px] uppercase">Gender Demography</span>
                      <span className="text-white/90 font-medium">{selectedProduct.gender}</span>
                    </div>
                  </div>
                </div>

                {/* Size & Color Picker (Internal state within simple variables for simplicity and speed) */}
                <div className="space-y-4">
                  {/* Select size */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-mono">Runway Variant Size</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((sz) => (
                        <button 
                          key={sz}
                          onClick={() => {
                            // Assign value in an elegant helper state or set checkout variable
                            triggerNotification(`Standard waist size ${sz} selected.`);
                          }}
                          className="px-3.5 py-2 text-xs font-bold font-mono border border-white/20 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] rounded"
                        >
                          Size {sz}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/40 mt-1 font-mono">Sized for standard Lagos tailored waists</p>
                  </div>

                  {/* Select colors */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-mono">Vibrant Dye Options</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((col) => (
                        <button 
                          key={col}
                          onClick={() => {
                            triggerNotification(`Lagos color tone "${col}" selected.`);
                          }}
                          className="px-3 py-1.5 text-[11px] font-mono border border-white/10 text-white/80 hover:border-white/40"
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actionable button triggers */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
                  <button 
                    onClick={() => {
                      // default selection choice of first color/size
                      addToCart(selectedProduct, selectedProduct.sizes[0], selectedProduct.colors[0]);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 min-w-[150px] py-4 bg-[#D4AF37] hover:bg-[#b08e28] text-black font-black uppercase text-xs tracking-widest transition-colors flex items-center justify-center space-x-2 rounded"
                  >
                    <ShoppingBag className="w-4.5 h-4.5" />
                    <span>ADD TO SELECTION</span>
                  </button>

                  <button 
                    onClick={() => {
                      toggleFavorite(selectedProduct.id);
                    }}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded transition-all"
                    aria-label="Toggle wishlist"
                  >
                    <Star className={`w-4.5 h-4.5 ${favorites.includes(selectedProduct.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white'}`} />
                  </button>

                  <a 
                    href={selectedProduct.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center rounded text-xs"
                    title="Examine real product page on host portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center space-x-4 text-[10px] text-white/40 font-mono">
                  <span>🚀 Estimated delivery: 24h - 48h within Lagos</span>
                  <span>🔒 Escrow checkout via Flutterwave / Paystack</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING BAG DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0a0a0a] border-l border-white/15 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-base font-black uppercase tracking-widest">Runway Select Bundle</h3>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/70 hover:text-white"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <p className="text-white/30 text-xs font-mono uppercase tracking-widest">No garments in collection</p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest"
                >
                  Examine runway
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded p-3.5 flex gap-4">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-20 object-cover rounded bg-white/5 shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-black uppercase truncate text-white/95">{item.product.name}</p>
                        <button 
                          onClick={() => updateCartQuantity(item.id, -item.quantity)}
                          className="text-white/40 hover:text-red-400 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#D4AF37] uppercase font-mono mt-0.5">
                        Size: {item.selectedSize} &bull;&nbsp;Color: {item.selectedColor}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-2">
                      <div className="flex items-center space-x-1.5 bg-white/5 rounded border border-white/10 px-1 py-0.5">
                        <button 
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="p-1 hover:bg-white/10 rounded"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 text-white" />
                        </button>
                        <span className="text-xs text-white px-2 font-mono">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="p-1 hover:bg-white/10 rounded"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-white font-mono">
                        ₦{(item.product.price * item.quantity).toLocaleString('en-NG')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Pricing, Delivery and Payments Integration Block */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/15 bg-black space-y-6">
              
              {/* Checkout details form */}
              <div className="bg-white/5 p-4 rounded border border-white/10 space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-black font-mono">NIGERIAN LOGISTICS & PAYMENTS CONFIG</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="checkout-fullName" className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">Full Name</label>
                    <input 
                      id="checkout-fullName"
                      type="text" 
                      placeholder="E.g., Kachi" 
                      value={checkoutDetails.fullName}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, fullName: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 p-2 rounded text-[11px] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-phone" className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">WhatsApp Phone</label>
                    <input 
                      id="checkout-phone"
                      type="text" 
                      placeholder="+234..." 
                      value={checkoutDetails.phone}
                      onChange={(e) => setCheckoutDetails({ ...checkoutDetails, phone: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 p-2 rounded text-[11px] text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-address" className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">Detailed Street Address</label>
                  <input 
                    id="checkout-address"
                    type="text" 
                    placeholder="E.g., 24 Awolowo Road, Ikoyi" 
                    value={checkoutDetails.address}
                    onChange={(e) => setCheckoutDetails({ ...checkoutDetails, address: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 p-2 rounded text-[11px] text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="checkout-city" className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">City Hub</label>
                    <select 
                      id="checkout-city"
                      value={checkoutDetails.city}
                      onChange={(e: any) => setCheckoutDetails({ ...checkoutDetails, city: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 p-2 rounded text-[11px] text-white focus:outline-none text-xs"
                    >
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Port Harcourt">Port Harcourt</option>
                      <option value="Benin">Benin</option>
                      <option value="Other">Other Hub</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="checkout-deliveryMethod" className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">Logistics</label>
                    <select 
                      id="checkout-deliveryMethod"
                      value={checkoutDetails.deliveryMethod}
                      onChange={(e: any) => setCheckoutDetails({ ...checkoutDetails, deliveryMethod: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 p-2 rounded text-[11px] text-white focus:outline-none text-xs"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Express">Express Air</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="checkout-paymentGateway" className="block text-[9px] uppercase tracking-wider text-white/50 mb-1">Gateway</label>
                    <select 
                      id="checkout-paymentGateway"
                      value={checkoutDetails.paymentGateway}
                      onChange={(e: any) => setCheckoutDetails({ ...checkoutDetails, paymentGateway: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 p-2 rounded text-[11px] text-white focus:outline-none text-xs"
                    >
                      <option value="Paystack">Paystack</option>
                      <option value="Flutterwave">Flutterwave</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Price summary list */}
              <div className="space-y-2 border-b border-white/10 pb-4 font-mono text-xs">
                <div className="flex justify-between items-center text-white/60">
                  <span>Bag Subtotal</span>
                  <span>₦{cartSubtotal.toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between items-center text-white/60">
                  <span>Custom Transit Fees ({checkoutDetails.city})</span>
                  <span>₦{currentDeliveryFee.toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between items-center text-white font-bold text-sm">
                  <span className="text-[#D4AF37]">Aggregate Total</span>
                  <span className="text-[#D4AF37]">₦{cartTotalSum.toLocaleString('en-NG')}</span>
                </div>
              </div>

              <button 
                onClick={handlePaymentCheckout}
                disabled={isCheckingOut}
                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-[#D4AF37] transition-colors flex items-center justify-center space-x-2"
              >
                {isCheckingOut ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>AUTHORIZING TRANSACTIONS...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4.5 h-4.5 text-black" />
                    <span>PROCESS CHANNELS PAYMENT</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* CHECKOUT SUCCESS POPUP */}
      {orderConfirmedData && (
        <div id="checkout-success-pane" className="fixed inset-0 z-50 bg-[#030303]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-[#D4AF37] p-8 text-center rounded-lg shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]">
              <Check className="w-8 h-8 font-black" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">TRANSACTION PROCESSED SUCCESSFULLY</span>
              <h3 className="text-2xl font-black uppercase font-display text-white">Payment Authorized via {orderConfirmedData.gateway}</h3>
              <p className="text-white/60 text-xs">
                Your luxury apparel purchase is approved. We have dispatched log info to Ikeja dispatch centers.
              </p>
            </div>

            {/* Tracking Reference Display Box */}
            <div className="bg-white/5 p-4 rounded border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase text-[9px]">Logistics Tracking Ref</span>
                <span className="text-white font-bold tracking-wider">{orderConfirmedData.orderId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase text-[9px]">Payment Code reference</span>
                <span className="text-white/70 truncate max-w-[200px]">REF-PAY-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between items-center text-left">
                <span className="text-white/40 uppercase text-[9px]">Estimated Dispatch ETA</span>
                <span className="text-[#D4AF37] font-bold">{orderConfirmedData.estimatedDelivery}</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => {
                  setTrackingIdInput(orderConfirmedData.orderId);
                  setActiveTab('tracking');
                  setOrderConfirmedData(null);
                  setIsCartOpen(false);
                }}
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#b08e28] text-black font-black uppercase text-xs tracking-widest rounded"
              >
                Track dispatch
              </button>
              <button 
                onClick={() => {
                  setOrderConfirmedData(null);
                  setIsCartOpen(false);
                }}
                className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase text-xs tracking-widest rounded"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-black py-12 px-4 lg:px-12 border-t border-white/10 mt-20 text-white/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <span className="text-xl font-black uppercase text-white tracking-widest font-display">
              JUPITER<span className="text-[#D4AF37]">.</span>THREADS
            </span>
            <p className="text-xs text-white/40 leading-relaxed">
              Nigeria&apos;s leading tech-enabled aggregator of luxury pants and streetwear drops. Curating House of JoJo masterpieces since 2024.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase text-white font-bold tracking-widest mb-4">Runway Partners</h4>
            <ul className="text-xs space-y-2 font-mono">
              <li>Ashluxe Lagos</li>
              <li>Orange Culture</li>
              <li>WafflesnCream Skate Shop</li>
              <li>Miskay Boutique</li>
              <li>Zara listings NG</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase text-white font-bold tracking-widest mb-4">Supported Gateways</h4>
            <ul className="text-xs space-y-2 font-mono">
              <li>Paystack API Escrow</li>
              <li>Flutterwave Secure Checkouts</li>
              <li>Lagos Dispatch Hub Cash</li>
              <li>Durable Delivery Guarantees</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase text-white font-bold tracking-widest mb-4">Customer Care</h4>
            <p className="text-xs text-white/40 leading-relaxed mb-3">
              Need immediate tracking help or customized hand-sewn adaptations? Live support based in Abuja & VI.
            </p>
            <a 
              href="https://wa.me/2349000000000?text=I%20need%20logistics%20support%20with%20Jupiter%20Threads" 
              className="inline-block py-2 px-4 bg-[#25D366] text-black hover:bg-[#20ba5a] text-[10.5px] tracking-wider uppercase font-black transition-colors rounded-full"
            >
              WhatsApp Hotline &rarr;
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/30 font-mono">
          <p>© 2026 Jupiter Threads. Under House of JoJo. Sourced globally, styled in Nigeria.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white">Runway Terms</a>
            <a href="#" className="hover:text-white">Logistics Escrow Policy</a>
            <a href="#" className="hover:text-white">API Feed Integration</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
