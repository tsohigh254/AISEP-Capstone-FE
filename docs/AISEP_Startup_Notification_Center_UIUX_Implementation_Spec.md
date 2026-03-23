# AISEP Startup Notification Center UI/UX Implementation Spec

## 1. Purpose
Implement the Startup-side Notification Center for AISEP so Startup users can:
- view notifications
- distinguish unread vs read items
- mark items as read/unread
- mark all as read
- navigate from a notification to the related entity or page

This spec is intended for UI/UX, FE, and AI code generation.

---

## 2. Scope
This feature covers:
- Notification bell entry in top navigation
- Unread badge
- Notification Center page
- Optional popover preview from the bell icon
- Notification detail interaction behavior
- Mark read / unread behaviors
- Mark all as read behavior
- Empty / loading / error / pagination states

Out of scope:
- notification preference settings page
- admin moderation of notifications
- push notification infrastructure

---

## 3. Recommended Routes
- `/startup/notifications`
- optional popover from global header bell icon

---

## 4. Entry Points
### Primary entry points
- Bell icon in Startup workspace header
- Notifications item in sidebar or user menu

### Secondary entry points
- Deep link from system banners
- Redirect after actions that create navigable notifications

---

## 5. Core User Stories
### View Notifications
Startup user can open the notification center and see a newest-first list of notifications.

### Mark Notification as Read / Unread
Startup user can update the read state of one notification.

### Mark All as Read
Startup user can mark all unread notifications as read.

### Open Related Content
Startup user can click a notification to navigate to the relevant page.

---

## 6. Information Architecture
## 6.1 Header Bell
Show:
- bell icon
- unread count badge
- optional small preview dropdown

Bell behavior:
- if unread count > 0, show badge
- clicking bell opens either popover preview or full page
- unread count refreshes after read-state changes

## 6.2 Notification Center Page
Recommended layout:
- page title
- unread summary
- filter bar
- mark all as read button
- notification list
- pagination or infinite scroll

### Top Section
Show:
- Title: `Notifications`
- Subtitle: `Track updates related to your startup, verification, documents, AI evaluation, consulting, and investor activity.`
- Unread summary, e.g. `12 unread`
- CTA: `Mark all as read`

### Filter Bar
Recommended filters:
- All
- Unread
- Read
- System
- Verification
- Documents
- AI Evaluation
- Consulting
- Investor Activity

Sorting:
- newest first by default
- no custom sorting needed in v1 beyond newest-first

---

## 7. Notification Item Design
Each notification item should show:
- icon or category indicator
- title
- short body text
- timestamp
- unread/read state
- action affordance
- optional contextual badge or entity name

### Recommended Fields
- `id`
- `type`
- `title`
- `message`
- `createdAt`
- `isRead`
- `targetType`
- `targetId`
- `targetUrl`
- `priority`
- `actorName` (optional)

### Visual States
#### Unread item
- stronger background or border accent
- unread dot indicator
- slightly stronger title weight

#### Read item
- lighter visual treatment
- no unread dot

### Item Actions
Per item allow:
- click row to open target
- mark as read/unread from row action menu

---

## 8. Notification Categories
Recommended categories aligned with Startup workflow:
- System
- Verification
- Documents & IP
- AI Evaluation
- Consulting
- Investor Interaction
- Messaging

### Example Notification Types
#### Verification
- KYC submitted
- KYC approved
- KYC rejected
- additional information requested

#### Documents & IP
- blockchain submission pending
- blockchain confirmed
- blockchain failed
- document visibility updated

#### AI Evaluation
- evaluation requested
- evaluation queued
- evaluation processing
- evaluation completed
- evaluation failed

#### Consulting
- advisor accepted request
- advisor rejected request
- advisor proposed new schedule
- schedule confirmed
- report submitted
- feedback reminder

#### Investor Interaction
- new investor interest
- received offer
- offer updated
- offer cancelled

#### Messaging
- new message in conversation

---

## 9. Interaction Rules
## 9.1 Opening a Notification
When user clicks a notification item:
- navigate to `targetUrl` if available
- mark notification as read automatically
- preserve back navigation to notification center

## 9.2 Mark as Read / Unread
User may toggle a single notification state.

Rules:
- unread -> read should immediately update UI and unread badge
- read -> unread should also immediately update UI and unread badge
- use optimistic update if desired, with rollback on failure

## 9.3 Mark All as Read
When user clicks `Mark all as read`:
- all currently unread notifications become read
- unread badge updates immediately
- action is disabled if unread count = 0

---

## 10. Page States
## 10.1 Loading
Show:
- skeleton list items
- disabled action bar

## 10.2 Empty
Show friendly empty state:
- title: `No notifications yet`
- helper: `When your startup receives updates, they will appear here.`

## 10.3 Empty Filter Result
Show:
- `No notifications match this filter.`
- action: `Clear filters`

## 10.4 Error
Show:
- inline error block
- retry button

## 10.5 Pagination / Infinite Scroll
Either is acceptable.

Recommended behavior:
- load newest page first
- support `Load more` or infinite scroll
- preserve scroll position on return if possible

---

## 11. Suggested UI Components
- BellIconButton
- UnreadBadge
- NotificationFilterTabs
- NotificationList
- NotificationItem
- NotificationItemMenu
- MarkAllReadButton
- EmptyState
- ErrorState
- SkeletonList

---

## 12. API Suggestions
## 12.1 List Notifications
`GET /api/startup/notifications?filter=all&page=1&pageSize=20`

Response fields:
- `items`
- `total`
- `unreadCount`
- `page`
- `pageSize`
- `hasMore`

## 12.2 Mark One as Read
`PATCH /api/startup/notifications/:id/read`

## 12.3 Mark One as Unread
`PATCH /api/startup/notifications/:id/unread`

## 12.4 Mark All as Read
`PATCH /api/startup/notifications/read-all`

---

## 13. Data Model Suggestion
```ts
export type StartupNotificationType =
  | 'SYSTEM'
  | 'VERIFICATION'
  | 'DOCUMENT'
  | 'AI_EVALUATION'
  | 'CONSULTING'
  | 'INVESTOR_INTERACTION'
  | 'MESSAGE';

export interface StartupNotification {
  id: string;
  type: StartupNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  targetType?: string;
  targetId?: string;
  targetUrl?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  actorName?: string;
}
```

---

## 14. UX Rules
- newest-first by default
- unread must be easy to distinguish visually
- avoid very long body text in list items
- clicking the row should feel like a navigation action
- notification list should support mixed categories without visual clutter
- badge counts must stay in sync after local actions

---

## 15. Accessibility
- bell button must have accessible label
- unread badge should not be color-only dependent
- each item must be keyboard focusable
- menus and actions must be operable by keyboard
- timestamps should have readable text labels

---

## 16. QA Checklist
- unread badge appears correctly
- unread count updates after marking one item
- unread count updates after mark all as read
- clicking notification opens correct target URL
- filter tabs work correctly
- empty state works
- empty filtered state works
- error + retry works
- pagination or load more works
- read/unread state persists after refresh

---

## 17. Recommended v1 Delivery Order
1. Header bell + unread badge
2. Notification center page list
3. Mark read/unread
4. Mark all as read
5. Filters
6. Pagination / load more
7. Optional popover preview
