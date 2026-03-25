# AISEP – Admin Workspace Implementation Specification

## 1. Mục tiêu

Admin Workspace là màn hình home chính của **Application Admin** sau khi đăng nhập.  
Màn hình này đóng vai trò như **control center** để Admin:

- quan sát nhanh tình trạng toàn hệ thống
- truy cập nhanh vào các module quản trị quan trọng
- phát hiện các vấn đề cần xử lý sớm
- theo dõi các tín hiệu rủi ro, cảnh báo, log và tác vụ quản trị cần ưu tiên

Theo SRS, **Admin Dashboard** là màn hình chính của Application Admin; các module liên quan của Admin gồm:
- User Management
- Roles & Permissions
- System Settings
- AI Model/Scoring Config
- Blockchain Config
- Audit Logs
- các chức năng monitoring, workflow, report governance, incident/rollback

---

## 2. Mục tiêu UX của màn hình

Admin Workspace không nên chỉ là một dashboard “xem số”.  
Nó phải là một **operational workspace** có 3 giá trị chính:

1. **See**
   - nhìn nhanh sức khỏe hệ thống
   - nhìn nhanh các cảnh báo và điểm bất thường

2. **Decide**
   - biết cái gì cần xử lý trước
   - biết module nào cần vào ngay

3. **Act**
   - có CTA rõ ràng để đi đến màn xử lý chuyên sâu:
     - User Management
     - Roles & Permissions
     - System Settings
     - Audit Logs
     - Monitoring
     - Workflow Management
     - Incident / Rollback

---

## 3. Phạm vi của Admin Workspace

### 3.1 Trong phạm vi
Admin Workspace cần hỗ trợ:
- hiển thị tổng quan hệ thống
- hiển thị tóm tắt user/account governance
- hiển thị tóm tắt RBAC / permission changes
- hiển thị tóm tắt AI/Blockchain/Database/API health
- hiển thị cảnh báo và sự kiện quan trọng gần đây
- hiển thị quick actions đi đến module con
- hiển thị các tác vụ ưu tiên cần admin xử lý
- hiển thị recent audit activity ở mức preview

### 3.2 Ngoài phạm vi
Admin Workspace **không** là nơi xử lý đầy đủ:
- chỉnh sửa chi tiết user
- chỉnh role trực tiếp mức phức tạp cao
- chỉnh full system config
- xem full audit log table
- xử lý workflow chi tiết
- xử lý incident/rollback đầy đủ

Các tác vụ này phải chuyển sang màn chuyên biệt tương ứng.

---

## 4. Actor và quyền truy cập

### Primary Actor
- Application Admin

### Permission rule
- chỉ user đã đăng nhập và có role **Admin** mới được truy cập workspace này
- nếu user không có quyền:
  - không hiển thị route/menu
  - nếu cố truy cập trực tiếp bằng URL thì chuyển sang unauthorized / not allowed screen

### Guard logic
- `isAuthenticated == true`
- `currentRole includes Admin`
- nếu fail:
  - chưa đăng nhập → redirect Login
  - đã đăng nhập nhưng không phải Admin → redirect Unauthorized / Not Allowed

---

## 5. Định vị màn hình trong app

### Tên màn hình
- Admin Workspace
- Admin Dashboard

### Route đề xuất
- `/admin`
- hoặc `/admin/dashboard`

### Vai trò trong flow
- là màn landing sau login thành công của Application Admin
- là hub điều hướng đến tất cả module admin

---

## 6. Cấu trúc layout tổng thể

### 6.1 Bố cục đề xuất

#### A. Top header
Hiển thị:
- title: `Admin Workspace`
- subtitle ngắn: `System governance and operational control center`
- current date/time
- nút refresh dashboard
- notification bell
- admin avatar menu

#### B. Left navigation / side navigation
Nhóm menu rõ theo domain:

- Dashboard
- User Governance
  - User Management
- Access Control
  - Roles & Permissions
  - Permissions Matrix
- Configuration
  - System Settings
  - AI Config
  - Blockchain Config
  - Security Config
- Monitoring
  - System Health
  - AI Service
  - Blockchain Node
  - Database & API
- Compliance
  - Audit Logs
- Workflow
  - Workflow Management
- Governance
  - Escalated Reports / Violation Reports
- Incident
  - Incident Center / Rollback
- Logout

#### C. Main content area
Gồm nhiều section dạng card/grid:

1. System Health Overview
2. Governance Summary
3. Pending / Priority Actions
4. Monitoring Widgets
5. Recent Audit Activity
6. Quick Access
7. Optional: System Announcements / Maintenance Banner

