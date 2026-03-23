# AISEP - Advisor Consulting Schedule & Request Handling Implementation Spec

## 1. Purpose

This document defines the implementation plan for the **Advisor consulting schedule and request handling** domain in AISEP.

It covers these Advisor use cases:
- **UC-108 - Manage Consulting Schedule**
- **UC-109 - Accept / Reject Consulting Request**
- **UC-110 - View Consulting Schedule Request**
- **UC-111 - Propose / Confirm Consulting Time**
- **UC-112 - Reschedule / Cancel Appointment**

It should align with these advisor screens:
- `Incoming Consulting Requests`
- `Request Details`
- `My Consultings`
- `Session / Meeting`
- `Confirm Schedule (Advisor)`
- `Set Availability / Time Slots` (adjacent support screen)

## 2. Scope

This feature is the Advisor-side operational flow for incoming consulting requests and ongoing consulting sessions.

### Included in scope
- View incoming requests assigned to the current advisor
- View consulting request detail
- Accept a request
- Reject a request with reason
- Propose alternative time slots
- Confirm final consulting time
- View ongoing and past consultings
- Reschedule a scheduled appointment when policy allows
- Cancel a scheduled appointment when policy allows
- Show consulting request/session status and timeline
- Notify related users when important actions happen
- Show weekly/upcoming schedule on advisor side

### Out of scope
- Startup-side creation and editing of consulting requests
- Advisor consultation report authoring
- Feedback/rating submission and response
- Earnings/payout logic
- Video meeting provider integration details
- Operation Staff dispute resolution workflows

## 3. Why this module matters

This module is the bridge between:
- the Startup-side consulting request flow
- the Advisor workspace
- the later report submission flow

Without this module, the advisor cannot operationally respond to a request, finalize schedule, or manage appointment changes.

## 4. Source alignment and modeling note

The SRS explicitly defines:
- advisor schedule viewing
- advisor accept request
- advisor reject request
- advisor request/status lifecycle
- advisor confirm/propose/reschedule/cancel as separate use cases or screen-level capabilities

However, the SRS text is more detailed for some actions than others. Because of that, this spec includes a few **implementation assumptions** to make the workflow complete and codeable.

These assumptions are marked clearly and should be validated later against BA decisions if needed.

## 5. Main Business Rules to honor

The implementation must follow these core consulting rules:
- Consulting request statuses follow: `Requested -> Accepted/Rejected -> Scheduled -> Completed/Cancelled`
- Startup can only update/cancel the request before Advisor response
- Consulting sessions require confirmed schedules before they can proceed
- Requests are auto-cancelled if the advisor does not accept/reject within a configurable time window
- Advisors can propose alternative time slots if the initial schedule conflicts
- Rejected consulting requests must include a rejection reason
- Role-based access control must restrict data to the owner advisor only
- Reminder notifications should only be sent for confirmed upcoming schedules

## 6. Product / Domain boundary

This module belongs to the **consulting domain**.

### Reads from
- advisor profile
- startup profile summary
- consulting request
- preferred time slots
- schedule confirmation state
- advisor availability
- notifications

### Writes to
- consulting request status
- request timeline / audit trail
- selected scheduled time
- advisor confirmation state
- cancellation / reschedule metadata
- notification records

## 7. Route strategy

Recommended routes:

- `/advisor/consulting/requests`
- `/advisor/consulting/requests/[requestId]`
- `/advisor/consulting`
- `/advisor/consulting/[sessionId]`
- `/advisor/consulting/[sessionId]/confirm`
- `/advisor/availability`

Optional modal-based routes if preferred:
- request detail may open as drawer/modal from list
- accept/reject/propose actions may be nested actions inside detail page

## 8. High-level UX structure

### Screen A - Incoming Consulting Requests
Purpose:
- show new/pending requests requiring advisor action

Content:
- request cards or table
- startup summary
- request objective summary
- preferred format
- preferred time slots preview
- status badge
- submitted time
- expire-at time if pending
- CTA: View Details

Recommended tabs:
- `Pending`
- `Accepted`
- `Scheduled`
- `Completed`
- `Cancelled`
- `Rejected`

### Screen B - Request Details
Purpose:
- provide full request information and decision actions

