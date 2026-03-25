# AISEP – Admin User Details Implementation Specification

## 1. Mục tiêu

Admin **User Details** là màn hình chi tiết cho từng tài khoản trong module quản trị người dùng của **Application Admin**.

Màn hình này được mở khi Admin chọn một user từ **User Management**. Đây là nơi Admin:

- xem đầy đủ thông tin tài khoản của một user
- hiểu rõ trạng thái hiện tại của tài khoản
- kiểm tra vai trò, lịch sử hoạt động gần đây, risk flags và audit preview
- thực hiện các hành động quản trị phù hợp theo trạng thái tài khoản
- chỉnh sửa thông tin cơ bản của user
- khóa / mở khóa tài khoản
- xử lý yêu cầu kích hoạt lại tài khoản nếu có

Màn hình này phải được thiết kế theo hướng **detail-first, action-safe, admin-optimized**:
- nhìn nhanh được tình trạng tài khoản
- thấy rõ hành động nào được phép làm
- tránh thao tác phá hủy hoặc nhầm lẫn
- hỗ trợ AI/code agent triển khai dễ dàng bằng logic rõ ràng

---

## 2. Vai trò của màn hình trong flow Admin

Luồng chính:

1. Admin vào **Admin Workspace**
2. Admin mở **User Management**
3. Admin chọn một user bất kỳ
4. Hệ thống mở **User Details**
5. Admin xem thông tin và thực hiện các action phù hợp

### Vai trò của màn hình

User Details là màn hình trung gian giữa:
- **màn danh sách** (User Management)
- và **các hành động quản trị cụ thể** trên từng user

Nó không chỉ là màn “xem hồ sơ”, mà còn là **trạm điều hành trên từng tài khoản**.

---

## 3. Phạm vi chức năng

### Trong phạm vi

Màn hình cần hỗ trợ:
- xem thông tin chi tiết của user
- xem trạng thái account lifecycle
- xem role hiện tại
- xem risk/flag summary
- xem activity summary và audit preview
- chỉnh sửa thông tin cơ bản của user
- khóa tài khoản
- mở khóa tài khoản
- review và xử lý yêu cầu reactivation
- mở các flow phụ như role change, audit logs, related history

### Ngoài phạm vi

Không xử lý đầy đủ tại màn này các nghiệp vụ sau:
- quản lý toàn bộ ma trận quyền của hệ thống
- chỉnh sửa system-wide roles & permissions phức tạp
- full audit investigation với filter/export nâng cao
- bulk actions trên nhiều user

Những nghiệp vụ đó thuộc các màn riêng:
- Roles & Permissions
- Audit Logs
- User Management

---

## 4. Actor và quyền truy cập

### Primary Actor
- Application Admin

### Access control
Chỉ user có role **Admin** mới được truy cập.

### Guard logic
- `isAuthenticated == true`
- `currentRole includes Admin`
- `targetUserId exists`

### Kết quả nếu không đạt điều kiện
- chưa đăng nhập → redirect Login
- không phải Admin → Unauthorized / Not Allowed
- không tìm thấy user → Not Found state

---

## 5. Tên màn hình và route đề xuất

### Tên màn hình
- User Details
- User Profile Management
- User Account Details

### Route đề xuất
- `/admin/users/:userId`

### Điều hướng vào màn
Có thể vào từ:
- click vào row trong User Management
- click icon xem chi tiết trong User Management
- click từ audit log / alert / priority task

---

## 6. Mục tiêu UX của màn hình

Màn này phải giúp Admin trả lời nhanh 5 câu hỏi:

1. User này là ai?
2. Tài khoản đang ở trạng thái gì?
3. Có dấu hiệu rủi ro / cần chú ý gì không?
4. Admin đang được phép làm những action nào trên tài khoản này?
5. Nếu thao tác, hậu quả của action là gì?

Do đó UX cần:
- nổi bật status chính
- ưu tiên action phù hợp theo ngữ cảnh
- dùng wording rõ và ít mơ hồ
- có confirm step cho action nhạy cảm
- tránh hiển thị đồng loạt action không áp dụng được

