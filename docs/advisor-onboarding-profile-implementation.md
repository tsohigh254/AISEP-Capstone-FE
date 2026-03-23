# AISEP - Advisor Profile Onboarding Implementation Spec

## 1. Purpose

This document defines how to use the `/advisor/onboarding` flow to collect initial Advisor information and bootstrap the **Advisor Profile Management** feature.

This onboarding flow should support these Advisor profile use cases:
- **UC-105 - Manage Advisor Profile**
- **UC-106 - Update Advisor Profile**
- **UC-107 - View Advisor Profile**

It should align with these advisor profile screens:
- `Advisor Profile`
- `Edit Profile (Advisor)`
- `Expertise & Services`

## 2. Important Scope Decision

`/advisor/onboarding` is **for Advisor profile creation / first-time completion**, not the formal KYC submission flow.

### Included in onboarding
- Public/professional profile basics
- Advisor expertise
- Bio and mentorship philosophy
- Public links
- Profile completeness tracking

### Not included in onboarding
- KYC request creation
- KYC document review workflow
- Sensitive verification files meant only for Operation Staff
- Final verification approval/rejection

## 3. Why this mapping is correct

The SRS separates Advisor features into:
- Advisor KYC (`UC-100` to `UC-104`)
- Advisor Profile (`UC-105` to `UC-107`)
- Separate screens for `Advisor KYC Status`, `Submit KYC (Advisor)`, `Advisor Profile`, `Edit Profile (Advisor)`, and `Expertise & Services`

Therefore, `/advisor/onboarding` should be treated as the **entry flow for Advisor profile management**, not as KYC submission.

## 4. Business Goal

The onboarding page should help a newly registered Advisor quickly create a usable profile so that:
- the platform has enough structured data to display the advisor
- profile completeness can be tracked
- the advisor can later update the same data in profile management
- the advisor can later proceed to KYC if required

## 5. Core Requirements

The implementation should satisfy the profile-related business rules:
- Advisor profiles may remain **incomplete** until required fields are filled.
- Advisor profiles must include:
  - identity details
  - professional background
  - bio
  - mentorship philosophy
  - at least one public link
- profile completeness/status must be tracked.

## 6. Route Strategy

### Primary route
- `/advisor/onboarding`

### Related routes after onboarding
- `/advisor/profile`
- `/advisor/profile/edit`
- `/advisor/expertise`
- `/advisor/kyc`

### Redirect rules
- First login and no advisor profile exists -> redirect to `/advisor/onboarding`
- Advisor profile exists but status is `INCOMPLETE` -> allow reopening `/advisor/onboarding` or redirect to edit mode
- Advisor profile is sufficiently complete -> redirect to dashboard
- Advisor may skip onboarding if product wants soft onboarding, but profile status must remain `INCOMPLETE`

## 7. Data Ownership Model

The onboarding flow writes into the **Advisor profile domain**, not the KYC domain.

### Persist to Advisor profile
- full name
- title / current role
- company / organization
- years of experience
- website
- LinkedIn URL
- profile photo
- primary expertise
- secondary expertise list
- bio
- mentorship philosophy

### Do not persist as KYC-only data here
- identity proof files
- staff review result
- verification declaration for KYC
- KYC request status/version

## 8. Suggested UX Structure

Use a 2-step onboarding flow.

### Step 1 - Basic Information
Fields:
- Profile photo
- Full name
- Current title / role
- Company / organization
- Years of experience
- Website
- LinkedIn URL

### Step 2 - Expertise & Bio
Fields:
- Primary expertise
- Secondary expertise (max 3)
- Short bio
- Mentorship philosophy
- Optional services offered

## 9. Field Definitions

## 9.1 Basic Information

### `fullName`
- Type: string
- Required: yes
- Max length: 120
- Example: `Nguyen Van A`

### `title`
- Type: string
- Required: yes
- Max length: 120
- Example: `CEO, Founder, Product Advisor`

### `company`
- Type: string
- Required: yes
- Max length: 160
- Example: `AI Tech Ventures`

### `yearsOfExperience`
- Type: integer
- Required: yes
- Range: `0..60`

### `website`
- Type: URL string
- Required: conditionally
- Rule: at least one public link must exist between `website` and `linkedinUrl`

### `linkedinUrl`
- Type: URL string
- Required: conditionally
- Rule: at least one public link must exist between `website` and `linkedinUrl`

### `profilePhotoUrl`
- Type: string
- Required: no
- Source: object storage upload result

## 9.2 Expertise & Bio

### `primaryExpertise`
- Type: enum
- Required: yes
- Single select