Content:
- startup basic info
- request objective / scope / notes
- requested format
- preferred time slots
- current status
- request timeline
- action area

Available actions by state:
- `Requested`: Accept, Reject, Propose Alternative Time
- `Accepted`: Confirm Time or continue negotiation
- `Scheduled`: View session, Reschedule, Cancel
- `Rejected/Cancelled/Completed`: view-only

### Screen C - My Consultings
Purpose:
- show ongoing and historical consultings

Content:
- session list
- date/time
- startup name
- current status
- confirmation state
- link to session detail

### Screen D - Session / Meeting
Purpose:
- display final scheduled session details and any allowed next actions

Content:
- meeting date/time
- startup info
- request summary
- confirmation status by both sides
- reminder status (optional internal field)
- action buttons depending on status

### Screen E - Confirm Schedule (Advisor)
Purpose:
- allow advisor to explicitly confirm the final agreed schedule

Content:
- final selected slot
- timezone-aware display
- confirmation CTA
- optional reschedule CTA if still allowed

## 9. Domain model overview

Use two closely related entities rather than trying to force everything into one row.

### 9.1 ConsultingRequest
Represents the business request from startup to advisor.

Suggested fields:
- `id`
- `startupId`
- `advisorId`
- `objective`
- `scope`
- `preferredFormat`
- `additionalNotes`
- `status`
- `submittedAt`
- `advisorRespondedAt`
- `acceptedAt`
- `rejectedAt`
- `rejectionReason`
- `cancelledAt`
- `cancelledBy`
- `cancelReason`
- `expiresAt`
- `currentNegotiationRound`
- `createdAt`
- `updatedAt`

### 9.2 ConsultingTimeSlotProposal
Represents proposed slots in the negotiation stage.

Suggested fields:
- `id`
- `consultingRequestId`
- `proposedBy` (`STARTUP` | `ADVISOR` | `SYSTEM`)
- `startAt`
- `endAt`
- `timezone`
- `status` (`PROPOSED` | `ACCEPTED` | `DECLINED` | `SUPERSEDED`)
- `note`
- `createdAt`

### 9.3 ConsultingSession
Represents the confirmed operational session after a final slot is selected.

Suggested fields:
- `id`
- `consultingRequestId`
- `startupId`
- `advisorId`
- `scheduledStartAt`
- `scheduledEndAt`
- `timezone`
- `status`
- `startupConfirmedAt`
- `advisorConfirmedAt`
- `confirmedAt`
- `rescheduledFromSessionId` (optional)
- `meetingMode`
- `meetingLink` (optional)
- `cancelledAt`
- `cancelledBy`
- `cancelReason`
- `completedAt`
- `createdAt`
- `updatedAt`

### 9.4 ConsultingActivityLog
Immutable audit/timeline record.

Suggested fields:
- `id`
- `consultingRequestId`
- `consultingSessionId` (nullable)
- `actorType`
- `actorId`
- `actionType`
- `fromStatus`
- `toStatus`
- `metadataJson`
- `createdAt`

## 10. Status model

### 10.1 Request status
Use a request status aligned with BR-74.

```ts
export type ConsultingRequestStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
```

### 10.2 Session status
Use a session-specific operational status.

```ts
export type ConsultingSessionStatus =
  | 'PENDING_CONFIRMATION'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'IN_DISPUTE'
```

### 10.3 Confirmation state

```ts
export type ScheduleConfirmationState = {
  startupConfirmedAt: string | null
  advisorConfirmedAt: string | null
  fullyConfirmed: boolean
}
```

### Meaning
- `REQUESTED`: newly created by startup, advisor has not responded
- `ACCEPTED`: advisor accepted the request, but final schedule is not fully confirmed yet
- `REJECTED`: advisor declined the request with reason
- `SCHEDULED`: final time selected and confirmed enough to create an operational session
- `COMPLETED`: session finished and closed
- `CANCELLED`: request/session cancelled

## 11. State transition rules

### 11.1 Request lifecycle

```text
REQUESTED
  -> ACCEPTED
  -> REJECTED
  -> CANCELLED (timeout/system or allowed user action)

ACCEPTED
  -> SCHEDULED
  -> CANCELLED

SCHEDULED
  -> COMPLETED
  -> CANCELLED

REJECTED / CANCELLED / COMPLETED
  -> terminal states
```

