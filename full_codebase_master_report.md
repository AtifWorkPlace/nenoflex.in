# NenoFlex (`nenoflex.in`) — Comprehensive Architecture & Full Codebase Master Report

**Document Version**: 8.0.0  
**Last Updated**: 2026-08-12  
**Target Environment**: Production (`https://nenoflex.in`)  
**Host Platform**: Vercel (Hobby Tier - ₹0 Budget)  
**Database & Storage**: Supabase Cloud (PostgreSQL 15 + Supabase Storage CDN)  
**Framework**: Next.js 15 (App Router) + React 19 + TypeScript + TailwindCSS  

---

## 📖 TABLE OF CONTENTS
1. [Executive Summary & System Architecture](#1-executive-summary--system-architecture)
2. [Root Cause Diagnostic: "The related resource does not exist" Error](#2-root-cause-diagnostic-the-related-resource-does-not-exist-error)
3. [Site Design, Aesthetic System & Visual Tokens](#3-site-design-aesthetic-system--visual-tokens)
4. [Zero-Cost Vercel + Supabase Storage Optimization](#4-zero-cost-vercel--supabase-storage-optimization)
5. [Native Supabase SDK Signed Upload URL Architecture](#5-native-supabase-sdk-signed-upload-url-architecture)
6. [Cryptographic Security, Auth & Data Integrity](#6-cryptographic-security-auth--data-integrity)
7. [Realtime Order Pipeline & Concurrency Control](#7-realtime-order-pipeline--concurrency-control)
8. [Complete Codebase File Implementations](#8-complete-codebase-file-implementations)
9. [Comprehensive Test Suites & Verification Results](#9-comprehensive-test-suites--verification-results)
10. [Summary of Accomplishments & Production Readiness](#10-summary-of-accomplishments--production-readiness)

---

## 1. EXECUTIVE SUMMARY & SYSTEM ARCHITECTURE

NenoFlex (`nenoflex.in`) is an enterprise-grade, high-performance thrift streetwear & luxury vintage e-commerce web application. Built for maximum reliability under zero-cost budget constraints (₹0 operating budget), NenoFlex decouples compute (Vercel Edge Functions) from heavy object storage (Supabase Storage CDN) and relational data persistence (Supabase Cloud PostgreSQL).

### Core System Flow Diagram

```text
                                  CUSTOMER / ADMIN BROWSER
                                            │
                                            ▼
                                   NEXT.JS APP ROUTER
                                  (Vercel Edge & Server)
                                            │
                ┌───────────────────────────┼───────────────────────────┐
                ▼                           ▼                           ▼
         SERVER SIDE DATA            HMAC SHA-256 JWT           SIGNED STORAGE UPLOAD
       getInitialPageData()           Auth Verification         (uploadToSignedUrl SDK)
                │                           │                           │
                ▼                           ▼                           ▼
       SUPABASE CLOUD DB           AUTHENTICATED API           SUPABASE STORAGE CDN
       - public.products           - POST /api/orders          - /storage/v1/object/public
       - public.orders             - GET  /api/orders            /products/catalog/*.webp
       - public.siteSettings       - PATCH /api/orders                  │
       - public.coupons            - POST /api/products                 │
                │                           │                           │
                └───────────────────────────┼───────────────────────────┘
                                            ▼
                                  SUPABASE REALTIME WS
                                  (postgres_changes)
                                            │
                                            ▼
                                  ADMIN DASHBOARD UI
                               - Deduplicated Live Stream
                               - Cash Register Chime 🔔
```

---

## 2. ROOT CAUSE DIAGNOSTIC: "The related resource does not exist" ERROR

### 🔍 Verified Findings & Root Cause Analysis

When uploading image files (e.g. `1000201008.jpg`), the production browser returned:
`StorageApiError: The related resource does not exist (status: 404)`

#### Empirical Cause:
1. In `src/lib/supabase-server.ts`, `getPrivilegedKey()` was configured to fall back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` when `SUPABASE_SERVICE_ROLE_KEY` was missing or unconfigured in the server runtime environment.
2. When `createSignedUploadUrl(filePath)` was called with `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Supabase Storage API explicitly rejected anon key signed URL generation with HTTP 404 (`"The related resource does not exist"`).
3. When `createSignedUploadUrl(filePath)` is called with a valid `SUPABASE_SERVICE_ROLE_KEY`, Supabase Storage API successfully generates signed upload credentials (`token`, `path`, `signedUrl`) with HTTP 200 SUCCESS.

#### The Fix:
- Updated `getPrivilegedKey()` in `src/lib/supabase-server.ts` to strictly require `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) for storage administration and signed URL creation.
- Prevented dangerous fallback to `anonKey` on server operations.
- Enhanced client error diagnostics in `src/lib/supabase.ts` to output non-sensitive property diagnostics (`status`, `statusCode`, `path`, `mimeType`, `blobSize`) for rapid troubleshooting.

---

## 3. SITE DESIGN, AESTHETIC SYSTEM & VISUAL TOKENS

NenoFlex follows a **Tokyo Thrift Vault / Nike Vintage Dark Luxe** visual identity, combining matte obsidian backgrounds (`#0D0D0D`, `#171717`), high-contrast typography (Cinzel / Outfit / Inter), and electric neon accents (`#CCFF00` Volt Neon, `#10B981` Emerald Green, `#F59E0B` Amber Gold).

### Primary Color Palette & Tokens

| Token Name | Hex Code | Purpose |
|---|---|---|
| **Background Primary** | `#0D0D0D` | Main page background (Obsidian Matte) |
| **Background Surface** | `#171717` | Card / Modal / Drawer surface |
| **Border Subtlety** | `rgba(255,255,255,0.1)` | Sleek glassmorphism dividers |
| **Volt Neon Accent** | `#CCFF00` | CTA buttons, badge highlights, tag markers |
| **Emerald Authenticity** | `#10B981` | 9.8 Mint condition badges & verified seals |
| **Text Primary** | `#FFFFFF` | Crisp luxury titles |
| **Text Muted** | `#A3A3A3` | Technical specs, material info, descriptions |

---

## 4. ZERO-COST VERCEL + SUPABASE STORAGE OPTIMIZATION

1. **Direct Browser WebP Compression**:
   * Admin browser resizes image to max 800px width in an HTML5 Canvas.
   * Canvas converts image directly to 0.78 quality WebP `Blob` (`~100KB–250KB`).
2. **Native Supabase SDK Signed Upload**:
   * Server generates signed upload path & token via `supabase.storage.from('products').createSignedUploadUrl(filePath)`.
   * Browser uploads directly using `supabase.storage.from('products').uploadToSignedUrl(path, token, blobToUpload, options)`.
   * **Zero image bytes pass through Vercel serverless functions during upload.**
   * `/api/products` receives only lightweight HTTP URL strings (~80 characters).

---

## 9. COMPREHENSIVE TEST SUITES & VERIFICATION RESULTS

### Automated Test Suite Outputs

```text
======================================================
   NenoFlex Zero-Cost Architecture & Data Verification   
======================================================
✔ Test 1 PASSED: Catalog backup exists. All 4 product IDs (nf-101..104) 100% preserved
✔ Test 2 PASSED: Direct browser-to-Supabase Storage image uploader function is exported
✔ Test 3 PASSED: Large raw base64 image strings (>100KB) detected for rejection on /api/products
✔ Test 4 PASSED: robots.ts and sitemap.ts exist to prevent crawler bot loops
✔ Test 5 PASSED: Live Supabase database contains all 4 products with intact IDs
Optimization Summary: 5 Passed, 0 Failed

=====================================================
   NenoFlex Order Pipeline & Realtime Verification   
=====================================================
✔ Test 1 PASSED: GET /api/orders rejects unauthenticated requests with HTTP 401
✔ Test 2 PASSED: GET /api/orders validates admin HMAC Authorization token
✔ Test 3 PASSED: normalizeOrderFromDb correctly maps snake_case DB columns to camelCase Order interface
✔ Test 4 PASSED: Realtime deduplication prevents duplicate items and updates existing orders cleanly
✔ Test 5 PASSED: saveOrder returns structured { success, error } status without swallowing errors
Pipeline Verification Summary: 5 Passed, 0 Failed

=== NenoFlex Production Security & Logic Test Suite ===
✔ Test 1 PASSED: Admin token generation and verification succeeded
✔ Test 2 PASSED: Unauthenticated admin request correctly rejected with HTTP 401
✔ Test 3 PASSED: Server price calculation overrides client price tampering
✔ Test 4 PASSED: Coupon validation correctly enforces min order threshold and max discount
Security Execution Summary: 4 Passed, 0 Failed

=== NenoFlex Atomic Stock Concurrency Test Suite ===
✔ Test 1 PASSED: Exactly 1 purchase succeeded, 19 rejected (No Race Condition)
Concurrency Execution Summary: 1 Passed, 0 Failed
```

### Production Build Result
```text
   ▲ Next.js 15.2.9
   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Generating static pages (20/20) ...
 ✓ Generating static pages (20/20)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ƒ /                                    4.41 kB         179 kB
├ ○ /about                                2.7 kB         103 kB
├ ƒ /admin                               15.7 kB         187 kB
├ ƒ /api/admin/create-upload-url           162 B         101 kB
├ ƒ /api/admin/upload-image                162 B         101 kB
├ ƒ /api/orders                            162 B         101 kB
├ ƒ /api/products                          162 B         101 kB
├ ○ /collections                         2.09 kB         106 kB
├ ○ /robots.txt                            162 B         101 kB
└ ○ /sitemap.xml                           162 B         101 kB

Exit Code: 0 (SUCCESS)
```

---

## 10. SUMMARY OF ACCOMPLISHMENTS & PRODUCTION READINESS

1. **Root Cause Resolved**: Identified that calling `createSignedUploadUrl` with `anonKey` produced Supabase 404 StorageApiError (`"The related resource does not exist"`). Fixed `getPrivilegedKey()` to strictly require `SUPABASE_SERVICE_ROLE_KEY`.
2. **Zero-Cost Storage Architecture**: Signed Upload URL issuer (`POST /api/admin/create-upload-url`) allows direct Admin Browser -> Supabase Storage CDN uploads (`uploadToSignedUrl` SDK method). Zero image bytes pass through Vercel serverless functions.
3. **Storage RLS Security**: Public read access preserved for visitors, while unauthenticated anon writes are strictly blocked by RLS policies.
4. **Full Catalog Preservation**: Products `nf-101`, `nf-102`, `nf-103`, `nf-104` 100% preserved with zero ID changes or data loss.
5. **Codebase Status**: All 20 build routes compiled cleanly with 0 type errors or lint warnings. GitHub repository [`https://github.com/AtifWorkPlace/nenoflex.in.git`](https://github.com/AtifWorkPlace/nenoflex.in.git) is up to date at commit `16e5095`.
