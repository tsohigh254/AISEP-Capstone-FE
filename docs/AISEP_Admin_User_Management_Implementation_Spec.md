# AISEP – Admin User Management Implementation Specification

## 1. Mục tiêu

Admin User Management là màn hình để **Application Admin** quản lý toàn bộ tài khoản người dùng trong hệ thống AISEP.

Màn hình này tập trung vào 4 mục tiêu chính:
- xem danh sách user toàn hệ thống
- tìm kiếm, lọc và phân loại user theo trạng thái / role / loại tài khoản
- phát hiện nhanh tài khoản cần chú ý (locked, flagged, pending reactivation, suspicious)
- điều hướng sang **User Details** để xử lý sâu hơn như cập nhật thông tin, lock/unlock, xem lịch sử, duyệt reactivation

User Management là màn hình tiếp theo hợp lý sau **Admin Workspace**, vì đây là module core của Admin và là điểm vào của phần governance account.

---

## 2. Vai trò của màn hình trong Admin module

### Đây là màn hình:
- quản lý ở mức **list + filter + review + navigation**
- không phải nơi xử lý quá nhiều form phức tạp cùng lúc

### Nguyên tắc thiết kế
- **List-first**: ưu tiên nhìn tổng quan danh sách user rõ ràng
- **Filter-first**: admin phải khoanh vùng dữ liệu nhanh
- **Action-safe**: action nhạy cảm như lock/unlock cần có confirm
- **Detail-second**: thao tác sâu chuyển sang User Details để tránh màn bị rối

---

## 3. Actor và quyền truy cập

### Primary Actor
- Application Admin

### Access rule
- chỉ user đã đăng nhập và có role **Admin** mới được truy cập
- nếu không đủ quyền:
  - không hiển thị menu
  - truy cập trực tiếp route sẽ bị chặn và chuyển sang Unauthorized / Not Allowed

### Guard logic
- `isAuthenticated == true`
- `currentRole includes Admin`

Nếu fail:
- chưa đăng nhập → redirect Login
- đã đăng nhập nhưng không phải Admin → redirect Unauthorized

---

## 4. Route và vị trí điều hướng

### Route đề xuất
- `/admin/users`

### Đi vào màn này từ đâu
- từ Admin Workspace
- từ Governance Summary card
- từ Priority Actions liên quan account
- từ Audit preview có context user

### Đi ra khỏi màn này đến đâu
- User Details
- Roles & Permissions (nếu cần xem role mapping)
- Audit Logs (nếu cần xem lịch sử chi tiết)

---

## 5. Mục tiêu UX

Admin khi vào màn này cần làm được các việc sau trong thời gian ngắn:
- biết hiện có bao nhiêu user và phân bố ra sao
- biết tài khoản nào cần chú ý ngay
- tìm đúng user rất nhanh
- mở đúng hồ sơ chi tiết để xử lý
- tránh thao tác nhầm trên tài khoản nhạy cảm

Vì vậy màn hình nên ưu tiên:
- bảng dữ liệu rõ ràng
- filter mạnh nhưng dễ dùng
- trạng thái account hiển thị trực quan
- action rõ ràng nhưng an toàn

---

## 6. Phạm vi chức năng

## 6.1 Trong phạm vi
Màn hình này nên hỗ trợ:
- xem danh sách user
- tìm kiếm user
- filter user
- sort user
- xem trạng thái account
- xem role hiện tại
- xem tín hiệu cảnh báo account
- chọn user để mở User Details
- lock / unlock nhanh ở mức cơ bản nếu policy cho phép
- vào queue các tài khoản cần review

## 6.2 Ngoài phạm vi
Không nên xử lý full tại đây:
- chỉnh sửa form chi tiết toàn bộ hồ sơ user
- chỉnh nhiều trường nhạy cảm cùng lúc
- full reactivation workflow nhiều bước
- full audit history của một user
- full role assignment phức tạp

Những phần này nên chuyển sang **User Details** hoặc module riêng.

---

## 7. Cấu trúc layout tổng thể

## 7.1 Page header
Hiển thị:
- title: `User Management`
- subtitle: `Manage user accounts across the AISEP platform`
- refresh button
- optional export button