### 11.2 Important assumptions
- Accepting a request does **not necessarily** mean the final session is already confirmed.
- A request should move to `SCHEDULED` only when a final slot is chosen and required confirmations are satisfied.
- If the product wants a simplified model, `Accept` may directly choose a preferred slot and create a pending confirmation session.

## 12. Core scenarios

## 12.1 View incoming requests
1. Advisor opens `/advisor/consulting/requests`
2. System validates authenticated user and advisor role
3. System retrieves requests where `advisorId = currentAdvisorId`
4. System applies supported tabs/filters/sorting
5. System displays request cards/list
6. If none exist, show empty state

## 12.2 View request details
1. Advisor opens a request detail page
2. System validates request ownership
3. System retrieves:
   - request information
   - startup summary
   - preferred time slots
   - timeline/activity log
   - current decision actions
4. System displays all detail sections

## 12.3 Accept request
1. Advisor opens a `REQUESTED` request
2. Advisor clicks `Accept`
3. System validates:
   - advisor owns request
   - request status is still `REQUESTED`
   - request is not expired / auto-cancelled
4. System updates request status to `ACCEPTED`
5. System records `advisorRespondedAt` and `acceptedAt`
6. System writes audit/timeline log
7. System sends notifications to startup
8. UI refreshes and shows success message

## 12.4 Reject request
1. Advisor opens a `REQUESTED` request
2. Advisor clicks `Reject`
3. System shows rejection reason input
4. Advisor enters reason and confirms
5. System validates:
   - advisor owns request
   - request is rejectable
   - rejection reason is non-empty and valid
6. System updates status to `REJECTED`
7. System stores rejection reason and timestamps
8. System writes audit/timeline log
9. System sends notifications to startup
10. UI refreshes and shows success message

## 12.5 Propose alternative time
1. Advisor opens request detail
2. Advisor reviews startup preferred slots
3. If none fit, advisor clicks `Propose Time`
4. Advisor selects 1..N alternative slots
5. System validates slot format and overlap policy
6. System stores new `ConsultingTimeSlotProposal` rows with `proposedBy = ADVISOR`
7. System writes timeline log
8. System notifies startup
9. Request remains in `ACCEPTED` or negotiation state until final selection is made

## 12.6 Confirm final schedule
1. A final slot is selected through negotiation
2. Advisor opens confirm screen or session detail
3. Advisor clicks `Confirm Schedule`
4. System validates:
   - request belongs to advisor
   - request is in acceptable pre-scheduled state
   - selected slot is still valid
5. System records `advisorConfirmedAt`
6. If both parties are confirmed, system:
   - creates/updates `ConsultingSession`
   - sets request status to `SCHEDULED`
   - sets session status to `SCHEDULED`
   - sets `confirmedAt`
7. System writes audit/timeline log
8. System sends schedule confirmation notifications and later reminders

## 12.7 Reschedule appointment
1. Advisor opens a scheduled session
2. Advisor clicks `Reschedule`
3. System validates policy:
   - session is currently reschedulable
   - current time is before policy cutoff
   - advisor owns the session
4. Advisor proposes new slot(s)
5. System stores new proposal round
6. Existing session moves back to pending confirmation flow or keeps historical scheduled slot until new slot is confirmed
7. Timeline log is written
8. Startup is notified

## 12.8 Cancel appointment
1. Advisor opens a scheduled or still-active request/session
2. Advisor clicks `Cancel`
3. System shows confirmation dialog and reason field if policy requires
4. System validates cancellation eligibility
5. System updates request/session status to `CANCELLED`
6. System stores cancel metadata
7. System writes timeline log
8. System sends notification to startup

## 13. Scheduling model recommendation

To keep the implementation practical, use a **two-layer schedule model**:

### Layer 1 - Negotiation slots
Used while request is still being negotiated.
- startup proposed slots
- advisor proposed slots
- accepted slot candidate

### Layer 2 - Confirmed session
Created only when final slot is chosen and confirmations are satisfied.

This avoids mixing temporary slot negotiation data with the final session object.

## 14. Availability integration

The advisor side also has `Set Availability / Time Slots` in the screen list.

