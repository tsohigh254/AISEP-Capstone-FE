# AISEP – Admin Roles & Permissions Implementation Specification

## 1. Mục tiêu

Màn hình **Vai trò & Quyền** là module quản trị **RBAC (Role-Based Access Control)** dành cho **Application Admin** trong AISEP.

Module này gộp 2 nhóm chức năng có liên quan chặt chẽ với nhau vào **cùng một menu**:

- **Tab 1: Role Management**  
  Dùng để tạo, cập nhật, xóa role và quản lý permission set của từng role.
- **Tab 2: Permissions Matrix**  
  Dùng để xem tổng thể mapping giữa role và permission theo dạng ma trận để review, kiểm tra và đối chiếu.

Mục tiêu của module:
- giúp Admin quản lý role một cách nhất quán
- giúp Admin hiểu rõ quyền nào đang được gán cho role nào
- tránh lỗi cấp quyền sai, thiếu, thừa hoặc chồng chéo
- cung cấp ngữ cảnh rõ ràng trước khi Admin thay đổi permission model
- hỗ trợ AI/code agent implement dễ dàng bằng logic rõ ràng, trạng thái minh bạch, action an toàn

---

## 2. Vì sao gộp 2 chức năng trong 1 module

Theo nghiệp vụ, **Manage Roles & Permissions** và **View Permissions Matrix** là 2 chức năng khác nhau.  
Tuy nhiên, về UX và điều hướng hệ thống, 2 chức năng này thuộc **cùng một domain RBAC**.

Giải pháp tối ưu:
- Sidebar chỉ có **1 menu: Vai trò & Quyền**
- Trong màn này có **2 tab**:
  - `Quản lý vai trò`
  - `Permissions Matrix`

Lợi ích:
- gọn sidebar
- giảm phân mảnh màn hình
- cho Admin chuyển nhanh giữa chỉnh sửa và đối chiếu
- đúng logic quản trị thực tế

---

## 3. Phạm vi chức năng

### 3.1 Trong phạm vi

Module cần hỗ trợ:
- xem danh sách role
- tạo role mới
- cập nhật role
- xóa role
- xem chi tiết role
- gán / bỏ permission cho role
- xem summary của permission theo nhóm
- xem ma trận role-permission
- tìm kiếm / lọc role
- tìm kiếm / lọc permission trong matrix
- điều hướng sang user-related flow khi cần đối chiếu
- ghi nhận audit log cho các thay đổi quan trọng

### 3.2 Ngoài phạm vi

Module này không xử lý trực tiếp:
- tạo user account
- chỉnh profile user
- gán role hàng loạt cho user từ danh sách user
- xem full audit investigation
- chỉnh system config ngoài RBAC

Các nghiệp vụ đó thuộc:
- User Management
- User Details
- Audit Logs
- System Settings

---

## 4. Actor và quyền truy cập

### Primary Actor
- Application Admin

### Access rule
Chỉ user có role **Admin** mới truy cập được module này.

### Guard logic
- `isAuthenticated == true`
- `currentRole includes Admin`

### Nếu không thỏa
- chưa đăng nhập → redirect Login
- không phải Admin → Unauthorized / Not Allowed
- không có quyền trên route con → chặn truy cập tab/action tương ứng

---

## 5. Tên màn hình, route và điều hướng

### Tên module
- Vai trò & Quyền
- Roles & Permissions

### Route đề xuất
- `/admin/roles-permissions`

### Route con đề xuất
- `/admin/roles-permissions/roles`
- `/admin/roles-permissions/matrix`

### Điều hướng vào module
Có thể vào từ:
- sidebar admin
- quick access từ Admin Workspace
- deep link từ User Details
- deep link từ Audit Logs nếu admin đang điều tra thay đổi role/permission

---

## 6. Mục tiêu UX của module

Module này phải giúp Admin trả lời nhanh các câu hỏi sau:

1. Hệ thống hiện có những role nào?
2. Mỗi role đang có những quyền gì?
3. Role nào nên được sửa thay vì tạo mới?
4. Nếu thay đổi permission của một role thì tác động sẽ là gì?
5. Quyền đang bị cấp thừa / thiếu / bất nhất ở đâu?
6. Sau khi sửa role, có cách nào kiểm tra lại nhanh toàn bộ mapping không?

