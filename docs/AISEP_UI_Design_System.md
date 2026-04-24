
> **Purpose:** This document defines every visual rule, token, component pattern, and UX convention used in AISEP's frontend. Any AI assistant working on this codebase **must follow this guide exactly** to produce consistent, premium-quality UI.

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS (no CSS modules, no inline styles) |
| Icons | `lucide-react` only |
| External icons | `next/image` with `unoptimized` for SVG from `thesvg.org` |
| Toasts | `sonner` (`toast.success`, `toast.error`) |
| Utilities | `cn()` from `@/lib/utils` (clsx + tailwind-merge) |
| Language | Vietnamese UI strings. English variable/function names. |
<!--  -->
---

## 2. Color Tokens

### Brand
| Token | Value | Usage |
|---|---|---|
| Primary action (dark) | `#0f172a` | Primary buttons, key CTAs |
| Primary hover | `#1e293b` | Hover state of dark buttons |
| Brand accent (gold) | `#eec54e` | Links, highlights, focus rings |
| Focus ring | `ring-[#eec54e]/20 border-[#eec54e]` | All form input focus states |

### Backgrounds
| Token | Tailwind class | Usage |
|---|---|---|
| Page background | `bg-[#f8f8f8]` or `bg-slate-50` | Shell/page background |
| Card background | `bg-white` | All cards and panels |
| Subtle input/row | `bg-slate-50` | Table rows, input backgrounds, read-only areas |

### Status Color System
Every status has a consistent 4-token palette: `dot`, `badge bg`, `badge text`, `badge border`.

```
REQUESTED / Pending  → amber-400 dot  | bg-amber-50 text-amber-700 border-amber-200/80
ACCEPTED             → blue-400 dot   | bg-blue-50 text-blue-700 border-blue-200/80
SCHEDULED            → emerald-400 dot| bg-emerald-50 text-emerald-700 border-emerald-200/80
COMPLETED            → slate-400 dot  | bg-slate-50 text-slate-600 border-slate-200/80
REJECTED             → red-400 dot    | bg-red-50 text-red-600 border-red-200/80
CANCELLED            → gray-400 dot   | bg-gray-50 text-gray-500 border-gray-200/80
```

```tsx
// Implementation pattern
const STATUS_CFG: Record<Status, { dot: string; badge: string }> = {
  REQUESTED: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200/80" },
  ACCEPTED:  { dot: "bg-blue-400",  badge: "bg-blue-50 text-blue-700 border-blue-200/80" },
  SCHEDULED: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  COMPLETED: { dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 border-slate-200/80" },
  REJECTED:  { dot: "bg-red-400",   badge: "bg-red-50 text-red-600 border-red-200/80" },
  CANCELLED: { dot: "bg-gray-400",  badge: "bg-gray-50 text-gray-500 border-gray-200/80" },
};

// Render a status badge
<span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", cfg.badge)}>
  <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
  {STATUS_LABEL[status]}
</span>
```

### Slot Proposal Status
```
PROPOSED   → bg-blue-50 text-blue-600 border border-blue-200
ACCEPTED   → bg-emerald-50 text-emerald-600 border border-emerald-200
DECLINED   → bg-red-50 text-red-500 border border-red-200
SUPERSEDED → bg-gray-50 text-gray-500 border border-gray-200
```

---

## 3. Typography Scale

Use literal pixel sizes via Tailwind's bracket notation. **Never** use named sizes (`text-sm`, `text-base`, etc.) unless it maps to a size in this table.

| Role | Class | Weight | Usage |
|---|---|---|---|
| Page title / Entity name | `text-[20px]` | `font-bold` | H1-level headings |
| Section title / Card heading | `text-[15px]` | `font-semibold` | Dialog titles |
| Card heading | `text-[13px]` | `font-semibold` | Card section headers |
| Body / Primary content | `text-[13px]` | `font-normal` | Main text, descriptions |
| Meta / Labels | `text-[12px]` | `font-medium` | Secondary info |
| Micro / Uppercase label | `text-[11px]` | `font-semibold` (normal case) or `uppercase tracking-wide font-normal` (for field labels) | Tags, badges, field labels |
| Tiny / Timestamps | `text-[10px]` | `font-semibold` | Status dots, small badges |

**Field label pattern** (inside cards, above field values):
```tsx
<p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Mục tiêu buổi tư vấn</p>
<p className="text-[13px] text-slate-700 leading-relaxed">{value}</p>
```

---

## 4. Spacing & Layout

