export type UserRole = 'vendor' | 'farmer';

export type User = {
  _id: string;
  email: string;
  role: UserRole;
  name: string;
  businessName: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  category: string;
  sellerId: string;
  sellerName: string;
  sellerType: UserRole;
  createdAt: string;
  updatedAt?: string;
  certificationType?: string;
  minimumOrder?: number;
  bulkDiscounts?: {
    quantity: number;
    price: number;
  }[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type OrderProduct = {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
}

export type Order = {
  _id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  products: OrderProduct[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  notes?: string;
}

export type Chat = {
  _id: string;
  participants: {
    userId: string;
    role: UserRole;
    name: string;
  }[];
  messages: {
    _id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type Notification = {
  _id: string;
  userId: string;
  type: 'order' | 'chat' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  referenceId?: string;
  referenceType?: 'order' | 'chat' | 'product';
}