---

## 7. Cấu trúc layout tổng thể

## 7.1 Layout khuyến nghị

### A. Top bar / breadcrumb
Hiển thị:
- `Admin Workspace / User Management / User Details`
- nút Back về User Management
- ID user hoặc mã nội bộ

### B. Header section
Hiển thị identity chính của user:
- avatar
- full name / display name
- email
- user ID
- role badge
- status badge
- risk badge nếu có
- created date
- last active

### C. Primary action area
Hiển thị các nút hành động theo trạng thái user, ví dụ:
- Edit user
- Lock account
- Unlock account
- Review reactivation
- Change role
- View full audit logs

### D. Main content area
Nên chia thành các block hoặc tab:

Option 1 – dạng section dọc:
1. Account Overview
2. User Information
3. Roles & Access Summary
4. Status & Risk
5. Activity Summary
6. Audit Preview
7. Reactivation Review (conditional)

Option 2 – dạng tabs:
- Overview
- Account Info
- Access & Roles
- Activity & Audit
- Security & Risk

### Khuyến nghị
Để AI/code agent dễ implement và UX admin rõ hơn, nên dùng:
- **Header + sections dọc** cho phiên bản đầu
- chỉ dùng tabs nếu dữ liệu quá nhiều

---

## 8. Các section chi tiết

## 8.1 Header Identity Block

### Mục tiêu
Cho Admin nhận diện user ngay lập tức.

### Trường hiển thị
- avatar hoặc initials
- full name
- email
- internal user ID
- primary role
- account status
- risk indicator
- created at
- last active

### Thứ tự ưu tiên hiển thị
1. Name / email
2. Status
3. Role
4. Risk
5. Metadata phụ

### Status có thể có
Ví dụ:
- Active
- Pending Review
- Locked
- Pending Reactivation
- Suspended
- Inactive

### Risk có thể có
Ví dụ:
- Normal
- Flagged
- Sensitive
- High Attention

### UX rule
- status phải nổi bật hơn risk
- role badge không được nổi hơn status
- metadata phụ nên dùng text nhẹ hơn

---

## 8.2 Account Overview Section

### Mục tiêu
Tóm tắt tình hình account mà không cần kéo xuống sâu.

### Nội dung hiển thị
- account status hiện tại
- role hiện tại
- verification / review state nếu có
- last login / last active
- account created date
- source tạo tài khoản (nếu hệ thống có)
- lock state
- reactivation request state nếu có

### Dùng card summary nhỏ
Ví dụ:
- Account Status
- Current Role
- Last Activity
- Review State
- Reactivation State

### Logic hiển thị theo trạng thái
- nếu tài khoản bị khóa → nhấn mạnh lý do và thời điểm khóa
- nếu có pending reactivation → hiển thị block cảnh báo riêng
- nếu có pending review → hiển thị CTA review phù hợp

---

## 8.3 User Information Section

### Mục tiêu
Cho Admin xem và cập nhật thông tin cơ bản của user.

### Trường đề xuất
- full name
- display name
- email
- phone number
- organization / company (nếu có)
- account type / actor type
- role label
- created date
- last updated

### Chế độ hiển thị
- mặc định là **read-only**
- bấm `Edit user` → chuyển sang **edit mode**

### Edit mode behavior
- field hợp lệ mới cho sửa
- field quan trọng như email có thể cần confirm hoặc validation chặt hơn
- field không được phép sửa phải disabled rõ ràng

### Form actions
- Save changes
- Cancel

### Validation UX
- inline validation message
- không cho submit khi dữ liệu không hợp lệ
- highlight field lỗi rõ ràng

### Edge case
Nếu user đang bị khóa hoặc ở trạng thái đặc biệt:
- vẫn có thể xem dữ liệu
- quyền edit có thể bị hạn chế tùy rule

---

## 8.4 Roles & Access Summary Section