Vì vậy UX cần:
- tách rõ **chỉnh sửa** và **đối chiếu**
- dễ chuyển qua lại giữa 2 tab
- hiển thị impact rõ trước action nhạy cảm
- ngăn xóa/sửa role một cách vô ý
- tránh biến matrix thành nơi chỉnh sửa phức tạp nếu chưa cần

---

## 7. Kiến trúc UX tổng thể

## 7.1 Cấu trúc module

### Header module
Hiển thị:
- breadcrumb: `Admin Workspace / Vai trò & Quyền`
- title: `Vai trò & Quyền`
- subtitle ngắn: `Manage RBAC roles and review permission mappings`
- action phụ nếu cần:
  - Create role
  - View audit logs

### Tab navigation
- **Tab 1: Quản lý vai trò**
- **Tab 2: Permissions Matrix**

### Quy tắc tab
- tab được nhớ theo URL/query state
- khi refresh vẫn giữ tab hiện tại
- khi điều hướng từ nơi khác có thể mở thẳng tab phù hợp

---

## 8. Tab 1 – Quản lý vai trò

## 8.1 Mục tiêu

Đây là nơi Admin quản lý vòng đời của role:
- xem role
- tạo role
- cập nhật role
- xóa role
- chỉnh permission set của role

Tab này là **action-oriented**.

---

## 8.2 Bố cục khuyến nghị

### A. Top toolbar
Bao gồm:
- search role by name/description
- filter theo trạng thái hoặc nhóm role nếu có
- sort
- button `Tạo vai trò`

### B. Role list panel
Hiển thị danh sách role dưới dạng:
- table
hoặc
- list card

### C. Role detail / editor panel
Có thể triển khai 1 trong 2 cách:

#### Cách 1 – Master/detail
- bên trái: danh sách role
- bên phải: chi tiết role đang chọn

#### Cách 2 – List + drawer/modal
- danh sách role ở màn chính
- click role hoặc action → mở detail page / drawer

### Khuyến nghị
Để dễ code và dễ scale:
- dùng **List + detail panel/drawer** cho web admin
- nếu muốn sâu hơn có thể tách route detail

---

## 8.3 Dữ liệu role tối thiểu cần hiển thị

Mỗi role nên có:
- role ID
- role name
- description
- permission count
- created at
- updated at
- assigned user count (nếu có)
- created by / updated by (nếu có)
- system role flag / protected flag (nếu có)

### Hiển thị gợi ý
Columns hoặc card fields:
- Tên vai trò
- Mô tả
- Số quyền
- Số user đang dùng
- Cập nhật gần nhất
- Hành động

---

## 8.4 Các action chính trong tab Role Management

### Action 1 – View role details
Cho Admin xem:
- role name
- description
- permission groups
- permissions selected
- assigned user count
- metadata thay đổi

### Action 2 – Create role
Cho Admin tạo role mới và chọn permission set ban đầu.

### Action 3 – Update role
Cho Admin chỉnh:
- role name
- description
- permission set

### Action 4 – Delete role
Cho Admin xóa role nếu role đó đủ điều kiện xóa.

### Action 5 – Duplicate role (khuyến nghị)
Không bắt buộc theo doc, nhưng rất hữu ích cho UX:
- sao chép role hiện có để tạo role tương tự
- giảm lỗi cấu hình tay
- rất hợp với module RBAC

Nếu bạn muốn bám doc cực chặt thì có thể để phase sau.

---

## 8.5 Create Role flow

### Mục tiêu
Cho Admin tạo một role mới với permission set hợp lệ.

### UI đề xuất
Dùng **drawer** hoặc **modal lớn** hoặc **detail editor panel**.

### Form fields
- Role name
- Description
- Permission groups
- Individual permissions
- Optional note / reason for creation

### Permission selection UX
Nên hỗ trợ:
- chọn theo group
- expand/collapse group
- chọn từng permission
- hiển thị số permission đã chọn

