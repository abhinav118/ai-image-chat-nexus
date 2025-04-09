export interface CreativeItem {
  id: string;
  imageUrl: string;
  title: string;
  prompt: string;
  tags: string[];
  isFavorite: boolean;
  category: string;
}

const BASE_URL = "https://images.unsplash.com/";

export const mockCreatives: CreativeItem[] = [
  {
    id: "1",
    imageUrl: `${BASE_URL}photo-1488590528505-98d2b5aba04b`,
    title: "Tech Product Launch",
    prompt: "Sleek tech device emerging from darkness, surrounded by digital particles. Minimalist design with neon blue accents. Perfect for capturing attention of tech enthusiasts.",
    tags: ["tech", "product", "minimal"],
    category: "Technology",
    isFavorite: false
  },
  {
    id: "2",
    imageUrl: `${BASE_URL}photo-1461749280684-dccba630e2f6`,
    title: "Coding Platform Promo",
    prompt: "Programmer hands typing code on dark screen, glowing syntax highlighting. Modern workspace with subtle tech elements and warm ambient lighting. Conveys innovation and expertise.",
    tags: ["coding", "technology", "software"],
    category: "Technology",
    isFavorite: true
  },
  {
    id: "3",
    imageUrl: `${BASE_URL}photo-1486312338219-ce68d2c6f44d`,
    title: "Productivity App Banner",
    prompt: "Professional workspace with laptop, coffee, and productivity tools. Soft natural lighting with app interface visible on screen. Clean, organized aesthetic that appeals to professionals.",
    tags: ["productivity", "app", "work"],
    category: "Software",
    isFavorite: false
  },
  {
    id: "4",
    imageUrl: `${BASE_URL}photo-1581091226825-a6a2a5aee158`,
    title: "WFH Solution Ad",
    prompt: "Comfortable home office setup with ergonomic chair, desk, and tech accessories. Warm lighting, plants, and personal touches. Balances productivity with home comfort.",
    tags: ["remote", "work", "wfh"],
    category: "Lifestyle",
    isFavorite: false
  },
  {
    id: "5",
    imageUrl: `${BASE_URL}photo-1531297484001-80022131f5a1`,
    title: "Data Analytics Platform",
    prompt: "Abstract visualization of data points and connections on dark background. Futuristic glowing graphs and charts showing upward trends. Conveys power of data insights.",
    tags: ["data", "analytics", "business"],
    category: "Business",
    isFavorite: true
  },
  {
    id: "6",
    imageUrl: `${BASE_URL}photo-1498050108023-c5249f4df085`,
    title: "Developer Tools Promo",
    prompt: "Close-up of developer workspace with multiple screens of code. Dark theme editor with vibrant syntax highlighting. Coffee cup and minimal desk accessories suggest productivity.",
    tags: ["developer", "tools", "coding"],
    category: "Technology",
    isFavorite: false
  },
  {
    id: "7",
    imageUrl: `${BASE_URL}photo-1488590528505-98d2b5aba04b?w=800`,
    title: "Tech Startup Banner",
    prompt: "Modern open-concept startup office with team collaborating. Mix of digital displays and whiteboard planning. Energy and innovation visible in the workspace design.",
    tags: ["startup", "technology", "innovation"],
    category: "Business",
    isFavorite: false
  },
  {
    id: "8",
    imageUrl: `${BASE_URL}photo-1461749280684-dccba630e2f6?w=800`,
    title: "Digital Transformation",
    prompt: "Visual metaphor showing transition from analog to digital. Paper documents transforming into digital data. Dynamic motion blur with glowing digital elements.",
    tags: ["digital", "transformation", "business"],
    category: "Business",
    isFavorite: false
  },
  {
    id: "9",
    imageUrl: `${BASE_URL}photo-1486312338219-ce68d2c6f44d?w=800`,
    title: "Mobile App Promotion",
    prompt: "Close-up of smartphone displaying sleek app interface. User's hand interacting with vibrant UI elements. Background suggests urban lifestyle context.",
    tags: ["mobile", "app", "digital"],
    category: "Software",
    isFavorite: true
  },
  {
    id: "10",
    imageUrl: `${BASE_URL}photo-1581091226825-a6a2a5aee158?w=800`,
    title: "Creative Workspace Solution",
    prompt: "Artistic workspace with digital tablet, color swatches, and creative tools. Natural lighting highlighting ergonomic design features. Appeals to creative professionals.",
    tags: ["workspace", "creative", "productivity"],
    category: "Lifestyle",
    isFavorite: false
  },
  {
    id: "11",
    imageUrl: `${BASE_URL}photo-1531297484001-80022131f5a1?w=800`,
    title: "AI Platform Launch",
    prompt: "Futuristic visualization of AI neural network. Abstract connections forming recognizable patterns. Dark background with glowing blue and purple nodes suggesting intelligence.",
    tags: ["ai", "machine learning", "platform"],
    category: "Technology",
    isFavorite: false
  },
  {
    id: "12",
    imageUrl: `${BASE_URL}photo-1498050108023-c5249f4df085?w=800`,
    title: "Developer Community",
    prompt: "Diverse group of developers collaborating at shared workspace. Multiple screens showing code and projects. Community atmosphere with coffee and snacks, suggesting collaboration.",
    tags: ["community", "developer", "coding"],
    category: "Technology",
    isFavorite: false
  }
];

export const templateCategories = [
  "E-commerce Promotions",
  "Product Launches",
  "Brand Awareness",
  "Lead Generation",
  "Event Promotion",
  "Content Marketing",
  "App Installs",
  "Conversion Optimization"
];

export const mockTemplates = [
  {
    id: "t1",
    title: "Product Showcase",
    description: "Highlight your product features with this clean, professional template.",
    category: "Product Launches",
    imageUrl: `${BASE_URL}photo-1488590528505-98d2b5aba04b?w=600`
  },
  {
    id: "t2",
    title: "Limited Time Offer",
    description: "Create urgency with this promotional template perfect for sales and discounts.",
    category: "E-commerce Promotions",
    imageUrl: `${BASE_URL}photo-1461749280684-dccba630e2f6?w=600`
  },
  {
    id: "t3",
    title: "App Download",
    description: "Drive app installs with this eye-catching mobile app promotion template.",
    category: "App Installs",
    imageUrl: `${BASE_URL}photo-1486312338219-ce68d2c6f44d?w=600`
  },
  {
    id: "t4",
    title: "Event Announcement",
    description: "Promote your upcoming events with this engaging template.",
    category: "Event Promotion",
    imageUrl: `${BASE_URL}photo-1581091226825-a6a2a5aee158?w=600`
  },
  {
    id: "t5",
    title: "Lead Magnet",
    description: "Capture leads with this conversion-focused template.",
    category: "Lead Generation",
    imageUrl: `${BASE_URL}photo-1531297484001-80022131f5a1?w=600`
  },
  {
    id: "t6",
    title: "Brand Story",
    description: "Tell your brand story with this narrative-focused template.",
    category: "Brand Awareness",
    imageUrl: `${BASE_URL}photo-1498050108023-c5249f4df085?w=600`
  }
];