Recommended behavior:
- advisor availability is a supportive dataset, not a hard dependency for phase 1
- when proposing or confirming a slot, the system may warn if the chosen slot conflicts with saved availability
- for phase 1, availability can be advisory; strict conflict enforcement can be added later

## 15. UI rules by status

### If status = `REQUESTED`
UI should show:
- Accept button
- Reject button
- Propose Alternative Time button
- expiry countdown if relevant

### If status = `ACCEPTED`
UI should show:
- proposed slot negotiation history
- confirm schedule action when a final slot exists
- propose another slot if negotiation remains open

### If status = `SCHEDULED`
UI should show:
- final confirmed date/time
- startup confirmation status
- advisor confirmation status
- reschedule button if allowed
- cancel button if allowed
- session detail link

### If status = `REJECTED`
UI should show:
- rejection reason
- timeline only
- read-only state

### If status = `CANCELLED`
UI should show:
- cancellation metadata
- read-only state

### If status = `COMPLETED`
UI should show:
- session summary
- link to report flow
- read-only state for schedule actions

## 16. Suggested frontend structure

```text
app/
  advisor/
    consulting/
      requests/
        page.tsx
        [requestId]/page.tsx
      page.tsx
      [sessionId]/page.tsx
      [sessionId]/confirm/page.tsx
    availability/
      page.tsx

components/
  advisor/consulting/
    consulting-request-list.tsx
    consulting-request-card.tsx
    consulting-request-filters.tsx
    consulting-request-detail.tsx
    request-status-badge.tsx
    accept-request-dialog.tsx
    reject-request-dialog.tsx
    propose-time-dialog.tsx
    confirm-schedule-panel.tsx
    session-detail-card.tsx
    reschedule-dialog.tsx
    cancel-session-dialog.tsx
    consulting-timeline.tsx
```

## 17. Suggested form contracts

### 17.1 Reject request

```ts
export type RejectConsultingRequestInput = {
  requestId: string
  rejectionReason: string
}
```

Validation:
- required
- trimmed length >= 10 recommended
- max length e.g. 500

### 17.2 Propose time

```ts
export type ProposedSlotInput = {
  startAt: string
  endAt: string
  timezone: string
  note?: string
}

export type ProposeConsultingTimeInput = {
  requestId: string
  slots: ProposedSlotInput[]
}
```

Validation:
- at least 1 slot
- end must be greater than start
- max slots per proposal round should be configurable, e.g. 3
- slot must be in the future
- timezone required

### 17.3 Confirm schedule

```ts
export type ConfirmConsultingScheduleInput = {
  requestId: string
  selectedSlotId: string
}
```

Validation:
- selected slot must belong to request
- selected slot must not be superseded/declined
- request must still be confirmable

### 17.4 Reschedule

```ts
export type RescheduleConsultingSessionInput = {
  sessionId: string
  slots: ProposedSlotInput[]
  reason?: string
}
```

### 17.5 Cancel appointment

```ts
export type CancelConsultingSessionInput = {
  sessionId: string
  reason?: string
}
```

## 18. API proposal

Base path: `/api/v1/advisor/consulting`

### Request listing
- `GET /requests`
  - query: `status`, `search`, `page`, `pageSize`, `sortBy`

### Request details
- `GET /requests/:requestId`

### Accept request
- `POST /requests/:requestId/accept`

### Reject request
- `POST /requests/:requestId/reject`

### Propose time
- `POST /requests/:requestId/propose-time`

### Confirm schedule
- `POST /requests/:requestId/confirm-schedule`

### Session listing
- `GET /sessions`
  - query: `status`, `from`, `to`, `page`, `pageSize`

### Session details
- `GET /sessions/:sessionId`

### Reschedule session
- `POST /sessions/:sessionId/reschedule`

### Cancel session
- `POST /sessions/:sessionId/cancel`

### Optional availability helper
- `GET /availability`

## 19. Example response shapes

### 19.1 Request list item

```json
{
  "id": "req_123",
  "status": "REQUESTED",
  "submittedAt": "2026-03-22T10:00:00Z",
  "expiresAt": "2026-03-24T10:00:00Z",
  "startup": {
    "id": "startup_1",
    "displayName": "NovaAI",
    "logoUrl": null
  },
  "objective": "Need help refining go-to-market strategy",
  "preferredFormat": "ONLINE",
  "preferredSlotsPreview": [
    {
      "startAt": "2026-03-25T08:00:00Z",
      "endAt": "2026-03-25T09:00:00Z",
      "timezone": "Asia/Ho_Chi_Minh"
    }
  ]
}
```