### Mục tiêu
Cho Admin thấy nhanh user đang có role gì và có quyền truy cập ở mức nào.

### Nội dung hiển thị
- primary role
- secondary roles nếu có
- role assigned date
- assigned by
- access-sensitive flag nếu có
- quick summary số quyền hoặc nhóm quyền nếu hệ thống hỗ trợ

### Action liên quan
- Change role
- View permissions
- Open Roles & Permissions

### UX rule
Section này chỉ nên là **summary + jump-off point**.
Không nên biến User Details thành màn full RBAC editor phức tạp.

### Nếu hỗ trợ quick role change
Nên mở bằng:
- modal
- side drawer

và phải có:
- current role
- new role
- impact note
- confirm step

---

## 8.5 Status & Risk Section

### Mục tiêu
Giải thích rõ vì sao tài khoản đang ở trạng thái hiện tại.

### Nội dung hiển thị
- current status
- status reason
- risk level
- risk reasons / flags
- who last changed status
- when status last changed
- lock reason nếu có
- pending review reason nếu có
- sensitive/flagged indicators nếu có

### UI khuyến nghị
Dùng card hoặc timeline ngắn.

### Ví dụ logic hiển thị
#### Nếu status = Active
- hiển thị trạng thái bình thường
- nút `Lock account` khả dụng
- nút `Unlock` ẩn

#### Nếu status = Locked
- hiển thị block đỏ/cảnh báo
- cho thấy lý do khóa
- cho thấy thời gian khóa
- nút chính phải là `Unlock account`
- nếu có reactivation request thì thêm `Review reactivation`

#### Nếu status = Pending Review
- hiển thị block review state
- action chính nên là `Review account`

#### Nếu status = Pending Reactivation
- hiển thị chi tiết yêu cầu kích hoạt lại
- action chính nên là `Approve reactivation` / `Reject reactivation`

### Nguyên tắc quan trọng
Action phải thay đổi theo status.
Không dùng cùng một bộ action cho mọi user.

---

## 8.6 Activity Summary Section

### Mục tiêu
Cho Admin hiểu user có còn hoạt động hay không và có gì bất thường gần đây.

### Dữ liệu nên có
- last active
- last login
- recent important activity count
- recent failed attempts / alerts nếu có
- device / location summary nếu hệ thống hỗ trợ

### Hiển thị khuyến nghị
- 3–5 dòng summary hoặc mini cards
- không cần full activity log tại đây

### CTA
- View full activity
- View audit logs

---

## 8.7 Audit Preview Section

### Mục tiêu
Preview nhanh các thay đổi quan trọng liên quan đến tài khoản này.

### Chỉ hiển thị preview
Ví dụ 5–10 item gần nhất hoặc quan trọng nhất.

### Trường hiển thị
- timestamp
- actor
- action
- result
- note ngắn

### Ví dụ item
- Account created
- Role updated
- Account locked
- Reactivation requested
- Profile info updated
- Suspicious change flagged

### CTA
- `View full audit logs`

### UX note
Audit preview không thay thế Audit Logs screen.
Chỉ là bản tóm tắt để Admin có ngữ cảnh khi quyết định hành động.

---

## 8.8 Reactivation Review Section (Conditional)

### Khi nào hiển thị
Chỉ hiển thị nếu user đang:
- `Pending Reactivation`
- hoặc có yêu cầu mở lại tài khoản cần review

### Mục tiêu
Cho Admin xử lý yêu cầu mở khóa / kích hoạt lại tài khoản.

### Nội dung hiển thị
- request date
- requested by
- request reason
- related notes
- prior lock reason
- prior lock date
- any risk flags still active

### Action chính
- Approve reactivation
- Reject reactivation
- Keep account locked
- Request more review (nếu flow có)

### UX rule
Đây là action nhạy cảm, phải có:
- confirmation modal
- warning text rõ
- audit logging note

### Nếu approve
- status đổi từ `Pending Reactivation` → `Active`
- unlock state được cập nhật
- hiển thị success message