### `secondaryExpertises`
- Type: enum[]
- Required: no
- Max items: 3
- Must not contain `primaryExpertise`

### `bio`
- Type: text
- Required: yes
- Recommended max length: 1000
- Purpose: professional background overview

### `mentorshipPhilosophy`
- Type: text
- Required: yes
- Recommended max length: 1000
- Purpose: how the advisor mentors startups

### `servicesOffered`
- Type: enum[] or text[]
- Required: optional in v1
- Can be moved to a separate screen if not needed immediately

## 10. Expertise Taxonomy

Use a fixed taxonomy rather than free text.

```ts
export type AdvisorExpertiseCode =
  | 'FUNDRAISING'
  | 'PRODUCT_STRATEGY'
  | 'GO_TO_MARKET'
  | 'FINANCE'
  | 'LEGAL_IP'
  | 'OPERATIONS'
  | 'TECHNOLOGY'
  | 'MARKETING'
  | 'HR_OR_TEAM_BUILDING'
```

```ts
export const ADVISOR_EXPERTISE_OPTIONS = [
  { code: 'FUNDRAISING', label: 'Gọi vốn' },
  { code: 'PRODUCT_STRATEGY', label: 'Chiến lược SP' },
  { code: 'GO_TO_MARKET', label: 'Go-to-market' },
  { code: 'FINANCE', label: 'Tài chính' },
  { code: 'LEGAL_IP', label: 'Pháp lý & SHTT' },
  { code: 'OPERATIONS', label: 'Vận hành' },
  { code: 'TECHNOLOGY', label: 'Công nghệ' },
  { code: 'MARKETING', label: 'Marketing' },
  { code: 'HR_OR_TEAM_BUILDING', label: 'Nhân sự' },
]
```

## 11. Profile Status Model

Use a dedicated profile status separate from KYC status.

```ts
export type AdvisorProfileStatus =
  | 'NOT_STARTED'
  | 'INCOMPLETE'
  | 'COMPLETED'
```

### Meaning
- `NOT_STARTED`: no profile record yet
- `INCOMPLETE`: profile exists but required data is missing
- `COMPLETED`: required profile fields are filled

Do **not** overload this with KYC values like `PENDING`, `VERIFIED`, `REJECTED`.

## 12. Completeness Rules

A profile is considered `COMPLETED` when all required conditions are satisfied:
- `fullName` exists
- `title` exists
- `company` exists
- `yearsOfExperience` is not null
- at least one public link exists: `website` or `linkedinUrl`
- `primaryExpertise` exists
- `bio` exists
- `mentorshipPhilosophy` exists

Optional:
- profile photo
- secondary expertises
- services offered

### Suggested completeness scoring
- Required fields each contribute a fixed percentage
- Optional fields can add bonus completeness but should not block `COMPLETED`

Example:
- 8 required checkpoints
- each checkpoint = 12.5%
- status becomes `COMPLETED` only at 100%

## 13. End-to-End Flow

### Flow A - First-time advisor
1. Advisor signs in.
2. System checks whether `advisorProfile` exists.
3. If not found, system redirects to `/advisor/onboarding`.
4. Step 1 loads with empty/default values.
5. Advisor fills basic information.
6. System validates fields locally.
7. User clicks `Continue`.
8. Step 2 opens.
9. Advisor fills expertise, bio, and mentorship philosophy.
10. System validates again.
11. User submits onboarding.
12. Backend creates advisor profile or upserts existing draft profile.
13. Backend recalculates completeness and status.
14. If successful:
   - mark profile as `INCOMPLETE` or `COMPLETED`
   - redirect to dashboard or advisor profile page
15. If failed:
   - show save error and keep form state.

### Flow B - Resume incomplete onboarding
1. Advisor opens `/advisor/onboarding`.
2. System loads existing profile draft.
3. Form pre-fills saved values.
4. User updates missing fields.
5. On submit, backend recalculates completeness.
6. If complete, profile status becomes `COMPLETED`.

### Flow C - Skip onboarding
1. Advisor clicks `Skip for now`.
2. System creates no profile or keeps partial draft.
3. User is redirected to dashboard.
4. Profile remains `NOT_STARTED` or `INCOMPLETE`.
5. System may show later prompts encouraging profile completion.

## 14. Form State Strategy

Use local draft state on the client for resilience.

### Recommended behavior
- auto-save form data locally after debounce
- restore draft on refresh if backend save has not happened yet
- after successful server save, clear stale local draft

### Sources of truth
- Backend profile record = long-term source of truth
- Local storage / context = temporary draft cache only

## 15. Frontend Form Model

