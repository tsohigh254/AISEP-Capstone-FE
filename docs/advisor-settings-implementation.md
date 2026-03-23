# AISEP — Advisor Settings Implementation Spec

## 1. Mục tiêu

Triển khai trang `/advisor/settings` như một màn **Account & Security Settings** dành cho Advisor.

Trang này **không** phải là module nghiệp vụ chính của Advisor. Nó chỉ dùng để quản lý:
- thông tin tài khoản cơ bản
- bảo mật tài khoản
- phiên đăng nhập
- tùy chọn nhận thông báo

Trang này **không** chứa các chức năng business như:
- Advisor Profile
- KYC / Resubmit KYC
- Expertise & Services
- Service Pricing
- Availability / Time Slots
- Consulting Requests / Reports
- Earnings / Payouts

---

## 2. Nguồn nghiệp vụ liên quan

`/advisor/settings` không có một use case riêng trong SRS, nhưng có thể được triển khai như một **container page** gom các chức năng chung đang áp dụng cho Advisor:

- `UC-03 Logout`
- `UC-06 Change Password`
- `UC-07 View Notifications`
- `UC-08 Mark Notification as Read/Unread`

Ngoài ra, phần notification preferences có thể bám theo business rule lưu preference theo user cho cả in-app và email.

---

## 3. Scope của màn `/advisor/settings`

### 3.1 In scope

1. Xem thông tin tài khoản cơ bản
2. Xem trạng thái email verification
3. Đổi mật khẩu
4. Đăng xuất khỏi phiên hiện tại
5. Tùy chọn đăng xuất khỏi tất cả thiết bị (optional)
6. Quản lý notification preferences
7. Hiển thị trạng thái lưu / trạng thái thao tác

### 3.2 Out of scope

1. Chỉnh sửa hồ sơ Advisor
2. Submit hoặc Resubmit KYC
3. Quản lý giá tư vấn
4. Quản lý availability
5. Quản lý meeting link
6. Quản lý payout / earnings
7. Quản lý danh sách notification chi tiết

---

## 4. Mục tiêu UX

Trang `/advisor/settings` phải:
- đơn giản
- rõ ràng
- ít cognitive load
- ít section nhưng thực dụng
- ưu tiên an toàn tài khoản

Nguyên tắc UX:
- chia block rõ ràng
- không nhồi business feature vào settings
- mọi thao tác quan trọng phải có feedback ngay
- các action destructive như logout all devices nên có confirmation dialog

---

## 5. IA / Cấu trúc trang

Đề xuất bố cục gồm 4 section:

### Section A — Thông tin tài khoản
Hiển thị dạng read-only:
- Email
- Role = Advisor
- Account status
- Email verification status
- Created at (optional)
- Last password changed at (optional)

### Section B — Bảo mật
Form đổi mật khẩu:
- Current password
- New password
- Confirm new password
- Toggle `Đăng xuất khỏi các thiết bị khác sau khi đổi mật khẩu` (optional)
- Nút `Đổi mật khẩu`

### Section C — Phiên đăng nhập
Hiển thị action:
- `Đăng xuất`
- `Đăng xuất khỏi tất cả thiết bị` (optional)

### Section D — Thông báo
Notification preferences:
- Nhận thông báo trong ứng dụng
- Nhận email thông báo
- Có thể thêm từng category nếu hệ thống muốn chi tiết hơn trong phase sau

---

## 6. Route structure đề xuất

- `GET /advisor/settings` — load toàn bộ dữ liệu settings
- `PATCH /advisor/settings/password` — đổi mật khẩu
- `POST /advisor/settings/logout-current` — đăng xuất phiên hiện tại
- `POST /advisor/settings/logout-all` — đăng xuất tất cả thiết bị
- `PATCH /advisor/settings/notification-preferences` — cập nhật notification preferences

Nếu backend đang dùng auth module chung thì có thể map thành:
- `PATCH /auth/change-password`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `GET /me/settings`
- `PATCH /me/notification-preferences`

---

## 7. UI chi tiết theo section

## 7.1 Section A — Thông tin tài khoản

### Fields hiển thị
- Email
- Vai trò
- Trạng thái tài khoản
- Trạng thái xác minh email

### Gợi ý hiển thị
- badge xanh: `Đã xác minh`
- badge vàng/xám: `Chưa xác minh`
- badge đỏ: `Bị khóa` hoặc `Bị hạn chế` nếu có

### CTA phụ
- Nếu email chưa verify: `Gửi lại email / OTP xác minh`

> Lưu ý: nút resend verification là optional vì SRS có UC Verify Email riêng. Nếu hệ thống đã có flow verify riêng rõ ràng, settings chỉ cần link tới `/verify-email`.

---

