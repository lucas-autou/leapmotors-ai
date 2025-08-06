export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  image: string;
  price: string;
  autonomy: string;
  power: string;
  acceleration: string;
  battery: string;
  features: string[];
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  description: string;
}