```ts
export type AdvisorOnboardingForm = {
  profilePhotoUrl: string | null
  fullName: string
  title: string
  company: string
  yearsOfExperience: number | null
  website: string
  linkedinUrl: string
  primaryExpertise: AdvisorExpertiseCode | null
  secondaryExpertises: AdvisorExpertiseCode[]
  bio: string
  mentorshipPhilosophy: string
  servicesOffered: string[]
}
```

## 16. Validation Rules

### Step 1 validation
- `fullName` required
- `title` required
- `company` required
- `yearsOfExperience` required
- `yearsOfExperience >= 0`
- `yearsOfExperience <= 60`
- if `website` exists -> must be valid URL
- if `linkedinUrl` exists -> must be valid URL
- at least one of `website` or `linkedinUrl` must exist before final submit

### Step 2 validation
- `primaryExpertise` required
- `secondaryExpertises.length <= 3`
- `secondaryExpertises` must not include `primaryExpertise`
- `bio` required
- `mentorshipPhilosophy` required

### Example messages
- `Vui lòng nhập họ và tên`
- `Vui lòng nhập chức vụ hiện tại`
- `Vui lòng nhập công ty hoặc tổ chức`
- `Vui lòng nhập số năm kinh nghiệm hợp lệ`
- `Vui lòng cung cấp ít nhất một liên kết công khai`
- `Vui lòng chọn chuyên môn chính`
- `Chuyên môn phụ không được trùng chuyên môn chính`
- `Vui lòng nhập phần giới thiệu bản thân`
- `Vui lòng nhập triết lý cố vấn`

## 17. Backend Persistence Logic

Use `upsert` behavior by `userId`.

### Create case
If advisor profile does not exist:
- create `Advisor` record linked to current user
- store submitted fields
- compute `profileCompleteness`
- compute `profileStatus`

### Update case
If advisor profile already exists:
- update editable fields
- recompute `profileCompleteness`
- recompute `profileStatus`

## 18. API Proposal

## 18.1 Get current advisor onboarding/profile draft
`GET /api/v1/advisor/profile/me`

### Response
```json
{
  "advisorId": "adv_123",
  "userId": "usr_123",
  "profileStatus": "INCOMPLETE",
  "profileCompleteness": 62,
  "fullName": "Nguyen Van A",
  "title": "CEO, Founder, Expert",
  "company": "AI Tech Ventures",
  "yearsOfExperience": 8,
  "website": "https://example.com",
  "linkedinUrl": "https://linkedin.com/in/username",
  "profilePhotoUrl": null,
  "primaryExpertise": "GO_TO_MARKET",
  "secondaryExpertises": ["MARKETING", "PRODUCT_STRATEGY"],
  "bio": "...",
  "mentorshipPhilosophy": "..."
}
```

## 18.2 Save draft / update profile
`PUT /api/v1/advisor/profile/me`

### Request
```json
{
  "fullName": "Nguyen Van A",
  "title": "CEO, Founder, Expert",
  "company": "AI Tech Ventures",
  "yearsOfExperience": 8,
  "website": "https://example.com",
  "linkedinUrl": "https://linkedin.com/in/username",
  "profilePhotoUrl": null,
  "primaryExpertise": "GO_TO_MARKET",
  "secondaryExpertises": ["MARKETING", "PRODUCT_STRATEGY"],
  "bio": "Short professional bio",
  "mentorshipPhilosophy": "I help startups validate GTM and fundraising readiness"
}
```

### Response
```json
{
  "advisorId": "adv_123",
  "profileStatus": "COMPLETED",
  "profileCompleteness": 100,
  "message": "Profile saved successfully"
}
```

## 18.3 Upload profile photo
`POST /api/v1/advisor/profile/me/photo`

### Response
```json
{
  "profilePhotoUrl": "https://cdn.../advisor-photo.jpg"
}
```

## 19. Database Mapping

The ERD already contains a base `Advisors` table with fields such as:
- `FullName`
- `Title`
- `Company`
- `Bio`
- `ProfilePhotoURL`
- `YearsOfExperience`
- `MentorshipPhilosophy`
- `LinkedInURL`
- `Website`
- `ProfileStatus`

### Recommended additions if not present yet
- `ProfileCompleteness` integer
- `PrimaryExpertise` varchar/enum
- `SecondaryExpertises` jsonb or separate relation table
- `OnboardingCompletedAt` datetime nullable

### Recommended normalized option
#### `AdvisorProfileExpertise`
- `id`
- `advisorId`
- `expertiseCode`
- `kind` = `PRIMARY | SECONDARY`
- `createdAt`

## 20. Access Control