### Flow chi tiết
1. Admin nhấn `Tạo vai trò`
2. Hệ thống mở Create Role form
3. Admin nhập role name
4. Admin nhập description
5. Admin chọn permission theo group hoặc từng item
6. Hệ thống hiển thị summary:
   - số permission đã chọn
   - nhóm permission đang dùng
7. Admin nhấn `Lưu`
8. Hệ thống validate:
   - role name không rỗng
   - role name không trùng
   - permission values hợp lệ
9. Nếu hợp lệ:
   - tạo role
   - lưu mapping role-permission
   - ghi audit log
   - hiển thị success message
10. Role mới xuất hiện trong danh sách

### Validation
- role name bắt buộc
- role name unique
- permission không được chứa giá trị không hợp lệ
- nếu hệ thống có protected namespace thì phải chặn theo rule

### UX note
- không nên auto-save
- phải có nút `Hủy`
- nếu đóng form khi có thay đổi chưa lưu → cảnh báo confirm

---

## 8.6 Update Role flow

### Mục tiêu
Cho Admin cập nhật role hiện có khi cần thay đổi chính sách truy cập.

### Trường được sửa
- role name
- description
- permission set

### Flow chi tiết
1. Admin chọn một role
2. Hệ thống mở role detail
3. Hệ thống load role data + permission mapping hiện tại
4. Admin chỉnh sửa thông tin
5. Admin thay đổi permission selections
6. Hệ thống hiển thị impact preview ngắn:
   - số permission thêm mới
   - số permission bị bỏ
   - số user đang dùng role này
7. Admin nhấn `Lưu thay đổi`
8. Hệ thống validate dữ liệu
9. Nếu hợp lệ:
   - cập nhật role
   - cập nhật role-permission mappings
   - ghi audit log
   - refresh detail + list
   - hiển thị success message

### UX note rất quan trọng
Khi role đang được nhiều user sử dụng, việc đổi permission có tác động lớn.  
Nên hiển thị cảnh báo kiểu:
- `This role is currently assigned to 12 users. Permission changes will affect all of them.`

---

## 8.7 Delete Role flow

### Mục tiêu
Cho Admin xóa role không còn sử dụng hoặc được tạo sai.

### Điều kiện đề xuất
Role chỉ được xóa khi:
- role tồn tại
- role không phải system-protected role
- role không đang gán cho user nào, hoặc policy cho phép xử lý reassignment trước
- action phù hợp RBAC policy

### Flow chi tiết
1. Admin chọn `Xóa vai trò`
2. Hệ thống mở confirm modal
3. Modal hiển thị:
   - role name
   - assigned user count
   - warning impact
4. Nếu role không đủ điều kiện xóa:
   - disable confirm
   - hiển thị lý do
5. Nếu được phép:
   - Admin confirm
   - hệ thống xóa role
   - xóa/cleanup mappings theo policy
   - ghi audit log
   - remove khỏi list
   - hiển thị success message

### UX rule
Delete là action nguy hiểm:
- dùng nút danger
- confirm modal rõ ràng
- nếu role đang được dùng thì không nên cho xóa im lặng

---

## 8.8 Permission selection UX trong tab Role Management

### Cấu trúc nhóm quyền khuyến nghị
Nên group permission theo domain:
- User Governance
- Access Control
- Configuration
- Monitoring
- Audit & Compliance
- Workflow
- Governance / Reports
- Incident Handling
- Common / Notifications
- Startup
- Investor
- Advisor
- Operation Staff

### Mỗi permission item nên có
- permission name
- description ngắn
- category
- optional risk level

### Tương tác nên có
- select all trong 1 group
- expand/collapse group
- filter permission theo từ khóa
- hiển thị selected count
- compare current vs edited state

### UX note
Đừng để danh sách permission thành một block checkbox rất dài và khó đọc.  
Nên group + spacing rõ.

---

## 8.9 Role list states

### Loading
- skeleton cho list
- skeleton cho detail panel

### Empty
- message `No roles found`
- CTA `Create role`

### Error
- error block
- retry button

### No search result
- message `No roles match your search`
- clear search/filter CTA

---

## 9. Tab 2 – Permissions Matrix

## 9.1 Mục tiêu

Tab này giúp Admin **review tổng thể** mapping giữa role và permission.

