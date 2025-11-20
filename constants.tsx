import { Scenario } from "./types";
import { 
  Coffee, 
  Shirt, 
  Sparkles, 
  Layers
} from "lucide-react";
import React from "react";

export const SCENARIOS: Scenario[] = [
  {
    id: 't-shirt',
    name: 'Gildan 5000 T-Shirt',
    description: 'Heavy cotton classic fit tee.',
    iconName: 'Shirt',
    promptTemplate: 'Visualize this design printed on the front chest of a {color} Gildan 5000 Heavy Cotton T-Shirt. The shirt is isolated on a plain background. High resolution product photography, realistic fabric texture.',
    options: {
      colors: [
        { label: 'White', value: 'white', hex: '#ffffff' },
        { label: 'Black', value: 'black', hex: '#18181b' },
        { label: 'Navy', value: 'navy blue', hex: '#172554' },
        { label: 'Sport Grey', value: 'heather grey', hex: '#9ca3af' },
        { label: 'Red', value: 'red', hex: '#dc2626' },
        { label: 'Royal', value: 'royal blue', hex: '#2563eb' },
        { label: 'Military Green', value: 'military green', hex: '#4d5940' },
      ]
    },
    defaultSpecs: {
      price: '$10.98 each + tax',
      features: [
        '100% cotton jersey (preshrunk)',
        'Classic fit with seamless double needle collar',
        'Taped neck and shoulders',
        'Tear away label',
        'Sizes: S-3XL'
      ]
    }
  },
  {
    id: 'hoodie',
    name: 'Pullover Hoodie',
    description: 'Cozy streetwear style hoodie.',
    iconName: 'Layers',
    promptTemplate: 'Apply this design to the chest of a high-quality heather grey pullover hoodie isolated on a plain background. Urban style, realistic fabric folds and texture, studio lighting.',
    defaultSpecs: {
      price: '$39.95 each + tax',
      features: [
        '50% cotton / 50% polyester fleece',
        'Compact fleece fabric for low shrinkage',
        'Double lined hood with drawstring',
        'Pouch pocket',
        'Rib knit cuffs and waistband'
      ]
    }
  },
  {
    id: 'baseball-cap',
    name: 'Baseball Cap',
    description: 'Embroidered classic dad hat.',
    iconName: 'Sparkles',
    promptTemplate: 'Display this design embroidered on the front of a black classic baseball cap (dad hat style) sitting on a clean surface. Close up, high texture detail, professional product photography.',
    defaultSpecs: {
      price: '$15.50 each + tax',
      features: [
        '100% cotton bio-washed twill',
        'Unstructured, six-panel, low-profile',
        'Pre-curved visor',
        'Adjustable self-fabric back with tri-glide buckle',
        'One size fits most'
      ]
    }
  },
  {
    id: 'coffee-mug',
    name: 'Ceramic Mug',
    description: 'White ceramic coffee mug.',
    iconName: 'Coffee',
    promptTemplate: 'Create a photorealistic image of this design printed on a white ceramic coffee mug sitting on a rustic wooden table. Morning sunlight lighting. High quality product photography.',
    defaultSpecs: {
      price: '$8.50 each + tax',
      features: [
        '11oz Ceramic Mug',
        'C-handle for comfortable grip',
        'High gloss finish',
        'Dishwasher and microwave safe',
        'Lead-free'
      ]
    }
  }
];

export const ICON_MAP: Record<string, React.ReactNode> = {
  Coffee: <Coffee className="w-6 h-6" />,
  Shirt: <Shirt className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Layers: <Layers className="w-6 h-6" />,
};