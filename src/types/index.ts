// Core database types (aligned with Prisma schema)

// User roles
export type UserRole = "CUSTOMER" | "ADMIN";

// Product status
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

// Size type
export type SizeType = "CLOTHING" | "SHOE";

// Inventory transaction types
export type InventoryTransactionType =
  | "INITIAL_STOCK"
  | "RESTOCK"
  | "SALE"
  | "RESERVATION"
  | "RELEASE"
  | "RETURN"
  | "DAMAGE"
  | "ADJUSTMENT"
  | "CANCELLATION";

// Cart status
export type CartStatus = "ACTIVE" | "CONVERTED" | "ABANDONED";

// Coupon discount types
export type CouponDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

// Review status
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

// Payment methods
export type PaymentMethod = "TELEBIRR" | "CHAPA" | "CBE_BANK" | "ABAY_BANK";

// Payment status
export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

// Order status
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

// Delivery status
export type DeliveryStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED";

// Notification types
export type NotificationType =
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "PAYMENT_SUCCESS"
  | "PROMOTION"
  | "SYSTEM";

// Gender
export type ProductGender = "MALE" | "FEMALE" | "UNISEX";

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ============================================
// Pagination
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// Cart Types
// ============================================

export interface CartItemInput {
  variantId: string;
  quantity: number;
}

export interface CartItemOutput {
  id: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    price: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: { url: string }[];
    };
    color?: { name: string; hex_code: string | null };
    size?: { name: string };
  };
}

// ============================================
// Checkout Types
// ============================================

export interface CheckoutAddress {
  label?: string;
  recipientName: string;
  phone: string;
  region: string;
  city: string;
  subCity?: string;
  woreda?: string;
  streetAddress: string;
  building?: string;
  additionalInfo?: string;
}

export interface CheckoutInput {
  addressId?: string;
  address?: CheckoutAddress;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  cartItems: CartItemInput[];
}

export interface CheckoutResult {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  paymentRequired: boolean;
  paymentIntent?: {
    clientSecret?: string;
    provider: PaymentMethod;
    reference: string;
  };
}

// ============================================
// Order Types
// ============================================

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  items: {
    id: string;
    productName: string;
    sku: string;
    sizeSnapshot?: string;
    colorSnapshot?: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[];
  shippingAddress: Record<string, unknown>;
  payment?: {
    method: PaymentMethod;
    status: PaymentStatus;
    reference: string;
  };
  deliveryStatusHistory?: {
    status: DeliveryStatus;
    timestamp: string;
    note?: string;
  }[];
}

// ============================================
// Product Types
// ============================================

export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  gender?: ProductGender;
  colorIds?: string[];
  sizeIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
}

export interface ProductSortOptions {
  field: "featured" | "createdAt" | "price";
  direction: "asc" | "desc";
}

// ============================================
// Admin Types
// ============================================

export interface AdminDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  recentOrders: OrderSummary[];
}

// ============================================
// Error Codes (aligned with specification)
// ============================================

export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  VARIANT_NOT_FOUND: "VARIANT_NOT_FOUND",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  INVALID_QUANTITY: "INVALID_QUANTITY",
  INVALID_COUPON: "INVALID_COUPON",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_NOT_FOUND: "PAYMENT_NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ============================================
// Session/User Types
// ============================================

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
  };
}

export interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}