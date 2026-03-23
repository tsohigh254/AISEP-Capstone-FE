# Advisor Service Pricing in Profile - Implementation Spec

## 1. Purpose

This document defines how to implement **Service Pricing** directly inside the **Advisor Profile / Edit Profile** experience of AISEP.

The goal is to let an Advisor configure:
- whether they are currently accepting consultation requests,
- a base hourly rate,
- supported session durations,
- price previews per duration,
- estimated platform fee and estimated advisor payout.

This pricing configuration is a **profile-level commercial setting**, not a KYC field and not a per-session editable field.

---

## 2. Scope

### In scope
- Add a new section named **Dịch vụ & Mức phí** to the Advisor profile edit page.
- Allow Advisor to enable or disable receiving consultation requests.
- Allow Advisor to set a base hourly rate.
- Allow Advisor to choose supported consultation durations.
- Show calculated session price preview.
- Show estimated platform fee and estimated payout preview.
- Save pricing together with the Advisor profile.
- Expose pricing to downstream consultation request and payment flows.
- Lock a pricing snapshot into a consultation session once the session becomes payable/confirmed.

### Out of scope
- Actual payment gateway implementation.
- Payout settlement execution.
- Refund execution.
- Dynamic discounting, coupons, taxes, multi-currency, or surge pricing.
- Per-topic/per-service custom pricing in V1.

---

## 3. Why this belongs in Advisor Profile

Pricing should be implemented as a **sub-section of Advisor Profile / Expertise & Services**, not as an isolated module.

Reasoning:
- It is a long-lived Advisor configuration similar to expertise and availability.
- It affects how Startups view and book an Advisor.
- The amount used in payment must come from a stable Advisor-owned configuration source.

Recommended information architecture:
- Basic Information
- Professional Information
- Bio & Mentorship Philosophy
- Online Meeting Links
- Expertise
- **Dịch vụ & Mức phí**
- Availability

---

## 4. Related existing AISEP features

This feature should connect to the following existing areas:
- Advisor Profile
- Edit Profile (Advisor)
- Expertise & Services
- Set Availability / Time Slots
- Earnings / Payouts
- Startup Initiate Payment flow
- Operation Staff payout / refund oversight

---

## 5. UX placement on current page

Add a new card section below **Chuyên môn** and above the bottom action bar.

### Section title
**Dịch vụ & Mức phí**

### Section description
Cấu hình mức phí tư vấn và thời lượng hỗ trợ để Startup có thể xem và đặt lịch phù hợp.

### Fields in the section
1. Toggle: **Nhận yêu cầu tư vấn**
2. Input: **Đơn giá theo giờ**
3. Read-only field or fixed label: **Tiền tệ**
4. Multi-select chips: **Thời lượng hỗ trợ**
5. Price preview table
6. Estimated fee / payout summary
7. Optional warning or eligibility note

---

## 6. UI behavior

### 6.1. Receive consultation toggle
Field:
- `isBookable`

Behavior:
- When OFF:
  - pricing still can remain saved,
  - pricing is not shown as active for Startup booking,
  - Advisor does not receive new consultation requests.
- When ON:
  - pricing becomes active if all validation conditions pass.

### 6.2. Hourly rate
Field:
- `hourlyRate`

Behavior:
- Numeric input only.
- Positive value only.
- Decimal support allowed if needed.
- UI should show suffix like `USD / giờ` or `VND / giờ`.

### 6.3. Currency
Field:
- `currency`

Behavior for V1:
- Use a single platform-supported currency only.
- Recommended approach: fixed to `USD` in code if product direction is international, or fixed to `VND` if product direction is local-first.
- Do not allow user-side multi-currency switching in V1.

### 6.4. Supported durations
Field:
- `supportedDurations`

Recommended allowed values in V1:
- 30
- 60
- 90
- 120

Behavior:
- Multi-select chips.
- At least one duration required when `isBookable = true`.
- Duplicate durations not allowed.
- Unsupported duration values not allowed.

### 6.5. Price preview
Preview is computed locally in FE and revalidated in BE.

For each selected duration:
- session price
- estimated platform fee
- estimated advisor payout

Example for `80 USD / hour`:
- 30 min = 40 USD
- 60 min = 80 USD
- 90 min = 120 USD
- 120 min = 160 USD

### 6.6. Estimated payout block
Display read-only informational values:
- Platform fee rate: `15%`
- Estimated advisor payout after platform fee

This is preview-only. Final payout still depends on payment result, disputes, and payout approval workflow.

---