- Only authenticated users with Advisor role may access `/advisor/onboarding`.
- User may only read/write their own profile.
- Operation Staff should not use this flow to edit advisor profile data directly.
- KYC review access remains separate.

## 21. Relation to Other Advisor Screens

### `Advisor Profile`
Read-only or public-style display of saved data.

### `Edit Profile (Advisor)`
Uses the same data schema as onboarding, but after first creation.

### `Expertise & Services`
May reuse a subset of the same profile fields:
- primary expertise
- secondary expertise
- services offered

To avoid duplication, onboarding and edit profile should share the same form schema and validation rules.

## 22. Suggested UI States

### Loading
- show skeletons while loading current profile

### Empty
- no profile exists yet
- show welcome message and stepper

### Draft
- partial values exist
- show `Continue`

### Saving
- disable duplicate submit
- show `Saving...`

### Saved successfully
- toast or inline success state

### Error
- preserve form data
- show inline or toast error

## 23. Error Cases

### Unauthorized
- user not authenticated
- redirect to login or show forbidden

### Wrong role
- authenticated but not advisor
- show forbidden

### Network failure during save
- keep local draft
- show retry option

### Invalid expertise payload
- reject on backend
- return field-level validation error

### Partial server save conflict
- prefer last valid save
- return updated server state if conflict resolution is needed

## 24. Submit Logic Pseudocode

```ts
async function submitAdvisorOnboarding(form: AdvisorOnboardingForm) {
  validateStep1(form)
  validateStep2(form)

  const payload = normalizeForm(form)

  const saved = await advisorProfileApi.updateMe(payload)

  return {
    advisorId: saved.advisorId,
    profileStatus: saved.profileStatus,
    profileCompleteness: saved.profileCompleteness,
  }
}
```

```ts
function calculateAdvisorProfileCompleteness(data: AdvisorOnboardingForm): number {
  let score = 0
  const checkpoints = [
    Boolean(data.fullName),
    Boolean(data.title),
    Boolean(data.company),
    data.yearsOfExperience !== null,
    Boolean(data.website || data.linkedinUrl),
    Boolean(data.primaryExpertise),
    Boolean(data.bio),
    Boolean(data.mentorshipPhilosophy),
  ]

  const passed = checkpoints.filter(Boolean).length
  score = Math.round((passed / checkpoints.length) * 100)
  return score
}
```

```ts
function deriveAdvisorProfileStatus(completeness: number): 'NOT_STARTED' | 'INCOMPLETE' | 'COMPLETED' {
  if (completeness === 0) return 'NOT_STARTED'
  if (completeness < 100) return 'INCOMPLETE'
  return 'COMPLETED'
}
```

## 25. Recommended Frontend Folder Structure

```txt
app/
  advisor/
    onboarding/
      page.tsx

components/
  advisor/
    onboarding/
      advisor-onboarding-wizard.tsx
      basic-info-step.tsx
      expertise-bio-step.tsx
      profile-photo-upload.tsx
      expertise-selector.tsx

lib/
  advisor/
    profile-schema.ts
    profile-mappers.ts
    profile-completeness.ts
    profile-api.ts
```

## 26. Acceptance Criteria

### Functional
- Advisor can open `/advisor/onboarding` after login.
- System loads existing advisor profile if one exists.
- Advisor can fill Step 1 and Step 2.
- System validates required fields.
- On submit, advisor profile is created or updated.
- Profile completeness is recalculated after every successful save.
- Profile status becomes `COMPLETED` only when all required fields are filled.
- Saved data is visible later in `Advisor Profile` and `Edit Profile (Advisor)`.

### Non-functional
- Form remains usable on mobile/tablet/desktop.
- Validation errors are shown inline.
- Duplicate submission is prevented.
- Sensitive KYC data is not mixed into this onboarding flow.

## 27. Testing Checklist

### Happy path
- First-time advisor completes onboarding successfully
- Redirect after completion works correctly

### Draft path
- Advisor refreshes in the middle of onboarding and draft is restored

### Edit path
- Existing advisor profile is loaded and updated successfully

### Validation path
- Missing title -> blocked
- Missing public link -> blocked
- Missing primary expertise -> blocked
- Secondary expertise includes primary -> blocked

### Permissions path
- Non-advisor role cannot access onboarding route

## 28. Final Implementation Recommendation

Treat `/advisor/onboarding` as a **profile bootstrap flow** for Advisor Profile Management.

It should:
- create the first advisor profile record
- collect required profile data early
- track completeness/status
- feed `Advisor Profile`, `Edit Profile`, and `Expertise & Services`
- stay separate from the formal KYC verification workflow

This keeps the domain model clean, the UX simple, and the implementation aligned with the current AISEP SRS.
