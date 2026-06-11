import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory inventory of premium aggregated Lagos fashion trousers
let productsCatalog: any[] = [
  {
    id: "prod-1",
    name: "Kano Tactical Cargo Parachute Pants",
    price: 125000,
    originalPrice: 155000,
    image: "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?auto=format&fit=crop&w=600&q=80",
    hoverImage: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80",
    sourceSite: "Ashluxe Official",
    sourceUrl: "https://ashluxe.com/collections/pants/kano-tactical-parachute",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Obsidian Black", "Forest Green"],
    category: "Cargo" as const,
    brand: "Ashluxe",
    fabric: "High-grade Water-Resistant Taslan Nylon",
    stockStatus: "In Stock" as const,
    rating: 4.8,
    reviewsCount: 34,
    gender: "Unisex" as const,
    trendCategory: "Streetwear Essentials" as const,
    description: "A staple streetwear cargo featuring 8 functional tactical pockets, customized elastic bungee cords at the ankle, heavy-weight industrial construction, and authentic House of Ashluxe chrome branding. Sourced fresh from the Lagos flagship store.",
    launchDate: "2026-05-15T00:00:00.000Z"
  },
  {
    id: "prod-2",
    name: "Eko Overlap Asymmetrical Trouser",
    price: 180000,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=600&q=80",
    hoverImage: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=600&q=80",
    sourceSite: "Orange Culture Online",
    sourceUrl: "https://orangeculture.com.ng/shop/eko-asymmetrical-drape-white",
    sizes: ["M", "L", "XL"],
    colors: ["Off-White", "Terracotta Dye"],
    category: "Asymmetrical" as const,
    brand: "Orange Culture",
    fabric: "Hand-loomed Organic Linen & Organic Cotton",
    stockStatus: "Low Stock" as const,
    rating: 4.9,
    reviewsCount: 18,
    gender: "Unisex" as const,
    trendCategory: "Luxury Pants" as const,
    description: "Fluid storytelling through Nigerian tailoring. Combines an overlapping structured front dress-panel with a slouchy back-street drape. Embellished with hand-polished nickel waist rings.",
    launchDate: "2026-06-01T00:00:00.000Z"
  },
  {
    id: "prod-3",
    name: "Alagomeji Baggy Skate Denim",
    price: 65000,
    originalPrice: 85000,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
    hoverImage: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=600&q=80",
    sourceSite: "WafflesnCream Shop",
    sourceUrl: "https://wafflesncream.com/skate/alagomeji-baggy-denim-indigo",
    sizes: ["30", "32", "34", "36"],
    colors: ["Midnight Blue Wash", "Acid Bleach"],
    category: "Baggy" as const,
    brand: "WafflesnCream",
    fabric: "14oz Stiff Selvedge Cotton Denim",
    stockStatus: "In Stock" as const,
    rating: 4.7,
    reviewsCount: 41,
    gender: "Men" as const,
    trendCategory: "Streetwear Essentials" as const,
    description: "Inspired by late-90s skateboard energy in Yaba, Lagos. Deep-cut pockets with subtle West-African heritage motifs woven into the side seams.",
    launchDate: "2026-04-10T00:00:00.000Z"
  },
  {
    id: "prod-4",
    name: "Victoria Island Pleated Silk Palazzo",
    price: 52000,
    originalPrice: 75000,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80",
    hoverImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
    sourceSite: "Miskay Boutique Online",
    sourceUrl: "https://miskayboutique.com/bottoms/vi-pleated-palazzo-beige",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Sahara Beige", "Lagos Sunset Rose"],
    category: "Palazzo" as const,
    brand: "Miskay Boutique",
    fabric: "Silk Georgette Blend",
    stockStatus: "In Stock" as const,
    rating: 4.6,
    reviewsCount: 52,
    gender: "Women" as const,
    trendCategory: "Trending in Nigeria" as const,
    description: "Flowy, high-rise luxury silhouette featuring crisp architectural accordion pleating, standard floor-sweeping profile, and breathable inner silk lining.",
    launchDate: "2026-05-28T00:00:00.000Z"
  },
  {
    id: "prod-5",
    name: "Ikoyi Double-Pleat Wide Leg",
    price: 95000,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    hoverImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
    sourceSite: "Instagram Premium Vendor @NaijaStreetElite",
    sourceUrl: "https://instagram.com/naijastreetelite/p/ikoyi-double-pleats-cream",
    sizes: ["S", "M", "L"],
    colors: ["Cream Ivory", "Charcoal Grey"],
    category: "Wide-legged" as const,
    brand: "House of JoJo",
    fabric: "Superfine Italian Wool Crepe",
    stockStatus: "In Stock" as const,
    rating: 4.9,
    reviewsCount: 15,
    gender: "Unisex" as const,
    trendCategory: "Luxury Pants" as const,
    description: "The crown jewel of our wide leg trousers. Features sharp front creasing, drop crotch elegance, and a custom interior silicone waistband grip to hold sartorial lines active under hot climates.",
    launchDate: "2026-06-05T00:00:00.000Z"
  },
  {
    id: "prod-6",
    name: "Garki Minimalist Draped Khaki",
    price: 58000,
    originalPrice: 65000,
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80",
    hoverImage: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=600&q=80",
    sourceSite: "Zara Lagos Boutique",
    sourceUrl: "https://zara.com/ng/en/garki-minimalist-draped-khaki",
    sizes: ["28", "30", "32", "34"],
    colors: ["Warm Khaki", "Sand Grey"],
    category: "Korean" as const,
    brand: "Zara Nigeria",
    fabric: "Rayon Tencel Cord Blend",
    stockStatus: "In Stock" as const,
    rating: 4.5,
    reviewsCount: 22,
    gender: "Unisex" as const,
    trendCategory: "Trending in Nigeria" as const,
    description: "Korean design language refined for Abuja executive streetwear. Slits at the inside hem create an effortless frame for sneakers or leather loafers.",
    launchDate: "2026-05-10T00:00:00.000Z"
  },
  {
    id: "prod-7",
    name: "Lekki Multi-Pocket Combat Baggy",
    price: 78000,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
    hoverImage: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
    sourceSite: "Konga Premium Seller",
    sourceUrl: "https://konga.com/product/lekki-multi-pocket-combat-baggy",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Dusk Purple", "Military Sand"],
    category: "Cargo" as const,
    brand: "House of JoJo",
    fabric: "Premium Heavy Canvas & Ripstop Panels",
    stockStatus: "In Stock" as const,
    rating: 4.7,
    reviewsCount: 29,
    gender: "Unisex" as const,
    trendCategory: "Streetwear Essentials" as const,
    description: "An incredibly detailed streetwear piece. Incorporates reinforced knee panels, a custom heavy metal waist chain-loop, 10 pockets overall, and Velcro straps to adjust cuff volume dynamically.",
    launchDate: "2026-06-10T00:00:00.000Z"
  },
  {
    id: "prod-8",
    name: "Heritage Benin Indigo Handspun Trouser",
    price: 150000,
    originalPrice: 180000,
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80",
    hoverImage: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80",
    sourceSite: "Instagram Artisan Coalition",
    sourceUrl: "https://instagram.com/benincraftsmenco/p/heritage-raw-indigo",
    sizes: ["M", "L"],
    colors: ["Organic Indigo Indigo", "Natural Ecru"],
    category: "Luxury Casual" as const,
    brand: "Artisan Co.",
    fabric: "100% Organic Handspun Benin Cotton & Raw Silk",
    stockStatus: "Low Stock" as const,
    rating: 5.0,
    reviewsCount: 8,
    gender: "Unisex" as const,
    trendCategory: "Limited Drop" as const,
    description: "A gorgeous artistic crossover. Hand-dyed five times under Benin-city artisan suns. Extreme drape silhouette with traditional weave borders framing the pockets. Each piece is unique.",
    launchDate: "2026-06-11T00:00:00.000Z"
  }
];

