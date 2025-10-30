import {
    CommercialSection,
    CommercialSectionItem,
    StoreFront,
} from '@/modules/commercial/types';

export const mockStoreFronts: StoreFront[] = [
  {
    id: 'store-luna-living',
    name: 'Luna Living',
    category: 'home',
    accentColor: '#F3E7D9',
    initials: 'LL',
    rating: 4.8,
    followers: 23500,
    productCount: 128,
    tags: ['Decor', 'Minimal'],
    promoMessage: 'Bundle & save 15% this weekend',
    products: [
      {
        id: 'prod-throw',
        name: 'Woven Throw Blanket',
        price: '$24.90',
        description: 'Textured cotton throw in neutral hues.',
      },
      {
        id: 'prod-planter',
        name: 'Ceramic Planter Duo',
        price: '$18.50',
        description: 'Matte ceramic planters sized for indoor herbs.',
      },
      {
        id: 'prod-lamp',
        name: 'Ambient Table Lamp',
        price: '$32.00',
        description: 'Opal glass lamp with dimmable glow.',
      },
    ],
    ownerName: 'Eva Luna',
    address: '18 Crescent Ave, Portland, OR',
    description:
      'Scandinavian-inspired decor essentials crafted with natural textures and soft light.',
    logoUrl: 'https://images.unsplash.com/photo-1616628188505-4047bea1e2ea?w=240&h=240&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&h=640&fit=crop',
    categories: [
      {
        id: 'luna-living-room',
        title: 'Living room',
        items: [
          {
            id: 'room-soft-lamp',
            name: 'Soft Arc Floor Lamp',
            price: '$48.00',
            description: 'Slim profile arc lamp with warm LED bulb.',
          },
          {
            id: 'room-knit-throw',
            name: 'Knit Layer Throw',
            price: '$26.00',
            description: 'Chunky knit throw woven from recycled fibers.',
          },
          {
            id: 'room-nesting-tables',
            name: 'Oak Nesting Tables',
            price: '$120.00',
            description: 'Pair of matte oak nesting tables with rounded corners.',
          },
        ],
      },
      {
        id: 'luna-bedroom',
        title: 'Bedroom',
        items: [
          {
            id: 'bed-stone-lamp',
            name: 'Stone Base Bedside Lamp',
            price: '$34.50',
            description: 'Hand-polished stone lamp base with linen shade.',
          },
          {
            id: 'bed-linen-set',
            name: 'Breathable Linen Sheet Set',
            price: '$89.00',
            description: 'Lightweight linen sheets in sand and clay palette.',
          },
          {
            id: 'bed-storage-bench',
            name: 'Storage Bench',
            price: '$158.00',
            description: 'Upholstered bench with hidden storage and oak legs.',
          },
        ],
      },
      {
        id: 'luna-plants',
        title: 'Planters & greenery',
        items: [
          {
            id: 'plant-ceramic-duo',
            name: 'Ceramic Planter Duo',
            price: '$18.50',
            description: 'Matte ceramic planters sized for succulents.',
          },
          {
            id: 'plant-hanging-kit',
            name: 'Hanging Planter Kit',
            price: '$24.00',
            description: 'Braided hanger with stoneware planter and hook.',
          },
          {
            id: 'plant-mister',
            name: 'Glass Plant Mister',
            price: '$12.00',
            description: 'Amber glass mister with brushed brass pump.',
          },
        ],
      },
    ],
  },
  {
    id: 'store-vibe-lab',
    name: 'Vibe Lab Electronics',
    category: 'electronics',
    accentColor: '#D6E7FF',
    initials: 'VL',
    rating: 4.6,
    followers: 48210,
    productCount: 203,
    tags: ['Audio', 'Smart Home'],
    promoMessage: 'Free shipping on orders over $40',
    products: [
      {
        id: 'prod-headphones',
        name: 'Noise-cancel Headphones',
        price: '$79.00',
        description: 'Hybrid ANC on-ear headphones with 30h battery.',
      },
      {
        id: 'prod-speaker',
        name: 'Smart Speaker Mini',
        price: '$39.90',
        description: 'Compact smart speaker with room-filling sound.',
      },
      {
        id: 'prod-light',
        name: 'Gradient Light Strip',
        price: '$22.50',
        description: 'Adaptive RGB light strip with music sync.',
      },
    ],
    ownerName: 'Jayden Price',
    address: '221 Tech Plaza, Austin, TX',
    description:
      'Smart home audio gear and lighting made for creators and modern apartments.',
    logoUrl: 'https://images.unsplash.com/photo-1522156373667-4c7234bbd804?w=240&h=240&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=640&fit=crop',
    categories: [
      {
        id: 'vibe-audio',
        title: 'Audio essentials',
        items: [
          {
            id: 'audio-anc-headphones',
            name: 'Orbit ANC Headphones',
            price: '$89.00',
            description: 'Foldable headphones with adaptive noise canceling.',
          },
          {
            id: 'audio-true-wireless',
            name: 'Pulse Buds Mini',
            price: '$54.90',
            description: 'True wireless earbuds with ergonomic fit.',
          },
          {
            id: 'audio-soundbar',
            name: 'Wave Compact Soundbar',
            price: '$119.00',
            description: 'Slim soundbar tuned for apartment living rooms.',
          },
        ],
      },
      {
        id: 'vibe-smart-home',
        title: 'Smart home',
        items: [
          {
            id: 'smart-hub-mini',
            name: 'Core Hub Mini',
            price: '$44.00',
            description: 'Matter-ready smart home hub with edge automation.',
          },
          {
            id: 'smart-lightstrip',
            name: 'Gradient Light Strip',
            price: '$22.50',
            description: 'RGB light strip with adaptive scenes and voice control.',
          },
          {
            id: 'smart-sensor-pack',
            name: 'Enviro Sensor Pack',
            price: '$36.00',
            description: 'Temperature, motion, and humidity sensors in one kit.',
          },
        ],
      },
      {
        id: 'vibe-workspace',
        title: 'Desk & creator',
        items: [
          {
            id: 'desk-led-bar',
            name: 'Creator LED Bar',
            price: '$58.00',
            description: 'Edge-lit desk LED bar with true tone diffusion.',
          },
          {
            id: 'desk-stream-deck',
            name: 'StreamPad Lite',
            price: '$74.00',
            description: 'Programmable macro pad with haptic buttons.',
          },
          {
            id: 'desk-cable-kit',
            name: 'Cable Keep Kit',
            price: '$18.00',
            description: 'Magnetic clips and sleeves for cable routing.',
          },
        ],
      },
    ],
  },
  {
    id: 'store-aurora-beauty',
    name: 'Aurora Beauty Co.',
    category: 'beauty',
    accentColor: '#F9E0F2',
    initials: 'AB',
    rating: 4.9,
    followers: 18900,
    productCount: 96,
    tags: ['Skincare', 'Vegan'],
    promoMessage: 'Buy 2 serums, get 1 mask free',
    products: [
      {
        id: 'prod-serum',
        name: 'Radiance Serum',
        price: '$28.00',
        description: 'Vitamin C serum for glass-skin glow.',
      },
      {
        id: 'prod-cream',
        name: 'Hydration Gel Cream',
        price: '$26.50',
        description: 'Daily gel cream with ceramide complex.',
      },
      {
        id: 'prod-set',
        name: 'Mini Glow Set',
        price: '$18.90',
        description: 'Travel trio: cleanser, toner, overnight mask.',
      },
    ],
    ownerName: 'Maya Campos',
    address: '55 Aurora Street, Los Angeles, CA',
    description:
      'Clean, clinically-backed skincare rituals designed for glow seekers and sensitive skin.',
    logoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=240&h=240&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1589985270826-4b4c1ea3b8a5?w=1200&h=640&fit=crop',
    categories: [
      {
        id: 'aurora-serums',
        title: 'Serums',
        items: [
          {
            id: 'serum-vitamin-c',
            name: 'Radiance Serum',
            price: '$28.00',
            description: '10% vitamin C blend with licorice root.',
          },
          {
            id: 'serum-night-renew',
            name: 'Night Renewal Drops',
            price: '$32.00',
            description: 'Gentle retinol alternative with bakuchiol.',
          },
          {
            id: 'serum-hydra',
            name: 'Hydra Dew Ampoule',
            price: '$30.00',
            description: 'Peptide + algae complex for bounce.',
          },
        ],
      },
      {
        id: 'aurora-moisturizers',
        title: 'Moisturizers',
        items: [
          {
            id: 'moisture-gel-cream',
            name: 'Hydration Gel Cream',
            price: '$26.50',
            description: 'Featherweight hydration for daytime wear.',
          },
          {
            id: 'moisture-ceramide',
            name: 'Barrier Repair Cream',
            price: '$29.00',
            description: 'Ceramide-rich cream to soothe dry skin.',
          },
          {
            id: 'moisture-sleep-mask',
            name: 'Midnight Recovery Mask',
            price: '$21.50',
            description: 'Overnight mask with blue tansy and squalane.',
          },
        ],
      },
      {
        id: 'aurora-sets',
        title: 'Starter sets',
        items: [
          {
            id: 'set-mini-glow',
            name: 'Mini Glow Set',
            price: '$18.90',
            description: 'Portable trio with cleanser, mist, hydrator.',
          },
          {
            id: 'set-weekend-reset',
            name: 'Weekend Reset Kit',
            price: '$34.00',
            description: 'Masks and exfoliator to refresh in 48 hours.',
          },
          {
            id: 'set-sunrise',
            name: 'Sunrise Essentials',
            price: '$24.00',
            description: 'SPF gel, eye brightener, lip dew balm.',
          },
        ],
      },
    ],
  },
  {
    id: 'store-pulse-fit',
    name: 'PulseFit Active',
    category: 'lifestyle',
    accentColor: '#DDF5EC',
    initials: 'PF',
    rating: 4.7,
    followers: 15420,
    productCount: 142,
    tags: ['Athleisure', 'Accessories'],
    promoMessage: 'New arrivals drop every Friday',
    products: [
      {
        id: 'prod-joggers',
        name: 'AirFlex Joggers',
        price: '$34.00',
        description: 'Moisture-wicking joggers with tapered fit.',
      },
      {
        id: 'prod-bottle',
        name: 'Insulated Bottle',
        price: '$14.50',
        description: 'Stainless bottle keeping drinks cold for 24h.',
      },
      {
        id: 'prod-band',
        name: 'Resistance Band Trio',
        price: '$19.90',
        description: 'Three strength bands with grippy lining.',
      },
    ],
    ownerName: 'Kaia Bennett',
    address: '402 Harbor Way, Seattle, WA',
    description:
      'Performance-forward athleisure, hydration, and recovery kits built for active city life.',
    logoUrl: 'https://images.unsplash.com/photo-1594737625785-c66858a24b47?w=240&h=240&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=1200&h=640&fit=crop',
    categories: [
      {
        id: 'pulse-apparel',
        title: 'Apparel',
        items: [
          {
            id: 'apparel-airflex-joggers',
            name: 'AirFlex Joggers',
            price: '$34.00',
            description: 'Breathable joggers with bonded seams.',
          },
          {
            id: 'apparel-layer-tee',
            name: 'LayerFit Seamless Tee',
            price: '$22.00',
            description: 'Seamless tee with mesh ventilation zones.',
          },
          {
            id: 'apparel-hoodie',
            name: 'Momentum Hoodie',
            price: '$48.00',
            description: 'Thermal hoodie with thumbholes and zip pocket.',
          },
        ],
      },
      {
        id: 'pulse-gear',
        title: 'Gear & accessories',
        items: [
          {
            id: 'gear-resistance-bands',
            name: 'Resistance Band Trio',
            price: '$19.90',
            description: 'Three loop bands with progressive resistance.',
          },
          {
            id: 'gear-foam-roller',
            name: 'Recover Foam Roller',
            price: '$28.00',
            description: 'Textured recovery roller with firm core.',
          },
          {
            id: 'gear-jump-rope',
            name: 'Speed Jump Rope',
            price: '$16.50',
            description: 'Adjustable jump rope with aluminum handles.',
          },
        ],
      },
      {
        id: 'pulse-hydration',
        title: 'Hydration & travel',
        items: [
          {
            id: 'hydro-insulated-bottle',
            name: 'Insulated Bottle',
            price: '$14.50',
            description: 'Double-wall stainless steel bottle, 21oz.',
          },
          {
            id: 'hydro-gym-case',
            name: 'Gym Ready Carry Case',
            price: '$32.00',
            description: 'Water-resistant zip case with ventilated pocket.',
          },
          {
            id: 'hydro-travel-kit',
            name: 'Active Travel Kit',
            price: '$44.00',
            description: 'Packing cube, bottle, and resistance bands set.',
          },
        ],
      },
    ],
  },
  {
    id: 'store-harvest',
    name: 'Harvest Pantry',
    category: 'grocery',
    accentColor: '#F2EFD4',
    initials: 'HP',
    rating: 4.5,
    followers: 12870,
    productCount: 76,
    tags: ['Organic', 'Local'],
    promoMessage: 'Daily essentials delivered in 2h',
    products: [
      {
        id: 'prod-coffee',
        name: 'Cold Brew Pack',
        price: '$16.00',
        description: 'Four-pack of ready-to-brew cold brew sachets.',
      },
      {
        id: 'prod-granola',
        name: 'Nutty Granola',
        price: '$12.40',
        description: 'House blend granola with toasted almonds.',
      },
      {
        id: 'prod-tea',
        name: 'Botanical Tea Set',
        price: '$15.90',
        description: 'Assorted herbal teas in reusable tins.',
      },
    ],
    ownerName: 'Noah Kincaid',
    address: '78 Willow Market, Denver, CO',
    description:
      'Seasonal pantry staples, beverage kits, and small-batch treats from family growers.',
    logoUrl: 'https://images.unsplash.com/photo-1515007917921-cad9bf0222c7?w=240&h=240&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=640&fit=crop',
    categories: [
      {
        id: 'harvest-pantry',
        title: 'Pantry staples',
        items: [
          {
            id: 'pantry-granola',
            name: 'Nutty Granola',
            price: '$12.40',
            description: 'Crunchy granola with maple drizzle.',
          },
          {
            id: 'pantry-oat-pack',
            name: 'Overnight Oat Pack',
            price: '$10.50',
            description: 'Three flavors of overnight oats with chia.',
          },
          {
            id: 'pantry-artisan-jam',
            name: 'Berry Artisan Jam',
            price: '$9.80',
            description: 'Small batch jam with wild blueberries.',
          },
        ],
      },
      {
        id: 'harvest-beverage',
        title: 'Beverages',
        items: [
          {
            id: 'beverage-coldbrew',
            name: 'Cold Brew Pack',
            price: '$16.00',
            description: 'Slow-steep blend with chocolate notes.',
          },
          {
            id: 'beverage-herbal-tea',
            name: 'Botanical Tea Set',
            price: '$15.90',
            description: 'Loose-leaf tea trio: chamomile, mint, hibiscus.',
          },
          {
            id: 'beverage-tonic',
            name: 'Citrus Ginger Tonic',
            price: '$11.00',
            description: 'Sparkling tonic with pressed ginger and yuzu.',
          },
        ],
      },
      {
        id: 'harvest-snacks',
        title: 'Snacks & treats',
        items: [
          {
            id: 'snack-seed-crackers',
            name: 'Seeded Crackers',
            price: '$8.50',
            description: 'Five-seed cracker crisps with sea salt.',
          },
          {
            id: 'snack-fruit-leather',
            name: 'Fruit Leather Pack',
            price: '$9.20',
            description: 'Sun-dried fruit leather, no added sugar.',
          },
          {
            id: 'snack-cocoa-nibs',
            name: 'Cocoa Nib Trail Mix',
            price: '$11.40',
            description: 'Trail mix with cacao nibs and dried cherries.',
          },
        ],
      },
    ],
  },
];

