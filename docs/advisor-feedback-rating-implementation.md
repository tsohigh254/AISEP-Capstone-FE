# Advisor Feedback & Rating Implementation Spec

## 1. Purpose

Implement the Advisor Feedback & Rating feature for AISEP so that an authenticated Advisor can:

- view rating summary and written feedback received from Startups
- review feedback only for sessions that were actually completed
- optionally respond to a Startup feedback item if the product enables response capability

This spec is designed for implementation after:

- Advisor KYC
- Advisor Profile Management
- Advisor Consulting Schedule / Request Handling
- Advisor Consulting Reports

because feedback depends on completed consulting sessions and previously submitted Startup feedback.

---

## 2. Source Alignment in SRS

### 2.1 Official use case coverage

Core official Advisor use case:

- **UC-119 – View Feedback & Rating Summary**

Related Startup-side source of data:

- **UC-50 – Submit Feedback & Rating for Advisor**

Related business rules:

- **BR-78** Advisor feedback can only be submitted once per completed session
- **BR-79** Advisors can respond to Startup feedback
- **BR-80** Advisor dashboard includes average rating
- **BR-50** access controlled by RBAC

### 2.2 Scope decision for implementation

Although the official Advisor UC list explicitly names only **UC-119**, the functional requirements section also defines **Response feedback** as an Advisor feature. Therefore, this implementation spec is split into:

- **Phase 1 (required core):** View Feedback & Rating Summary
- **Phase 1.5 / Optional but recommended:** Respond to Feedback

This keeps the implementation aligned with both the UC table and the detailed functional requirements.

---

## 3. Feature Scope

### In scope

1. View own feedback page
2. View average rating
3. View total review count
4. View rating breakdown by star level
5. View feedback list with session context
6. Filter and sort feedback list
7. View feedback details
8. Show empty state when no feedback exists
9. Optional: submit advisor response to a feedback item
10. Optional: edit advisor response if policy allows

### Out of scope

1. Startup feedback submission flow itself
2. Dispute or moderation resolution UI for flagged feedback
3. Public advisor profile rendering for Startup side
4. Earnings or payout computation from ratings
5. External review systems

---

## 4. Actor and Access

### Primary actor

- Advisor

### Supporting actors / systems

- Startup: creates the original feedback
- Backend API
- Notification service
- Operation Staff: may later review flagged feedback or disputes

### Access rules

- User must be authenticated
- User role must be Advisor
- Advisor may access only feedback belonging to their own advisor profile
- Advisors must never see internal moderation notes
- Hidden or removed feedback (policy-based) must not be shown unless explicitly allowed by moderation rules

---

## 5. Dependency and Data Origin

Feedback data comes from completed consulting sessions.

### Required upstream conditions

1. A consulting session exists between Startup and Advisor
2. The session is in a terminal eligible state for feedback, usually `COMPLETED`
3. Startup submits feedback for that session
4. The platform stores rating and optional comment
5. The feedback becomes visible to the Advisor according to moderation/policy rules

### Key policy rule

A session can contribute at most one Startup feedback submission to one Advisor.

Recommended invariant:

- unique constraint on `(session_id, startup_id, advisor_id)` or simply `(session_id)` if one session can only belong to one Startup and one Advisor pair

---

## 6. Product Behavior Summary

### Core user story

As an Advisor, I want to open my Feedback page and immediately understand:

- my current average rating
- how many ratings I have received
- what Startups said about my sessions
- which sessions those reviews came from
- whether I can respond to any specific review

### UX goals

- quick credibility snapshot
- easy drill-down into written reviews
- clear distinction between rated-with-comment vs rating-only items
- support trust-building without exposing internal system logic

---

## 7. Screen Model

## 7.1 Ratings & Feedback screen

Suggested route:

- `/advisor/feedback`

### Main sections

1. **Summary header**
   - average rating
   - total reviews
   - distribution by 1–5 stars
   - optional recent trend label if available later

2. **Filter / sort bar**
   - rating filter
   - date range filter
   - has comment / no comment
   - responded / not responded (if response feature enabled)
   - sort by newest / oldest / highest rating / lowest rating