### Nếu reject
- status không quay về Active
- tài khoản tiếp tục bị khóa hoặc trạng thái từ chối
- có thể yêu cầu note lý do

---

## 9. Hệ thống action theo trạng thái

Đây là phần rất quan trọng để AI/code agent code đúng logic.

## 9.1 Action matrix đề xuất

### Trường hợp A – Active
Action có thể hiển thị:
- Edit user
- Change role
- Lock account
- View audit logs

Action không nên hiển thị:
- Unlock account
- Approve reactivation

### Trường hợp B – Locked
Action có thể hiển thị:
- View lock reason
- Unlock account
- View audit logs
- Review reactivation (nếu có request)

Action không nên hiển thị:
- Lock account

### Trường hợp C – Pending Review
Action có thể hiển thị:
- Review account
- Edit user (nếu business rule cho phép)
- View audit logs

### Trường hợp D – Pending Reactivation
Action có thể hiển thị:
- Approve reactivation
- Reject reactivation
- View lock history
- View audit logs

### Trường hợp E – Sensitive / High Attention
- vẫn hiển thị action theo status chính
- nhưng thêm warning banner hoặc badge
- action nhạy cảm có confirm mạnh hơn

---

## 10. Action flows chi tiết

## 10.1 Flow – View User Details
1. Admin mở User Details bằng user ID hợp lệ
2. Hệ thống kiểm tra quyền Admin
3. Hệ thống tải dữ liệu user
4. Hệ thống hiển thị header identity
5. Hệ thống hiển thị overview, info, status/risk, activity, audit preview
6. Nếu có reactivation request, hiển thị section tương ứng

### Failure cases
- không có quyền → unauthorized
- user không tồn tại → not found
- lỗi tải một phần → section error, phần khác vẫn hiển thị

---

## 10.2 Flow – Edit User Information
1. Admin nhấn `Edit user`
2. Màn chuyển sang edit mode hoặc mở drawer/modal
3. Admin chỉnh các field được phép sửa
4. Hệ thống validate dữ liệu
5. Admin nhấn `Save changes`
6. Hệ thống lưu thay đổi
7. Hệ thống cập nhật lại màn hình chi tiết
8. Hiển thị success feedback
9. Ghi nhận audit entry

### Lưu ý UX
- không auto-save
- phải có cancel
- field không hợp lệ phải hiển thị lỗi ngay

---

## 10.3 Flow – Lock Account
1. Admin nhấn `Lock account`
2. Hệ thống mở confirmation modal
3. Modal hiển thị cảnh báo tác động
4. Admin nhập/chọn reason nếu cần
5. Admin confirm
6. Hệ thống cập nhật status thành `Locked`
7. Header và Status section cập nhật ngay
8. Action button đổi sang `Unlock account`
9. Audit preview có entry mới
10. Hiển thị success toast/message

### Modal nội dung nên có
- tiêu đề rõ: `Lock this account?`
- mô tả hậu quả ngắn
- reason input/select
- confirm button nguy hiểm

---

## 10.4 Flow – Unlock Account
1. Admin nhấn `Unlock account`
2. Hệ thống mở confirmation modal
3. Admin xác nhận
4. Hệ thống cập nhật account về trạng thái hợp lệ
5. Status đổi sang `Active` hoặc trạng thái tương ứng
6. Action button đổi lại thành `Lock account`
7. Audit preview cập nhật
8. Hiển thị success feedback

### UX rule
Unlock không nên là action icon mơ hồ.
Nó nên là action rõ và có confirm.

---

## 10.5 Flow – Approve Reactivation
1. User có trạng thái `Pending Reactivation`
2. Admin mở User Details
3. Reactivation Review section hiển thị đầy đủ thông tin
4. Admin nhấn `Approve reactivation`
5. Hệ thống mở confirm modal
6. Admin xác nhận
7. Hệ thống cập nhật status về `Active`
8. Reactivation section chuyển sang resolved state hoặc biến mất
9. Audit preview cập nhật
10. Hiển thị success state