### 19.2 Request detail

```json
{
  "id": "req_123",
  "status": "ACCEPTED",
  "objective": "Need help refining go-to-market strategy",
  "scope": "MVP launch, initial channel selection, pricing hypothesis",
  "preferredFormat": "ONLINE",
  "additionalNotes": "Prefer sessions in the morning",
  "startup": {
    "id": "startup_1",
    "displayName": "NovaAI",
    "industry": "SaaS",
    "stage": "SEED"
  },
  "slotProposals": [
    {
      "id": "slot_1",
      "proposedBy": "STARTUP",
      "startAt": "2026-03-25T08:00:00Z",
      "endAt": "2026-03-25T09:00:00Z",
      "timezone": "Asia/Ho_Chi_Minh",
      "status": "PROPOSED"
    }
  ],
  "confirmation": {
    "startupConfirmedAt": null,
    "advisorConfirmedAt": null,
    "fullyConfirmed": false
  },
  "timeline": []
}
```

## 20. Backend service responsibilities

### AdvisorConsultingQueryService
- list requests
- get request details
- list sessions
- get session details

### AdvisorConsultingCommandService
- accept request
- reject request
- propose time
- confirm schedule
- reschedule session
- cancel session

### ConsultingPolicyService
- can advisor accept request?
- can advisor reject request?
- can advisor propose slot?
- can advisor confirm schedule?
- can advisor reschedule?
- can advisor cancel?
- has request expired?

### ConsultingNotificationService
- notify startup when request accepted
- notify startup when request rejected
- notify startup when new advisor slot is proposed
- notify both sides when schedule is confirmed
- notify both sides when session is cancelled/rescheduled
- integrate with reminder scheduler for confirmed sessions

## 21. Authorization rules

For every advisor consulting endpoint:
- user must be authenticated
- user role must be `ADVISOR`
- request/session must belong to current advisor
- server-side RBAC is mandatory even if UI hides actions

Recommended enforcement:
- load entity by `id`
- compare `entity.advisorId === currentAdvisorId`
- otherwise return forbidden/not-found based on API policy

## 22. Validation rules

### Accept request
- request exists
- request belongs to advisor
- request status is `REQUESTED`
- request has not expired or been auto-cancelled

### Reject request
- same as accept
- rejection reason required

### Propose time
- request exists and belongs to advisor
- request is `REQUESTED` or `ACCEPTED`
- every slot is in the future
- no invalid slot overlap inside same payload
- optional conflict check against advisor availability

### Confirm schedule
- request belongs to advisor
- selected slot exists and belongs to request
- request is in a schedulable state
- schedule has not already been locked/cancelled

### Reschedule
- session exists and belongs to advisor
- session status is `SCHEDULED` or `PENDING_CONFIRMATION` if policy allows
- action occurs before configurable cutoff

### Cancel
- request/session belongs to advisor
- state is cancellable
- reason may be required by policy

## 23. Empty states and edge cases

### Empty states
- no incoming requests
- no scheduled consultings
- no past consultings

### Edge cases
- startup cancels before advisor acts
- request expires automatically before advisor opens detail page
- two browser tabs try to accept/reject at the same time
- advisor tries to confirm a slot already superseded by newer proposal
- scheduled session is already cancelled by startup or system
- user timezone differs from stored timezone
- reminder already sent for an outdated schedule after reschedule

## 24. Auto-cancel policy

The SRS says pending consulting requests are automatically cancelled if not accepted or rejected within an admin-configurable timeframe.

Recommended implementation:
- store `expiresAt` when request is created
- background job periodically finds `REQUESTED` requests where `expiresAt < now`
- transition them to `CANCELLED`
- write system-generated activity log
- notify both sides if needed

## 25. Notification plan

Minimum notifications:
- request received by advisor
- request accepted
- request rejected with reason summary
- alternative time proposed
- schedule confirmed
- session rescheduled
- session cancelled
- schedule reminder before confirmed session

Notification targets:
- startup
- advisor

Notification channels:
- in-app required
- email optional by preference/config