### Page Layout
- Shell has a **sidebar + main content** layout.
- Content max-width: `max-w-[1100px] mx-auto` for standard pages.
- Shell breadcrumb + header area: `max-w-[1440px] mx-auto` (shell level).
- Vertical rhythm between cards: `space-y-5` or `space-y-6`.
- Page entry animation: `animate-in fade-in duration-400`.

### 2-Column Detail Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
  <div className="lg:col-span-2 space-y-5">{/* Left: main content */}</div>
  <div className="lg:col-span-1 space-y-5">{/* Right: sidebar (timeline, status) */}</div>
</div>
```

---

## 5. Card Component

The **single most important element**. Every panel, section, and data group lives inside a card.

```tsx
// Standard card
<div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
  <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
    <IconName className="w-4 h-4 text-slate-400" />
    Tiêu đề Card
  </h2>
  {/* content */}
</div>
```

**Rules:**
- `rounded-2xl` — always, never less.
- `border border-slate-200/80` — always, very subtle.
- `shadow-[0_1px_3px_rgba(0,0,0,0.04)]` — always, ultra-soft shadow.
- `px-6 py-5` — standard padding.
- Card header icon: `w-4 h-4 text-slate-400` lucide icon before title text.
- Cards **never** have colored backgrounds (except special state cards like amber urgent zones).

### Urgent / Alert Card Variant
Used for items requiring immediate action (e.g., pending requests zone):
```tsx
<div className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-4">
  {/* amber zone header */}
  <div className="flex items-center justify-between mb-3">
    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-700">
      <AlertCircle className="w-4 h-4" />
      {count} yêu cầu cần phản hồi
    </span>
    <span className="text-[12px] text-amber-600">Phản hồi sớm để tránh tự động huỷ</span>
  </div>
</div>
```

### Info/Confirmation Card Variant
For confirmed state display inside action areas:
```tsx
// Success (confirmed time)
<div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
  <p className="text-[11px] text-emerald-600 uppercase tracking-wide font-medium mb-1">Label</p>
  <p className="text-[13px] font-semibold text-emerald-700">{value}</p>
</div>

// Info (meeting link / instructions)
<div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
  <p className="text-[11px] text-blue-600 uppercase tracking-wide font-medium mb-1">Label</p>
  <p className="text-[12px] text-blue-500 italic">{value}</p>
</div>

// Warning (irreversible action)
<div className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
  <div className="flex items-center gap-2">
    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
    <p className="text-[12px] text-amber-700">{message}</p>
  </div>
</div>
```

---

## 6. Buttons

### Primary (Dark)
```tsx
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm">
  <Icon className="w-4 h-4" />
  Label
</button>
```

### Secondary (Outlined)
```tsx
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors">
  <Icon className="w-4 h-4" />
  Label
</button>
```

### Destructive (Red Outlined)
```tsx
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors">
  <XCircle className="w-4 h-4" />
  Huỷ / Từ chối