Tab này thiên về:
- đối chiếu
- kiểm tra
- xác minh
- tìm inconsistency

Không nên biến đây thành nơi chỉnh sửa nặng nếu chưa thật cần.

---

## 9.2 Bố cục khuyến nghị

### A. Top controls
- search permission
- filter by category
- filter by role
- toggle show only assigned permissions
- toggle compact / full labels
- export button (nếu phase sau)

### B. Matrix area
- hàng dọc: permissions
- cột ngang: roles
- ô giao nhau: assigned / not assigned

### C. Sticky headers
Nên có:
- sticky role header row
- sticky permission name column
để matrix dài vẫn usable

---

## 9.3 Dữ liệu hiển thị trong matrix

### Role columns
Mỗi cột role nên hiển thị:
- role name
- optional permission count
- optional protected badge

### Permission rows
Mỗi hàng permission nên hiển thị:
- permission name
- description ngắn
- category/group
- optional risk/critical marker

### Cell state
Mỗi ô giao giữa role và permission nên có 1 trong các trạng thái:
- assigned
- not assigned
- inherited / locked (nếu hệ thống có khái niệm này)
- unavailable (nếu permission không áp dụng)

### Hiển thị cell
Có thể dùng:
- check icon
- dot
- colored state
- disabled state

Nhưng phải đủ contrast và dễ scan nhanh.

---

## 9.4 Mục tiêu UX của matrix

Admin phải làm được các việc sau rất nhanh:
- nhìn một permission và biết role nào đang có
- nhìn một role và biết nhóm quyền nào đang thiếu hoặc đang thừa
- lọc theo category để không bị ma trận quá to
- tìm một permission cụ thể
- đối chiếu thay đổi sau khi sửa role

---

## 9.5 Tương tác trong matrix

### Bắt buộc nên có
- search permission
- filter category
- scroll ngang nếu nhiều role
- scroll dọc nếu nhiều permission
- sticky headers

### Khuyến nghị nên có
- click cell để mở tooltip
- click role header để jump sang role detail
- click permission row để xem mô tả
- highlight column/row on hover
- toggle `Show only differences` hoặc `Show assigned only`

### Có nên edit trực tiếp trên matrix không?
Khuyến nghị:
- **giai đoạn đầu: không chỉnh trực tiếp**
- matrix chỉ để review
- muốn chỉnh thì click role → chuyển sang tab Quản lý vai trò

Lý do:
- ít lỗi hơn
- dễ kiểm soát hơn
- dễ code hơn
- tránh action sai vì lỡ click cell

Nếu phase sau muốn nâng cấp:
- có thể cho inline toggle cell với confirm

---

## 9.6 Matrix states

### Loading
- skeleton grid
- sticky placeholder header

### Empty
- nếu chưa có role hoặc permission:
  - hiển thị message phù hợp
  - CTA tạo role hoặc kiểm tra permission data

### Error
- error block riêng cho matrix
- retry button

### No filter result
- message `No permissions match the current filter`

---

## 10. Mối liên hệ giữa 2 tab

Đây là logic cực quan trọng để AI/code agent triển khai đúng.

### Rule 1
Thay đổi role ở tab `Quản lý vai trò` phải phản ánh ngay sang `Permissions Matrix`.

### Rule 2
Nếu Admin đang ở matrix và click vào role header:
- mở role detail tương ứng trong tab `Quản lý vai trò`
hoặc
- mở drawer role detail

### Rule 3
Nếu Admin vừa save role update:
- matrix cần refresh hoặc sync state

### Rule 4
Nếu role bị xóa:
- matrix phải bỏ cột role đó ngay sau refresh thành công

---

## 11. Business logic quan trọng

## 11.1 Protected/System roles

Nên định nghĩa rõ khái niệm:
- system role
- protected role

Ví dụ:
- Admin
- Operation Staff
- Startup
- Investor
- Advisor

Các role lõi này có thể:
- không cho xóa
- chỉ cho sửa một phần
- hoặc cho sửa nhưng cần confirm mạnh hơn

### UX hiển thị
- protected badge
- tooltip giải thích
- disable delete button nếu không cho xóa

---