#### D. Right panel (optional)
Có thể dùng cho:
- active alerts
- latest critical incidents
- quick notes / admin reminders

Nếu muốn UI gọn hơn có thể gộp vào main content.

---

## 7. Các section chính trong Admin Workspace

### 7.1 Section: System Health Overview

#### Mục tiêu
Cho Admin nhìn trong 3–5 giây biết hệ thống đang:
- ổn định
- có cảnh báo
- hay đang có lỗi nghiêm trọng

#### Thành phần hiển thị
Các card KPI / status:
- Total Users
- Locked / Flagged Accounts
- Active Roles
- AI Service Status
- Blockchain Node Status
- Database Status
- API Status
- Open Alerts
- High Priority Incidents

#### Logic hiển thị trạng thái
Mỗi card có:
- value chính
- badge trạng thái
- icon
- mô tả ngắn
- CTA khi cần

#### Status rule đề xuất
- `Healthy` → xanh
- `Warning` → vàng/cam
- `Critical` → đỏ
- `Unknown` → xám

### 7.2 Section: Governance Summary

#### Card đề xuất
- Users awaiting attention
- Accounts locked today
- Reactivation requests pending
- Recent role changes
- Workflow changes pending review
- Escalated reports awaiting action

### 7.3 Section: Pending / Priority Actions

#### Dạng hiển thị
Danh sách task ưu tiên dạng table/card:
- loại việc
- đối tượng
- mức ưu tiên
- thời gian phát sinh
- CTA

### 7.4 Section: Monitoring Widgets

4 widget nên có:
1. AI Service Monitor
2. Blockchain Node Monitor
3. Database & API Monitor
4. Overall System Health

### 7.5 Section: Recent Audit Activity

Chỉ hiển thị preview, không hiển thị full log table tại workspace.
Các trường nên có:
- timestamp
- actor
- action
- target
- result
- severity

### 7.6 Section: Quick Access

Card điều hướng đề xuất:
- Manage Users
- Manage Roles & Permissions
- System Settings
- AI Configuration
- Blockchain Configuration
- Security Configuration
- Audit Logs
- Workflow Management
- Escalated Reports
- Incident Center

---

## 8. Luồng sử dụng chính

### 8.1 Luồng vào màn
1. Admin đăng nhập thành công
2. Hệ thống kiểm tra role
3. Nếu role là Admin, redirect vào Admin Workspace
4. Hệ thống tải dữ liệu dashboard
5. Hiển thị dashboard theo thứ tự:
   - shell/layout trước
   - summary cards
   - widgets
   - preview lists
6. Nếu có lỗi một phần, các section khác vẫn tiếp tục hiển thị

### 8.2 Luồng xử lý khi admin click card
Ví dụ:
- click `Locked Accounts` → mở User Management với filter `status=locked`
- click `AI Service Warning` → mở AI Service Monitor
- click `Recent Role Changes` → mở Roles & Permissions hoặc Audit Logs filter theo role changes
- click `Escalated Reports` → mở report queue

Nguyên tắc:
- workspace chỉ làm preview
- summarize
- redirect

---

## 9. Business logic đề xuất cho màn hình

### 9.1 Data loading priority
Ưu tiên tải theo thứ tự:
1. quyền truy cập / user session
2. critical system status
3. priority actions
4. governance summary
5. audit preview
6. secondary widgets

### 9.2 Refresh logic
- có nút `Refresh Dashboard`
- khi refresh: giữ layout ổn định, chỉ update dữ liệu, tránh nhấp nháy toàn bộ màn

### 9.3 State logic
#### Toàn màn
- `initial-loading`
- `ready`
- `partial-error`
- `fatal-error`

#### Từng widget/section
- `loading`
- `ready`
- `empty`
- `error`

Quy tắc:
- một widget error không làm hỏng toàn dashboard
- widget error phải có message ngắn + nút retry section

### 9.4 Badge logic
#### Severity badge
- Critical
- Warning
- Info

#### Operational status badge
- Active
- Inactive
- Healthy
- Degraded
- Down

#### Governance status badge
- Pending
- Under Review
- Escalated
- Resolved

---

## 10. Điều hướng từ workspace đến module con

### 10.1 User Governance
Đi từ:
- locked/flagged account cards
- reactivation tasks
- recent user actions

Đi đến:
- User Management
- User Details

### 10.2 Access Control
Đi từ:
- recent role changes
- suspicious permission changes
- permission-related alerts