const buildItem = (
  store: StoreFront,
  data: Omit<CommercialSectionItem, 'storeId' | 'storeName' | 'storeBadge' | 'accentColor'> &
    Partial<Pick<CommercialSectionItem, 'accentColor'>>,
): CommercialSectionItem => ({
  storeId: store.id,
  storeName: store.name,
  storeBadge: store.initials,
  accentColor: data.accentColor ?? store.accentColor,
  ...data,
});

const storeById = (id: string) => mockStoreFronts.find((store) => store.id === id)!;

export const mockSectionItems: Record<CommercialSection, CommercialSectionItem[]> = {
  forYou: [
    buildItem(storeById('store-luna-living'), {
      id: 'fy-throw-set',
      name: 'Layered Throw Set',
      subtitle: 'Hand-loomed cotton, neutral palette',
      price: '$29.90',
      badge: 'New drop',
      tags: ['Home', 'Cozy'],
    }),
    buildItem(storeById('store-aurora-beauty'), {
      id: 'fy-serum-duo',
      name: 'Glow Ritual Duo',
      subtitle: 'Vitamin C + Hyaluronic combo',
      price: '$42.00',
      badge: 'Bundle deal',
      tags: ['Skincare'],
    }),
    buildItem(storeById('store-vibe-lab'), {
      id: 'fy-pulse-buds',
      name: 'Pulse Buds Mini',
      subtitle: 'Compact true wireless audio',
      price: '$54.90',
      tags: ['Audio'],
    }),
    buildItem(storeById('store-pulse-fit'), {
      id: 'fy-travel-kit',
      name: 'Active Travel Kit',
      subtitle: 'Carry + bottle + resistance bands',
      price: '$44.00',
      tags: ['Travel'],
    }),
  ],
  topSale: [
    buildItem(storeById('store-vibe-lab'), {
      id: 'ts-speaker',
      name: 'Smart Speaker Mini',
      subtitle: 'Top seller • 2K+ sold this week',
      price: '$39.90',
      badge: 'Flash sale',
      tags: ['Smart Home'],
    }),
    buildItem(storeById('store-pulse-fit'), {
      id: 'ts-airflex',
      name: 'AirFlex Joggers',
      subtitle: 'Moisture-wicking fabric blend',
      price: '$34.00',
      tags: ['Athleisure'],
    }),
    buildItem(storeById('store-harvest'), {
      id: 'ts-coldbrew',
      name: 'Cold Brew Pack',
      subtitle: 'Best seller • ships in 2h',
      price: '$16.00',
      tags: ['Pantry'],
    }),
    buildItem(storeById('store-aurora-beauty'), {
      id: 'ts-hydration',
      name: 'Hydration Gel Cream',
      subtitle: 'Oil-free daily moisturizer',
      price: '$26.50',
      tags: ['Daily use'],
    }),
  ],
  newArrivals: [
    buildItem(storeById('store-luna-living'), {
      id: 'na-dome-lamp',
      name: 'Dome Glass Lamp',
      subtitle: 'Soft-glow, tap dimmer',
      price: '$36.00',
      badge: 'Just in',
      tags: ['Lighting'],
    }),
    buildItem(storeById('store-pulse-fit'), {
      id: 'na-flex-mat',
      name: 'FlexFlow Mat',
      subtitle: 'Dual texture, non-slip finish',
      price: '$24.90',
      tags: ['Fitness'],
    }),
    buildItem(storeById('store-aurora-beauty'), {
      id: 'na-midnight-mask',
      name: 'Midnight Recovery Mask',
      subtitle: 'Overnight repair treatment',
      price: '$21.50',
      tags: ['Night care'],
    }),
    buildItem(storeById('store-vibe-lab'), {
      id: 'na-lightstrip',
      name: 'Gradient Light Strip',
      subtitle: 'Syncs with music • App ready',
      price: '$22.50',
      tags: ['Lighting'],
    }),
  ],
  buyAgain: [
    buildItem(storeById('store-harvest'), {
      id: 'ba-granola',
      name: 'Nutty Granola',
      subtitle: 'Reorder in 1 tap • 12oz',
      price: '$12.40',
      tags: ['Breakfast'],
    }),
    buildItem(storeById('store-luna-living'), {
      id: 'ba-planter',
      name: 'Ceramic Planter Duo',
      subtitle: 'Restock reminder • bestseller',
      price: '$18.50',
      tags: ['Decor'],
    }),
    buildItem(storeById('store-pulse-fit'), {
      id: 'ba-bottle',
      name: 'Insulated Bottle',
      subtitle: 'Keeps cold for 24h',
      price: '$14.50',
      tags: ['Hydration'],
    }),
    buildItem(storeById('store-aurora-beauty'), {
      id: 'ba-serum',
      name: 'Radiance Serum',
      subtitle: 'Auto-refill available',
      price: '$28.00',
      tags: ['Skincare'],
    }),
  ],
  suggestions: [
    buildItem(storeById('store-vibe-lab'), {
      id: 'sg-sleepbuds',
      name: 'Sleep Buds S',
      subtitle: 'Adaptive white-noise generator',
      price: '$44.90',
      tags: ['Night routine'],
    }),
    buildItem(storeById('store-luna-living'), {
      id: 'sg-scent-diffuser',
      name: 'Scent Diffuser Capsule',
      subtitle: 'Refill-friendly, 3-week runtime',
      price: '$19.50',
      tags: ['Aromatherapy'],
    }),
    buildItem(storeById('store-pulse-fit'), {
      id: 'sg-ankle-weights',
      name: 'Soft Ankle Weights',
      subtitle: 'Adjustable up to 2kg',
      price: '$27.00',
      tags: ['Strength'],
    }),
    buildItem(storeById('store-harvest'), {
      id: 'sg-herbal-tea',
      name: 'Botanical Tea Set',
      subtitle: '6 blends, caffeine-free',
      price: '$15.90',
      tags: ['Tea'],
    }),
  ],
};

export const allCommercialItems: CommercialSectionItem[] = Object.values(mockSectionItems).flat();
