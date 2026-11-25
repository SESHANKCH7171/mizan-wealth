# MIZAN (ميزان) — Personal Barakah, Zakaat & Wealth OS
> **Build Target:** Ubuntu Antigravity → GitHub → Vercel → Mobile PWA (Home Screen App)
> **Backend & Sync:** Supabase Auth + PostgreSQL (`mizan_state` JSONB store with Row Level Security)
> **Currency Standard:** Indian Rupee (INR `₹`) using the Indian Numbering System (`1,00,00,000` / Lakhs & Crores).

---

## 1. Project Vision & Core Purpose
Build a single, unified, Islamically-inspired personal finance and charity web application called **Mizan** (*The Balance*). It combines spiritual giving goals with complete personal wealth tracking in one peaceful, high-contrast, dignified interface that syncs in real time across PC and Mobile.

### The 4 Pillars of the App
1. **1 Crore Zakaat Mission:** A dedicated, high-visibility lifetime/multi-year tracker toward giving **₹1,00,00,000 (1 Cr)** in Zakaat, with milestones, recipient/cause logs, and a 2.5% Zakaat calculator.
2. **Grandfather Support Ledger (*Silat al-Rahim*):** A dedicated, respectful tracker for every amount given to your grandfather, with running totals, dates, purposes, notes, and quick-log actions.
3. **Unified Wealth Command Center:** Complete tracking of **Earnings**, **Savings**, **Investments**, and **Portfolio** (Net Worth, asset allocation, cashflow, Halal verification, and Zakaat eligibility) in one place.
4. **Modular Rule & Bucket Engine (Future-Proof Extensibility):** A dynamic system allowing the user to add custom financial rules (e.g., *"Automatically allocate 10% of every new Earning to the 1 Cr Zakaat Fund"*) and create new custom goals/buckets directly from the UI at any time without modifying code.

---

## 2. Visual Identity & Islamic Aesthetic Specification
The UI must feel like a serene, luxurious, modern Islamic manuscript meets a precision fintech dashboard. **Avoid generic corporate blue or cluttered SaaS templates.**

### Color Palette (Dark-First, High-Contrast Emerald & Gold)
- **Primary Canvas (Midnight Obsidian):** `#060D0B`
- **Elevated Card Surface (Deep Mosque Emerald):** `#0B1A16`
- **Interactive Hover / Secondary Surface:** `#112620`
- **Primary Accent (Burnished Islamic Gold):** `#D4AF37` (Hover: `#E5C158`)
- **Secondary Accent (Emerald Glow):** `#10B981` (for positive growth & completed milestones)
- **Warm Accent (Amber/Saffron):** `#F59E0B` (for pending allocations or reminders)
- **Text Primary (Warm Alabaster):** `#F4F1EA`
- **Text Secondary (Muted Sage):** `#94A8A0`
- **Borders:** `1px solid rgba(212, 175, 55, 0.18)` (subtle gold hairline borders on cards)

### Typography (Google Fonts)
- **Display / Headings / Arabic Accents:** `Cinzel` and `Amiri` (architectural Islamic elegance)
- **Body / UI:** `Plus Jakarta Sans` (clean, modern, highly legible)
- **Financial Numbers / Figures:** `JetBrains Mono` with `tabular-nums` (ensures every ₹ figure aligns cleanly)

### Subtle Islamic Geometric Details
- **Background Texture:** An ultra-subtle (`opacity: 0.04`) repeating SVG 8-point Islamic star (*Rub el Hizb*) geometric lattice pattern fixed to the canvas background.
- **Card Accents:** Delicate gold corner filigree or thin top-border gold gradient (`linear-gradient(90deg, transparent, #D4AF37, transparent)`) on hero cards.
- **Greeting Header:** Dynamic header showing *"Bismillah"* / *"Assalamu Alaikum"* alongside both the **Gregorian Date** and the **Hijri (Islamic) Date** (calculated natively via `Intl.DateTimeFormat('en-TN-u-ca-islamic', ...)` — zero external API needed).

---

## 3. Tech Stack & Architecture
- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS + custom CSS variables for the Midnight Obsidian / Emerald / Gold theme
- **Icons:** `lucide-react`
- **Charts & Visualizations:** `recharts` (responsive Donut Chart for portfolio allocation, Area Chart for Net Worth & Zakaat trajectory)
- **Database & Auth:** `@supabase/supabase-js`
- **Formatting Utility (`src/lib/formatINR.ts`):**
  - Strictly format all numbers in Indian format (`₹1,00,00,000` instead of `₹10,000,000`).
  - Support compact display helper (`₹12.50 L`, `₹1.00 Cr`).

---

## 4. Private Cloud Sync (Supabase Auth + Database) & Mobile PWA

### Environment Variables (`.env.local` & Vercel)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Existing Supabase Table Schema (`mizan_state`)
The Supabase project already has the `mizan_state` table with Row Level Security enabled:
```sql
-- Reference only (already created in Supabase):
-- table: public.mizan_state (user_id uuid primary key, data jsonb, updated_at timestamptz)