## 7. Validation rules

### Required rules
- `hourlyRate > 0`
- `supportedDurations.length >= 1` when `isBookable = true`
- each duration must belong to supported set `[30, 60, 90, 120]`
- no duplicate durations
- Advisor must be authenticated
- User role must be `Advisor`
- Advisor profile must exist

### Eligibility rules for enabling bookable state
Recommended minimum profile requirements before `isBookable` can be turned on:
- full name exists
- title exists
- company or organization exists
- primary expertise exists
- at least one public professional link exists (`LinkedIn` or `Website`)

Recommended stronger rule:
- Advisor KYC status should be at least `BASIC_VERIFIED` before allowing `isBookable = true`

### Validation messages
- Vui lòng nhập đơn giá theo giờ.
- Đơn giá phải lớn hơn 0.
- Vui lòng chọn ít nhất một thời lượng hỗ trợ.
- Thời lượng hỗ trợ không hợp lệ.
- Hồ sơ chưa đủ điều kiện để bật nhận tư vấn.
- Bạn chưa đủ điều kiện xác thực để mở nhận yêu cầu tư vấn.

---

## 8. Calculation logic

### Core formulas

```ts
sessionPrice = hourlyRate * durationMinutes / 60
platformFeeAmount = sessionPrice * platformFeeRate
advisorPayoutPreview = sessionPrice - platformFeeAmount
```

### Default platform fee rate
```ts
platformFeeRate = 0.15
```

### Notes
- FE may calculate live previews.
- BE must calculate again and never trust FE-computed money values.
- Money should be normalized using integer minor units where possible in BE.

---

## 9. Data model proposal

## 9.1. Profile-level pricing table

### Option A - separate pricing table (recommended)

