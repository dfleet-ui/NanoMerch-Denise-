import { Scenario } from "./types";
import { 
  Coffee, 
  Shirt, 
  Sparkles, 
  Layers,
  Droplets,
  ShoppingBag,
  PenLine,
  Flame
} from "lucide-react";
import React from "react";

export const SCENARIOS: Scenario[] = [
  {
    id: 't-shirt',
    name: 'Gildan 5000 T-Shirt',
    description: 'Heavy cotton classic fit tee.',
    iconName: 'Shirt',
    promptTemplate: 'Visualize this design printed on the front chest of a {color} Gildan 5000 Heavy Cotton T-Shirt. The shirt is isolated on a plain white background. High resolution product photography, realistic fabric texture.',
    options: {
      colors: [
        { label: 'White', value: 'white', hex: '#ffffff' },
        { label: 'Black', value: 'black', hex: '#18181b' },
        { label: 'Navy', value: 'navy blue', hex: '#172554' },
        { label: 'Sport Grey', value: 'heather grey', hex: '#9ca3af' },
        { label: 'Red', value: 'red', hex: '#dc2626' },
        { label: 'Royal', value: 'royal blue', hex: '#2563eb' },
        { label: 'Military Green', value: 'military green', hex: '#4d5940' },
        { label: 'Forest Green', value: 'forest green', hex: '#14532d' },
      ]
    },
    defaultSpecs: {
      price: 'Starting at $12.98 each + tax',
      pricingTiers: [
        { qty: '12–23', price: '$16.50' },
        { qty: '24–47', price: '$14.25' },
        { qty: '48–71', price: '$12.98' },
        { qty: '72+', price: '$11.50' },
      ],
      features: [
        '100% cotton jersey (preshrunk)',
        'Classic fit with seamless double needle collar',
        'Taped neck and shoulders',
        'Tear away label',
        'Sizes: S–3XL',
        'Decoration: Screen Print or DTF'
      ]
    }
  },
  {
    id: 'polo',
    name: 'Port Authority Polo',
    description: 'Classic piqué polo shirt.',
    iconName: 'Shirt',
    promptTemplate: 'Visualize this design embroidered on the left chest of a {color} Port Authority piqué polo shirt. The polo is isolated on a plain white background. Professional product photography, realistic fabric texture, crisp embroidery detail.',
    options: {
      colors: [
        { label: 'White', value: 'white', hex: '#ffffff' },
        { label: 'Black', value: 'black', hex: '#18181b' },
        { label: 'Navy', value: 'navy blue', hex: '#172554' },
        { label: 'Royal', value: 'royal blue', hex: '#2563eb' },
        { label: 'Red', value: 'red', hex: '#dc2626' },
        { label: 'Sport Grey', value: 'light grey', hex: '#9ca3af' },
        { label: 'Dark Green', value: 'dark green', hex: '#14532d' },
      ]
    },
    defaultSpecs: {
      price: 'Starting at $28.50 each + tax',
      pricingTiers: [
        { qty: '6–11', price: '$34.50' },
        { qty: '12–23', price: '$31.00' },
        { qty: '24–47', price: '$28.50' },
        { qty: '48+', price: '$26.00' },
      ],
      features: [
        '65% polyester / 35% cotton piqué',
        'Flat knit collar and cuffs',
        'Two-button placket',
        'Side vents for ease of movement',
        'Sizes: XS–4XL',
        'Decoration: Left chest embroidery'
      ]
    }
  },
  {
    id: 'hoodie',
    name: 'Pullover Hoodie',
    description: 'Cozy streetwear style hoodie.',
    iconName: 'Layers',
    promptTemplate: 'Apply this design to the chest of a high-quality {color} pullover hoodie isolated on a plain white background. Realistic fabric folds and texture, studio lighting.',
    options: {
      colors: [
        { label: 'Black', value: 'black', hex: '#18181b' },
        { label: 'Navy', value: 'navy blue', hex: '#172554' },
        { label: 'Sport Grey', value: 'heather grey', hex: '#9ca3af' },
        { label: 'Dark Heather', value: 'dark heather grey', hex: '#52525b' },
        { label: 'Red', value: 'red', hex: '#dc2626' },
        { label: 'Forest Green', value: 'forest green', hex: '#14532d' },
      ]
    },
    defaultSpecs: {
      price: 'Starting at $39.95 each + tax',
      pricingTiers: [
        { qty: '12–23', price: '$45.00' },
        { qty: '24–47', price: '$42.00' },
        { qty: '48+', price: '$39.95' },
      ],
      features: [
        '50% cotton / 50% polyester fleece',
        'Compact fleece fabric for low shrinkage',
        'Double lined hood with drawstring',
        'Pouch pocket',
        'Rib knit cuffs and waistband',
        'Decoration: Screen Print or Embroidery'
      ]
    }
  },
  {
    id: 'fleece-jacket',
    name: 'Fleece Full-Zip Jacket',
    description: 'Warm branded full-zip fleece.',
    iconName: 'Flame',
    promptTemplate: 'Show this design embroidered on the left chest of a {color} full-zip fleece jacket, isolated on a plain white background. Professional product photography, realistic fleece texture.',
    options: {
      colors: [
        { label: 'Black', value: 'black', hex: '#18181b' },
        { label: 'Navy', value: 'navy blue', hex: '#172554' },
        { label: 'Charcoal', value: 'charcoal grey', hex: '#374151' },
        { label: 'Red', value: 'red', hex: '#dc2626' },
        { label: 'Forest Green', value: 'forest green', hex: '#14532d' },
      ]
    },
    defaultSpecs: {
      price: 'Starting at $55.00 each + tax',
      pricingTiers: [
        { qty: '6–11', price: '$62.00' },
        { qty: '12–23', price: '$58.00' },
        { qty: '24+', price: '$55.00' },
      ],
      features: [
        '100% polyester anti-pill fleece',
        'Full-zip front with chin guard',
        'Open hem with side pockets',
        'Cadet collar',
        'Sizes: XS–3XL',
        'Decoration: Left chest embroidery'
      ]
    }
  },
  {
    id: 'baseball-cap',
    name: 'Baseball Cap',
    description: 'Embroidered classic dad hat.',
    iconName: 'Sparkles',
    promptTemplate: 'Display this design embroidered on the front panel of a {color} classic baseball cap (structured dad hat style) sitting on a clean white surface. Close up, high texture detail, professional product photography.',
    options: {
      colors: [
        { label: 'Black', value: 'black', hex: '#18181b' },
        { label: 'Navy', value: 'navy blue', hex: '#172554' },
        { label: 'Royal', value: 'royal blue', hex: '#2563eb' },
        { label: 'Khaki', value: 'khaki', hex: '#a16207' },
        { label: 'Red', value: 'red', hex: '#dc2626' },
        { label: 'White', value: 'white', hex: '#f4f4f5' },
      ]
    },
    defaultSpecs: {
      price: 'Starting at $16.50 each + tax',
      pricingTiers: [
        { qty: '12–23', price: '$19.50' },
        { qty: '24–47', price: '$17.50' },
        { qty: '48+', price: '$16.50' },
      ],
      features: [
        '100% cotton bio-washed twill',
        'Unstructured, six-panel, low-profile',
        'Pre-curved visor',
        'Adjustable self-fabric back with tri-glide buckle',
        'One size fits most',
        'Decoration: Front embroidery'
      ]
    }
  },
  {
    id: 'water-bottle',
    name: '20oz Stainless Bottle',
    description: 'Insulated stainless water bottle.',
    iconName: 'Droplets',
    promptTemplate: 'Show this design laser engraved or printed on a {color} 20oz stainless steel insulated water bottle, standing upright on a clean white surface. High-end product photography, reflective metal finish.',
    options: {
      colors: [
        { label: 'Black', value: 'matte black', hex: '#18181b' },
        { label: 'Silver', value: 'brushed silver', hex: '#9ca3af' },
        { label: 'Navy', value: 'navy blue', hex: '#172554' },
        { label: 'Red', value: 'red', hex: '#dc2626' },
        { label: 'White', value: 'white', hex: '#f4f4f5' },
        { label: 'Forest Green', value: 'forest green', hex: '#14532d' },
      ]
    },
    defaultSpecs: {
      price: 'Starting at $18.50 each + tax',
      pricingTiers: [
        { qty: '12–23', price: '$22.00' },
        { qty: '24–47', price: '$20.00' },
        { qty: '48+', price: '$18.50' },
      ],
      features: [
        '20oz double-wall vacuum insulated',
        'Keeps cold 24 hrs / hot 12 hrs',
        '18/8 food-grade stainless steel',
        'BPA-free, leak-proof lid',
        'Wide mouth for ice cubes',
        'Decoration: Laser engraving or full-color print'
      ]
    }
  },
  {
    id: 'tote-bag',
    name: 'Canvas Tote Bag',
    description: 'Reusable promotional tote.',
    iconName: 'ShoppingBag',
    promptTemplate: 'Show this design screen printed on the front of a natural canvas tote bag hanging against a clean white background. Lifestyle product photography, realistic fabric texture.',
    defaultSpecs: {
      price: 'Starting at $7.50 each + tax',
      pricingTiers: [
        { qty: '24–47', price: '$9.50' },
        { qty: '48–99', price: '$8.25' },
        { qty: '100+', price: '$7.50' },
      ],
      features: [
        'Natural 10oz cotton canvas',
        '15" x 16" with 22" self-fabric handles',
        'Large main compartment',
        'Machine washable',
        'Eco-friendly reusable material',
        'Decoration: Screen Print (1–4 colour)'
      ]
    }
  },
  {
    id: 'coffee-mug',
    name: 'Ceramic Mug',
    description: 'White ceramic coffee mug.',
    iconName: 'Coffee',
    promptTemplate: 'Create a photorealistic image of this design printed on a white 11oz ceramic coffee mug sitting on a rustic wooden table. Morning sunlight lighting. High quality product photography.',
    defaultSpecs: {
      price: 'Starting at $9.50 each + tax',
      pricingTiers: [
        { qty: '24–47', price: '$12.00' },
        { qty: '48–99', price: '$10.50' },
        { qty: '100+', price: '$9.50' },
      ],
      features: [
        '11oz ceramic mug',
        'C-handle for comfortable grip',
        'High gloss finish',
        'Dishwasher and microwave safe',
        'Lead-free',
        'Decoration: Full-wrap sublimation print'
      ]
    }
  },
  {
    id: 'pen',
    name: 'Branded Pen',
    description: 'Classic logo imprint pen.',
    iconName: 'PenLine',
    promptTemplate: 'Show this logo imprinted on the barrel of a sleek black ballpoint pen, displayed on a clean white background. Close-up professional product photography, sharp and detailed.',
    defaultSpecs: {
      price: 'Starting at $1.85 each + tax',
      pricingTiers: [
        { qty: '100–249', price: '$2.50' },
        { qty: '250–499', price: '$2.15' },
        { qty: '500+', price: '$1.85' },
      ],
      features: [
        'Ballpoint with blue or black ink',
        'Smooth writing mechanism',
        'Retractable push-top button',
        'Rubber grip for comfort',
        'Decoration: 1-colour barrel imprint'
      ]
    }
  }
];

export const ICON_MAP: Record<string, React.ReactNode> = {
  Coffee: <Coffee className="w-6 h-6" />,
  Shirt: <Shirt className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Layers: <Layers className="w-6 h-6" />,
  Droplets: <Droplets className="w-6 h-6" />,
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
  PenLine: <PenLine className="w-6 h-6" />,
  Flame: <Flame className="w-6 h-6" />,
};
