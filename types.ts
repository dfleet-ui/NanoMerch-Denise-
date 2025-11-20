
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  scenarioType: 'preset' | 'custom';
}

export interface ScenarioOption {
  label: string;
  value: string;
  hex: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  iconName: string; // Mapping to Lucide icons
  promptTemplate: string;
  options?: {
    colors?: ScenarioOption[];
  };
  defaultSpecs?: {
    price: string;
    features: string[];
  };
}

export interface StoryboardItem {
  id: string;
  image: GeneratedImage;
  title: string;
  description: string; // Detailed text
  features: string; // Newline separated string for easy editing
  price: string;
}

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

declare global {
  interface Window {
    html2pdf: any;
  }
}