// Lazy-loaded Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// 1. GET CATALOG WITH FILTERS & SEARCH
app.get("/api/products", (req, res) => {
  try {
    let filtered = [...productsCatalog];
    const { category, brand, size, color, search, minPrice, maxPrice, gender, sourceSite } = req.query;

    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
    }
    if (brand) {
      filtered = filtered.filter(p => p.brand.toLowerCase() === (brand as string).toLowerCase());
    }
    if (gender) {
      filtered = filtered.filter(p => p.gender.toLowerCase() === (gender as string).toLowerCase());
    }
    if (sourceSite) {
      filtered = filtered.filter(p => p.sourceSite.toLowerCase().includes((sourceSite as string).toLowerCase()));
    }
    if (size) {
      filtered = filtered.filter(p => p.sizes.some(s => s.toLowerCase() === (size as string).toLowerCase()));
    }
    if (color) {
      filtered = filtered.filter(p => p.colors.some(c => c.toLowerCase().includes((color as string).toLowerCase())));
    }
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(maxPrice));
    }
    if (search) {
      const s = (search as string).toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(s) || 
        p.description.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
      );
    }

    res.json({ success: true, products: filtered });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. AI FASHION RECOMMENDATION & OUTFIT PAIRING
app.post("/api/ai/recommend", async (req, res) => {
  const { prompt, userHistory } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, error: "Prompt is required." });
  }

  const ai = getGeminiClient();
  const availableItemsSummary = productsCatalog.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    brand: p.brand,
    description: p.description
  }));

  if (!ai) {
    // Elegant fallback mock recommendation if Gemini key is missing
    const fallbackAnswers = [
      "Based on Lagos hot weather trends, the **Eko Overlap Asymmetrical Trouser** paired with a sleek linen tank is standard elite. For shoes, we recommend Ashluxe retro low-tops.",
      "For a high-fashion streetwear silhouette, double-down on the **Kano Tactical Cargo Parachute Pants**. Team it with heavy cotton t-shirts and silver thick chain links.",
      "If you are seeking clean, elegant office-to-bar drapes, the **Ikoyi Double-Pleat Wide Leg** is undefeated. Highlight it with leather slipins and structured blazers."
    ];
    const recommendedIds = productsCatalog.slice(0, 2).map(p => p.id);
    return res.json({
      success: true,
      answer: fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)] + "\n\n*(Note: Running in designer fallback mode. Configure GEMINI_API_KEY in Secrets for smart conversational analysis!)*",
      recommendedProductIds: recommendedIds,
      stylingTips: [
        "Go high-waisted and cinch with an extra-long industrial webbing belt.",
        "Combine oversized parachute profiles with form-fitting ribbed jersey knitwear.",
        "Add Nigerian silver heritage cuffs or amulets to complete the editorial vibe."
      ],
      suggestedAesthetic: "Sartorial Neo-Traditionalism"
    });
  }

  try {
    const systemPrompt = `You are the lead AI fashion computational stylist at Jupiter Threads, a high-end luxury Nigerian editorial fashion house.
Analyze the user's styling requests, taking into account current Nigerian hotspots (Lagos: Ikoyi, Lekki, Alagomeji, or Abuja: Jabi, Garki), tropical climate considerations, and the specific catalog of 5-star pants listings provided below:

${JSON.stringify(availableItemsSummary, null, 2)}

Provide fashion matching, outfit pairings, styling guidelines, and direct product recommendations.
Your response MUST strictly adhere to the following JSON schema:
{
  "answer": "Compelling fashion pairing advice and recommendations styled like a luxury editorial editor. Use rich styling terminology.",
  "recommendedProductIds": ["matching product ID 1", "matching product ID 2"],
  "stylingTips": ["Direct advice row 1", "Direct advice row 2"],
  "suggestedAesthetic": "A 2-3 word high-fashion tag name for their style"
}

Ensure all recommendedProductIds exist in the provided list. Return JSON exclusively.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            stylingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedAesthetic: { type: Type.STRING }
          },
          required: ["answer", "recommendedProductIds", "stylingTips", "suggestedAesthetic"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("Gemini AI styling error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. AI PRODUCT AGGREGATION & "SMART CRAWLER" TRIGGER
// Uses Gemini to simulate crawling current listing updates, removing mock duplicates, and generating luxury drops!
app.post("/api/products/crawl", async (req, res) => {
  const { searchTrend } = req.body;
  const ai = getGeminiClient();

  // Simulated sources that were scuttled or analyzed
  const sourcesChecked = [
    "Ashluxe Web Portal API",
    "Orange Culture Lagos listings",
    "WafflesnCream Instagram catalog feeds",
    "Miskay Boutique Shopify webhook",
    "Zara Nigeria retail database",
    "Jumia Premium Fashion Vendor Index"
  ];

  if (!ai) {
    // Fallback crawler generation if Gemini key is missing
    const crawlId = "prod-" + (productsCatalog.length + 1);
    const mockNewItem = {
      id: crawlId,
      name: `Abuja Streetwear ${searchTrend || 'Slouchy'} Cord Trouser`,
      price: 85000,
      originalPrice: 110000,
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
      hoverImage: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80",
      sourceSite: "WafflesnCream Shop",
      sourceUrl: "https://wafflesncream.com/skate/garki-streetwear-cord",
      sizes: ["S", "M", "L"],
      colors: ["Mocha Brown", "Forest Deep"],
      category: "Streetwear" as const,
      brand: "WafflesnCream",
      fabric: "Velvet Corduroy with mesh inner lining",
      stockStatus: "In Stock" as const,
      rating: 4.8,
      reviewsCount: 12,
      gender: "Unisex" as const,
      trendCategory: "Trending in Nigeria" as const,
      description: "Discovered during live crawling of Lagos fashion hashtags. Thick custom corduroy with reinforced rivets and asymmetrical belt loop, styled for Lagos evenings.",
      launchDate: new Date().toISOString()
    };

    productsCatalog.unshift(mockNewItem);

    return res.json({
      success: true,
      sourcesChecked,
      duplicatesRemoved: 1,
      itemsAnalyzed: 14,
      itemsInjected: 1,
      injectedItem: mockNewItem,
      message: "Lagos/Abuja digital fashion crawls completed. 1 hot unique item was aggregate-verified, deduplicated, and added with price check!"
    });
  }

  try {
    const prompt = `Generate a highly unique, premium pants product aggregated from a top Nigerian vendor.
User input / search interest: "${searchTrend || 'Oversized Streetwear'}"
Create exactly one item with highly specified details. Return ONLY a valid JSON object matching the following format:
{
  "name": "E.g., Ashluxe Lagos Parachute Pant",
  "price": 95000,
  "originalPrice": 120000,
  "category": "Cargo" (or Choose from: "Wide-legged", "Palazzo", "Asymmetrical", "Cargo", "Baggy", "Streetwear", "Vintage", "Korean", "Luxury Casual"),
  "sourceSite": "Ashluxe Official",
  "sourceUrl": "https://ashluxe.com/collections/pants/custom",
  "brand": "Ashluxe",
  "colors": ["Ebony", "Steel Gray"],
  "sizes": ["M", "L", "XL"],
  "fabric": "Waterproof Ripstop Nylon",
  "description": "Exquisite description showcasing design energy and Nigerian streetwear culture context.",
  "gender": "Unisex",
  "trendCategory": "Streetwear Essentials" (Choose: "Streetwear Essentials", "Luxury Pants", "Trending in Nigeria", "Limited Drop")
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            originalPrice: { type: Type.NUMBER, nullable: true },
            category: { type: Type.STRING },
            sourceSite: { type: Type.STRING },
            sourceUrl: { type: Type.STRING },
            brand: { type: Type.STRING },
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sizes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            fabric: { type: Type.STRING },
            description: { type: Type.STRING },
            gender: { type: Type.STRING },
            trendCategory: { type: Type.STRING }
          },
          required: ["name", "price", "category", "sourceSite", "brand", "colors", "sizes", "fabric", "description", "gender", "trendCategory"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    const id = "prod-gen-" + Math.floor(Math.random() * 10000);

    // Unsplash design catalogs based on style category
    const fashionImageMap: Record<string, { img: string; hover: string }> = {
      "Cargo": {
        img: "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?auto=format&fit=crop&w=600&q=80",
        hover: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80"
      },
      "Wide-legged": {
        img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80",
        hover: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80"
      },
      "Streetwear": {
        img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
        hover: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80"
      },
      "Palazzo": {
        img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80",
        hover: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=600&q=80"
      },
      "Asymmetrical": {
        img: "https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=600&q=80",
        hover: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=600&q=80"
      }
    };

    const maps = fashionImageMap[parsed.category] || fashionImageMap["Wide-legged"];

    const validatedNewItem = {
      id,
      name: parsed.name,
      price: parsed.price || 85000,
      originalPrice: parsed.originalPrice || null,
      image: maps.img,
      hoverImage: maps.hover,
      sourceSite: parsed.sourceSite || "Instagram Aggregated Vendor",
      sourceUrl: parsed.sourceUrl || "https://instagram.com/houseofjojo",
      sizes: parsed.sizes || ["M", "L"],
      colors: parsed.colors || ["Obsidian Black"],
      category: (parsed.category || "Wide-legged") as any,
      brand: parsed.brand || "Jupiter Designer Label",
      fabric: parsed.fabric || "Premium Cotton Crepe Blend",
      stockStatus: "In Stock" as const,
      rating: 4.8,
      reviewsCount: 4,
      gender: (parsed.gender === "Men" || parsed.gender === "Women") ? parsed.gender : "Unisex" as const,
      trendCategory: (parsed.trendCategory || "Trending in Nigeria") as any,
      description: parsed.description || "Freshly aggregated and de-duplicated by our Jupiter AI agent.",
      launchDate: new Date().toISOString()
    };

    // Prepend to catalog to show first
    productsCatalog.unshift(validatedNewItem);

    res.json({
      success: true,
      sourcesChecked,
      duplicatesRemoved: 2,
      itemsAnalyzed: 28,
      itemsInjected: 1,
      injectedItem: validatedNewItem,
      message: "AI Intelligent Crawl & De-duplication has run successfully. Analyzed 28 fashion URLs, filtered out 2 replica listing duplications, and secured 1 premium verified drop."
    });
  } catch (error: any) {
    console.error("Aggregation crawler failure:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. CHECKOUT SIMULATOR (Paystack & Flutterwave)
app.post("/api/checkout", (req, res) => {
  const { cart, addressDetails } = req.body;
  if (!cart || cart.length === 0) {
    return res.status(400).json({ success: false, error: "Cart is empty." });
  }

  const orderId = "JT-ORD-" + Math.floor(100000 + Math.random() * 900000);
  
  // Custom delivery times based on Nigerian Cities
  let deliveryDays = 3;
  let shipFee = 3500; // default in NGN
  const city = addressDetails.city || "Lagos";

  switch (city) {
    case "Lagos":
      deliveryDays = addressDetails.deliveryMethod === "Express" ? 1 : 2;
      shipFee = addressDetails.deliveryMethod === "Express" ? 5000 : 2500;
      break;
    case "Abuja":
      deliveryDays = addressDetails.deliveryMethod === "Express" ? 2 : 3;
      shipFee = addressDetails.deliveryMethod === "Express" ? 7500 : 4500;
      break;
    case "Port Harcourt":
      deliveryDays = addressDetails.deliveryMethod === "Express" ? 2 : 4;
      shipFee = addressDetails.deliveryMethod === "Express" ? 8000 : 5000;
      break;
    case "Benin":
      deliveryDays = addressDetails.deliveryMethod === "Express" ? 2 : 3;
      shipFee = addressDetails.deliveryMethod === "Express" ? 7000 : 4000;
      break;
    default:
      deliveryDays = addressDetails.deliveryMethod === "Express" ? 3 : 5;
      shipFee = addressDetails.deliveryMethod === "Express" ? 12000 : 7000;
  }

  const estDate = new Date();
  estDate.setDate(estDate.getDate() + deliveryDays);

  res.json({
    success: true,
    orderId,
    gateway: addressDetails.paymentGateway,
    gatewayReference: "REF-PG-" + Math.floor(10000000 + Math.random() * 90000000),
    shippingFee: shipFee,
    deliveryDays,
    estimatedDelivery: estDate.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    trackerLogs: [
      { time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }), statusDescription: "Order received & approved via Paystack/Flutterwave" },
      { time: "Pending", statusDescription: "Awaiting House of JoJo logistics sorting at Ikeja Center" }
    ]
  });
});

// Vite server integrations
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Jupiter Threads Luxury server booting on port ${PORT}`);
  });
};

startServer();
