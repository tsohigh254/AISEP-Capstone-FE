# AISEP - Advisor Consulting Report Implementation Spec

## 1. Purpose

This document defines the implementation plan for the **Advisor consulting report** domain in AISEP.

It covers these Advisor use cases:
- **UC-113 - Manage Consulting Reports**
- **UC-114 - Create report**
- **UC-115 - Update report**
- **UC-116 - Upload attachments**
- **UC-117 - Delete report (if allowed)**
- **UC-118 - View report history**

It should align with these related screens:
- `Submit Consulting Report`
- `My Consultings`
- `Session / Meeting`
- advisor report list/detail screens implied by `Manage Consultation Reports`
- Startup-side `View Consulting Report` as the downstream consumer
- Operation Staff `Consulting Oversight` / `Validate consulting report completeness` as the downstream review flow

## 2. Scope

This feature is the Advisor-side flow for creating, editing, submitting, and maintaining consulting reports after a consulting session has been completed.

### Included in scope
- View list of report-eligible sessions and existing reports
- Create a consultation report for an eligible completed session
- Save report draft
- Edit report while policy allows
- Upload and manage report attachments
- Submit report for operational review/finalization
- View report detail and audit/history
- Soft-delete a report when policy allows
- Show report status, submission time, and latest review state
- Notify related users when the report is submitted or finalized

### Out of scope
- Startup-side report viewing UI details
- Feedback and rating submission
- Payment release / earnings payout logic
- Dispute resolution details
- Rich document editor or collaborative editing
- External e-signature workflow
- Blockchain verification for reports unless added later by policy

## 3. Why this module matters

This module is the completion proof of the advisor workflow.

Without it:
- a consulting session has no structured outcome record
- the startup cannot review the session summary and deliverables
- Operation Staff cannot validate completeness/compliance
- the platform cannot enforce report accountability for advisors

This module is also directly tied to trust and anti-abuse controls because fake or missing reports create operational and financial risk.

## 4. Source alignment and modeling note

The SRS explicitly states that:
- advisors manage consultation reports linked to completed sessions
- advisors can create and edit consultation reports
- advisors must submit advisory reports after each consultation session
- advisory reports must be reviewed/authenticated by Operation Staff before finalization
- Operation Staff monitor submitted consulting reports for completeness/compliance
- startups can view the consulting report after the session when a report is available

However, the SRS is more detailed for **manage/create/edit** than for **upload attachments**, **delete report**, and **view report history**.

Because of that, this spec adds a few **implementation assumptions** so the module can be coded cleanly end to end. Those assumptions are clearly marked.

## 5. Main Business Rules to honor

The implementation must honor these rules:
- Advisors must submit advisory reports after each consultation session.
- Advisory reports must be reviewed/authenticated by Operation Staff before finalization.
- Operation Staff monitor submitted consulting reports for completeness and compliance.
- Consulting request/session history must be maintained.
- Role-based access control must restrict report access to the owner advisor and authorized operational roles.
- Startup can only view a report if the linked session belongs to that startup and the report is available under policy.
- File uploads must follow configured allowed formats and validation.

### Implementation assumptions
- A report can only be created for a session owned by the current advisor.
- A report can only be created when the linked session is in an eligible post-session state, recommended: `COMPLETED`.
- Each session maps to at most one active advisor report record.
- A report can be saved as `DRAFT` before final submission.
- A report becomes immutable to the advisor after it is `FINALIZED`, except through a staff-driven revision workflow.
- Delete is only allowed for `DRAFT` reports or `NEEDS_REVISION` reports that have not been finalized, and should be a soft delete.

## 6. Product / Domain boundary

This module belongs to the **consulting delivery** domain.

### Reads from
- advisor account and profile
- consulting session
- startup summary for linked session
- prior report revisions/history
- uploaded file metadata
- operation review state
- notifications

### Writes to
- consultation report
- report status
- report history / audit trail
- report attachments
- review markers for Operation Staff
- notification records

## 7. Route strategy

Recommended routes:

- `/advisor/reports`
- `/advisor/reports/create?sessionId=:sessionId`
- `/advisor/reports/:reportId`
- `/advisor/reports/:reportId/edit`
- `/advisor/reports/:reportId/history`
- `/advisor/consulting/:sessionId/report`

Optional modal/drawer patterns:
- create report from `Session / Meeting`
- upload attachments inside create/edit page or in a side drawer
- history as a slide-over panel

## 8. High-level UX structure

