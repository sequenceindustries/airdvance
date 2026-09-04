// Core domain types shared across the app, matching the Supabase schema.

export type DeviceCategory = "SMARTPHONE" | "TABLET" | "LAPTOP";

export type ProductStatus = "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: DeviceCategory;
  description: string;
  specifications: Record<string, string>;
  cash_price: number;
  images: string[];
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface RentalPlan {
  id: string;
  product_id: string;
  term_months: number;
  monthly_payment: number;
  deposit: number;
  total_payable: number;
  admin_fee: number;
  buyout_amount: number;
  status: "ACTIVE" | "INACTIVE";
}

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "MORE_INFORMATION_REQUIRED"
  | "APPROVED"
  | "DECLINED"
  | "CANCELLED";

export interface Application {
  id: string;
  customer_id: string;
  product_id: string;
  rental_plan_id: string;
  status: ApplicationStatus;
  personal_info: {
    full_name: string;
    id_number: string;
    date_of_birth: string;
    mobile: string;
    email: string;
  };
  address: {
    residential: string;
    postal?: string;
  };
  employment: {
    status: string;
    employer?: string;
    monthly_income: number;
    notes?: string;
  };
  documents: { name: string; path: string; uploaded_at: string }[];
  consent_accepted: boolean;
  debit_order_mandate_id?: string | null;
  first_debit_status?: string | null;
  internal_notes: { author: string; note: string; created_at: string }[];
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  decided_at?: string;
}

export type AgreementStatus =
  | "PENDING"
  | "ACTIVE"
  | "PAUSED"
  | "DEFAULTED"
  | "COMPLETED"
  | "CANCELLED";

export type OwnershipStatus = "NOT_OWNED" | "OWNERSHIP_PENDING" | "OWNED";

export interface Agreement {
  id: string;
  agreement_number: string;
  customer_id: string;
  product_id: string;
  device_id: string;
  rental_plan_id: string;
  start_date: string;
  end_date: string;
  term_months: number;
  monthly_payment: number;
  deposit: number;
  admin_fee: number;
  buyout_amount: number;
  total_payable: number;
  payments_required: number;
  payments_completed: number;
  amount_paid: number;
  amount_remaining: number;
  status: AgreementStatus;
  ownership_status: OwnershipStatus;
  created_at: string;
  completed_at?: string;
}

export type PaymentStatus =
  | "SCHEDULED"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentType = "ADMIN_FEE" | "MONTHLY" | "BUYOUT";

export interface ScheduledPayment {
  id: string;
  agreement_id: string;
  customer_id: string;
  payment_number: number;
  amount: number;
  payment_type: PaymentType;
  due_date: string;
  status: PaymentStatus;
  paid_date?: string;
  payment_reference?: string;
  provider?: string;
}

export interface DebitOrderMandate {
  id: string;
  customer_id: string;
  application_id: string | null;
  bank_name: string;
  account_holder: string;
  account_number_last4: string;
  branch_code: string;
  account_type: string;
  authorized_at: string;
  created_at: string;
}

export type InventoryStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "ALLOCATED"
  | "ACTIVE"
  | "RETURNED"
  | "DAMAGED"
  | "LOST"
  | "OWNED";

export interface InventoryDevice {
  id: string;
  product_id: string;
  asset_number: string;
  serial_number: string | null;
  imei: string | null;
  condition: string;
  status: InventoryStatus;
  location: string | null;
  agreement_id: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export type DeviceControlStatus =
  | "NOT_REGISTERED"
  | "REGISTERED"
  | "ACTIVE"
  | "RESTRICTION_PENDING"
  | "RESTRICTED"
  | "RESTORE_PENDING"
  | "ERROR"
  | "RELEASED";

export interface DeviceControlRecord {
  id: string;
  device_id: string;
  provider: string;
  provider_device_id: string | null;
  status: DeviceControlStatus;
  last_command: string | null;
  last_command_at: string | null;
  last_response: string | null;
  restriction_reason: string | null;
  restricted_at: string | null;
  restored_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AuditAction =
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_APPROVED"
  | "APPLICATION_DECLINED"
  | "APPLICATION_MORE_INFO_REQUESTED"
  | "AGREEMENT_CREATED"
  | "PAYMENT_CREATED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "PAYMENT_OVERDUE"
  | "DEVICE_REGISTERED"
  | "DEVICE_ACTIVATED"
  | "DEVICE_RESTRICTED"
  | "DEVICE_RESTORED"
  | "DEVICE_RELEASED"
  | "AGREEMENT_COMPLETED"
  | "OWNERSHIP_GRANTED";

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: AuditAction;
  entity: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export type NotificationType =
  | "APPLICATION_RECEIVED"
  | "APPLICATION_APPROVED"
  | "APPLICATION_DECLINED"
  | "AGREEMENT_CREATED"
  | "PAYMENT_UPCOMING"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "PAYMENT_OVERDUE"
  | "DEVICE_RESTRICTED"
  | "DEVICE_RESTORED"
  | "OWNERSHIP_ACHIEVED";

export interface NotificationRecord {
  id: string;
  customer_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  mobile: string | null;
  role: "CUSTOMER" | "ADMIN";
  created_at: string;
}