3. **Feedback list**
   - rating stars
   - Startup display name or anonymized label (policy-based)
   - session title / consulting topic
   - session completed date
   - feedback comment
   - response preview if advisor already responded
   - CTA: View Details / Respond

4. **Empty state**
   - no feedback yet
   - explanation that ratings appear after completed sessions and submitted Startup feedback

### Optional detail drawer / page

- full feedback content
- session context
- advisor response block
- created date / last updated date

---

## 8. State Model

### Page-level states

1. `loading`
2. `ready`
3. `empty`
4. `access_denied`
5. `error`

### Feedback item visibility states

Recommended internal state for each feedback item:

- `VISIBLE`
- `HIDDEN_BY_POLICY`
- `FLAGGED`
- `REMOVED`

For Phase 1 UI, only show items in `VISIBLE`.

### Response states (optional)

- `NOT_RESPONDED`
- `RESPONDED`
- `RESPONSE_EDITABLE`
- `RESPONSE_LOCKED`

If the project wants simple behavior, use:

- one response per feedback
- editable until a policy-defined lock time or moderation event

---

## 9. Functional Flow

## 9.1 View feedback summary flow

1. Advisor opens the Feedback page
2. FE requests summary and feedback list from API
3. BE validates authentication and Advisor ownership
4. BE retrieves visible feedback records for the advisor
5. BE calculates summary metrics:
   - average rating
   - total reviews
   - count by each star value
6. BE returns paginated feedback items plus summary
7. FE renders summary cards and list
8. If no visible feedback exists, FE shows empty state

## 9.2 Filter / sort flow

1. Advisor changes one or more filters
2. FE updates query params and refetches list
3. BE validates filter values
4. BE returns filtered and sorted list
5. FE preserves summary metrics or refetches consistent summary depending on product decision

Recommended rule:

- global summary should represent **all visible feedback**
- list can be filtered independently

## 9.3 Respond to feedback flow (optional)

1. Advisor clicks `Respond` on a feedback item
2. FE opens response form
3. Advisor enters response text
4. FE validates length/basic rules
5. FE sends create response request
6. BE validates:
   - advisor owns the feedback item
   - feedback exists and is visible/respondable
   - response content is valid
   - policy allows response creation or update
7. BE stores response
8. BE updates feedback item metadata
9. FE refreshes item and shows success message
10. Optional notification sent to Startup

---

## 10. Recommended Domain Rules

### Mandatory rules

1. Feedback can only exist for a completed session
2. Feedback can only be submitted once per completed session
3. Advisor can only view feedback linked to their own sessions/profile
4. Summary metrics must be calculated only from visible valid feedback
5. Soft-deleted or moderation-hidden feedback must not affect public/visible summary unless business explicitly chooses otherwise

### Recommended additional rules

6. Rating range must be integer `1..5`
7. Comment is optional, but rating is required
8. Advisor response is optional
9. Only one advisor response per feedback item
10. Advisor response edits are allowed only under policy-defined conditions
11. Startup cannot edit rating after response lock unless product policy explicitly supports it
12. Feedback summary in Advisor Dashboard should use same aggregation source as Feedback page to avoid inconsistency

---

## 11. Data Model Proposal

## 11.1 Main entities

### `consulting_sessions`
Minimal fields used by this feature:

- `id`
- `startup_id`
- `advisor_id`
- `request_id`
- `topic`
- `status`
- `scheduled_start_at`
- `completed_at`

### `advisor_feedback`
Recommended fields:

- `id`
- `session_id`
- `startup_id`
- `advisor_id`
- `rating` smallint
- `comment` text nullable
- `visibility_status` enum
- `moderation_status` enum nullable
- `created_at`
- `updated_at`
- `submitted_at`

### `advisor_feedback_response`
Recommended fields:

- `id`
- `feedback_id`
- `advisor_id`
- `response_text`
- `created_at`
- `updated_at`
- `edited_count`
- `is_locked`

### Optional aggregated table: `advisor_rating_snapshot`
Useful for performance at scale.

- `advisor_id`
- `average_rating`
- `total_reviews`
- `star_1_count`
- `star_2_count`
- `star_3_count`
- `star_4_count`
- `star_5_count`
- `last_recomputed_at`