### Screen A - Consultation Reports List
Purpose:
- show all reports owned by the current advisor
- show sessions that still require reports

Content:
- tabs: `Pending Report`, `Draft`, `Submitted`, `Needs Revision`, `Finalized`, `Archived`
- report/session summary cards or table
- startup name
- session date
- report status
- last updated time
- CTA: `Create`, `Open`, `Edit`, `View History`

Recommended empty states:
- no eligible sessions for reporting
- no reports yet
- no finalized reports yet

### Screen B - Create Report
Purpose:
- let advisor author a report for a completed session

Content:
- locked session summary header
- structured report form
- deliverables section
- attachments section
- draft save
- submit CTA

### Screen C - Edit Report
Purpose:
- update a draft or revision-requested report when policy allows

Content:
- current report data
- review remarks if staff requested changes
- attachment list
- save draft / resubmit actions

### Screen D - Report Detail
Purpose:
- show the current report in read-only detail form

Content:
- session info
- startup info
- report sections
- attachments
- status timeline
- staff review state
- audit summary

### Screen E - Report History
Purpose:
- show prior revisions and key report events

Content:
- version timeline
- event actor
- timestamp
- event type
- summary diff note
- open version snapshot action

## 9. Report lifecycle

Recommended report lifecycle:

- `NOT_CREATED`
- `DRAFT`
- `SUBMITTED`
- `UNDER_REVIEW`
- `NEEDS_REVISION`
- `FINALIZED`
- `DELETED` (soft deleted, internal only)

### Meanings
- `NOT_CREATED`: eligible session exists but no report record yet
- `DRAFT`: advisor started the report but has not submitted it
- `SUBMITTED`: advisor submitted report; awaiting staff pickup
- `UNDER_REVIEW`: staff is reviewing completeness/compliance
- `NEEDS_REVISION`: staff requested update or correction
- `FINALIZED`: report approved/authenticated and should be read-only to advisor
- `DELETED`: report removed under policy but still retained internally for audit

### Recommended transitions
- `NOT_CREATED -> DRAFT`
- `DRAFT -> SUBMITTED`
- `DRAFT -> DELETED`
- `SUBMITTED -> UNDER_REVIEW`
- `UNDER_REVIEW -> NEEDS_REVISION`
- `UNDER_REVIEW -> FINALIZED`
- `NEEDS_REVISION -> SUBMITTED`
- `NEEDS_REVISION -> DELETED` (policy-based, optional)

## 10. Session eligibility model

A consultation report must be tied to one and only one consulting session.

### Minimum eligibility rules
A session is report-eligible when:
- it belongs to the current advisor
- it is not cancelled
- it is in an eligible post-session state
- it does not already have another active report

### Recommended eligible session status
Use `COMPLETED` as the strict creation gate.

This is the cleanest rule because the SRS states:
- the advisor creates a report for a completed session
- the startup later views the report linked to a completed session

### Optional enhancement
If the product later adds a separate `CONDUCTED` execution stage, the system may allow draft creation in `CONDUCTED` but only allow submission in `COMPLETED`.

## 11. Report content model

The SRS does not fully prescribe the internal report fields, so the report should use a structured template instead of free-form only.

### Recommended report fields

#### 11.1 Identity / linkage
- `id`
- `advisorId`
- `startupId`
- `sessionId`
- `reportNumber` (optional human-readable code)

#### 11.2 Summary
- `title`
- `summary`
- `consultationObjective`
- `discussionOverview`

#### 11.3 Analysis / outcome
- `keyFindings`
- `advisorRecommendations`
- `identifiedRisks`
- `nextSteps`
- `priorityLevel` (`LOW | MEDIUM | HIGH`)

#### 11.4 Deliverables
- `deliverablesSummary`
- `deliverablesProvided` (array of items)
- `followUpRequired` (boolean)
- `followUpNotes`

#### 11.5 Operational metadata
- `status`
- `version`
- `draftSavedAt`
- `submittedAt`
- `finalizedAt`
- `lastEditedAt`
- `lastEditedBy`
- `reviewStatus`
- `reviewRemarkSummary`
- `deletedAt`
- `deletedBy`

#### 11.6 Attachments
- `attachments[]`

### Recommended required fields for submission
For `SUBMITTED`, require at least:
- linked completed session
- title
- summary
- key findings or discussion overview
- advisor recommendations
- next steps

Attachments should be optional unless later mandated by policy.

## 12. Domain model overview

Use a primary report entity plus attachment and history entities.

