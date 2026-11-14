export interface PaystackSetupConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: Record<string, string | number | boolean>; // <-- FIXED: Removed 'any'
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

export interface PaystackHandler {
  openIframe: () => void;
}

export interface PaystackPop {
  setup: (config: PaystackSetupConfig) => PaystackHandler;
}

declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}