# AISEP Startup Settings UI/UX Implementation Spec

## 1. Scope

This spec defines the `/startup/settings` feature for the Startup role.

The settings area should cover only account-level and workspace-level controls that are appropriate for a compact settings hub:

- Security
- Notification Preferences
- Startup Profile Visibility

This settings area should **not** become a catch-all page for every startup management feature.

## 2. What belongs in Startup Settings

### 2.1 Security
- Change Password entry
- Security helper text
- Route to change password flow

### 2.2 Notification Preferences
- In-app notification preferences
- Email notification preferences
- Essential vs optional notifications
- Save preferences

### 2.3 Profile Visibility
- Visible to Investors
- Visible to Advisors
- Save visibility settings
- Optional explanatory text about discovery impact

## 3. What does NOT belong in Startup Settings

These should remain in their own modules:

- Full Startup Profile editing
- Full Verification / KYC flow
- Document-level visibility settings
- Documents & IP management
- AI Evaluation flow
- Advisor search / mentoring workflow
- Investor interaction / offers

## 4. Recommended Information Architecture

### 4.1 Main route
- `/startup/settings`

### 4.2 Optional nested routes
- `/startup/settings/security`
- `/startup/settings/notifications`
- `/startup/settings/visibility`

If you want a simpler implementation, `/startup/settings` can render all 3 sections on one page.

## 5. Page Objective

The Startup Settings page should let the user:

- secure the account
- control how important notifications are received
- manage startup profile discoverability to investors and advisors

## 6. Layout Recommendation

### Desktop
Use a single-column settings page with clear section cards.

Page structure:
1. Breadcrumb
2. Page title + subtitle
3. Security card
4. Notification Preferences card
5. Profile Visibility card
6. Save feedback / footer note if needed

### Mobile
- Stack all cards vertically
- Keep section actions accessible
- Use bottom sticky save bar when needed for long forms

## 7. Page Header

### Title
`Account & Settings`

### Subtitle
`Manage password, notifications, and visibility preferences for your startup workspace.`

## 8. Section 1 — Security

### Purpose
Provide an entry point to password management.

### UI contents
- Section title: `Security`
- Row item: `Login Password`
- Description: `Update your password regularly to improve account security.`
- CTA button: `Change Password`

### Behavior
Clicking `Change Password` should:
- open a modal, or
- navigate to `/startup/settings/security`

### Change Password flow requirements
The change password screen/modal should include:
- Current Password
- New Password
- Confirm New Password
- Save Changes
- Cancel

### Validation
- Current password required
- New password required
- Confirm password must match
- Password policy validation if applicable

### States
- default
- invalid current password
- new password mismatch
- saving
- success
- failure

## 9. Section 2 — Notification Preferences

### Purpose
Allow the startup user to control which notifications are received via in-app and email.

### Recommended structure
Use a matrix with rows = notification categories and columns = channels.

Columns:
- In-app
- Email

### Categories
#### Essential
1. Security Alerts
   - login alerts
   - password updates
   - important security events

2. Verification / KYC Updates
   - submitted
   - approved
   - rejected
   - more info requested

#### Startup workflow notifications
3. Advisor & Investor Interactions
   - someone viewed the profile
   - new consulting request updates
   - new interaction or response

4. Documents & IP
   - blockchain verification result
   - document processing result
   - visibility-related status changes

5. AI Evaluation
   - evaluation started
   - queued / processing / completed / failed
   - report ready

#### Optional
6. Product / Platform Updates
   - weekly updates
   - feature announcements
   - newsletters

### UX rules
- Essential notifications should either:
  - be locked on, or
  - clearly labeled as strongly recommended
- Optional notifications can be turned on/off freely

### Save behavior
- Save button disabled until there are unsaved changes
- On success, show: `Settings saved successfully.`
- On failure, show clear retry state

### States
- default
- dirty form
- saving
- success
- error
- essential rows locked

## 10. Section 3 — Profile Visibility

### Purpose
Let the startup control whether the startup profile is visible to investors and/or advisors.

### UI contents
- Section title: `Profile Visibility`
- Description: `Control who can discover and view your startup profile in the platform.`

### Fields
1. Visible to Investors
   - toggle or segmented control
2. Visible to Advisors
   - toggle or segmented control

### Optional helper text
- `Turning visibility off may reduce discovery and connection opportunities.`
- `These settings affect startup profile exposure, not individual document visibility.`

### Save behavior
- Save button enabled only when values change
- confirm if the user turns off all visibility

### Confirmation suggestion
If both toggles are OFF:
- show warning: `Your startup profile will no longer be discoverable in the platform.`
- require confirm action before save

### States
- both ON
- investors ON / advisors OFF
- investors OFF / advisors ON
- both OFF with warning
- save success
- save failed

## 11. Recommended Component List

- Breadcrumb
- Page header
- Section card
- Settings row
- Button
- Toggle switch
- Tooltip / helper text
- Inline status message
- Toast
- Confirmation modal
- Sticky save bar for mobile

## 12. Permissions

Only authenticated Startup users can access `/startup/settings`.

Rules:
- user must be authenticated
- user role must be Startup
- settings shown should belong only to the current account / workspace

## 13. Data Model Suggestion

```ts
export type StartupSettings = {
  security: {
    passwordLastChangedAt?: string;
  };
  notifications: {
    securityAlerts: { inApp: boolean; email: boolean; locked?: boolean };
    kycUpdates: { inApp: boolean; email: boolean; locked?: boolean };
    advisorInvestorInteractions: { inApp: boolean; email: boolean };
    documentsAndIP: { inApp: boolean; email: boolean };
    aiEvaluation: { inApp: boolean; email: boolean };
    productUpdates: { inApp: boolean; email: boolean };
  };
  visibility: {
    visibleToInvestors: boolean;
    visibleToAdvisors: boolean;
  };
};
```

## 14. Suggested API Surface

### GET `/api/startup/settings`
Returns current settings.

### PATCH `/api/startup/settings/notifications`
Updates notification preferences.

### PATCH `/api/startup/settings/visibility`
Updates profile visibility.

### POST `/api/startup/settings/change-password`
Changes password.

## 15. UX Copy Suggestions

### Security
- `Login Password`
- `Update your password regularly to improve account security.`
- `Change Password`

### Notifications
- `Notification Preferences`
- `Choose how you receive important startup updates.`
- `Security alerts are always recommended.`

### Visibility
- `Profile Visibility`
- `Manage who can discover your startup profile.`
- `Visible to Investors`
- `Visible to Advisors`

## 16. Accessibility Notes

- All toggles must be keyboard accessible
- Labels must be associated properly with controls
- Save feedback must be screen-reader friendly
- Color cannot be the only indicator of on/off state
- Confirmation modal should trap focus correctly

## 17. QA Checklist

### Security
- Change Password button opens correct flow
- validation works for all fields
- success and error states display correctly

### Notifications
- toggles load correct current values
- save button only enables on change
- locked notification rows cannot be disabled if policy says so
- saved values persist after refresh

### Visibility
- current values load correctly
- both toggles off shows warning
- save persists correctly
- visibility changes affect profile exposure as intended

## 18. Final Product Decision

The Startup Settings page should be a focused account/settings hub, not a full workspace control center.

### Keep in this page
- Security
- Notification Preferences
- Profile Visibility

### Keep outside this page
- KYC / Verification flow
- Startup Profile editing
- Document visibility per file
- AI Evaluation module
- Consulting module
- Investor interaction module