### 12.1 ConsultationReport
Suggested fields:
- `id`
- `sessionId`
- `advisorId`
- `startupId`
- `title`
- `summary`
- `consultationObjectiveSnapshot`
- `discussionOverview`
- `keyFindings`
- `advisorRecommendations`
- `identifiedRisks`
- `nextSteps`
- `deliverablesSummary`
- `followUpRequired`
- `followUpNotes`
- `status`
- `reviewStatus`
- `currentReviewCaseId` (optional)
- `version`
- `createdAt`
- `updatedAt`
- `draftSavedAt`
- `submittedAt`
- `finalizedAt`
- `deletedAt`

### 12.2 ConsultationReportAttachment
Suggested fields:
- `id`
- `reportId`
- `fileId` or `storageKey`
- `originalFileName`
- `mimeType`
- `fileSizeBytes`
- `attachmentType` (`DELIVERABLE | SUPPORTING_NOTE | IMAGE | OTHER`)
- `uploadedBy`
- `uploadedAt`
- `isDeleted`

### 12.3 ConsultationReportHistory
Suggested fields:
- `id`
- `reportId`
- `version`
- `eventType`
- `actorType`
- `actorId`
- `summary`
- `snapshotJson`
- `createdAt`

### 12.4 ConsultationReportReview
Suggested fields:
- `id`
- `reportId`
- `reviewerId`
- `status` (`PENDING | UNDER_REVIEW | NEEDS_REVISION | APPROVED | REJECTED_INTERNAL`)
- `remark`
- `fieldRemarksJson`
- `reviewedAt`

## 13. Suggested status enums

```ts
export type ConsultationReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_REVISION'
  | 'FINALIZED'
  | 'DELETED'

export type ConsultationReportEventType =
  | 'CREATED'
  | 'DRAFT_SAVED'
  | 'UPDATED'
  | 'ATTACHMENT_UPLOADED'
  | 'ATTACHMENT_REMOVED'
  | 'SUBMITTED'
  | 'REVIEW_STARTED'
  | 'REVISION_REQUESTED'
  | 'FINALIZED'
  | 'DELETED'
```

## 14. Authorization rules

### Advisor permissions
Advisor can:
- list own reports
- create a report only for own eligible session
- edit own report while status allows
- upload/remove attachments on own editable report
- view own report history
- soft-delete own report only if policy allows

Advisor cannot:
- access reports of other advisors
- create reports for sessions not belonging to them
- edit finalized reports
- bypass staff review/finalization

### Startup permissions
Startup can:
- view the linked report only when the session belongs to them and the report is available under policy

Startup cannot:
- edit advisor reports
- view internal review remarks intended only for staff/advisor

### Operation Staff permissions
Operation Staff can:
- read submitted reports in oversight queue
- mark under review
- request revision
- approve/finalize or authenticate under policy
- view history and audit logs

## 15. Create flow

### Entry points
- from `Session / Meeting` when session is completed
- from `Consultation Reports` list by choosing an eligible session

### Main flow
1. Advisor opens report creation.
2. System validates that the session belongs to the advisor.
3. System validates that the session is completed and report-eligible.
4. System checks that no other active report already exists for the session.
5. System displays the structured create form.
6. Advisor enters report content and optionally uploads attachments.
7. Advisor clicks `Save Draft` or `Submit`.
8. System validates data according to the chosen action.
9. System creates the report record and writes history/audit logs.
10. If submitted, system changes status to `SUBMITTED` and queues it for operational review.
11. System shows success state and redirects to report detail.

### Validation rules
- advisor must be authenticated
- session must exist and belong to the current advisor
- session must be completed
- report must not already exist for the same session
- required fields must be present for submission
- attachment files must pass type/size validation

## 16. Update flow

### Editable statuses
Recommended editable statuses:
- `DRAFT`
- `NEEDS_REVISION`

### Main flow
1. Advisor opens an editable report.
2. System loads current report content and attachment metadata.
3. If the report is in `NEEDS_REVISION`, system shows review remarks.
4. Advisor updates fields and optionally changes attachments.
5. Advisor saves as draft or resubmits.
6. System validates content.
7. System stores the new version snapshot and increments version if needed.
8. System writes audit/history events.

### Update policy recommendation
- `Save Draft` should keep the same status if already `DRAFT`
- resubmitting `NEEDS_REVISION` should move back to `SUBMITTED`
- finalized reports are read-only

## 17. Attachment flow

This covers **UC-116 - Upload attachments**.

### Allowed attachment purpose
- supporting deliverables
- notes or templates
- screenshots / diagrams / exported material

