// medusa-config.js
import fs from "node:fs";
import path from "node:path";

import { loadEnv, Modules, defineConfig } from "@medusajs/utils";

loadEnv(process.env.NODE_ENV || "production", process.cwd());

/**
 * Helpers
 */
const bool = (v) => v === "true" || v === "1" || v === "yes";

/**
 * Core envs
 */
const ADMIN_CORS = process.env.ADMIN_CORS;
const AUTH_CORS = process.env.AUTH_CORS;
const STORE_CORS = process.env.STORE_CORS;

const BACKEND_URL =
  process.env.BACKEND_PUBLIC_URL ||
  process.env.BACKEND_URL ||
  process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ||
  "http://localhost:9000";

const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_URL = process.env.REDIS_URL;

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const COOKIE_SECRET = process.env.COOKIE_SECRET || "supersecret";

const WORKER_MODE =
  process.env.MEDUSA_WORKER_MODE === "shared" ||
  process.env.MEDUSA_WORKER_MODE === "worker" ||
  process.env.MEDUSA_WORKER_MODE === "server"
    ? process.env.MEDUSA_WORKER_MODE
    : "shared";

const SHOULD_DISABLE_ADMIN = bool(process.env.MEDUSA_DISABLE_ADMIN);

/**
 * Providers envs
 */
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL =
  process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_FROM;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM;

const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
const MEILISEARCH_ADMIN_KEY =
  process.env.MEILISEARCH_ADMIN_KEY || process.env.MEILISEARCH_MASTER_KEY;

/**
 * PostHog (BACKEND) — IMPORTANT:
 * Use these env vars on DigitalOcean:
 * - POSTHOG_EVENTS_API_KEY
 * - POSTHOG_HOST
 */
const POSTHOG_EVENTS_API_KEY = process.env.POSTHOG_EVENTS_API_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST;

/**
 * Optional local module: loyalty
 * Fixes DO App Platform crash when the folder isn't present in the deployed filesystem.
 */
const loyaltyPath = path.join(process.cwd(), "src", "modules", "loyalty");
const hasLoyaltyModule =
  fs.existsSync(loyaltyPath) ||
  fs.existsSync(`${loyaltyPath}.js`) ||
  fs.existsSync(`${loyaltyPath}.ts`) ||
  fs.existsSync(path.join(loyaltyPath, "index.js")) ||
  fs.existsSync(path.join(loyaltyPath, "index.ts"));

/**
 * Build modules array safely
 */