## 7.2 Summary strip / KPI row
Các card nhỏ ở đầu trang:
- Total Users
- Active Users
- Locked Accounts
- Flagged Accounts
- Pending Reactivation
- Recently Created Accounts

### Mục đích
Cho Admin biết nhanh tình hình account governance trước khi nhìn vào bảng.

---

## 7.3 Filter bar
Các control đề xuất:
- search input
- role filter
- account status filter
- verification / review status filter (nếu dùng)
- created date range
- recently active filter
- sort dropdown
- clear filters button

### Search hỗ trợ
- user full name
- email
- username / ID hiển thị
- organization / company name nếu applicable

---

## 7.4 Main data table
Bảng là thành phần trung tâm của màn hình.

### Cột đề xuất
- User
- Email / Contact
- Role
- Account Type
- Status
- Verification / Risk Badge
- Last Active
- Created At
- Actions

### Giải thích ngắn
**User**
- avatar + display name
- có thể hiện thêm user code nhỏ bên dưới

**Email / Contact**
- email chính
- optional secondary info

**Role**
- Startup / Investor / Advisor / Operation Staff / Admin
- nếu nhiều role thì hiển thị primary role + count

**Account Type**
- cá nhân / tổ chức / hệ thống (nếu hệ thống có phân biệt)

**Status**
- Active
- Locked
- Suspended
- Pending Review
- Pending Reactivation
- Disabled

**Verification / Risk Badge**
- Verified
- Unverified
- Flagged
- High Attention

**Last Active**
- thời gian hoạt động gần nhất

**Created At**
- ngày tạo account

**Actions**
- View Details
- Lock / Unlock
- More actions

---

## 8. Trạng thái account và badge

Cần thống nhất bộ badge để admin nhìn phát hiểu ngay.

## 8.1 Account status badge
- `Active`
- `Locked`
- `Suspended`
- `Pending Review`
- `Pending Reactivation`
- `Disabled`

## 8.2 Risk / attention badge
- `Flagged`
- `Needs Review`
- `Verified`
- `Unverified`
- `Sensitive`

## 8.3 Nguyên tắc hiển thị
- mỗi row luôn có **status chính**
- nếu có rủi ro, hiển thị thêm 1 badge phụ
- tránh nhồi quá nhiều badge gây rối

---

## 9. Các hành vi chính của màn hình

## 9.1 Load lần đầu
1. Admin mở User Management
2. hệ thống kiểm tra quyền truy cập
3. hiển thị page shell + filter bar + loading table
4. tải summary cards
5. tải danh sách user theo default state
6. render kết quả

### Default state đề xuất
- sort theo `Newest activity` hoặc `Recently updated`
- chưa áp filter đặc biệt
- page size mặc định hợp lý

---

## 9.2 Search user
1. Admin nhập từ khóa vào search box
2. hệ thống áp search lên danh sách
3. table cập nhật theo kết quả phù hợp
4. nếu không có kết quả, hiển thị empty state

### Search behavior
- search nên có debounce
- hỗ trợ partial match
- giữ filter hiện tại khi search

---

## 9.3 Filter user
Admin có thể lọc theo:
- role
- account status
- flagged / risk state
- verification state
- date range
- activity state

### Logic filter
- các filter nên hoạt động đồng thời
- cần có chip hiển thị filter đang áp dụng
- có nút `Clear all filters`

---

## 9.4 Sort user
Cho phép sort theo:
- newest created
- oldest created
- recently active
- least active
- alphabetical name
- status priority

### Gợi ý default sort
- recently active hoặc recently updated

---

## 9.5 Open user details
1. Admin click row hoặc click `View Details`
2. hệ thống điều hướng sang User Details
3. context filter/list trước đó có thể được giữ lại để quay về thuận tiện

---

## 9.6 Quick lock / unlock
### Chỉ nên cho phép nếu policy đồng ý
Nếu cho action nhanh ở table:
1. Admin click `Lock` hoặc `Unlock`
2. hiện confirm modal
3. nếu xác nhận thì thực hiện action
4. cập nhật row state
5. hiển thị success/error feedback