### Nội dung confirm nên nhấn mạnh
- tài khoản sẽ được kích hoạt lại
- user sẽ truy cập hệ thống trở lại
- hành động sẽ được ghi log

---

## 10.6 Flow – Reject Reactivation
1. Admin nhấn `Reject reactivation`
2. Hệ thống mở modal yêu cầu lý do nếu cần
3. Admin xác nhận từ chối
4. Hệ thống giữ hoặc trả account về trạng thái khóa
5. Hệ thống ghi nhận kết quả review
6. UI cập nhật trạng thái phù hợp
7. Audit preview cập nhật

---

## 10.7 Flow – Change Role
1. Admin nhấn `Change role`
2. Hệ thống mở drawer/modal
3. Hiển thị current role và các role có thể gán
4. Admin chọn role mới
5. Hệ thống hiển thị impact summary ngắn
6. Admin confirm
7. Role badge cập nhật
8. Audit preview cập nhật
9. Có CTA mở sâu sang Roles & Permissions nếu cần

### Lưu ý
Nếu business rule muốn tách role change khỏi màn này, chỉ để CTA dẫn sang màn riêng.

---

## 11. Các trạng thái màn hình

## 11.1 Page states
- `loading`
- `ready`
- `partial-error`
- `not-found`
- `unauthorized`
- `fatal-error`

## 11.2 Section states
Mỗi section có thể ở trạng thái:
- loading
- ready
- empty
- error

### Quy tắc quan trọng
- một section lỗi không làm crash toàn màn
- ví dụ audit preview lỗi nhưng account info vẫn hiển thị bình thường

---

## 12. Empty states và error states

## 12.1 Not Found
Khi user ID không tồn tại:
- hiển thị `User not found`
- có nút quay lại User Management

## 12.2 Unauthorized
Khi không có quyền:
- hiển thị `You do not have permission to access this user`
- không render dữ liệu nhạy cảm

## 12.3 Empty audit preview
- hiển thị `No recent audit activity`
- CTA `Open full audit logs` có thể vẫn hiện nếu phù hợp

## 12.4 No risk flags
- hiển thị badge `Normal` hoặc nội dung `No current risk flags`

## 12.5 No reactivation request
- không hiển thị Reactivation Review section

---

## 13. Component structure gợi ý cho AI/code agent

## 13.1 Page-level components
- `UserDetailsPage`
- `UserDetailsHeader`
- `UserOverviewSection`
- `UserInfoSection`
- `UserRolesSummarySection`
- `UserStatusRiskSection`
- `UserActivitySummarySection`
- `UserAuditPreviewSection`
- `UserReactivationSection`

## 13.2 Reusable components
- `StatusBadge`
- `RiskBadge`
- `MetadataRow`
- `SummaryCard`
- `TimelineList`
- `SectionCard`
- `ConfirmActionModal`
- `EditUserDrawer` or `EditUserModal`
- `ChangeRoleDrawer`

## 13.3 Recommended state containers
- page state
- header summary state
- edit form state
- action loading state
- audit preview state
- reactivation review state

---

## 14. UI behavior rules rất quan trọng

## 14.1 Không hiển thị action vô nghĩa
Ví dụ:
- user đang Locked → không hiển thị `Lock account`
- user đang Active → không hiển thị `Unlock account`
- không có reactivation request → không hiển thị `Approve reactivation`

## 14.2 Action nguy hiểm phải có confirm
Applies to:
- lock account
- unlock account
- approve reactivation
- reject reactivation
- change role (nếu nhạy cảm)

## 14.3 Action xong phải phản ánh ngay lên UI
Ví dụ sau khi lock:
- status badge đổi ngay
- action button đổi ngay
- audit preview cập nhật hoặc refresh
- success feedback hiển thị rõ

## 14.4 Đừng làm User Details thành một form quá dài
Ưu tiên:
- read-only by default
- edit only when needed
- sections rõ ràng

