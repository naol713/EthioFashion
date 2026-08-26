import type { PaymentMethod } from '@/types';

export interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerPhone?: string;
}

export interface PaymentInitialization {
  provider: PaymentMethod;
  reference: string;
  status: 'PENDING';
  checkoutUrl?: string;
}

export interface PaymentProvider {
  readonly method: PaymentMethod;
  initialize(request: PaymentRequest): Promise<PaymentInitialization>;
  verify(reference: string): Promise<{ status: 'PENDING' | 'PAID' | 'FAILED'; reference: string }>;
  cancel(reference: string): Promise<{ status: 'CANCELLED'; reference: string }>;
}

abstract class InternalProvider implements PaymentProvider {
  abstract readonly method: PaymentMethod;

  async initialize(request: PaymentRequest): Promise<PaymentInitialization> {
    return {
      provider: this.method,
      reference: `${this.method.toLowerCase()}_${request.orderNumber}_${crypto.randomUUID()}`,
      status: 'PENDING',
    };
  }

  async verify(reference: string) {
    return { status: 'PENDING' as const, reference };
  }

  async cancel(reference: string) {
    return { status: 'CANCELLED' as const, reference };
  }
}

export class TelebirrProvider extends InternalProvider {
  readonly method = 'TELEBIRR' as const;
}

export class ChapaProvider extends InternalProvider {
  readonly method = 'CHAPA' as const;
}

export class CbeBankProvider extends InternalProvider {
  readonly method = 'CBE_BANK' as const;
}

export class AbayBankProvider extends InternalProvider {
  readonly method = 'ABAY_BANK' as const;
}

const providers: Record<PaymentMethod, PaymentProvider> = {
  TELEBIRR: new TelebirrProvider(),
  CHAPA: new ChapaProvider(),
  CBE_BANK: new CbeBankProvider(),
  ABAY_BANK: new AbayBankProvider(),
};

export function getPaymentProvider(method: PaymentMethod) {
  return providers[method];
}