## 26. Timeline / audit trail recommendation

Every meaningful action should write to `ConsultingActivityLog`.

Action examples:
- `REQUEST_CREATED`
- `REQUEST_ACCEPTED`
- `REQUEST_REJECTED`
- `ADVISOR_PROPOSED_TIME`
- `STARTUP_PROPOSED_TIME`
- `SCHEDULE_CONFIRMED_BY_ADVISOR`
- `SCHEDULE_CONFIRMED_BY_STARTUP`
- `SESSION_SCHEDULED`
- `SESSION_RESCHEDULED`
- `SESSION_CANCELLED`
- `REQUEST_AUTO_CANCELLED`

This timeline is useful for:
- UI history display
- debugging
- Operation Staff review
- future dispute handling

## 27. Suggested database constraints

- `consulting_request.status` restricted to enum
- only one active request per startup/advisor pair may be policy-based if BA wants, otherwise allow many
- `rejection_reason` required when status = `REJECTED`
- `confirmedAt` only set when both confirmations are satisfied
- `scheduledStartAt < scheduledEndAt`
- index on `(advisor_id, status, submitted_at)`
- index on `(advisor_id, scheduled_start_at)`
- index on `(consulting_request_id, created_at)` for timeline and slot proposals

## 28. Pseudocode

### 28.1 Accept request

```ts
async function acceptConsultingRequest(advisorId: string, requestId: string) {
  const request = await requestRepo.findById(requestId)

  if (!request || request.advisorId !== advisorId) throw new ForbiddenError()
  if (request.status !== 'REQUESTED') throw new BusinessRuleError('REQUEST_NOT_ACCEPTABLE')
  if (request.expiresAt && request.expiresAt < new Date()) {
    await autoCancelExpiredRequest(request)
    throw new BusinessRuleError('REQUEST_EXPIRED')
  }

  request.status = 'ACCEPTED'
  request.advisorRespondedAt = new Date()
  request.acceptedAt = new Date()

  await requestRepo.save(request)
  await activityLogRepo.insert({
    consultingRequestId: request.id,
    actorType: 'ADVISOR',
    actorId: advisorId,
    actionType: 'REQUEST_ACCEPTED',
    fromStatus: 'REQUESTED',
    toStatus: 'ACCEPTED'
  })

  await notificationService.notifyStartupRequestAccepted(request)

  return request
}
```

### 28.2 Reject request

```ts
async function rejectConsultingRequest(advisorId: string, input: RejectConsultingRequestInput) {
  const request = await requestRepo.findById(input.requestId)

  if (!request || request.advisorId !== advisorId) throw new ForbiddenError()
  if (request.status !== 'REQUESTED') throw new BusinessRuleError('REQUEST_NOT_REJECTABLE')
  if (!input.rejectionReason?.trim()) throw new ValidationError('REJECTION_REASON_REQUIRED')

  request.status = 'REJECTED'
  request.advisorRespondedAt = new Date()
  request.rejectedAt = new Date()
  request.rejectionReason = input.rejectionReason.trim()

  await requestRepo.save(request)
  await activityLogRepo.insert({
    consultingRequestId: request.id,
    actorType: 'ADVISOR',
    actorId: advisorId,
    actionType: 'REQUEST_REJECTED',
    fromStatus: 'REQUESTED',
    toStatus: 'REJECTED',
    metadataJson: { rejectionReason: request.rejectionReason }
  })

  await notificationService.notifyStartupRequestRejected(request)

  return request
}
```

### 28.3 Confirm schedule

```ts
async function confirmConsultingSchedule(advisorId: string, input: ConfirmConsultingScheduleInput) {
  const request = await requestRepo.findByIdWithSlots(input.requestId)
  if (!request || request.advisorId !== advisorId) throw new ForbiddenError()
  if (!['ACCEPTED', 'REQUESTED'].includes(request.status)) {
    throw new BusinessRuleError('REQUEST_NOT_CONFIRMABLE')
  }

  const slot = request.slotProposals.find(x => x.id === input.selectedSlotId)
  if (!slot) throw new ValidationError('SLOT_NOT_FOUND')

  const session = await sessionRepo.upsertFromConfirmedSlot({
    request,
    slot,
    advisorConfirmedAt: new Date()
  })

  if (session.startupConfirmedAt && session.advisorConfirmedAt) {
    request.status = 'SCHEDULED'
    session.status = 'SCHEDULED'
    session.confirmedAt = new Date()
  } else {
    session.status = 'PENDING_CONFIRMATION'
  }

  await requestRepo.save(request)
  await sessionRepo.save(session)
  await activityLogRepo.insert({
    consultingRequestId: request.id,
    consultingSessionId: session.id,
    actorType: 'ADVISOR',
    actorId: advisorId,
    actionType: 'SCHEDULE_CONFIRMED_BY_ADVISOR'
  })

  await notificationService.notifyScheduleUpdated(request, session)

  return { request, session }
}
```