Đi đến:
- Roles & Permissions
- Permissions Matrix

### 10.3 Configuration
Đi từ:
- config-related alerts
- quick access cards

Đi đến:
- System Settings
- AI Config
- Blockchain Config
- Security Config

### 10.4 Monitoring
Đi từ:
- status widgets
- red/yellow service cards

Đi đến:
- System Health Monitor
- AI Service Monitor
- Blockchain Node Monitor
- Database & API Monitor

### 10.5 Compliance
Đi từ:
- recent audit preview
- suspicious action alerts

Đi đến:
- Audit Logs

### 10.6 Workflow / Governance / Incident
Đi từ:
- escalated reports
- workflow changes
- incident cards

Đi đến:
- Workflow Management
- Escalated Reports
- Incident Center / Rollback

---

## 11. UI components đề xuất

### 11.1 Layout components
- `AdminShell`
- `AdminSidebar`
- `AdminTopbar`
- `DashboardGrid`

### 11.2 Dashboard components
- `StatusSummaryCard`
- `MetricCard`
- `HealthWidget`
- `PriorityTaskList`
- `AuditPreviewTable`
- `QuickAccessCard`
- `SystemBanner`
- `EmptyStateBlock`
- `SectionErrorState`

### 11.3 Shared components
- `StatusBadge`
- `SeverityBadge`
- `FilterChip`
- `RefreshButton`
- `LastUpdatedText`

---

## 12. Empty states / error states / edge cases

### 12.1 Empty state
Ví dụ:
- không có audit log phù hợp
- không có task ưu tiên
- chưa có alert

### 12.2 Partial error
Ví dụ:
- AI widget lỗi
- Blockchain widget lỗi
- Audit preview lỗi

Cách xử lý:
- section đó hiển thị lỗi riêng
- section khác vẫn hoạt động
- có nút retry cục bộ

### 12.3 Fatal error
Ví dụ:
- session invalid
- quyền truy cập không hợp lệ
- không tải được dashboard shell

### 12.4 No permission
Nếu user không phải Admin:
- không render workspace
- không hiển thị quick actions admin
- redirect hoặc show not authorized

---

## 13. Responsive behavior

### Desktop
- ưu tiên layout nhiều cột
- sidebar cố định
- top summary cards dạng grid 4–6 cột

### Tablet
- giảm còn 2–3 cột
- right panel có thể chuyển xuống dưới

### Mobile
- summary cards xếp dọc
- sidebar thành drawer
- audit preview rút gọn
- quick access dùng list/card stack

---

## 14. Acceptance criteria đề xuất

### AC-01
Khi Admin đăng nhập thành công, hệ thống điều hướng vào Admin Workspace.

### AC-02
Chỉ user có role Admin mới truy cập được Admin Workspace.

### AC-03
Admin Workspace hiển thị được các nhóm thông tin chính:
- system health
- governance summary
- priority actions
- monitoring
- recent audit preview
- quick access

### AC-04
Mỗi card/section quan trọng đều có CTA điều hướng đến màn chuyên biệt liên quan.

### AC-05
Nếu một widget lỗi, các widget khác vẫn hiển thị bình thường.

### AC-06
Dashboard có trạng thái loading, empty, error rõ ràng.

### AC-07
Các trạng thái cảnh báo và severity dùng badge nhất quán.

### AC-08
Audit preview chỉ là bản xem nhanh; full filtering/export nằm ở Audit Logs screen.

### AC-09
Admin có thể refresh dashboard mà không làm vỡ layout.

### AC-10
Các dữ liệu nhạy cảm hoặc hành động đặc quyền chỉ hiển thị nếu đúng quyền truy cập.

---

## 15. Đề xuất triển khai thứ tự

### Phase 1 – MVP
- Admin shell
- sidebar + topbar
- summary cards
- quick access
- priority actions mock
- recent audit preview mock
- loading / error / empty states

### Phase 2
- monitoring widgets đầy đủ
- alert banner
- role-aware rendering chi tiết hơn
- filter context khi chuyển sang module con

### Phase 3
- advanced refresh behavior
- personalization nhỏ cho admin
- saved layout / widget priority
- incident spotlight / maintenance mode banner

---

## 16. Kết luận

Admin Workspace của AISEP nên được triển khai như một **control center có thể hành động**, không phải chỉ là một dashboard thống kê.  
Màn hình này phải giúp Application Admin:

- nhìn toàn cảnh hệ thống thật nhanh
- biết việc gì quan trọng nhất
- đi đến đúng module xử lý chỉ với một thao tác