## 14.5 Luôn có đường quay lại danh sách
- breadcrumb
- back button
- preserve filter context nếu có thể

---

## 15. Dữ liệu hiển thị tối thiểu AI/code agent cần chuẩn bị

### Header data
- id
- avatar
- fullName
- email
- role
- status
- risk
- createdAt
- lastActiveAt

### Overview data
- reviewState
- lockState
- reactivationState
- actorType

### Info data
- displayName
- phone
- organization
- editable fields

### Role summary data
- currentRoles
- assignedBy
- assignedAt

### Status & risk data
- statusReason
- lockReason
- flaggedReasons
- lastStatusChangedAt
- lastStatusChangedBy

### Activity summary data
- lastLoginAt
- recentActivityCount
- failedAccessCount

### Audit preview data
- list of audit items

### Reactivation data
- requestDate
- requestReason
- priorLockReason
- reviewable state

---

## 16. Visual priority guidelines

### Phần nổi bật nhất
1. user identity
2. account status
3. actions có thể làm

### Phần nổi bật vừa
4. role
5. risk
6. reactivation state

### Phần phụ
7. metadata ngày giờ
8. audit preview
9. activity summary chi tiết

---

## 17. Responsive behavior

### Desktop
- layout 2 cột hoặc 3 vùng
- header action nằm ngang
- sections hiển thị đầy đủ

### Tablet
- gộp còn 1 cột lớn + action wrap

### Mobile
Màn admin không nên tối ưu quá sâu cho mobile, nhưng vẫn nên usable:
- action stack dọc
- section collapse/accordion
- audit preview rút gọn

---

## 18. Acceptance criteria

### AC-01
Chỉ Admin mới truy cập được màn User Details.

### AC-02
Khi mở bằng user ID hợp lệ, hệ thống hiển thị đầy đủ header identity và các section chính.

### AC-03
Màn hình hiển thị status, role, risk và metadata tài khoản rõ ràng.

### AC-04
Các action hiển thị phải thay đổi theo status của user.

### AC-05
Admin có thể chuyển sang edit mode để cập nhật thông tin cơ bản của user.

### AC-06
Lock account phải có confirmation step và cập nhật UI sau khi hoàn tất.

### AC-07
Unlock account phải có confirmation step và cập nhật UI sau khi hoàn tất.

### AC-08
Nếu có pending reactivation, hệ thống hiển thị Reactivation Review section và action tương ứng.

### AC-09
Audit preview chỉ hiển thị bản tóm tắt, không thay thế màn Audit Logs đầy đủ.

### AC-10
Nếu một section lỗi, các section khác vẫn hiển thị nếu dữ liệu còn khả dụng.

### AC-11
Nếu user không tồn tại, hệ thống hiển thị Not Found state.

### AC-12
Sau mỗi action nhạy cảm, UI phải phản ánh trạng thái mới ngay và hiển thị feedback thành công/thất bại.

---

## 19. Thứ tự triển khai đề xuất

### Phase 1 – MVP
- breadcrumb + back
- header identity block
- overview section
- info section read-only
- status & risk section
- action buttons theo status
- audit preview cơ bản

### Phase 2
- edit mode hoàn chỉnh
- role change drawer
- reactivation review section
- activity summary tốt hơn

### Phase 3
- section refresh tối ưu
- preserve navigation context
- richer audit preview
- warning banners theo mức độ rủi ro

---

## 20. Kết luận

**Admin User Details** phải được triển khai như một màn hình quản trị tài khoản theo ngữ cảnh, không phải chỉ là trang xem hồ sơ.

Mục tiêu của màn này là để Admin:
- hiểu nhanh user đang ở trạng thái nào
- biết ngay hành động nào hợp lệ
- thao tác an toàn, có kiểm soát
- có đủ ngữ cảnh từ risk và audit preview trước khi quyết định

Nếu làm đúng, màn này sẽ là trung tâm cho các flow:
- View user
- Update user info
- Lock / Unlock account
- Review / Approve reactivation
- Jump to role / audit modules
