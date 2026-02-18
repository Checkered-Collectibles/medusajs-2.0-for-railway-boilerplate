// --- Helper Type for Notes ---
// Explicitly add medusa_customer_id so TypeScript auto-completes it
export interface RazorpayNotes {
    medusa_customer_id?: string;
    [key: string]: any;
}

// --- Base Entities ---

export interface RazorpayEntityBase {
    id: string;
    entity: string;
    created_at: number;
}

export interface RazorpaySubscriptionEntity extends RazorpayEntityBase {
    entity: "subscription";
    plan_id: string;
    customer_id: string;
    status: "authenticated" | "active" | "completed" | "pending" | "halted" | "paused" | "cancelled" | "expired";
    current_start: number | null;
    current_end: number | null;
    ended_at: number | null;
    quantity: number;

    // Update 1: Apply the helper type here
    notes: RazorpayNotes;

    charge_at: number | null;
    start_at: number | null;
    end_at: number | null;
    auth_attempts: number;
    total_count: number;
    paid_count: number;
    customer_notify: boolean;
    expire_by: number | null;
    short_url: string | null;
    has_scheduled_changes: boolean;
    change_scheduled_at: number | null;
    source: string;
    offer_id?: string;
    remaining_count: number;
    payment_method?: string;
    pause_initiated_by?: string | null;
    cancel_initiated_by?: string | null;
    type?: number;
}

export interface RazorpayPaymentEntity extends RazorpayEntityBase {
    entity: "payment";
    amount: number;
    currency: string;
    status: "captured" | "authorized" | "failed" | "refunded";
    order_id: string | null;
    invoice_id: string | null;
    international: boolean;
    method: string;
    amount_refunded: number;
    amount_transferred: number;
    refund_status: string | null;
    captured: boolean | string;
    description: string | null;
    card_id: string | null;
    card?: {
        id: string;
        entity: "card";
        name: string;
        last4: string;
        network: string;
        type: string;
        issuer: string | null;
        international: boolean;
        emi: boolean;
        expiry_month: number;
        expiry_year: number;
    };
    bank?: string | null;
    wallet?: string | null;
    vpa?: string | null;
    email: string;
    contact: string;
    customer_id: string;
    token_id: string | null;

    // Update 2: Apply the helper type here too
    notes: RazorpayNotes;

    fee: number;
    tax: number;
    error_code: string | null;
    error_description: string | null;
}

// --- Payloads (No changes needed below, just context) ---

interface SubscriptionPayload {
    subscription: {
        entity: RazorpaySubscriptionEntity;
    };
}

interface PaymentPayload {
    payment: {
        entity: RazorpayPaymentEntity;
    };
}

interface SubscriptionPaymentPayload {
    subscription: {
        entity: RazorpaySubscriptionEntity;
    };
    payment: {
        entity: RazorpayPaymentEntity;
    };
}

// --- Events ---

interface BaseEvent {
    entity: "event";
    account_id: string;
    created_at: number;
    contains: string[];
}

export interface SubscriptionAuthenticatedEvent extends BaseEvent {
    event: "subscription.authenticated";
    payload: SubscriptionPayload;
}

export interface SubscriptionChargedEvent extends BaseEvent {
    event: "subscription.charged";
    payload: SubscriptionPaymentPayload;
}

export interface SubscriptionCompletedEvent extends BaseEvent {
    event: "subscription.completed";
    payload: SubscriptionPaymentPayload;
}

export interface SubscriptionUpdatedEvent extends BaseEvent {
    event: "subscription.updated";
    payload: SubscriptionPayload;
}

export interface SubscriptionPendingEvent extends BaseEvent {
    event: "subscription.pending";
    payload: SubscriptionPayload;
}

export interface SubscriptionHaltedEvent extends BaseEvent {
    event: "subscription.halted";
    payload: SubscriptionPayload;
}

export interface SubscriptionPausedEvent extends BaseEvent {
    event: "subscription.paused";
    payload: SubscriptionPayload;
}

export interface SubscriptionResumedEvent extends BaseEvent {
    event: "subscription.resumed";
    payload: SubscriptionPayload;
}

export interface SubscriptionCancelledEvent extends BaseEvent {
    event: "subscription.cancelled";
    payload: SubscriptionPayload;
}

export type RazorpayWebhookEvent =
    | SubscriptionAuthenticatedEvent
    | SubscriptionChargedEvent
    | SubscriptionCompletedEvent
    | SubscriptionUpdatedEvent
    | SubscriptionPendingEvent
    | SubscriptionHaltedEvent
    | SubscriptionPausedEvent
    | SubscriptionResumedEvent
    | SubscriptionCancelledEvent;