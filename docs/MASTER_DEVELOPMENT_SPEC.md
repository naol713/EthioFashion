# Fashion E-Commerce Platform — Master Development Specification

**Version:** 1.0  
**Date:** 2026-08-22  
**Project Type:** Portfolio-grade single-vendor fashion e-commerce application  
**Market:** Ethiopia  
**Products:** Clothing and Shoes  
**Delivery:** Local delivery  
**Payment:** Internal/test implementation for Telebirr, Chapa, CBE Bank, and Bank of Abyssinia; architecture must be ready for future real gateway integrations.

---

# 1. MASTER OBJECTIVE

Build a polished, fully functional, portfolio-grade e-commerce platform for a single clothing and shoe store in Ethiopia.

This is NOT a static website, UI mockup, CRUD demo, or fake dashboard.

The application must have:
- Real database-backed products
- Real product variants
- Real inventory
- Real authentication
- Real authorization
- Real cart
- Real wishlist
- Real checkout
- Real orders
- Real payment records/workflow
- Real customer accounts
- Real admin operations
- Real reviews
- Real coupons
- Real audit logging
- Real validation
- Real error handling
- Responsive storefront
- Responsive admin dashboard
- Production-appropriate architecture
- Deployment-ready code structure

---

# 2. NON-NEGOTIABLE TECHNOLOGY STACK

## Frontend
- HTML/CSS fundamentals
- TypeScript
- React 19
- Next.js 16 (App Router)
- Tailwind CSS v4
- shadcn/ui
- React Hook Form
- Zod

## Backend
- Next.js Server Actions
- Next.js Route Handlers
- TypeScript
- Supabase Auth
- @supabase/ssr
- Supabase PostgreSQL
- PostgreSQL Row Level Security (RLS)
- Prisma ORM

## Prisma Responsibility
Prisma is restricted to trusted server-side operations such as:
- Complex transactions
- Inventory operations
- Order processing
- Admin/batch operations
- Complex joins/reporting
- Trusted maintenance operations

## Supporting Infrastructure
- PostgreSQL audit logging / audit_log table
- React Email + Resend
- Upstash Rate Limiting
- Sentry
- Vercel-compatible deployment

---

# 3. USER ROLES & SYSTEM ARCHITECTURE

## Roles
- **CUSTOMER**: Browse, search, filter, cart, wishlist, checkout, address management, order history/tracking, review products.
- **ADMIN**: Product/variant management, category & brand management, inventory tracking, order management & status updates, customer management, payment records, coupon management, reviews approval, audit log viewing, store settings.

---

# 4. IMPLEMENTATION PHASES & ROADMAP

- **Phase 1 — Foundation** (✅ COMPLETE)
  - Next.js + TS + Tailwind v4 + shadcn/ui setup
  - Core dependencies installed (`@supabase/ssr`, `@prisma/client`, `zod`, `react-hook-form`, `lucide-react`)
  - Complete Prisma schema (`prisma/schema.prisma`) with 18 models & 13 enums
  - Supabase client/server helpers & Auth utilities (`src/lib/auth/index.ts`)
  - Env validation (`src/lib/utils/env.ts`) & site config (`src/config/site.ts`)
  - Dev server running on `http://localhost:3000`

- **Phase 2 — Catalog Layer**
  - Database seed script & seed data for Ethiopian fashion store
  - Server actions & queries for Categories, Brands, Products, Variants, Inventory

- **Phase 3 — Storefront Experience**
  - Homepage with Hero section & featured collections
  - Shop catalog (`/products`) with filtering (category, gender, size, color, price) & sorting
  - Product detail page (`/products/[slug]`) with image gallery & variant selection

- **Phase 4 — Customer Shopping & Account**
  - Cart state management & cart server actions
  - Wishlist management
  - Address book management (`/account/addresses`)
  - Customer profile & authentication pages (`/login`, `/register`, `/forgot-password`)

- **Phase 5 — Checkout & Commerce Operations**
  - Checkout workflow (`/checkout`) with authoritative server price calculation & inventory locks
  - Internal Payment Service layer (Telebirr, Chapa, CBE, Abay Bank test providers)
  - Order creation, snapshots, and order history (`/account/orders`)

- **Phase 6 — Admin Dashboard**
  - Admin layout & sidebar (`/admin`)
  - Products & variants management
  - Inventory stock control & audit log viewer
  - Order management & state transitions
  - Customers, Coupons, Reviews approval

- **Phase 7 — Supporting Infrastructure**
  - React Email + Resend email notifications
  - Upstash rate limiting on auth & checkout endpoints
  - Error boundaries & Sentry tracking

- **Phase 8 & 9 — Quality, Security Audit & Polish**
  - RLS policies & authorization boundary audit
  - Full end-to-end user journey verification
  - Mobile responsiveness & performance tuning