## 11.2 Permission categories

Permission nên được nhóm theo category để:
- list role dễ đọc
- matrix dễ lọc
- editor dễ dùng

Ví dụ categories:
- Admin Access
- User Governance
- Verification / Review
- AI
- Blockchain
- Messaging
- Document Access
- Advisory / Consulting
- Monitoring
- Audit

---

## 11.3 Impact awareness

Khi update role, Admin cần thấy:
- role đang gán cho bao nhiêu user
- thay đổi này ảnh hưởng các user đó thế nào
- có bỏ quyền quan trọng nào không
- có thêm quyền nhạy cảm nào không

### UX khuyến nghị
Trước khi Save:
- hiển thị summary panel:
  - `+3 permissions added`
  - `-1 permission removed`
  - `Applies to 8 assigned users`

---

## 11.4 Audit logging

Mọi action quan trọng phải được log:
- create role
- update role
- delete role
- change permission mapping

### Trong UI
Nên có:
- success toast
- optional inline note `This action has been recorded in audit logs`
- quick CTA `View audit log`

---

## 12. States của toàn module

### Page states
- loading
- ready
- partial-error
- unauthorized
- fatal-error

### Tab states
Mỗi tab có:
- loading
- ready
- empty
- error

### Nguyên tắc
- tab matrix lỗi không làm hỏng tab role management
- tab role management lỗi không làm crash toàn module
- nếu chỉ một panel detail lỗi, list vẫn nên giữ

---

## 13. Empty states và edge cases

## 13.1 Chưa có role nào
- hiển thị empty state
- CTA `Create first role`

## 13.2 Search không ra
- `No roles found`
- clear filter CTA

## 13.3 Không có permission data
- hiển thị warning state
- hướng Admin kiểm tra cấu hình permission source

## 13.4 Role đang được gán cho user
- không cho delete âm thầm
- phải hiển thị assigned user count

## 13.5 Role name trùng
- show inline validation
- không cho save

## 13.6 Admin cố sửa role protected
- nếu bị hạn chế:
  - disable trường/action không hợp lệ
  - hiển thị lý do

## 13.7 Matrix quá rộng
- phải có horizontal scroll
- sticky headers
- role columns không được co quá mức

---

## 14. Component structure gợi ý cho AI/code agent

## 14.1 Page-level components
- `RolesPermissionsPage`
- `RolesPermissionsHeader`
- `RolesPermissionsTabs`

## 14.2 Tab 1 components
- `RoleManagementTab`
- `RoleToolbar`
- `RoleList`
- `RoleListItem` or `RoleTable`
- `RoleDetailPanel`
- `CreateRoleDrawer`
- `EditRoleDrawer`
- `DeleteRoleConfirmModal`
- `PermissionGroupSelector`
- `PermissionItem`
- `RoleImpactSummary`

## 14.3 Tab 2 components
- `PermissionsMatrixTab`
- `MatrixToolbar`
- `PermissionsMatrixGrid`
- `RoleHeaderCell`
- `PermissionRow`
- `PermissionMatrixCell`
- `MatrixLegend`
- `MatrixEmptyState`

## 14.4 Shared components
- `StatusBadge`
- `ProtectedRoleBadge`
- `SearchInput`
- `FilterDropdown`
- `ConfirmModal`
- `EmptyStateBlock`
- `SectionErrorState`
- `ToastFeedback`

---

## 15. Data model tối thiểu ở FE level

### Role item
- id
- name
- description
- permissionCount
- assignedUserCount
- isProtected
- createdAt
- updatedAt

### Role detail
- id
- name
- description
- permissions[]
- permissionGroups[]
- assignedUsersSummary
- createdBy
- updatedBy

### Permission item
- id
- name
- description
- category
- isCritical
- isSensitive

### Matrix data
- roles[]
- permissions[]
- assignments[]  
  hoặc mapping dạng:
  - `roleId -> permissionIds[]`

---

## 16. UI behavior rules rất quan trọng

## 16.1 Không cho delete role vô điều kiện
Phải kiểm tra:
- protected?
- assigned user count?
- policy allow?

## 16.2 Không tự save khi chỉnh permission
Admin cần chủ động confirm save.