### Lưu ý UX
- action này là nhạy cảm
- cần confirm rõ
- nên hiển thị lý do hoặc yêu cầu nhập note nếu policy yêu cầu
- với account nhạy cảm, có thể chỉ cho phép làm trong User Details

---

## 10. Nhóm queue / chế độ xem nhanh đề xuất

Ngoài table tổng, nên có tab hoặc quick preset filter:
- All Users
- Locked Accounts
- Flagged Accounts
- Pending Reactivation
- Recently Created
- High Attention

### Lợi ích
Admin không phải lọc lại nhiều lần cho các nhóm hay dùng.

---

## 11. Business logic đề xuất

## 11.1 Data priority
Khi load màn hình, ưu tiên:
1. access control
2. summary metrics
3. user table
4. risk indicators / queue counts

---

## 11.2 Graceful degradation
Nếu một phần dữ liệu lỗi:
- summary cards lỗi nhưng table vẫn chạy → vẫn cho admin làm việc
- table lỗi nhưng filter shell còn → hiển thị section error rõ ràng
- không để cả màn trắng nếu chỉ hỏng một phần

---

## 11.3 Selection logic
Có thể hỗ trợ chọn row để bulk action ở giai đoạn sau.

### MVP
- chưa cần bulk action phức tạp
- chỉ cần row actions từng user

### Phase sau
- bulk lock
- bulk export
- bulk assign label / internal note

---

## 11.4 Dangerous action logic
Các action như:
- Lock account
- Unlock account
- Suspend account

phải có:
- confirm step
- mô tả tác động
- feedback rõ ràng
- tránh click nhầm

### Modal confirm nên có
- tên user
- email hoặc ID
- hành động sắp thực hiện
- cảnh báo ngắn
- confirm / cancel

---

## 11.5 Status transition guard
Không phải trạng thái nào cũng chuyển được sang nhau tùy ý.

Ví dụ logic:
- Active → Locked: hợp lệ
- Locked → Active: có thể hợp lệ nếu admin có quyền
- Pending Reactivation → Active: hợp lệ qua flow duyệt
- Disabled → Active: có thể cần flow đặc biệt

### UX implication
- action nào không hợp lệ thì không hiện hoặc bị disabled
- không nên cho admin bấm rồi mới báo lỗi nếu có thể biết trước

---

## 11.6 Empty state logic
### Trường hợp 1: chưa có user
Hiển thị empty state toàn màn thân thiện

### Trường hợp 2: search/filter không ra kết quả
Hiển thị:
- message rõ ràng
- nút clear filter
- giữ nguyên filter context để admin hiểu vì sao không có dữ liệu

---

## 12. Các section chi tiết nên có

## 12.1 Summary cards
Card đề xuất:
- Total Users
- Active Accounts
- Locked Accounts
- Flagged Accounts
- Pending Reactivation
- New Accounts This Period

### Click behavior
Bấm card có thể áp filter tương ứng vào table.

Ví dụ:
- click `Locked Accounts` → table filter `status=locked`
- click `Pending Reactivation` → table filter queue tương ứng

---

## 12.2 Filter bar
### Components
- SearchInput
- RoleSelect
- StatusSelect
- RiskSelect
- DateRangePicker
- SortSelect
- ClearFilterButton

### UX note
- filter bar nên sticky khi scroll nếu table dài
- clear filter phải dễ nhìn thấy

---

## 12.3 User table
### Row click
- click vào vùng an toàn của row → mở User Details
- click vào action button → không trigger row navigation

### Table behaviors
- sticky header
- pagination hoặc infinite scroll có kiểm soát
- loading skeleton cho table body

---

## 12.4 Row actions
### Tối thiểu nên có
- View Details
- Lock / Unlock
- More

### More menu có thể gồm
- View Audit Trail
- Review Reactivation
- View Related Reports
- Copy User ID

---

## 13. State design

## 13.1 Page states
- loading
- ready
- partial error
- fatal error

## 13.2 Table states
- loading
- data available
- empty default
- empty after search
- error