```ts
AdvisorServicePricing {
  id: string
  advisorId: string
  isBookable: boolean
  hourlyRate: number
  currency: 'USD' | 'VND'
  supportedDurations: number[]
  platformFeeRate: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

Recommended notes:
- one active pricing profile per advisor in V1
- `supportedDurations` can be stored as `jsonb` or normalized child table
- `platformFeeRate` should be stored for traceability, even if centrally configured

## 9.2. Session pricing snapshot table

A pricing snapshot is required to avoid retroactive price changes.

```ts
ConsultingSessionPricingSnapshot {
  id: string
  sessionId: string
  advisorId: string
  hourlyRate: number
  currency: 'USD' | 'VND'
  durationMinutes: number
  sessionPrice: number
  platformFeeRate: number
  platformFeeAmount: number
  advisorPayoutAmount: number
  lockedAt: Date
}
```

### Why snapshot is required
If an Advisor changes their pricing later:
- old sessions must keep the old locked amount,
- current payment and payout records must remain auditable,
- disputes must be traceable using the original agreed price.

---

## 10. API design proposal

## 10.1. Get advisor edit profile payload

`GET /api/v1/advisor/profile/edit`

### Response

```json
{
  "profile": {
    "fullName": "Tran Bao",
    "title": "CEO",
    "company": "FPT",
    "website": "https://example.com",
    "linkedinUrl": "https://linkedin.com/in/example",
    "bio": "...",
    "mentorshipPhilosophy": "...",
    "primaryExpertise": "MARKETING",
    "secondaryExpertises": ["GO_TO_MARKET", "FINANCE"]
  },
  "servicePricing": {
    "isBookable": true,
    "hourlyRate": 80,
    "currency": "USD",
    "supportedDurations": [30, 60, 90],
    "platformFeeRate": 0.15
  },
  "pricingEligibility": {
    "canEnableBookable": true,
    "reasons": []
  }
}
```

## 10.2. Save advisor profile with pricing

`PATCH /api/v1/advisor/profile`

### Request

```json
{
  "fullName": "Tran Bao",
  "title": "CEO",
  "company": "FPT",
  "website": "https://example.com",
  "linkedinUrl": "https://linkedin.com/in/example",
  "bio": "...",
  "mentorshipPhilosophy": "...",
  "primaryExpertise": "MARKETING",
  "secondaryExpertises": ["GO_TO_MARKET", "FINANCE"],
  "servicePricing": {
    "isBookable": true,
    "hourlyRate": 80,
    "currency": "USD",
    "supportedDurations": [30, 60, 90]
  }
}
```

### Response

```json
{
  "message": "Profile updated successfully",
  "profileCompletion": 90,
  "servicePricing": {
    "isBookable": true,
    "hourlyRate": 80,
    "currency": "USD",
    "supportedDurations": [30, 60, 90],
    "platformFeeRate": 0.15
  }
}
```

## 10.3. Optional dedicated endpoint

If the team wants a cleaner separation:

`PATCH /api/v1/advisor/services/pricing`

Use this only if profile and pricing are deliberately split into separate FE save flows.

---

## 11. FE implementation notes

## 11.1. Form state

```ts
export type AdvisorServicePricingForm = {
  isBookable: boolean
  hourlyRate: number | null
  currency: 'USD'
  supportedDurations: number[]
}
```

## 11.2. Suggested component structure

- `AdvisorProfilePage`
- `AdvisorBasicInfoSection`
- `AdvisorBioSection`
- `AdvisorMeetingLinksSection`
- `AdvisorExpertiseSection`
- `AdvisorServicePricingSection`
- `AdvisorProfileActionBar`

## 11.3. Suggested service pricing component props

```ts
type AdvisorServicePricingSectionProps = {
  value: AdvisorServicePricingForm
  eligibility: {
    canEnableBookable: boolean
    reasons: string[]
  }
  platformFeeRate: number
  onChange: (next: AdvisorServicePricingForm) => void
  errors?: Record<string, string>
}
```

## 11.4. FE local derived state

Compute locally:
- selected duration previews
- session price previews
- payout previews
- disabled state of save button
- disabled state of `isBookable` toggle

## 11.5. FE save state UX

Must show:
- `Đang lưu...`
- `Đã lưu`
- `Lưu thất bại`

If autosave is enabled, pricing changes should either:
- save with the rest of the profile, or
- stay dirty until explicit save.

Recommended for this page:
- explicit save button only
- no autosave for pricing in V1

---

## 12. BE implementation notes

## 12.1. Authorization
- authenticated user required
- role must be `Advisor`
- advisor may update only their own profile pricing
- RBAC enforced server-side

## 12.2. Validation
- validate input types
- validate numeric bounds
- validate allowed duration list
- validate eligibility before allowing `isBookable = true`
- validate current KYC rule if product decides to gate pricing by verification

## 12.3. Persistence
- update profile and pricing in one transaction if they are saved together
- preserve old pricing snapshot for existing sessions
- do not modify old session pricing snapshot when profile pricing changes

## 12.4. Audit logging
Log the following changes:
- pricing enabled/disabled
- hourly rate changed
- supported durations changed
- currency changed

Audit payload example:

```json
{
  "actorRole": "Advisor",
  "actorId": "advisor_123",
  "action": "UPDATE_SERVICE_PRICING",
  "before": {
    "isBookable": false,
    "hourlyRate": 60,
    "supportedDurations": [30, 60]
  },
  "after": {
    "isBookable": true,
    "hourlyRate": 80,
    "supportedDurations": [30, 60, 90]
  }
}
```

---

## 13. Integration with consulting request flow

## 13.1. Startup side
When a Startup views an Advisor and wants to request consulting:
- the system should expose active pricing information,
- the Startup selects one supported duration,
- the request stores the chosen duration,
- the actual amount should still be locked later according to session/payment rule.

## 13.2. When to lock pricing
Recommended implementation:
- Advisor and Startup agree on a schedule and duration.
- Session enters a payable/confirmed state.
- System creates `ConsultingSessionPricingSnapshot`.
- Payment uses the snapshot value, not the current profile pricing.

## 13.3. Why lock at this point
This avoids ambiguity when:
- the Advisor changes price after schedule agreement,
- payment is initiated later,
- refund or payout review needs original price evidence.

---

## 14. Integration with payment flow

The Advisor pricing section does not process payment itself.

It only provides the pricing source for:
- payment amount display,
- creation of payment transaction,
- payout estimate,
- earnings reporting.

Recommended downstream flow:
1. Startup creates request with chosen duration.
2. Advisor accepts/proposes and schedule is agreed.
3. System locks price snapshot.
4. Startup initiates payment using locked payable amount.
5. Payment status updates session payment state.
6. Payout release remains subject to business rules and operations review.

---

## 15. Public vs internal data rules

## Public to Startup
Can be shown:
- bookable status
- supported durations
- session price per duration
- starting price label

## Internal only
Should not be shown publicly:
- platform fee amount
n- payout amount
- internal payout review state
- payout approval notes

Note: the Advisor may see estimated payout in their own profile settings, but Startups should not see advisor payout internals.

---

## 16. Suggested profile completeness rules

Recommended profile completeness contribution:
- Basic information: 30%
- Bio & mentorship philosophy: 20%
- Meeting links: 10%
- Expertise: 20%
- Service pricing: 20%

Service pricing can be counted as complete when:
- `isBookable = true`
- `hourlyRate` valid
- `supportedDurations.length >= 1`

Alternative approach:
- if bookable is optional, mark pricing as complete once values are valid even if currently inactive.

---

## 17. Suggested UI copy

### Section title
Dịch vụ & Mức phí

### Helper text
Thiết lập mức phí và thời lượng tư vấn để Startup có thể gửi yêu cầu phù hợp.

### Toggle label
Nhận yêu cầu tư vấn

### Hourly rate label
Đơn giá theo giờ

### Duration label
Thời lượng hỗ trợ

### Preview title
Xem trước mức giá

### Fee summary title
Phí nền tảng và thực nhận dự kiến

### Bookable eligibility warning
Bạn cần hoàn thiện hồ sơ và đáp ứng điều kiện xác minh trước khi mở nhận yêu cầu tư vấn.

---

## 18. Edge cases

### Case 1 - Advisor disables bookable after existing future sessions exist
- Existing scheduled/paid sessions remain valid.
- New requests are blocked.

### Case 2 - Advisor changes hourly rate while pending requests exist
Recommended policy for V1:
- New pricing applies only to new requests and not-yet-locked sessions.
- Already locked sessions keep old snapshot.

### Case 3 - Advisor removes a previously supported duration
- Existing sessions using that duration remain valid.
- New requests using that duration are blocked.

### Case 4 - Advisor profile incomplete
- Save pricing is allowed.
- Enabling `isBookable` is blocked.

### Case 5 - KYC downgraded or under review
Recommended policy:
- system may automatically disable `isBookable`
- or prevent new bookings while preserving existing sessions

---

## 19. Security considerations

- Validate all money fields server-side.
- Never trust FE price computation.
- Enforce Advisor ownership on all pricing endpoints.
- Log pricing changes.
- Avoid exposing internal fee and payout internals to unauthorized users.
- Protect sensitive payout review data.

---

## 20. Acceptance criteria

### Functional acceptance
- Advisor can view existing pricing on profile edit page.
- Advisor can enable/disable receiving requests.
- Advisor can set hourly rate.
- Advisor can select one or more supported durations.
- System shows calculated session prices.
- System shows estimated fee and payout.
- System saves pricing successfully.
- Invalid pricing is rejected with clear messages.
- Existing session pricing is not retroactively changed.

### UX acceptance
- Pricing section is visually separated from identity info.
- Save state is clearly shown.
- Disabled states and eligibility reasons are understandable.
- Preview updates instantly when rate or durations change.

### Data acceptance
- Pricing persists correctly.
- Snapshot is created when session price becomes locked.
- Downstream payment reads locked snapshot, not mutable profile price.

---

## 21. Test checklist

### FE
- render existing pricing
- change hourly rate updates preview
- change durations updates preview
- invalid input shows errors
- toggle disabled when eligibility fails
- save success state visible
- save failure state visible

### BE
- unauthorized user blocked
- wrong role blocked
- invalid duration rejected
- zero/negative rate rejected
- `isBookable = true` blocked when profile incomplete
- session pricing snapshot created correctly
- old snapshots preserved after pricing update

### Integration
- Startup sees active pricing only
- Startup payment uses locked amount
- Advisor earnings page can read snapshot/payout basis later

---

## 22. Recommended V1 decisions

To keep implementation simple and safe, V1 should use:
- one pricing profile per advisor
- one currency only
- one base hourly rate only
- fixed allowed durations set
- fixed platform fee rate from system config
- explicit save button
- no coupons, discounts, taxes, or promotional pricing

---

## 23. Suggested roadmap after this feature

After this section is implemented, the next related implementations should be:
1. expose pricing on public advisor detail page for Startup
2. connect chosen duration to consulting request creation
3. lock pricing snapshot on confirmed/payable session
4. show advisor-side earnings and payout history using pricing snapshot
5. add operations review hooks for payout/refund disputes

---

## 24. Final implementation recommendation

Implement **Dịch vụ & Mức phí** as a dedicated section inside Advisor Profile / Edit Profile, but keep its logic modular in code.

Recommended architectural split:
- FE location: Advisor profile edit page
- FE component: `AdvisorServicePricingSection`
- BE module owner: `profiles` or `advisor-services`
- payment usage: downstream via session pricing snapshot

This gives the cleanest UX while preserving correct business behavior for pricing, payments, disputes, and payouts.
