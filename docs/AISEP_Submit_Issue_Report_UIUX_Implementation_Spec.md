# AISEP Submit Issue Report UI/UX Implementation Spec

## 1. Purpose
Implement the cross-role Issue Report feature for AISEP so users can report problems related to platform interactions and operational incidents.

This spec is written to support UI/UX design, FE implementation, and AI-assisted code generation.

---

## 2. Scope
This feature allows a user to:
- open a report issue form from context
- select issue category
- attach a related entity reference
- provide issue description
- upload optional evidence attachments
- submit or cancel the report

This feature should work for Startup, Investor, and Advisor contexts, with the same core reporting pattern.

---

## 3. Recommended Routes / Presentation Model
Preferred presentation:
- modal or drawer launched from a context page

Optional full-page route:
- `/report-issue`

Recommended contextual routes are not required if modal is used.

---

## 4. Entry Points
The issue report form may be opened from:
- connection request details
- conversation detail
- consulting session details
- payment section
- report section
- other context-aware operational pages

This means the feature should accept a pre-filled related entity reference when opened from context.

---

## 5. Primary User Story
As a user, I want to report an issue related to a specific interaction or entity so that platform staff can review and resolve it.

---

## 6. Form Scope
The Issue Report form should include:
- issue category
- related entity reference
- issue description
- optional evidence attachments
- submit button
- cancel button

---

## 7. Form Design
## 7.1 Modal Header
Show:
- Title: `Report an Issue`
- Subtitle: `Describe the issue so our team can review it.`
- close action

## 7.2 Context Summary Block
If opened from a specific screen, show a small summary:
- related entity type
- entity title or identifier
- other party name if relevant
- date/time context if relevant

Examples:
- Consulting session with Nguyen Minh Quan
- Conversation with FinNext Capital
- Offer from ABC Ventures
- Payment for Session #MS-1002

This block should be read-only.

---

## 8. Form Fields
## 8.1 Issue Category
Field key: `issueCategory`

Type:
- select or segmented list

Required:
- yes

Recommended options:
- Payment Issue
- Consulting Issue
- Messaging Issue
- Offer / Connection Issue
- Verification Issue
- Document Issue
- Harassment / Misconduct
- Technical Problem
- Other

## 8.2 Related Entity Reference
Field key: `relatedEntity`

Type:
- read-only if launched from context
- searchable select if launched generically

Required:
- yes when applicable

Suggested fields:
- entity type
- entity id
- entity title

## 8.3 Description
Field key: `description`

Type:
- textarea

Required:
- yes

Recommended length:
- min 20 chars
- max 2000 chars

Prompt text:
- `Describe what happened, when it happened, and why you believe it needs review.`

## 8.4 Attachments
Field key: `attachments[]`

Type:
- file upload

Required:
- no

Supported examples:
- screenshots
- PDFs
- receipts
- exported evidence files

Rules:
- show file count
- allow remove before submit
- validate file size/type

---

## 9. Buttons
Footer actions:
- Secondary: `Cancel`
- Primary: `Submit Report`

Submit button behavior:
- disabled until required fields are valid
- loading state while submitting

---

## 10. Validation Rules
### Required
- issueCategory
- description

### Conditional
- relatedEntity if issue must be linked to a context entity

### Inline Errors
Examples:
- `Please select an issue category.`
- `Please describe the issue.`
- `Description must be at least 20 characters.`
- `This attachment type is not supported.`

---

## 11. Submission Behavior
On submit:
1. validate fields
2. create issue report record
3. upload attachment metadata if any
4. notify operations staff
5. show success confirmation to user

Success response should include:
- report id
- submitted timestamp
- status = `Submitted`

---

## 12. Suggested Status Model
### User-facing report statuses
- Submitted
- Under Review
- Need More Info
- Resolved
- Closed

v1 minimum may only need:
- Submitted

---

## 13. Success UX
After successful submission:
- close modal and show toast, or
- stay on success state inside modal

Recommended success copy:
- `Your issue report has been submitted.`
- `Our team will review it and follow up if more information is needed.`

Optional actions:
- `Close`
- `View related item`

---

## 14. Cancel Behavior
If the form has unsaved data and user closes/cancels:
- show discard confirmation

Message example:
- `Discard this issue report?`
- `Your current input will be lost.`

---

## 15. Empty / Error / Edge States
## 15.1 Generic Open without Context
If opened without entity context:
- allow user to choose related entity type and item
- or allow generic issue reporting if policy permits

## 15.2 Submission Failed
Show:
- inline error message
- retry action

## 15.3 Attachment Upload Failed
Show per-file error and allow remove/retry.

## 15.4 Missing Related Entity
If the related entity no longer exists:
- show fallback text
- still allow issue submission only if policy permits
- otherwise block and explain

---

## 16. Suggested Components
- IssueReportModal
- IssueContextSummaryCard
- IssueCategorySelect
- RelatedEntityField
- DescriptionTextarea
- AttachmentUploader
- SubmitButton
- CancelButton
- SuccessState
- ErrorState
- DiscardChangesDialog

---

## 17. API Suggestions
## 17.1 Submit Issue Report
`POST /api/issues`

Payload example:
```json
{
  "issueCategory": "CONSULTING_ISSUE",
  "relatedEntityType": "CONSULTING_SESSION",
  "relatedEntityId": "ms_1002",
  "description": "The advisor joined late and did not cover the agreed scope.",
  "attachments": ["file_1", "file_2"]
}
```

Response example:
```json
{
  "id": "issue_2001",
  "status": "SUBMITTED",
  "submittedAt": "2026-03-23T09:00:00Z"
}
```

## 17.2 Upload Attachment
Use existing file upload endpoint or dedicated issue attachment endpoint.

---

## 18. Data Model Suggestion
```ts
export type IssueCategory =
  | 'PAYMENT_ISSUE'
  | 'CONSULTING_ISSUE'
  | 'MESSAGING_ISSUE'
  | 'OFFER_OR_CONNECTION_ISSUE'
  | 'VERIFICATION_ISSUE'
  | 'DOCUMENT_ISSUE'
  | 'HARASSMENT_OR_MISCONDUCT'
  | 'TECHNICAL_PROBLEM'
  | 'OTHER';

export interface IssueReportInput {
  issueCategory: IssueCategory;
  relatedEntityType?: string;
  relatedEntityId?: string;
  description: string;
  attachmentIds?: string[];
}
```

---

## 19. UX Rules
- keep the form short and serious
- always preserve context if launched from a related page
- avoid making users retype obvious related information
- descriptions should focus on facts and events
- the feature should feel operational, not social
- do not expose internal staff workflow details here

---

## 20. Accessibility
- modal focus trap required
- all fields keyboard accessible
- errors announced clearly
- attachment remove buttons accessible by keyboard and screen reader

---

## 21. QA Checklist
- modal opens from context correctly
- related entity pre-fills correctly
- category validation works
- description validation works
- attachments upload/remove works
- discard confirmation works
- successful submission shows confirmation
- failed submission shows retryable error
- operations notification is triggered after submit

---

## 22. Recommended v1 Delivery Order
1. Contextual modal shell
2. Category + description + submit
3. Related entity prefill
4. Attachments
5. Success state
6. Error handling
7. Optional generic non-context reporting