### File rules
Recommended default rules:
- allowed formats: `pdf`, `doc`, `docx`, `png`, `jpg`, `jpeg`
- configurable max file size per file
- configurable max number of attachments per report
- virus / unsafe content scan where available

### Actions
- upload one or many files
- remove attachment before submission if editable
- replace attachment by deleting old + uploading new
- view/download attachment from report detail

### Storage model
Store binary files in object storage and save only metadata in the database.

### Validation
- report must belong to advisor
- report must be editable
- file type must be allowed
- size must not exceed config
- upload must succeed before report submission completes

## 18. Delete flow

This covers **UC-117 - Delete report (if allowed)**.

### Recommended delete policy
Allow delete only when:
- report belongs to advisor
- status is `DRAFT` or `NEEDS_REVISION`
- report has not been finalized
- no policy lock exists

### Why soft delete
Because consulting reports are operationally sensitive and tied to session history, deletion should not physically remove the record.

### Main flow
1. Advisor opens report detail.
2. Advisor clicks `Delete Report`.
3. System shows confirmation dialog.
4. System validates ownership and deletable status.
5. System marks report as `DELETED`, stores actor and timestamp, and hides it from normal advisor views.
6. System writes audit log.

## 19. History flow

This covers **UC-118 - View report history**.

### What history should show
- report created
- each draft save or edit
- attachments uploaded/removed
- submission time
- review started
- revision requested
- finalized
- deleted

### History data sources
- audit log
- report history snapshots
- attachment history events

### UX recommendation
Use a compact timeline sorted descending by newest first, with optional version snapshot viewer.

## 20. Relationship with Operation Staff oversight

The report module must integrate with the operational review queue.

### Required behavior
- submitted reports become visible to Operation Staff oversight
- staff can mark report under review
- staff can request revision with remarks
- staff can finalize/authenticate the report under policy

### Advisor-facing effect
- `SUBMITTED`: advisor sees waiting state
- `UNDER_REVIEW`: report locked from edit
- `NEEDS_REVISION`: advisor sees remarks and can edit/resubmit
- `FINALIZED`: advisor sees read-only final state

## 21. Relationship with Startup-side report viewing

Startup-side `View Consulting Report` depends on this module.

### Recommended visibility policy
Startup can view the report when:
- the linked session belongs to the startup
- report status is at least `SUBMITTED` or, more conservatively, `FINALIZED`

### Recommended default
Use `FINALIZED` for external visibility unless BA explicitly wants startups to see pre-finalized submitted reports.

This is safer and better aligned with operational review.

## 22. API proposal

### 22.1 List reports
`GET /api/v1/advisor/reports`

Query params:
- `status`
- `q`
- `page`
- `pageSize`
- `sortBy`
- `sortOrder`

Response includes:
- report summaries
- linked session summary
- startup summary
- pagination

### 22.2 Get report detail
`GET /api/v1/advisor/reports/:reportId`

Returns:
- report full content
- attachments
- review summary
- allowed actions

### 22.3 List report-eligible sessions
`GET /api/v1/advisor/reports/eligible-sessions`

Returns completed sessions that do not yet have an active report.

### 22.4 Create draft report
`POST /api/v1/advisor/reports`

Body example:
```json
{
  "sessionId": "ses_123",
  "title": "Go-to-market mentoring report",
  "summary": "We reviewed the startup's GTM assumptions and immediate priorities.",
  "discussionOverview": "Focus on ICP narrowing, CAC assumptions, and first channel experiments.",
  "keyFindings": "Positioning is broad and conversion assumptions are optimistic.",
  "advisorRecommendations": "Run 3 acquisition experiments and tighten ICP definition.",
  "identifiedRisks": "Weak channel attribution and unclear pricing test plan.",
  "nextSteps": "Founder to deliver experiment plan within 7 days.",
  "deliverablesSummary": "Experiment checklist and revised funnel assumptions.",
  "followUpRequired": true,
  "followUpNotes": "Recommend a follow-up in 2 weeks.",
  "action": "SAVE_DRAFT"
}
```

### 22.5 Update report
`PATCH /api/v1/advisor/reports/:reportId`

Body:
- partial editable fields
- optional `action`: `SAVE_DRAFT | RESUBMIT`

### 22.6 Submit report
`POST /api/v1/advisor/reports/:reportId/submit`

Behavior:
- validate completeness
- status -> `SUBMITTED`
- create review queue entry
- notify relevant users

