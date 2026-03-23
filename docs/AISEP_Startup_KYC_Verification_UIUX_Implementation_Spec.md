# AISEP Startup KYC / Verification UIUX Implementation Spec

Version: 1.0  
Role: Startup  
Module: Startup Identity & Verification  
Status: Draft for implementation

---

## 1. Purpose

This document defines the UI/UX and implementation logic for the **Startup KYC / Verification** feature in AISEP.

It covers the startup-side verification flow from:
- viewing verification requirements,
- submitting initial Basic KYC,
- handling the two startup verification paths,
- viewing verification result/status,
- viewing requested additional information,
- viewing detailed result remarks,
- resubmitting KYC when allowed.

This spec is written so product, UI/UX, FE, and BE can implement a logically complete startup verification experience.

---

## 2. Source scope from SRS and business document

This spec is based on the following startup-related use cases in the SRS:
- UC-09 View Verification Requirements
- UC-10 View Requested Additional Information
- UC-11 View Verification Result Details
- UC-12 Verify Identity (Basic KYC)
- UC-13 Submit Basic KYC Verification
- UC-14 Submit Startup Verification (With Legal Entity)
- UC-15 Submit Startup Verification (Without Legal Entity)
- UC-16 View KYC Status
- UC-17 Resubmit KYC

The SRS explicitly states that startup verification supports **two submission paths**:
- **With Legal Entity**
- **Without Legal Entity**

and that the system must load the corresponding form, validate role and required fields, store uploaded files, create a startup verification request, and mark it as submitted for review. It also requires KYC status viewing, no-submission state, requested additional information display when applicable, and editable resubmission when the case is in a resubmittable state. Startup labels shown to the user may include **Verified Company**, **Verified Founding Team**, **Basic Verified**, **Pending More Info**, and **Verification Failed**. The SRS also notes that resubmission is definitely allowed for **Pending More Info**, while resubmission after **Verification Failed** should be controlled by business policy/configuration.【fileciteturn104file0】【fileciteturn104file11】【fileciteturn104file10】【fileciteturn104file4】

The business document further clarifies the intended meaning of startup verification: it is a **light verification** to establish that the startup exists at a basic level, is not fake, and has a reasonable link between the account holder and the startup. It also defines the two startup verification models, the required submission fields, and the label logic, including the meaning of **Verified Company** for startups with legal entity and **Verified Founding Team** for startups without legal entity.【fileciteturn104file18】【fileciteturn104file13】

---

## 3. Product goal

The Startup KYC module should help the startup:
- understand what verification is for,
- choose the correct verification path,
- submit the minimum required proof correctly,
- track the current verification result,
- understand why a case is pending/failing,
- resubmit cleanly when more info is requested,
- build enough trust for later platform activities.

The experience should feel:
- lightweight,
- trustworthy,
- structured,
- role-aware,
- not overly bureaucratic.

---

## 4. Core domain model

### 4.1 Verification intent

Startup KYC is **basic platform verification**, not deep legal due diligence.

It should communicate that AISEP verifies at a basic level that:
- the startup or project is plausibly real,
- the person using the account is reasonably linked to it,
- the submitted evidence is not clearly fake or irrelevant.

### 4.2 Verification paths

There are two startup verification paths:

1. **Startup Verification (With Legal Entity)**
2. **Startup Verification (Without Legal Entity)**

The startup type can be:
- selected by the startup in the form, or
- pre-detected from startup profile or platform context.

### 4.3 User-visible result labels

The SRS says the startup may see the following labels:

For **with legal entity**:
- Verified Company
- Basic Verified
- Pending More Info
- Verification Failed

For **without legal entity**:
- Verified Founding Team
- Basic Verified
- Pending More Info
- Verification Failed【fileciteturn104file10】

### 4.4 Process status vs label

Implementation should keep these separate:

- **Request status**: draft / submitted / under review / pending more info / approved / failed
- **Result label**: Verified Company / Verified Founding Team / Basic Verified / Pending More Info / Verification Failed

The SRS sometimes presents the user-facing result in a simplified way, but in implementation it is safer to separate:
- workflow state,
- user-facing trust label,
- requested additional information.

---

## 5. Main screens

The startup verification module should be implemented as the following screens/pages:

1. **Verification Overview / Requirements**
2. **Verify Identity (Basic KYC) – Initial submission form**
3. **KYC Status**
4. **Verification Result Details**
5. **Requested Additional Information**
6. **Resubmit KYC**

Recommended route structure:

```txt
/startup/verification
/startup/verification/submit
/startup/verification/status
/startup/verification/details
/startup/verification/additional-info
/startup/verification/resubmit
```

---

## 6. End-to-end flow

### 6.1 Happy path

1. Startup opens verification area.
2. System shows requirements and explains the two startup types.
3. Startup chooses or confirms startup type.
4. System loads the corresponding KYC form.
5. Startup enters required information and uploads required evidence.
6. Startup accepts truthful information commitment.
7. Startup submits verification.
8. System validates submission.
9. If valid, system creates KYC request and marks it as submitted for review.
10. Startup is redirected to KYC Status.
11. Operation Staff reviews the case.
12. System updates status and visible label.
13. Startup views latest result.
14. If more info is needed, startup sees requested additional information and can resubmit.

### 6.2 Alternate path: no submission yet

1. Startup opens KYC Status.
2. No record exists.
3. System shows no-submission state.
4. CTA goes to submit KYC for the first time.

### 6.3 Alternate path: pending more info

1. Operation Staff requests resubmission.
2. System updates case to Pending More Info and stores missing/unclear items.
3. Startup receives notification.
4. Startup opens KYC Status / Verification Details.
5. Startup sees requested additional information.
6. Startup opens Resubmit KYC.
7. System loads the previous submission in editable mode.
8. Startup updates fields and/or files and resubmits.

### 6.4 Alternate path: verification failed

1. Operation Staff rejects the submission.
2. System updates the case to Verification Failed.
3. Startup opens KYC Status / Verification Details.
4. System shows failed state and explanation.
5. Whether resubmission is allowed depends on platform policy/configuration.

---

## 7. Screen 1 — Verification Overview / Requirements

### 7.1 Purpose

This screen prepares the startup before submission.

It should answer:
- why verification exists,
- what the startup needs to provide,
- which path applies,
- what the possible outcomes mean.

### 7.2 Recommended layout

Sections:
- header / page intro
- verification purpose card
- startup type chooser / explainer
- requirements list for each path
- label meanings card
- CTA area

### 7.3 Content blocks

#### A. Why verify?
Short explanation:
- basic trust,
- reduce fake accounts,
- connect account with startup identity,
- improve platform trust.

#### B. Choose your startup type
Two option cards:
- With Legal Entity
- Without Legal Entity

Each card explains when to use it.

#### C. What you need to prepare
For **With Legal Entity**:
- legal full name
- enterprise code / tax code
- business registration certificate
- submitter full name
- submitter role
- work email
- website or product link
- truthful information commitment【fileciteturn104file11】

For **Without Legal Entity**:
- startup / project name
- founder or representative full name
- role
- contact email
- website / landing page / demo / LinkedIn page / app link
- one basic activity proof file
- truthful information commitment【fileciteturn104file11】

#### D. What labels mean
Show concise explanations:
- Verified Company
- Verified Founding Team
- Basic Verified
- Pending More Info
- Verification Failed

#### E. CTA
- Primary: Start Verification
- Secondary: View Current Status

### 7.4 UX notes

- This screen should be simple and educational.
- Use checklists and supportive copy, not legalistic copy.
- If the startup already has a submitted case, the primary CTA can switch to `View Status`.

---

## 8. Screen 2 — Verify Identity (Basic KYC) / Initial Submission

### 8.1 Purpose

Allow the startup to submit Basic KYC for the first time.

### 8.2 Form mode

This screen should support two modes:
- **startup type selected manually**, or
- **startup type pre-detected** with optional change if policy allows.

### 8.3 Overall structure

Recommended structure:

1. top progress/info bar
2. startup type selector or locked startup type indicator
3. dynamic form body
4. file upload block
5. truthful information commitment
6. actions footer

### 8.4 Shared fields and controls

Common controls:
- text fields
- email input
- URL input
- role dropdown/select
- file upload
- truthful information commitment checkbox
- submit button
- cancel/back button

### 8.5 Path A — With Legal Entity

Required fields:
- Legal full name
- Enterprise code / tax code
- Business Registration Certificate file
- Submitter full name
- Submitter role
- Work email
- Website or product link
- Truthful information commitment【fileciteturn104file11】