</button>
```

### Quick Action (Compact, inside list cards)
Used for inline accept/reject on list items — smaller than normal buttons:
```tsx
// Quick accept
<button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f172a] text-white text-[12px] font-semibold hover:bg-[#1e293b] transition-colors">
  <CheckCircle2 className="w-3.5 h-3.5" />
  Chấp nhận
</button>

// Quick view link (not a button)
<Link href={...} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-medium hover:bg-slate-50 transition-colors">
  Xem chi tiết
  <ArrowRight className="w-3 h-3" />
</Link>
```

### Slot-specific Confirm (Inside slot rows)
```tsx
// Select this slot (from startup's preferred slots, REQUESTED state)
<button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0f172a] text-white text-[11px] font-semibold hover:bg-[#1e293b] transition-colors">
  <Check className="w-3 h-3" />
  Chọn giờ này
</button>

// Confirm this slot (from advisor proposals, ACCEPTED state)
<button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors">
  <Check className="w-3 h-3" />
  Xác nhận giờ này
</button>
```

**Rules:**
- All buttons: `inline-flex items-center gap-{1|1.5}` — never a bare `<button>` without flex.
- Icon size inside buttons: `w-4 h-4` for full-size, `w-3.5 h-3.5` for compact, `w-3 h-3` for micro.
- `transition-colors` — always on interactive elements.
- `rounded-xl` for standard buttons, `rounded-lg` for compact/inline buttons.

---

## 7. Avatar Component

Deterministic gradient avatar from entity name, no image dependency:

```tsx
const AVATAR_COLORS = [
  "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Large (page header)
<div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm", avatarGradient)}>
  {name.charAt(0).toUpperCase()}
</div>

// Medium (list card)
<div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[15px] font-bold shrink-0", avatarGradient)}>
  {name.charAt(0).toUpperCase()}
</div>

// Small (compact list)
<div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-[12px] font-bold shrink-0", avatarGradient)}>
  {name.charAt(0).toUpperCase()}
</div>
```

---

## 8. Platform / Format Badge

Used to show Google Meet or Microsoft Teams inline. Always uses `next/image` for the SVG icon.

```tsx
// In consulting-format-badge.tsx
import Image from "next/image";

type ConsultingFormat = "GOOGLE_MEET" | "MICROSOFT_TEAMS";

const FORMAT_CFG: Record<ConsultingFormat, { label: string; shortLabel: string; icon: React.ReactNode; color: string; bg: string; border: string; }> = {
  GOOGLE_MEET: {
    label: "Google Meet", shortLabel: "Google Meet",
    icon: <Image src="https://thesvg.org/icons/google-meet/default.svg" alt="Google Meet" width={14} height={14} unoptimized />,
    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/80",
  },
  MICROSOFT_TEAMS: {
    label: "Microsoft Teams", shortLabel: "MS Teams",
    icon: <Image src="https://thesvg.org/icons/microsoft-teams/default.svg" alt="Microsoft Teams" width={14} height={14} unoptimized />,
    color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200/80",
  },
};

function FormatBadge({ format, size = "md" }: { format: ConsultingFormat; size?: "sm" | "md" }) {
  const cfg = FORMAT_CFG[format];
  const sz = size === "sm" ? "text-[10px]" : "text-[11px]";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${sz} ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.icon}
      {cfg.shortLabel}
    </span>
  );
}
```

`next.config.ts` must include `thesvg.org` in `remotePatterns`:
```ts
images: {
  remotePatterns: [{ protocol: "https", hostname: "thesvg.org" }],
}
```

---

## 9. Tag / Pill Badges

For scope tags, category pills, meta info:

```tsx
// Scope / category tag (neutral)
<span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
  {label}
</span>

// Meta info pill with icon
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-semibold border border-slate-100">
  <Icon className="w-3 h-3" />
  {label}
</span>
```

---

## 10. Time Slot Row

Standard pattern for displaying proposed time slots:

```tsx
// Startup-proposed slot row
<div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
  <div className="flex items-center gap-2 flex-1 min-w-0">
    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
    <span className="text-[13px] text-slate-700">{formatSlotRange(slot.startAt, slot.endAt)}</span>
    <span className="text-[10px] text-slate-400">{slot.timezone}</span>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    {/* conditional action button here */}
    <span className={cn("inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold", SLOT_STATUS_STYLE[slot.status])}>
      {SLOT_STATUS_LABEL[slot.status]}
    </span>
  </div>
</div>

// Advisor-proposed slot row (blue tint)
<div className="flex flex-col gap-1 px-3.5 py-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
      <span className="text-[13px] text-slate-700">{formatSlotRange(slot.startAt, slot.endAt)}</span>
    </div>
    {/* status badge + action button */}
  </div>
  {slot.note && <p className="text-[11px] text-slate-500 pl-5.5">{slot.note}</p>}
</div>
```

---

## 11. Tab Bar

```tsx
<div className="flex items-center gap-1 border-b border-slate-100 mb-5 overflow-x-auto">
  {TABS.map(tab => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={cn(
        "px-3.5 py-2 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
        activeTab === tab.key
          ? "border-[#0f172a] text-[#0f172a]"
          : "border-transparent text-slate-500 hover:text-slate-700"
      )}
    >
      {tab.label}
      {count > 0 && (
        <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
          activeTab === tab.key ? "bg-[#0f172a] text-white" : "bg-slate-100 text-slate-500"
        )}>
          {count}
        </span>
      )}
    </button>
  ))}
</div>
```

---

## 12. Search Input

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
  <input
    type="text"
    placeholder="Tìm kiếm..."
    value={search}
    onChange={e => setSearch(e.target.value)}
    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-white transition-all"
  />
</div>
```

---

## 13. Form Inputs

```tsx
// Text input / date / time
<input
  type="text"
  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all"
/>

// Textarea
<textarea
  rows={4}
  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none transition-all"
/>

// Select
<select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] bg-white transition-all">
  <option value="">Chọn...</option>
</select>
```

**Rules:**
- All inputs: `rounded-xl`, never `rounded-md` or `rounded-lg`.
- Focus: always `focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e]` — the gold accent ring.
- No `focus:outline-none` without also adding a ring.

---

## 14. Dialog / Modal