### 22.7 Upload attachment
`POST /api/v1/advisor/reports/:reportId/attachments`

Multipart form-data:
- file
- `attachmentType`

### 22.8 Delete attachment
`DELETE /api/v1/advisor/reports/:reportId/attachments/:attachmentId`

### 22.9 Delete report
`DELETE /api/v1/advisor/reports/:reportId`

Soft delete only.

### 22.10 View history
`GET /api/v1/advisor/reports/:reportId/history`

### 22.11 Startup-side read endpoint
`GET /api/v1/startup/consultings/:sessionId/report`

## 23. Form schema recommendation

```ts
export type ConsultationReportForm = {
  sessionId: string
  title: string
  summary: string
  discussionOverview: string
  keyFindings: string
  advisorRecommendations: string
  identifiedRisks: string
  nextSteps: string
  deliverablesSummary: string
  followUpRequired: boolean
  followUpNotes?: string
}
```

### Recommended validation
- `sessionId` required
- `title` required, trimmed, max length policy-defined
- `summary` required for submission
- `advisorRecommendations` required for submission
- `nextSteps` required for submission
- `followUpNotes` optional unless `followUpRequired = true`
- text fields should be sanitized and length-limited

## 24. UI state mapping

### List page states
- loading
- empty eligible sessions
- empty report list
- normal list
- filtered no results
- error

### Detail page states
- draft editable
- submitted waiting
- under review locked
- needs revision editable with remarks
- finalized read-only
- deleted inaccessible from normal flow

### CTA mapping
- `DRAFT` -> Edit / Submit / Delete
- `SUBMITTED` -> View Detail
- `UNDER_REVIEW` -> View Status
- `NEEDS_REVISION` -> Edit & Resubmit
- `FINALIZED` -> View / History

## 25. Notifications

Recommended notification events:
- report submitted
- revision requested
- report finalized
- attachment upload failure

### Recipients
- Advisor: submit success, revision request, finalization result
- Operation Staff: newly submitted report enters queue
- Startup: report available when externally visible

## 26. Audit logging

Write audit log for:
- report created
- report updated
- report submitted
- attachment uploaded/removed
- report deleted
- review state changed
- report finalized

Suggested metadata:
- actor id / role
- report id
- session id
- status before / after
- timestamp
- request id / correlation id

## 27. Suggested folder structure

```txt
app/
  advisor/
    reports/
      page.tsx
      create/
        page.tsx
      [reportId]/
        page.tsx
        edit/
          page.tsx
        history/
          page.tsx

components/
  advisor/
    reports/
      report-list.tsx
      report-filters.tsx
      report-status-badge.tsx
      report-form.tsx
      report-attachments.tsx
      report-history-timeline.tsx
      report-review-banner.tsx
      eligible-session-selector.tsx

lib/
  advisor/
    reports/
      schema.ts
      mapper.ts
      permissions.ts
      status.ts
      api.ts
```

## 28. Suggested backend modules

```txt
modules/
  consulting/
    consultation-report.controller.ts
    consultation-report.service.ts
    consultation-report-policy.service.ts
    consultation-report-history.service.ts
    consultation-report-review.service.ts
    dto/
    entities/
```

## 29. Pseudocode

### 29.1 Create report
```ts
function createConsultationReport(currentAdvisorId, payload) {
  const session = getSession(payload.sessionId)
  if (!session) throw NotFound
  if (session.advisorId !== currentAdvisorId) throw Forbidden
  if (session.status !== 'COMPLETED') throw BusinessRuleError('SESSION_NOT_ELIGIBLE')

  const existing = findActiveReportBySessionId(session.id)
  if (existing) throw BusinessRuleError('REPORT_ALREADY_EXISTS')

  validateReportPayload(payload, { mode: payload.action === 'SAVE_DRAFT' ? 'draft' : 'submit' })

  const report = insertReport({
    ...payload,
    advisorId: currentAdvisorId,
    startupId: session.startupId,
    status: payload.action === 'SAVE_DRAFT' ? 'DRAFT' : 'SUBMITTED',
    version: 1,
    submittedAt: payload.action === 'SAVE_DRAFT' ? null : now(),
  })

  insertHistory(report.id, payload.action === 'SAVE_DRAFT' ? 'CREATED' : 'SUBMITTED')

  if (report.status === 'SUBMITTED') {
    enqueueOperationalReview(report.id)
    notifyOperationsNewReport(report.id)
  }

  return report
}
```