const modules = [
  ...(hasLoyaltyModule ? [{ resolve: "./modules/loyalty" }] : []),

  /**
   * Analytics (PostHog)
   */
  ...(POSTHOG_EVENTS_API_KEY
    ? [
        {
          resolve: "@medusajs/medusa/analytics",
          options: {
            providers: [
              {
                resolve: "@medusajs/analytics-posthog",
                id: "posthog",
                options: {
                  posthogEventsKey: POSTHOG_EVENTS_API_KEY,
                  posthogHost: POSTHOG_HOST, // optional
                },
              },
            ],
          },
        },
      ]
    : []),

  /**
   * Payments (Razorpay)
   */
  {
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "@devx-commerce/razorpay/providers/payment-razorpay",
          id: "razorpay",
          options: {
            key_id: process.env.RAZORPAY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
            razorpay_account: process.env.RAZORPAY_ACCOUNT,
            automatic_expiry_period: 30,
            manual_expiry_period: 20,
            refund_speed: "normal",
            webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
            auto_capture: true,
          },
        },
      ],
    },
  },

  /**
   * File storage — DigitalOcean Spaces (medusa-file-spaces)
   */
  {
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/file-s3",
          id: "s3",
          options: {
            file_url: process.env.SPACE_URL,
            access_key_id: process.env.SPACE_ACCESS_KEY_ID,
            secret_access_key: process.env.SPACE_SECRET_ACCESS_KEY,
            region: process.env.SPACE_REGION,
            bucket: process.env.SPACE_BUCKET,
            endpoint: process.env.SPACE_ENDPOINT,
            // basic_auth: false // sometimes required for specific S3 providers, usually safe to omit for DO
          },
        },
      ],
    },
  },

  /**
   * Redis-backed services (Event bus + workflow engine)
   */
  ...(REDIS_URL
    ? [
        {
          key: Modules.EVENT_BUS,
          resolve: "@medusajs/event-bus-redis",
          options: {
            redisUrl: REDIS_URL,
          },
        },
        {
          key: Modules.WORKFLOW_ENGINE,
          resolve: "@medusajs/workflow-engine-redis",
          options: {
            redis: {
              url: REDIS_URL,
            },
          },
        },
      ]
    : []),

  /**
   * Notifications (SendGrid / Resend)
   */
  ...((SENDGRID_API_KEY && SENDGRID_FROM_EMAIL) ||
  (RESEND_API_KEY && RESEND_FROM_EMAIL)
    ? [
        {
          key: Modules.NOTIFICATION,
          resolve: "@medusajs/notification",
          options: {
            providers: [
              ...(SENDGRID_API_KEY && SENDGRID_FROM_EMAIL
                ? [
                    {
                      resolve: "@medusajs/notification-sendgrid",
                      id: "sendgrid",
                      options: {
                        channels: ["email"],
                        api_key: SENDGRID_API_KEY,
                        from: SENDGRID_FROM_EMAIL,
                      },
                    },
                  ]
                : []),

              ...(RESEND_API_KEY && RESEND_FROM_EMAIL
                ? [
                    {
                      resolve: "./src/modules/email-notifications",
                      id: "resend",
                      options: {
                        channels: ["email"],
                        api_key: RESEND_API_KEY,
                        from: RESEND_FROM_EMAIL,
                      },
                    },
                  ]
                : []),
            ],
          },
        },
      ]
    : []),

  /**
   * Stripe (optional)
   */
  ...(STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET
    ? [
        {
          key: Modules.PAYMENT,
          resolve: "@medusajs/payment",
          options: {
            providers: [
              {
                resolve: "@medusajs/payment-stripe",
                id: "stripe",
                options: {
                  apiKey: STRIPE_API_KEY,
                  webhookSecret: STRIPE_WEBHOOK_SECRET,
                },
              },
            ],
          },
        },
      ]
    : []),
];

/**
 * Plugins
 */
const plugins = [
  ...(MEILISEARCH_HOST && MEILISEARCH_ADMIN_KEY
    ? [
        {
          resolve: "@rokmohar/medusa-plugin-meilisearch",
          options: {
            config: {
              host: MEILISEARCH_HOST,
              apiKey: MEILISEARCH_ADMIN_KEY,
            },
            settings: {
              products: {
                type: "products",
                enabled: true,
                fields: [
                  "id",
                  "title",
                  "description",
                  "handle",
                  "categories.*",
                  "tags.*",
                  "variant_sku",
                  "thumbnail",
                ],
                indexSettings: {
                  searchableAttributes: [
                    "title",
                    "description",
                    "variant_sku",
                    "category_names",
                    "tag_values",
                  ],
                  displayedAttributes: [
                    "id",
                    "handle",
                    "title",
                    "description",
                    "variant_sku",
                    "thumbnail",
                    "collection_id",
                    "category_ids",
                    "category_names",
                    "tag_ids",
                    "tag_values",
                  ],
                  filterableAttributes: [
                    "id",
                    "handle",
                    "collection_id",
                    "category_ids",
                    "tag_ids",
                    "status",
                  ],
                },
                primaryKey: "id",
              },
            },
          },
        },
      ]
    : []),
];

/**
 * Export config
 */
export default defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseLogging: false,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    http: {
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      storeCors: STORE_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
      middleware: {
        payload: {
          limit: "50mb",
        },
      },
    },

    /**
     * If you use DO Managed Postgres and hit SSL issues, uncomment:
     * databaseDriverOptions: {
     *   connection: {
     *     ssl: { rejectUnauthorized: false },
     *   },
     *   pool: { min: 0, max: 15, idleTimeoutMillis: 30000, acquireTimeoutMillis: 60000 },
     * },
     */
  },

  admin: {
    backendUrl: BACKEND_URL,
    disable: SHOULD_DISABLE_ADMIN,
  },

  modules,
  plugins,
});