## 7.2 Section B — Bảo mật / Đổi mật khẩu

### Inputs
- `currentPassword`
- `newPassword`
- `confirmNewPassword`
- `revokeOtherSessions` (boolean, optional)

### Validation FE
- current password bắt buộc
- new password bắt buộc
- confirm password bắt buộc
- new password phải khác current password
- confirm password phải khớp new password
- có thể enforce rule độ dài tối thiểu, ký tự đặc biệt, chữ hoa, số tùy auth policy

### Validation message gợi ý
- Vui lòng nhập mật khẩu hiện tại
- Vui lòng nhập mật khẩu mới
- Vui lòng xác nhận mật khẩu mới
- Mật khẩu mới không được trùng mật khẩu hiện tại
- Mật khẩu xác nhận không khớp
- Mật khẩu mới chưa đáp ứng chính sách bảo mật

### Flow đổi mật khẩu
1. User nhập current password, new password, confirm password.
2. User bấm `Đổi mật khẩu`.
3. FE validate cơ bản.
4. FE gọi API đổi mật khẩu.
5. BE verify current password.
6. Nếu hợp lệ, BE update password hash.
7. Nếu user bật `revokeOtherSessions`, BE revoke các refresh token/session khác.
8. Ghi audit log.
9. Trả kết quả thành công.
10. UI hiển thị success state.

### Hành vi sau khi thành công
- clear toàn bộ password field
- hiển thị toast `Đổi mật khẩu thành công`
- cập nhật `lastPasswordChangedAt` nếu đang hiển thị

---

## 7.3 Section C — Phiên đăng nhập

### Actions
- `Đăng xuất`
- `Đăng xuất khỏi tất cả thiết bị` (optional)

### Flow logout current session
1. User bấm `Đăng xuất`.
2. Có thể hiện confirmation dialog.
3. FE gọi API logout current session.
4. BE revoke refresh token/session hiện tại.
5. FE clear local auth state.
6. Redirect về login.

### Flow logout all devices
1. User bấm `Đăng xuất khỏi tất cả thiết bị`.
2. Hiện confirmation dialog.
3. FE gọi API logout all.
4. BE revoke tất cả refresh token/session của user.
5. FE clear local auth state.
6. Redirect về login.

### Dialog text gợi ý
**Logout current**
- Title: `Đăng xuất?`
- Description: `Bạn sẽ kết thúc phiên đăng nhập hiện tại.`

**Logout all devices**
- Title: `Đăng xuất khỏi tất cả thiết bị?`
- Description: `Tất cả phiên đăng nhập khác sẽ bị vô hiệu hóa. Bạn sẽ cần đăng nhập lại.`

---

## 7.4 Section D — Notification Preferences

### Phase 1 fields
- `inAppEnabled`
- `emailEnabled`

### Phase 2 optional category-level settings
- consulting request notifications
- consulting schedule reminders
- KYC notifications
- report / review notifications
- payout notifications
- system/security notifications

### UI form
- Toggle `Thông báo trong ứng dụng`
- Toggle `Thông báo qua email`
- Nút `Lưu tùy chọn thông báo`

### Flow
1. User bật/tắt preference.
2. UI đánh dấu dirty state.
3. User bấm lưu hoặc auto-save sau debounce.
4. FE gọi API update preferences.
5. BE lưu preference theo user.
6. Hiển thị trạng thái lưu.

### Save states
- Đang lưu...
- Đã lưu
- Lưu thất bại

---

## 8. Data model đề xuất

## 8.1 Account settings DTO

```ts
export type AdvisorSettingsView = {
  account: {
    email: string
    role: 'ADVISOR'
    accountStatus: 'ACTIVE' | 'LOCKED' | 'SUSPENDED' | 'PENDING'
    emailVerified: boolean
    createdAt?: string
    lastPasswordChangedAt?: string | null
  }
  notificationPreferences: {
    inAppEnabled: boolean
    emailEnabled: boolean
  }
}
```

## 8.2 Change password payload

```ts
export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
  revokeOtherSessions?: boolean
}
```

## 8.3 Notification preferences payload

```ts
export type UpdateNotificationPreferencesPayload = {
  inAppEnabled: boolean
  emailEnabled: boolean
}
```

---

## 9. Database / persistence đề xuất

## 9.1 User / account
Tái sử dụng bảng user/account hiện có:
- email
- role
- passwordHash
- emailVerified
- accountStatus
- createdAt
- updatedAt

## 9.2 Notification preferences

Có thể lưu riêng bảng:

```ts
notification_preferences {
  user_id PK/FK
  in_app_enabled boolean not null default true
  email_enabled boolean not null default true
  created_at timestamp
  updated_at timestamp
}
```

Nếu muốn chi tiết hơn về sau:

```ts
notification_preferences {
  user_id PK/FK
  in_app_enabled boolean
  email_enabled boolean
  consulting_enabled boolean
  schedule_reminder_enabled boolean
  kyc_enabled boolean
  payout_enabled boolean
  system_security_enabled boolean
  created_at timestamp
  updated_at timestamp
}
```

## 9.3 Session / refresh token
Nếu hệ thống có session/token table:
- sessionId
- userId
- refreshTokenHash
- deviceInfo
- ipAddress
- createdAt
- expiresAt
- revokedAt

---

## 10. API contract đề xuất

## 10.1 Get settings

### Request
`GET /advisor/settings`

### Response
```json
{
  "account": {
    "email": "advisor@example.com",
    "role": "ADVISOR",
    "accountStatus": "ACTIVE",
    "emailVerified": true,
    "createdAt": "2026-03-20T08:15:00.000Z",
    "lastPasswordChangedAt": "2026-03-21T10:00:00.000Z"
  },
  "notificationPreferences": {
    "inAppEnabled": true,
    "emailEnabled": false
  }
}
```

## 10.2 Change password

### Request
`PATCH /advisor/settings/password`

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmNewPassword": "NewPass123!",
  "revokeOtherSessions": true
}
```

### Success response
```json
{
  "message": "Password changed successfully"
}
```

### Error cases
- current password sai
- new password không đạt policy
- confirm password không khớp
- account không hợp lệ

## 10.3 Logout current session

### Request
`POST /advisor/settings/logout-current`

### Success response
```json
{
  "message": "Logged out successfully"
}
```

## 10.4 Logout all devices

### Request
`POST /advisor/settings/logout-all`

### Success response
```json
{
  "message": "All sessions revoked successfully"
}
```

## 10.5 Update notification preferences

### Request
`PATCH /advisor/settings/notification-preferences`

```json
{
  "inAppEnabled": true,
  "emailEnabled": true
}
```

### Success response
```json
{
  "message": "Notification preferences updated successfully"
}
```

---

## 11. Authorization / RBAC

### Access rule
- chỉ user đã đăng nhập với role `ADVISOR` mới truy cập `/advisor/settings`
- route phải bị chặn với Guest, Startup, Investor, Operation Staff, Admin

### Server-side enforcement
- không chỉ rely vào FE route guard
- mọi API dưới `/advisor/settings` phải verify JWT/session
- verify đúng `userId`
- verify đúng role `ADVISOR` hoặc dùng endpoint `/me/*` an toàn theo current user

---

## 12. State management FE

## 12.1 Suggested structure
- `settings-page.tsx`
- `account-overview-card.tsx`
- `change-password-form.tsx`
- `session-actions-card.tsx`
- `notification-preferences-form.tsx`

## 12.2 Query / mutation
Nếu dùng React Query:
- `useAdvisorSettingsQuery()`
- `useChangePasswordMutation()`
- `useLogoutMutation()`
- `useLogoutAllMutation()`
- `useUpdateNotificationPreferencesMutation()`

## 12.3 Local state
- password form state local
- dirty state cho notification preferences
- loading state riêng cho từng action

Không nên dùng 1 loading chung cho cả page.

---

## 13. Error handling

### Common errors
- 401 Unauthorized
- 403 Forbidden
- 409 Conflict
- 422 Validation error
- 500 Internal server error

### UI mapping
- sai current password → inline error ở field current password
- password policy fail → inline error ở field new password
- network fail → toast lỗi chung
- logout fail → giữ nguyên session, show lỗi
- update preferences fail → revert UI hoặc giữ dirty state và show retry

---

## 14. Audit log đề xuất

Nên log các action sau:
- password changed
- password change failed do current password invalid
- logout current session
- logout all sessions
- notification preferences updated
- resend verification triggered (nếu có)

Audit fields:
- userId
- action
- timestamp
- ipAddress
- userAgent/deviceInfo
- success/failure

---

## 15. Notification preferences integration

Các notification preferences ở settings phải được notification service dùng khi gửi:
- in-app notifications
- email notifications

Nguyên tắc:
- nếu `emailEnabled = false` thì không gửi email cho category được control bởi preference này
- nếu `inAppEnabled = false` thì không tạo notification inbox cho category được control bởi preference này
- có thể có ngoại lệ cho security-critical notifications tùy policy hệ thống

---

## 16. Edge cases

1. User đang đổi mật khẩu nhưng session hết hạn
- redirect login
- không giữ plaintext password trong storage

2. User bấm logout nhiều lần
- request nên idempotent hoặc FE chặn double submit

3. User tắt toàn bộ notification
- vẫn có thể cần nhận security notifications nếu policy bắt buộc

4. User đổi mật khẩu và bật revoke other sessions
- current session có thể giữ hoặc cũng refresh state tùy policy
- khuyên giữ current session đang dùng, revoke các session còn lại

5. User chưa verify email
- settings vẫn vào được nếu policy cho phép sau login hạn chế
- hoặc chỉ cho xem account status và CTA verify

6. Notification preference save fail
- UI nên giữ state trước đó hoặc cho retry rõ ràng

---

## 17. UI copy gợi ý

### Thông tin tài khoản
- Tiêu đề: `Thông tin tài khoản`
- Mô tả: `Quản lý trạng thái tài khoản và các thiết lập bảo mật cơ bản.`

### Bảo mật
- Tiêu đề: `Bảo mật`
- Mô tả: `Cập nhật mật khẩu để bảo vệ tài khoản của bạn.`

### Phiên đăng nhập
- Tiêu đề: `Phiên đăng nhập`
- Mô tả: `Quản lý các phiên truy cập đang hoạt động.`

### Thông báo
- Tiêu đề: `Tùy chọn thông báo`
- Mô tả: `Chọn cách bạn muốn nhận thông báo từ AISEP.`

---

## 18. Pseudocode

## 18.1 Load page

```ts
onPageLoad() {
  requireAuthRole('ADVISOR')
  data = api.getAdvisorSettings()
  render(data)
}
```

## 18.2 Change password

```ts
async function submitChangePassword(form) {
  validatePasswordForm(form)
  setLoading(true)

  try {
    await api.changePassword(form)
    clearPasswordFields()
    showSuccess('Đổi mật khẩu thành công')
    refetchSettings()
  } catch (error) {
    mapPasswordErrorToUI(error)
  } finally {
    setLoading(false)
  }
}
```

## 18.3 Logout current

```ts
async function handleLogout() {
  const confirmed = await openConfirmDialog()
  if (!confirmed) return

  await api.logoutCurrent()
  clearAuthState()
  router.replace('/login')
}
```

## 18.4 Update notification preferences

```ts
async function saveNotificationPreferences(input) {
  setSaving(true)
  try {
    await api.updateNotificationPreferences(input)
    showSuccess('Đã lưu tùy chọn thông báo')
  } catch (error) {
    showError('Không thể lưu tùy chọn thông báo')
  } finally {
    setSaving(false)
  }
}
```

---

## 19. Acceptance criteria

### Account overview
- Advisor xem được email, role, account status, email verification status
- dữ liệu hiển thị đúng theo current user

### Change password
- Advisor đổi được mật khẩu khi nhập đúng current password
- hệ thống chặn khi confirm password không khớp
- hệ thống chặn khi new password không đạt policy
- sau khi đổi thành công, hiển thị thông báo thành công
- nếu bật revoke other sessions, các session khác bị vô hiệu

### Logout
- Advisor đăng xuất được khỏi phiên hiện tại
- sau logout, user bị redirect về login
- token/session local bị clear

### Logout all devices
- Advisor có thể revoke tất cả phiên khác
- action yêu cầu confirmation

### Notification preferences
- Advisor xem và cập nhật được preference nhận thông báo
- dữ liệu được lưu bền vững sau reload
- UI hiển thị trạng thái lưu rõ ràng

### Security / RBAC
- Guest không truy cập được `/advisor/settings`
- role khác không truy cập được màn Advisor settings
- API không cho sửa settings của user khác

---

## 20. Test checklist

### FE manual
- load settings page thành công
- email verified badge hiển thị đúng
- đổi mật khẩu thành công
- nhập sai current password
- confirm password mismatch
- logout current session
- logout all devices
- toggle notification preferences và lưu
- lỗi mạng khi save preferences
- lỗi mạng khi logout
- responsive mobile/tablet/desktop

### BE tests
- change password success
- change password wrong current password
- change password invalid policy
- logout current success
- logout all success
- update notification preferences success
- unauthorized access
- forbidden role access

---

## 21. Folder structure gợi ý

```text
app/
  advisor/
    settings/
      page.tsx

components/
  advisor/
    settings/
      account-overview-card.tsx
      change-password-form.tsx
      session-actions-card.tsx
      notification-preferences-form.tsx

lib/
  api/
    advisor-settings.ts
  validators/
    advisor-settings.ts
  hooks/
    use-advisor-settings.ts
```

---

## 22. Kết luận triển khai

`/advisor/settings` nên được giữ nhỏ, sạch, và đúng vai trò của một trang **Account Settings**.  
Nó không nên trở thành nơi chứa các business module chính của Advisor.

Nếu triển khai đúng scope, page này sẽ:
- dễ code
- dễ maintain
- không đè lên flow Profile/KYC/Services
- phù hợp với UC chung hiện có trong SRS