For MVP, this can be computed on read or maintained asynchronously.

---

## 12. Enum Proposal

```ts
export type FeedbackVisibilityStatus =
  | 'VISIBLE'
  | 'HIDDEN_BY_POLICY'
  | 'FLAGGED'
  | 'REMOVED'

export type ModerationStatus =
  | 'NONE'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'

export type SessionStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'

export type FeedbackSort =
  | 'NEWEST'
  | 'OLDEST'
  | 'HIGHEST_RATING'
  | 'LOWEST_RATING'
```

---

## 13. API Proposal

## 13.1 Get advisor feedback summary

`GET /api/advisor/feedback/summary`

### Response

```json
{
  "advisorId": "adv_001",
  "averageRating": 4.7,
  "totalReviews": 18,
  "ratingBreakdown": {
    "1": 0,
    "2": 1,
    "3": 1,
    "4": 4,
    "5": 12
  },
  "lastUpdatedAt": "2026-03-22T08:00:00Z"
}
```

## 13.2 Get paginated feedback list

`GET /api/advisor/feedback?rating=5&hasComment=true&responded=false&sort=NEWEST&page=1&pageSize=10`

### Response

```json
{
  "items": [
    {
      "id": "fb_001",
      "sessionId": "sess_001",
      "startup": {
        "id": "st_001",
        "displayName": "Nova Labs"
      },
      "session": {
        "topic": "Go-to-market review",
        "completedAt": "2026-03-10T10:00:00Z"
      },
      "rating": 5,
      "comment": "Very practical and actionable advice.",
      "createdAt": "2026-03-10T12:00:00Z",
      "response": null,
      "canRespond": true
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

## 13.3 Get feedback detail

`GET /api/advisor/feedback/:feedbackId`

## 13.4 Create advisor response (optional)

`POST /api/advisor/feedback/:feedbackId/response`

### Request

```json
{
  "responseText": "Thank you for the feedback. I am glad the session was helpful."
}
```

## 13.5 Update advisor response (optional, policy-based)

`PATCH /api/advisor/feedback/:feedbackId/response`

### Request

```json
{
  "responseText": "Thank you for the thoughtful feedback."
}
```

---

## 14. Backend Service Logic

## 14.1 Summary aggregation logic

Only include feedback records that satisfy all of the following:

- belongs to advisor
- linked session is valid
- linked session status is `COMPLETED`
- feedback visibility is `VISIBLE`
- not soft-deleted

### Pseudocode

```ts
async function getAdvisorFeedbackSummary(advisorId: string) {
  const rows = await feedbackRepo.findVisibleByAdvisor(advisorId)

  const totalReviews = rows.length
  if (totalReviews === 0) {
    return {
      averageRating: null,
      totalReviews: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }

  const sum = rows.reduce((acc, item) => acc + item.rating, 0)
  const averageRating = Number((sum / totalReviews).toFixed(1))

  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const item of rows) {
    ratingBreakdown[item.rating as 1 | 2 | 3 | 4 | 5] += 1
  }

  return {
    averageRating,
    totalReviews,
    ratingBreakdown
  }
}
```

## 14.2 Response creation logic

```ts
async function createAdvisorResponse(advisorId: string, feedbackId: string, responseText: string) {
  const feedback = await feedbackRepo.findById(feedbackId)

  if (!feedback) throw new NotFoundError('Feedback not found')
  if (feedback.advisorId !== advisorId) throw new ForbiddenError('No access')
  if (feedback.visibilityStatus !== 'VISIBLE') throw new BusinessError('Feedback cannot be responded to')
  if (!isValidResponseText(responseText)) throw new ValidationError('Invalid response content')

  const existing = await feedbackResponseRepo.findByFeedbackId(feedbackId)
  if (existing && existing.isLocked) {
    throw new BusinessError('Response is locked')
  }

  if (!existing) {
    return feedbackResponseRepo.create({ feedbackId, advisorId, responseText })
  }

  return feedbackResponseRepo.update(existing.id, {
    responseText,
    editedCount: existing.editedCount + 1
  })
}
```

---

## 15. FE Implementation Notes

## 15.1 Suggested pages/components

### Page

- `app/advisor/feedback/page.tsx`

### Components

- `advisor-feedback-summary.tsx`
- `advisor-rating-breakdown.tsx`
- `advisor-feedback-filters.tsx`
- `advisor-feedback-list.tsx`
- `advisor-feedback-card.tsx`
- `advisor-feedback-detail-drawer.tsx`
- `advisor-feedback-response-form.tsx`
- `advisor-feedback-empty-state.tsx`

## 15.2 FE data contract suggestion

```ts
type AdvisorFeedbackSummary = {
  averageRating: number | null
  totalReviews: number
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>
  lastUpdatedAt?: string
}