## 16.3 Mọi thay đổi permission nên có impact summary
Nhất là khi role đang có nhiều user.

## 16.4 Matrix mặc định là review-first
Không nên inline-edit cell ở bản đầu.

## 16.5 Chuyển tab không được làm mất thay đổi chưa lưu
Nếu đang edit role mà chuyển tab:
- hệ thống phải cảnh báo unsaved changes

## 16.6 Role detail phải rõ current state và edited state
Có thể hiển thị:
- added permissions
- removed permissions
- unchanged permissions

## 16.7 Search/filter phải không phá vỡ context
Ví dụ:
- đang mở role detail mà filter thay đổi làm role biến mất khỏi list
- UI vẫn phải xử lý mượt, không vỡ state

---

## 17. Responsive behavior

### Desktop
- ưu tiên đầy đủ:
  - tab header
  - role list
  - detail panel
  - matrix scroll

### Tablet
- role detail có thể chuyển thành drawer
- matrix có thể giảm mật độ thông tin

### Mobile
Admin RBAC module không nên tối ưu sâu cho mobile, nhưng vẫn nên usable:
- tabs vẫn dùng được
- role list dạng stacked cards
- matrix chỉ hỗ trợ xem rút gọn hoặc cảnh báo trải nghiệm hạn chế

---

## 18. Acceptance criteria

### AC-01
Chỉ Admin mới truy cập được module Vai trò & Quyền.

### AC-02
Sidebar chỉ có một menu `Vai trò & Quyền`, nhưng bên trong module có 2 tab:
- Quản lý vai trò
- Permissions Matrix

### AC-03
Tab Quản lý vai trò hiển thị được danh sách role và thông tin cơ bản của từng role.

### AC-04
Admin có thể tạo role mới với role name, description và permission set hợp lệ.

### AC-05
Admin có thể cập nhật role hiện có và thay đổi permission mapping của role đó.

### AC-06
Admin chỉ có thể xóa role khi role đó đủ điều kiện theo policy.

### AC-07
Tab Permissions Matrix hiển thị đúng quan hệ giữa role và permission theo dạng ma trận.

### AC-08
Admin có thể search/filter role trong tab Quản lý vai trò.

### AC-09
Admin có thể search/filter permission hoặc category trong tab Permissions Matrix.

### AC-10
Sau khi role hoặc permission mapping thay đổi, dữ liệu giữa 2 tab phải đồng bộ.

### AC-11
Các action quan trọng như create/update/delete role đều phải hiển thị feedback rõ ràng và ghi audit log.

### AC-12
Module phải có loading, empty, error states rõ ràng cho từng tab.

### AC-13
Nếu Admin đang chỉnh sửa role nhưng chưa lưu, chuyển tab hoặc rời màn hình phải có cảnh báo unsaved changes.

### AC-14
Protected/system roles phải được đánh dấu rõ ràng và action bị hạn chế theo rule.

---

## 19. Thứ tự triển khai đề xuất

### Phase 1 – MVP
- module shell + tabs
- role list
- role detail cơ bản
- create role
- update role
- permissions matrix read-only
- loading/empty/error states

### Phase 2
- delete role with policy checks
- impact summary
- protected role handling
- matrix filters tốt hơn
- deep link giữa matrix và role detail

### Phase 3
- duplicate role
- export matrix
- advanced compare view
- optional inline edit in matrix (nếu thực sự cần)

---

## 20. Kết luận

Module **Vai trò & Quyền** trong AISEP nên được triển khai như một **RBAC workspace** gộp 2 tab:
- **Quản lý vai trò** để chỉnh sửa
- **Permissions Matrix** để đối chiếu

Đây là phương án tối ưu nhất vì:
- đúng logic nghiệp vụ
- gọn sidebar
- dễ hiểu với Admin
- dễ code, dễ maintain
- hỗ trợ mở rộng tốt về sau

Nếu làm đúng, module này sẽ giúp Admin:
- quản trị role an toàn hơn
- giảm lỗi cấp quyền
- hiểu rõ toàn bộ permission model của hệ thống
- kiểm tra nhanh tác động của các thay đổi RBAC trước và sau khi áp dụng