#### Recommended UI groups

##### Group 1 — Legal entity information
- Legal full name
- Enterprise code / tax code

##### Group 2 — Proof document
- Business Registration Certificate upload
- file requirements helper text

##### Group 3 — Submitter identity
- Submitter full name
- Submitter role
- Work email

##### Group 4 — Public link
- Website or product link

##### Group 5 — Commitment
- Truthful information commitment checkbox

### 8.6 Path B — Without Legal Entity

Required fields:
- Startup / project name
- Founder or representative full name
- Role
- Contact email
- Website / landing page / demo / LinkedIn page / app link
- Basic activity proof file
- Truthful information commitment【fileciteturn104file11】

The SRS gives examples for basic activity proof file:
- pitch deck
- one-pager
- product screenshot【fileciteturn104file18】

#### Recommended UI groups

##### Group 1 — Startup/project identity
- Startup / project name

##### Group 2 — Founder/representative
- Founder or representative full name
- Role
- Contact email

##### Group 3 — Public link
- Website / landing page / demo / LinkedIn / app link

##### Group 4 — Activity proof
- Basic activity proof file upload
- helper text listing accepted example proof types

##### Group 5 — Commitment
- Truthful information commitment checkbox

### 8.7 Validation rules

Required from SRS:
- user must be authenticated
- user role must be Startup
- startup type must be identifiable before submission
- all required fields for the selected startup type must be completed
- required file upload must be provided
- email must be valid
- URL/link must be valid
- truthful information commitment must be accepted【fileciteturn104file18】

#### UX validation behavior
- show field-level inline errors
- keep the user on the page on validation failure
- show file validation message inline near uploader
- disable submit while upload is still in progress

### 8.8 Submission outcome

If valid:
- save submitted data and uploaded file(s)
- create startup KYC verification request
- mark request as submitted for review
- redirect to KYC Status or show success state and then navigate【fileciteturn104file11】

### 8.9 Important design note

Do not overcomplicate this form. Startup KYC is meant to be **light verification**, not a full compliance onboarding process.

---

## 9. Screen 3 — KYC Status

### 9.1 Purpose

Show the startup the latest verification result and what they should do next.

### 9.2 Required content from SRS

The screen must include:
- current status badge
- verification result label
- result explanation section
- requested additional information section if applicable
- resubmit action if applicable【fileciteturn104file10】

It must also support the **no-submission state** if no KYC record exists.【fileciteturn104file10】

### 9.3 Recommended layout

Sections:
- status hero card
- current label card
- explanation block
- next action block
- requested additional information block (conditional)
- latest submission summary
- quick links

### 9.4 States

#### A. No submission yet
Show:
- empty illustration/state
- message: Basic KYC has not been submitted yet
- CTA: Submit Verification

#### B. Submitted / Under review
Show:
- status badge: Submitted or Under Review
- helper text: your verification request is being reviewed
- CTA: View Submission Details

#### C. Approved with legal entity
Show:
- label: Verified Company or Basic Verified
- explanation text
- submission type: With Legal Entity

#### D. Approved without legal entity
Show:
- label: Verified Founding Team or Basic Verified
- explanation text
- submission type: Without Legal Entity

#### E. Pending More Info
Show:
- label: Pending More Info
- requested items preview
- CTA: View Requested Info
- CTA: Resubmit KYC

#### F. Verification Failed
Show:
- label: Verification Failed
- explanation text
- next action depends on policy
- optional CTA: Resubmit KYC if enabled by config

### 9.5 Labels and explanations

If **with legal entity**, show one of:
- Verified Company
- Basic Verified
- Pending More Info
- Verification Failed

If **without legal entity**, show one of:
- Verified Founding Team
- Basic Verified
- Pending More Info
- Verification Failed【fileciteturn104file10】

### 9.6 Suggested status mapping for implementation

Recommended internal display mapping:

| Workflow status | Label | User message |
|---|---|---|
| NOT_SUBMITTED | none | You have not submitted Basic KYC yet |
| SUBMITTED / UNDER_REVIEW | pending review | Your submission is under review |
| APPROVED | Verified Company / Verified Founding Team / Basic Verified | Your startup passed light verification at the current level |
| PENDING_MORE_INFO | Pending More Info | More information or clearer proof is required |
| FAILED | Verification Failed | Your startup did not pass basic verification |