type AdvisorFeedbackItem = {
  id: string
  sessionId: string
  startup: {
    id: string
    displayName: string
  }
  session: {
    topic: string | null
    completedAt: string
  }
  rating: 1 | 2 | 3 | 4 | 5
  comment: string | null
  createdAt: string
  response: {
    id: string
    responseText: string
    createdAt: string
    updatedAt: string
  } | null
  canRespond: boolean
}
```

## 15.3 FE UX rules

- summary renders before long list if possible
- use skeletons during loading
- preserve filter query params in URL
- optimistic update for response is optional; simple refetch is acceptable
- if no comment exists, show `Rating only` badge
- if response exists, show it collapsed below the review

---

## 16. Validation Rules

## 16.1 List and summary

- authenticated user required
- role must be Advisor
- page and pageSize must be positive valid numbers
- sort must be supported enum
- rating filter must be within `1..5`

## 16.2 Response form

Recommended constraints:

- trimmed content required
- min length: 2
- max length: 1000
- reject pure whitespace
- sanitize against XSS before persistence and again before rendering

### Example FE validation messages

- `Response cannot be empty`
- `Response is too long`
- `Please enter a valid response`

---

## 17. Security and RBAC

1. Never trust advisorId from client payload; derive it from authenticated session
2. Always filter by current advisor ownership in queries
3. Sanitize free-text fields on input and output
4. Avoid returning hidden/moderated feedback unless staff-only endpoint
5. Log response creation/update in audit trail
6. Apply rate limiting for response submission if abuse risk exists

---

## 18. Notification Rules

### Recommended notifications

#### When Startup submits feedback

Send in-app notification to Advisor:

- title: `New feedback received`
- body: `A startup has submitted feedback for one of your completed sessions.`

#### When Advisor responds to feedback

Optional notify Startup:

- title: `Advisor responded to your feedback`
- body: `Your advisor has responded to your review.`

Notification settings should respect user preferences if the system already supports them.

---

## 19. Audit Log Recommendations

Log at least these events:

- advisor_feedback_viewed (optional aggregate event)
- advisor_feedback_response_created
- advisor_feedback_response_updated
- advisor_feedback_response_hidden (if moderation applies)

Minimal audit fields:

- actor_id
- actor_role
- target_feedback_id
- action
- timestamp
- metadata summary

---

## 20. Empty State and Error Handling

### Empty state

Show when advisor has no visible feedback:

- title: `No feedback yet`
- helper text: `Ratings and written reviews will appear after completed consulting sessions and submitted startup feedback.`

### Access denied

- show generic no-access message
- do not leak existence of hidden feedback items

### Server failure

- show retry UI
- preserve filters if possible

---

## 21. Suggested API Error Mapping

- `400 Bad Request` → invalid filters / invalid response content
- `401 Unauthorized` → not logged in
- `403 Forbidden` → feedback does not belong to advisor or action not allowed
- `404 Not Found` → feedback item not found
- `409 Conflict` → response locked or business rule conflict
- `500 Internal Server Error` → unexpected processing failure

---

## 22. Analytics Recommendations

Optional product analytics events:

- `advisor_feedback_page_viewed`
- `advisor_feedback_filter_changed`
- `advisor_feedback_detail_opened`
- `advisor_feedback_response_started`
- `advisor_feedback_response_submitted`

---

## 23. Performance Notes

For MVP, summary may be aggregated on read.

For scale, consider:

- materialized summary snapshot
- background recompute after feedback create/update/hide events
- indexed filtering by advisor_id, rating, created_at, visibility_status

Recommended DB indexes:

- `(advisor_id, visibility_status, created_at desc)` on `advisor_feedback`
- `(session_id)` unique on `advisor_feedback` if one feedback per session
- `(feedback_id)` unique on `advisor_feedback_response` if one response per feedback

---

## 24. Suggested Prisma-style Model Draft

```prisma
model ConsultingSession {
  id                String   @id @default(cuid())
  startupId         String
  advisorId         String
  topic             String?
  status            String
  scheduledStartAt  DateTime?
  completedAt       DateTime?

  feedback          AdvisorFeedback?
}