```tsx
{open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-slate-900">Tiêu đề Dialog</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-3">
        {/* content */}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">
          Huỷ
        </button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm">
          Xác nhận
        </button>
      </div>
    </div>
  </div>
)}
```

**Rules:**
- Backdrop: `bg-black/40 backdrop-blur-sm` — always both.
- Modal: `rounded-2xl shadow-xl` — never less.
- Entry animation: `animate-in zoom-in-95 duration-200`.
- Max width: `max-w-md` for confirm dialogs, `max-w-lg` for form dialogs.
- Close button: top-right, `p-1 rounded-lg hover:bg-slate-100`.

---

## 15. Timeline / Activity Log

Used in detail pages (right column), shows state history:

```tsx
<div className="relative">
  {timeline.map((entry, idx) => {
    const isLast = idx === timeline.length - 1;
    return (
      <div key={entry.id} className="flex gap-3 pb-4 last:pb-0">
        <div className="flex flex-col items-center">
          <div className={cn("w-2.5 h-2.5 rounded-full mt-1 shrink-0",
            isLast ? "bg-[#eec54e]" : "bg-slate-300"
          )} />
          {!isLast && <div className="w-px flex-1 bg-slate-200 mt-1" />}
        </div>
        <div className="min-w-0 pb-1">
          <p className="text-[13px] text-slate-700 font-medium leading-tight">
            {TIMELINE_LABELS[entry.actionType] || entry.actionType}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {entry.actorType === "STARTUP" ? "Startup" : entry.actorType === "ADVISOR" ? "Advisor" : "Hệ thống"}
            {" · "}{relativeTime(entry.createdAt)}
          </p>
        </div>
      </div>
    );
  })}
</div>
```

- Latest entry dot: `bg-[#eec54e]` (gold).
- Older dots: `bg-slate-300`.
- Connector line: `w-px bg-slate-200`.

---

## 16. Empty State

```tsx
<div className="flex flex-col items-center justify-center py-16 space-y-3">
  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
    <InboxIcon className="w-6 h-6 text-slate-300" />
  </div>
  <p className="text-[14px] font-semibold text-slate-500">Không có kết quả</p>
  <p className="text-[13px] text-slate-400">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
</div>
```

---

## 17. Loading State

```tsx
<div className="flex items-center justify-center py-32">
  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
</div>
```

---

## 18. Breadcrumb (Shell Level)

Breadcrumb lives **in the shell** (not inside pages). Uses `usePathname()` + a `routeLabels` map.

```tsx
const routeLabels: Record<string, string> = {
  advisor: "Workspace",
  requests: "Yêu cầu tư vấn",
  schedule: "Lịch tư vấn",
  profile: "Hồ sơ Advisor",
  kyc: "Xác minh danh tính",
  settings: "Cài đặt",
};

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = routeLabels[seg] ?? (/^\d+$/.test(seg) || /^[a-z]+-\d+/.test(seg) ? "Chi tiết" : seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });
  if (crumbs.length <= 1) return null;
  return (
    <nav className="flex items-center gap-1.5 text-[12px] mb-5">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
          {c.isLast
            ? <span className="text-slate-600 font-medium">{c.label}</span>
            : <Link href={c.href} className="text-slate-400 hover:text-slate-600 transition-colors">{c.label}</Link>
          }
        </span>
      ))}
    </nav>
  );
}
```

---

## 19. Page Header Pattern

The first element on every detail page — white card with avatar, title, status badge, and meta info:

```tsx
<div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
  <div className="flex items-start gap-4">
    {/* Avatar */}
    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm", avatarGradient)}>
      {initial}
    </div>
    <div className="flex-1 min-w-0">
      {/* Title row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <h1 className="text-[20px] font-bold text-slate-900 leading-tight">{name}</h1>
        {/* Status badge */}
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", cfg.badge)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
          {statusLabel}
        </span>
      </div>
      {/* Subtitle */}
      <p className="text-[13px] text-slate-500 mt-1 truncate">{subtitle}</p>
      {/* Meta row */}
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {relativeTime(date)}
        </span>
        <span className="text-[11px] text-slate-400 font-mono">#{id}</span>
        {/* Additional badges: FormatBadge, industry pill, etc. */}
      </div>
    </div>
  </div>
</div>
```

---

## 20. List Card Pattern

Used in list/index pages. Each item is a white card with avatar, title, meta info, and quick actions at the bottom:

```tsx
<div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden group hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow">
  <Link href={`/path/${item.id}`} className="block px-5 pt-4 pb-3">
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[15px] font-bold shrink-0", avatarGradient)}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        {/* Title + status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-semibold text-slate-900">{title}</span>
          <StatusBadge />
        </div>
        {/* Description */}
        <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-1">{description}</p>
        {/* Meta */}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {relativeTime(date)}
          </span>
          <FormatBadge format={format} size="sm" />
          {countdown && (
            <span className="text-[11px] text-red-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {countdown}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
    </div>
  </Link>

  {/* Quick actions strip — only for items needing action */}
  {needsAction && (
    <div className="px-5 pb-4 flex items-center gap-2 border-t border-slate-100 pt-3">
      <button onClick={e => { e.preventDefault(); onAction(item.id); }}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f172a] text-white text-[12px] font-semibold hover:bg-[#1e293b] transition-colors">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Chấp nhận
      </button>
      <Link href={`/path/${item.id}`}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-medium hover:bg-slate-50 transition-colors">
        Xem chi tiết
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )}
</div>
```

---

## 21. Helper Functions (always include these)

```tsx
// Relative time (Vietnamese)
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d} ngày trước`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h} giờ trước`;
  const m = Math.floor(diff / 60000);
  if (m > 0) return `${m} phút trước`;
  return "Vừa xong";
}

// Date + time range for slots
function formatSlotRange(startAt: string, endAt: string): string {
  const s = new Date(startAt);
  const e = new Date(endAt);
  return `${s.getDate()} Thg ${s.getMonth() + 1}, ${s.getFullYear()} • ${s.getHours().toString().padStart(2, "0")}:${s.getMinutes().toString().padStart(2, "0")} - ${e.getHours().toString().padStart(2, "0")}:${e.getMinutes().toString().padStart(2, "0")}`;
}

// Expiry countdown (only show if within 48h)
function expiryCountdown(expiresAt: string): string | null {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "Đã hết hạn";
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 48) return null;
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours > 0) return `Hết hạn sau ${diffHours}h ${diffMins}m`;
  return `Hết hạn sau ${diffMins}m`;
}

// Deterministic avatar gradient from name
const AVATAR_COLORS = [
  "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
```

---

## 22. Anti-Patterns (Never Do These)

| ❌ Wrong | ✅ Correct |
|---|---|
| `text-sm`, `text-base`, `text-lg` | `text-[13px]`, `text-[15px]` etc. |
| `rounded-md` on cards | `rounded-2xl` |
| `rounded-md` on buttons | `rounded-xl` (standard) / `rounded-lg` (compact) |
| `shadow-md`, `shadow-lg` | `shadow-[0_1px_3px_rgba(0,0,0,0.04)]` |
| Colored card backgrounds for data | `bg-white` always |
| `focus:outline-none` alone | Always add `focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e]` |
| Emoji in UI strings | No emoji. Vietnamese only. |
| Stats/metric cards at top of list pages | Remove. Show data in tabs or inline counts. |
| Dark hero banner sections | Forbidden. Use white page header card instead. |
| Breadcrumbs inside page components | Breadcrumb in shell only. |
| Named tailwind sizes for font (sm/base/lg) | Always use `text-[Npx]` literals |
| `bg-gray-100` for card bg | `bg-white` for cards, `bg-slate-50` for inner rows |
| Colored borders wider than 1px except urgent zones | Only `border` (1px). `border-2` only for amber urgent zone |

---

## 23. Urgency UX Pattern

When items require immediate user action (e.g., REQUESTED state requests expiring soon):

1. **Float them to the top** of the list, separated into an amber zone.
2. **Show expiry countdown** inline (only if ≤ 48h).
3. **Show quick accept button** directly on the card — don't make users navigate to detail first.
4. **Amber zone styling**: `border-2 border-amber-200 bg-amber-50/40 rounded-2xl p-4`.
5. **Header text**: count + contextual instruction + "Phản hồi sớm để tránh tự động huỷ" right-aligned.

---

## 24. State Machine Convention

For multi-step flows (consulting, onboarding, etc.):

- Always use a typed union for statuses: `'STATE_A' | 'STATE_B' | ...`
- Always render actions conditionally on `request.status === "STATE"` — never complex boolean logic.
- Status badge always shows the current state dot + label using the STATUS_CFG pattern.
- Per-item actions (slot confirm, slot select) go **inline in the row**, not in a separate action card.
- The "Action Card" at the bottom is only for flow-level actions (reject, cancel, propose alternative).
- Confirmation requires **both parties**: track `advisorConfirmedAt` and `startupConfirmedAt` separately. Only set status to SCHEDULED when both are non-null.

---

*Last updated: 2026-03-22. Maintained by: project team + Claude Code.*