### 9.7 Quick actions

Depending on state, show:
- Submit Verification
- View Verification Details
- View Requested Additional Information
- Resubmit KYC

---

## 10. Screen 4 — Verification Result Details

### 10.1 Purpose

Provide a more detailed view than the KYC Status summary screen.

This screen corresponds to common UC-11 **View Verification Result Details**.

### 10.2 Recommended sections

- latest result header
- submission type
- submission summary
- uploaded evidence summary
- result explanation
- requested additional information or reviewer remarks if applicable
- review timeline/history preview
- CTA area

### 10.3 What this screen should show

Recommended fields:
- request ID / submission reference
- startup type path used
- submitted date
- latest updated date
- current status
- current label
- summary of files submitted
- requested corrections, if any
- current next action

### 10.4 UX rule

This screen is for **explanation and clarity**, not for editing.

If editing is needed, CTA should move to:
- Resubmit KYC
- Submit KYC

---

## 11. Screen 5 — Requested Additional Information

### 11.1 Purpose

This screen corresponds to UC-10 and should let the startup read exactly what was requested by review staff.

The Operation Staff flow in SRS explicitly allows staff to request resubmission, record missing/unclear items, and notify the applicant. The startup must be able to see those items clearly before resubmitting.【fileciteturn104file16】

### 11.2 Recommended content

- request status banner: Pending More Info
- list of requested clarification items
- item severity/type chips
- optional section mapping each request to a field or file
- CTA: Resubmit KYC

### 11.3 Item grouping recommendation

Group requests into:
- field correction needed
- file replacement needed
- clearer public link needed
- identity-role relationship unclear
- missing commitment / declaration

### 11.4 UX rule

Make this screen very readable.

The startup should not have to guess:
- what is wrong,
- what to replace,
- which field needs editing.

---

## 12. Screen 6 — Resubmit KYC

### 12.1 Purpose

Allow the startup to edit and resubmit an existing KYC submission when resubmission is allowed.

### 12.2 Required behavior from SRS

The system must:
- load latest startup KYC submission
- determine whether startup is with or without legal entity
- load corresponding editable form
- load requested additional information if current status is Pending More Info
- save updated information and replacement file(s)
- create a new review cycle【fileciteturn104file4】

### 12.3 Preconditions

- user authenticated
- user role Startup
- previous KYC submission exists
- KYC must be in a resubmittable state【fileciteturn104file4】

### 12.4 Resubmittable state

Documented rule:
- Pending More Info is resubmittable
- resubmission after Verification Failed should be controlled by configuration/business policy【fileciteturn104file4】

### 12.5 Screen structure

Sections:
- page banner with current result
- requested additional information summary
- editable form body for the existing startup type
- file replacement controls
- truthful information commitment checkbox
- resubmit footer actions

### 12.6 Important UX rule

The resubmit screen should preserve previous values and clearly mark:
- what was previously submitted,
- what needs to be corrected,
- which file should be replaced.

### 12.7 Validation

From SRS:
- previous submission must exist
- startup type specific required fields must be complete
- required file upload must be provided
- truthful commitment must be accepted before resubmission【fileciteturn104file4】

### 12.8 Outcome

If validation passes:
- save updated KYC submission
- save replacement file(s)
- create new review cycle
- mark request as submitted for review again
- redirect to KYC Status or show success message【fileciteturn104file4】

---

## 13. Data model recommendation

Suggested FE/BE shape:

```ts
interface StartupKycCase {
  id: string;
  startupId: string;
  startupVerificationType: 'WITH_LEGAL_ENTITY' | 'WITHOUT_LEGAL_ENTITY';
  workflowStatus:
    | 'NOT_SUBMITTED'
    | 'DRAFT'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'PENDING_MORE_INFO'
    | 'APPROVED'
    | 'FAILED';
  resultLabel:
    | 'VERIFIED_COMPANY'
    | 'VERIFIED_FOUNDING_TEAM'
    | 'BASIC_VERIFIED'
    | 'PENDING_MORE_INFO'
    | 'VERIFICATION_FAILED'
    | null;
  submittedAt?: string;
  updatedAt?: string;
  latestReviewCycle: number;
  isResubmittable: boolean;
  explanation?: string;
  requestedAdditionalItems?: RequestedInfoItem[];
  submissionSummary?: StartupKycSubmissionSummary;
}

interface RequestedInfoItem {
  id: string;
  fieldKey?: string;
  type: 'FIELD' | 'FILE' | 'LINK' | 'GENERAL';
  title: string;
  description: string;
  requiredAction: string;
}

interface StartupKycSubmissionSummary {
  startupVerificationType: 'WITH_LEGAL_ENTITY' | 'WITHOUT_LEGAL_ENTITY';
  legalFullName?: string;
  enterpriseCode?: string;
  projectName?: string;
  representativeFullName?: string;
  representativeRole?: string;
  workEmail?: string;
  contactEmail?: string;
  publicLink?: string;
  evidenceFiles: KycEvidenceFile[];
}

interface KycEvidenceFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  kind:
    | 'BUSINESS_REGISTRATION_CERTIFICATE'
    | 'BASIC_ACTIVITY_PROOF';
}
```

---

## 14. Field inventory

### 14.1 With Legal Entity

| Field | Required | Type |
|---|---:|---|
| Legal full name | Yes | text |
| Enterprise code / tax code | Yes | text |
| Business Registration Certificate file | Yes | file |
| Submitter full name | Yes | text |
| Submitter role | Yes | select |
| Work email | Yes | email |
| Website or product link | Yes | url |
| Truthful information commitment | Yes | checkbox |

### 14.2 Without Legal Entity

| Field | Required | Type |
|---|---:|---|
| Startup / project name | Yes | text |
| Founder or representative full name | Yes | text |
| Role | Yes | select |
| Contact email | Yes | email |
| Website / landing page / demo / LinkedIn / app link | Yes | url |
| Basic activity proof file | Yes | file |
| Truthful information commitment | Yes | checkbox |

### 14.3 Suggested role dropdown values

For legal entity submitter role, align with business document examples:
- Founder
- Co-founder
- Legal Representative
- Authorized Person【fileciteturn104file18】

For without legal entity path:
- Founder
- Co-founder
- Representative
- Core Team Member

---

## 15. File upload behavior

### 15.1 Uploader UX

Each required file block should support:
- drag and drop
- browse file
- selected file preview row
- replace file action
- remove file action before submit
- inline validation message

### 15.2 Legal entity proof

The required file is the Business Registration Certificate.

### 15.3 Without legal entity proof

The required file is one basic activity proof file. The SRS provides examples:
- pitch deck
- one-pager
- product screenshot【fileciteturn104file18】

### 15.4 Upload states

- empty
- uploading
- uploaded
- upload failed
- replacement uploaded
- invalid file

---

## 16. State design

### 16.1 Initial form states

- blank form
- pre-detected startup type
- manual startup type selection
- validation error
- file upload in progress
- submit loading
- submit success
- submit failed

### 16.2 KYC status states

- no submission
- submitted
- under review
- approved / verified company
- approved / verified founding team
- basic verified
- pending more info
- verification failed
- resubmission available
- resubmission blocked by policy

### 16.3 Result detail states

- data loaded
- no history detail
- requested additional info exists
- no requested info
- generic processing error

### 16.4 Resubmission states

- editable with previous values
- field corrections required
- file replacement required
- commitment not checked
- resubmitting
- resubmit success
- resubmit failed

---

## 17. Notifications and cross-feature links

The SRS includes common features for:
- View Notifications
- View Requested Additional Information
- View Verification Result Details【fileciteturn104file0】

Recommended notification triggers:
- verification submitted
- verification approved
- pending more info requested
- verification failed
- resubmission received

Recommended CTA deep links:
- notification → `/startup/verification/status`
- pending more info notification → `/startup/verification/additional-info`
- failed / more info message → `/startup/verification/details`

---

## 18. Suggested API endpoints

```txt
GET    /api/startup/verification/requirements
GET    /api/startup/verification/current
GET    /api/startup/verification/details
GET    /api/startup/verification/additional-info
POST   /api/startup/verification/submit
POST   /api/startup/verification/resubmit
POST   /api/startup/verification/upload-file
```

Optional:

```txt
GET    /api/startup/verification/history
GET    /api/startup/verification/policy
```

---

## 19. Backend behavior expectations