### 29.2 Update report
```ts
function updateConsultationReport(currentAdvisorId, reportId, patch, action) {
  const report = getReport(reportId)
  if (!report) throw NotFound
  if (report.advisorId !== currentAdvisorId) throw Forbidden
  if (!['DRAFT', 'NEEDS_REVISION'].includes(report.status)) {
    throw BusinessRuleError('REPORT_NOT_EDITABLE')
  }

  validateReportPayload({ ...report, ...patch }, { mode: action === 'SAVE_DRAFT' ? 'draft' : 'submit' })

  const nextStatus = action === 'RESUBMIT'
    ? 'SUBMITTED'
    : report.status === 'NEEDS_REVISION'
      ? 'NEEDS_REVISION'
      : 'DRAFT'

  const updated = saveReport(reportId, {
    ...patch,
    status: nextStatus,
    version: report.version + 1,
    submittedAt: action === 'RESUBMIT' ? now() : report.submittedAt,
  })

  insertHistory(reportId, action === 'RESUBMIT' ? 'SUBMITTED' : 'UPDATED')

  if (action === 'RESUBMIT') {
    enqueueOperationalReview(reportId)
  }

  return updated
}
```

### 29.3 Delete report
```ts
function deleteConsultationReport(currentAdvisorId, reportId) {
  const report = getReport(reportId)
  if (!report) throw NotFound
  if (report.advisorId !== currentAdvisorId) throw Forbidden
  if (!['DRAFT', 'NEEDS_REVISION'].includes(report.status)) {
    throw BusinessRuleError('REPORT_NOT_DELETABLE')
  }

  softDeleteReport(reportId, currentAdvisorId)
  insertHistory(reportId, 'DELETED')
}
```

## 30. Edge cases

- Advisor tries to create a report for a session already having an active report
- Session is not completed yet
- Advisor loses permission or account is restricted
- Attachment upload partially fails during submission
- Staff requests revision after advisor opened a stale edit page
- Report was finalized while advisor still editing in another tab
- Deleted report should not remain visible in normal advisor lists
- Startup attempts to view a non-finalized or inaccessible report

## 31. Acceptance criteria

### UC-113 Manage Consulting Reports
- Advisor can open a report list page and see own reports only.
- System shows related session information and status.
- Advisor can open a report detail page.

### UC-114 Create report
- Advisor can create a report only for own completed session.
- System prevents duplicate active reports for the same session.
- System supports saving draft and submitting.

### UC-115 Update report
- Advisor can edit only editable statuses.
- System validates updated content and stores history.
- Finalized reports are read-only.

### UC-116 Upload attachments
- Advisor can upload allowed file types to editable reports.
- System stores attachment metadata and links files to the report.
- Invalid files show proper validation errors.

### UC-117 Delete report
- Advisor can delete only when policy allows.
- Delete is soft delete and audit-logged.
- Deleted reports disappear from normal list view.

### UC-118 View report history
- Advisor can view a timeline of changes and version events.
- History is read-only.
- Timestamps and actors are recorded.

## 32. Manual test checklist

### Happy path
- completed session -> create report -> save draft -> edit -> submit -> staff reviews -> finalized

### Validation
- create report for non-completed session -> blocked
- submit with missing required fields -> blocked
- upload invalid file type -> blocked

### Permission
- advisor cannot open another advisor’s report
- startup cannot edit advisor report

### Status handling
- draft can be edited and deleted
- submitted report becomes read-only while under review
- needs revision reopens editing
- finalized becomes read-only

### History
- each update produces visible history item
- resubmission creates new event and version increment

## 33. Recommended implementation order

1. Report list + eligible session query
2. Create draft report
3. Edit / save draft
4. Attachment upload
5. Submit for review
6. History timeline
7. Soft delete
8. Startup read-only report endpoint
9. Operation review integration

## 34. Open questions for BA confirmation

- Should startup see the report immediately at `SUBMITTED`, or only after `FINALIZED`?
- Is one active report per session mandatory, or can there be a separate revision object chain?
- Which exact sections are mandatory in the final report template?
- Is attachment upload optional or required for some consulting types?
- Should delete be allowed only for `DRAFT`, or also for `NEEDS_REVISION`?
- Does finalization require explicit Operation Staff approval, or can some reports auto-finalize if no issue is found after a time window?

## 35. Recommended default decisions if BA does not specify soon

- one active report per session
- create only when session is `COMPLETED`
- startup can view only after `FINALIZED`
- soft delete only for `DRAFT`
- attachments optional
- all submissions go through Operation Staff review