## 29. API error mapping suggestion

Use consistent application messages.

Examples:
- success -> MSG001
- invalid input -> MSG002
- access denied / invalid action by state -> MSG005
- no data -> MSG006
- confirmation prompt -> MSG007
- system error -> MSG008

## 30. Acceptance criteria

### UC-108 Manage Consulting Schedule
- advisor can view own requests and sessions only
- advisor can filter list by status
- advisor can open detail page from list
- empty state is shown when no records exist

### UC-109 Accept / Reject Consulting Request
- advisor can accept a pending request
- advisor can reject a pending request with mandatory reason
- action is blocked for invalid status
- startup receives notification after action

### UC-110 View Consulting Schedule Request
- advisor can view request details including startup summary and preferred slots
- unauthorized advisor cannot access another advisor’s request

### UC-111 Propose / Confirm Consulting Time
- advisor can submit alternative slots
- advisor can confirm schedule for a selected valid slot
- request moves to `SCHEDULED` only when final confirmation requirements are met

### UC-112 Reschedule / Cancel Appointment
- advisor can reschedule only when policy allows
- advisor can cancel only when policy allows
- cancellation/reschedule is recorded in timeline
- both sides are notified when session changes

## 31. Test checklist

### Unit tests
- policy checks for each action by status
- reject requires reason
- request expiration handling
- confirm schedule only accepts valid slot
- reschedule/cancel eligibility rules

### Integration tests
- advisor can only access own requests
- accept changes status and writes activity log
- reject changes status and stores reason
- confirm schedule creates/updates session correctly
- reschedule creates negotiation round and notifications
- cancel updates status and prevents reminder sending for old schedule

### Manual QA scenarios
- pending request list loads correctly
- advisor accepts request from detail page
- advisor rejects with reason
- advisor proposes alternative slots
- advisor confirms final schedule
- startup confirmation arrives later and session becomes fully scheduled
- advisor reschedules a session
- advisor cancels a session
- expired request becomes non-actionable
- mobile/tablet responsiveness for list and detail pages

## 32. Recommended implementation order

1. Read APIs and list/detail UI
2. Accept request
3. Reject request
4. Slot proposal model + propose time UI
5. Confirm schedule flow
6. Session list/detail UI
7. Reschedule flow
8. Cancel flow
9. Notifications
10. Expiry job and reminder integration

## 33. Clean Architecture mapping suggestion

### Domain
- entities: ConsultingRequest, ConsultingSession, ConsultingTimeSlotProposal
- enums: request/session status
- policies: ConsultingPolicyService

### Application
- use cases:
  - ListAdvisorConsultingRequests
  - GetAdvisorConsultingRequestDetail
  - AcceptConsultingRequest
  - RejectConsultingRequest
  - ProposeConsultingTime
  - ConfirmConsultingSchedule
  - ListAdvisorSessions
  - GetAdvisorSessionDetail
  - RescheduleConsultingSession
  - CancelConsultingSession

### Infrastructure
- repositories
- DB models
- notification adapters
- scheduler / background jobs

### Presentation
- advisor consulting pages
- dialogs/forms
- status badges / timeline UI

## 34. Final implementation note

This module should be treated as the **operational heart** of the Advisor workspace.

After advisor onboarding/profile and KYC are in place, this is the next most important domain because it enables the advisor to actually participate in the platform’s core consulting workflow.

The recommended first-release principle is:
- keep status flow explicit
- keep negotiation slots separate from final session data
- log every meaningful action
- enforce ownership and state rules server-side
- keep scheduling clear before making it fancy