### 19.1 On initial submit
Backend should:
- verify authenticated startup role
- confirm startup type is identifiable
- validate required fields by selected type
- validate required file presence
- validate email/url format
- save data and files
- create KYC request
- mark submitted for review

### 19.2 On resubmit
Backend should:
- verify previous submission exists
- verify case is resubmittable
- load current startup type
- validate updated fields and replacement file(s)
- create new review cycle
- mark submitted for review again

### 19.3 On status fetch
Backend should return:
- latest workflow status
- current result label
- startup type path
- explanation text
- requested additional items
- whether resubmit is currently allowed

---

## 20. Business rules to preserve

1. Startup type must be identifiable before submission.【fileciteturn104file18】
2. Required fields differ by startup type and must be validated separately.【fileciteturn104file11】
3. Required file upload is mandatory for both paths.【fileciteturn104file11】
4. Truthful information commitment must be accepted before submit or resubmit.【fileciteturn104file11】【fileciteturn104file4】
5. KYC Status must support no-submission state.【fileciteturn104file10】
6. Requested additional information must be shown when result is Pending More Info.【fileciteturn104file10】
7. Resubmission is definitely allowed for Pending More Info; resubmission after Verification Failed is policy/config-driven.【fileciteturn104file4】
8. Startup-side UI must not expose internal review scoring details unless product explicitly decides to surface them later.

---

## 21. Accessibility and trust UX notes

- All form fields need proper labels and descriptions.
- File upload blocks need keyboard support and screen-reader labels.
- Status badges must not rely on color alone.
- Requested Additional Information must be readable as structured content, not just colored warning text.
- Failed and pending states should be informative, not punitive.
- Commitment checkbox text should be visible without hidden hover-only content.

---

## 22. Copy recommendations

### No submission
- Title: Verification not submitted yet
- Body: Complete Basic KYC so AISEP can verify that your startup exists at a basic level and is reasonably linked to your account.
- CTA: Start Verification

### Under review
- Title: Verification under review
- Body: Your submission has been received and is being reviewed by AISEP.

### Pending more info
- Title: More information required
- Body: We need additional or clearer information to continue your startup verification.
- CTA: Review requested information
- CTA 2: Resubmit KYC

### Verification failed
- Title: Verification did not pass
- Body: Your latest submission did not pass basic verification. Review the result details for more information.

### Approved
- Title: Verification completed
- Body (with legal entity): Your startup has received the Verified Company / Basic Verified label.
- Body (without legal entity): Your startup has received the Verified Founding Team / Basic Verified label.

---

## 23. Suggested implementation split

### FE Phase 1
- Verification Overview
- Initial submission form
- KYC Status
- No submission state

### FE Phase 2
- Verification Result Details
- Requested Additional Information
- Resubmit KYC

### BE Phase 1
- submit endpoint
- current status endpoint
- file upload endpoint

### BE Phase 2
- detail endpoint
- additional info endpoint
- resubmit endpoint
- review cycle history support

---

## 24. QA checklist

### Initial submit
- [ ] Startup type can be selected or pre-detected
- [ ] Correct form loads for each type
- [ ] Required fields validate correctly
- [ ] Invalid email is blocked
- [ ] Invalid URL is blocked
- [ ] Required file is enforced
- [ ] Commitment checkbox is enforced
- [ ] Successful submit redirects to status

### Status
- [ ] No-submission state appears when no KYC exists
- [ ] Correct labels show for each type
- [ ] Pending More Info state shows requested additional information section
- [ ] Verification Failed state shows correct explanation
- [ ] Resubmit CTA appears only when allowed

### Resubmit
- [ ] Previous submission data loads correctly
- [ ] Requested additional information is visible
- [ ] User can replace required file
- [ ] Validation still applies on resubmit
- [ ] New review cycle is created on success

### Detail/Info screens
- [ ] Verification details reflect latest case
- [ ] Additional info page is readable and actionable
- [ ] Direct deep links from notifications work

---

## 25. Final implementation stance

This startup verification module should be implemented as a **light but structured trust workflow**:
- simple enough for early-stage startups,
- strict enough to block obviously fake or weak submissions,
- clear enough that startups understand what to do next,
- modular enough to support both legal-entity and non-legal-entity startups cleanly.

It should not feel like full compliance onboarding.
It should feel like **startup trust verification for ecosystem participation**.