model AdvisorFeedback {
  id                String   @id @default(cuid())
  sessionId         String   @unique
  startupId         String
  advisorId         String
  rating            Int
  comment           String?
  visibilityStatus  String   @default("VISIBLE")
  moderationStatus  String   @default("NONE")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  submittedAt       DateTime @default(now())

  session           ConsultingSession @relation(fields: [sessionId], references: [id])
  response          AdvisorFeedbackResponse?

  @@index([advisorId, visibilityStatus, createdAt])
}

model AdvisorFeedbackResponse {
  id           String   @id @default(cuid())
  feedbackId   String   @unique
  advisorId    String
  responseText String
  editedCount  Int      @default(0)
  isLocked     Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  feedback     AdvisorFeedback @relation(fields: [feedbackId], references: [id])
}
```

---

## 25. Acceptance Criteria

### Core summary/list

1. Advisor can open Feedback page and view only their own feedback
2. System shows average rating, total reviews, and rating breakdown
3. System displays feedback list with rating and session context
4. System supports pagination, filtering, and sorting
5. If no feedback exists, system shows empty state
6. Hidden/invalid feedback is not shown in normal advisor page

### Response feature

7. Advisor can respond to a visible feedback item if response is enabled
8. Invalid response content is rejected with validation message
9. Response is saved and visible on the feedback item after success
10. Unauthorized advisor cannot respond to another advisor’s feedback

---

## 26. Manual Test Checklist

### Summary and list

- advisor with no feedback → empty state
- advisor with multiple feedback items → correct average and counts
- rating breakdown matches list data
- filter by 5 stars only
- sort by newest and oldest
- pagination behaves correctly

### Authorization

- advisor A cannot access advisor B feedback item by ID
- hidden feedback item is not returned in list

### Response flow

- create response successfully
- reject empty response
- reject over-length response
- update response if editing is allowed
- reject response when locked

### Data integrity

- only completed sessions generate feedback records
- duplicate feedback for same session is blocked
- dashboard average and feedback page average are consistent

---

## 27. Recommended Delivery Order

### Phase 1

- backend read endpoints
- feedback summary page
- feedback list page with filters/sort
- empty/error/loading states

### Phase 1.5

- response to feedback
- response edit policy
- startup notification on response

### Phase 2

- moderation labels / hidden feedback handling UI
- trend charts
- public profile summary reuse from same aggregated source

---

## 28. Final Implementation Notes

1. Treat `View Feedback & Rating Summary` as the official must-have feature.
2. Treat `Respond to Feedback` as a supported detailed FR feature that can be enabled immediately or shortly after.
3. Reuse the same aggregation source for:
   - Advisor Dashboard average rating
   - Advisor Feedback page summary
   - Startup-side Advisor Profile & Rating view
4. Keep the source of truth on the backend. FE must not calculate authoritative averages from partial pages.
5. Only valid visible feedback from completed sessions should influence summary statistics.

---

## 29. Suggested Folder Structure

```txt
app/
  advisor/
    feedback/
      page.tsx

components/
  advisor/
    feedback/
      advisor-feedback-summary.tsx
      advisor-rating-breakdown.tsx
      advisor-feedback-filters.tsx
      advisor-feedback-list.tsx
      advisor-feedback-card.tsx
      advisor-feedback-detail-drawer.tsx
      advisor-feedback-response-form.tsx
      advisor-feedback-empty-state.tsx

server/
  advisor-feedback/
    advisor-feedback.controller.ts
    advisor-feedback.service.ts
    advisor-feedback.repository.ts
    advisor-feedback.mapper.ts
    advisor-feedback.validator.ts
```