## 13.3 Summary states
- loading
- ready
- hidden on error (nếu cần)
- partial error

---

## 14. Error handling

## 14.1 Unauthorized
- show unauthorized screen hoặc redirect

## 14.2 Table load failed
- show inline error block
- có nút retry

## 14.3 Partial data inconsistency
Ví dụ:
- table có dữ liệu nhưng summary count lệch tạm thời

Cách xử lý:
- ưu tiên cho admin làm việc tiếp
- hiển thị `Last updated`
- tránh chặn toàn màn

---

## 15. Điều hướng liên quan

## 15.1 Từ Admin Workspace sang User Management
Từ các điểm vào:
- quick access
- governance summary
- locked accounts card
- pending actions liên quan account

## 15.2 Từ User Management sang User Details
Qua:
- click row
- click action `View Details`

## 15.3 Từ User Management sang Audit Logs
Qua:
- row action `View Audit Trail`
- top level action filter theo selected user

## 15.4 Từ User Management sang Roles & Permissions
Khi admin muốn kiểm tra vấn đề liên quan role

---

## 16. UI components đề xuất

### Page-level
- `UserManagementPage`
- `UserManagementHeader`
- `UserSummaryCards`
- `UserFilterBar`
- `UserDataTable`
- `UserRowActions`

### Shared
- `StatusBadge`
- `RiskBadge`
- `SearchInput`
- `FilterChip`
- `ConfirmActionModal`
- `SectionErrorState`
- `EmptyStateBlock`
- `PaginationControl`

---

## 17. UX writing đề xuất

### Title
- User Management

### Subtitle
- Manage user accounts across the AISEP platform

### Empty states
- `No users found.`
- `No accounts match the current filters.`
- `There are no flagged accounts at the moment.`

### Confirm messages
- `Are you sure you want to lock this account?`
- `Are you sure you want to unlock this account?`

### Success feedback
- `Account locked successfully.`
- `Account unlocked successfully.`
- `User list refreshed.`

### Error feedback
- `Unable to load user data.`
- `This action could not be completed.`

---

## 18. Acceptance criteria đề xuất

### AC-01
Chỉ Admin mới truy cập được User Management.

### AC-02
Màn hình hiển thị được danh sách user toàn hệ thống dưới dạng table rõ ràng.

### AC-03
Admin có thể tìm kiếm user theo từ khóa.

### AC-04
Admin có thể filter user theo role, status và các điều kiện quan trọng.

### AC-05
Admin có thể sort danh sách user theo các tiêu chí phổ biến.

### AC-06
Mỗi row hiển thị được tối thiểu:
- user identity
- email/contact
- role
- status
- last active
- actions

### AC-07
Admin có thể mở User Details từ User Management.

### AC-08
Nếu có quick lock/unlock, hệ thống phải có confirm modal trước khi thực hiện.

### AC-09
Màn hình có loading, empty, error state rõ ràng.

### AC-10
Các summary cards hoặc preset filters có thể hỗ trợ admin đi nhanh vào nhóm user cần xử lý.

---

## 19. Thứ tự triển khai đề xuất

### Phase 1 – MVP
- page shell
- summary cards cơ bản
- filter bar
- user table
- row action `View Details`
- loading / empty / error states

### Phase 2
- quick lock/unlock
- preset queues
- richer badges
- save filter state khi quay lại từ User Details

### Phase 3
- bulk actions
- export
- advanced risk indicators
- admin productivity enhancements

---

## 20. Kết luận

Admin User Management trong AISEP nên được triển khai như một **governance list screen mạnh về lọc, rõ về trạng thái, an toàn về thao tác**.

Màn hình này không nên ôm quá nhiều form chỉnh sửa chi tiết, mà nên làm thật tốt 3 việc:
- nhìn tổng quan user base
- tìm đúng user rất nhanh
- chuyển sang đúng màn xử lý sâu

Nếu User Management được làm đúng logic, toàn bộ flow admin phía sau sẽ mượt hơn rất nhiều, đặc biệt là:
- User Details
- Lock / Unlock flow
- Reactivation review
- Role / permission investigation
- Audit-based account governance
