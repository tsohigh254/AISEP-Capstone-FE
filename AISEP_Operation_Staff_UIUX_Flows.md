# AISEP - Operation Staff UI/UX Flow Specification

## 1. Mục tiêu tài liệu
Tài liệu này mô tả **flow chi tiết cho từng function của role Operation Staff** trong AISEP để phục vụ thiết kế UI/UX.

Phạm vi gồm 4 nhóm chính:
- Platform Monitoring
- KYC Operations
- AI / Trust / Governance
- Consulting / Payment Operations

Tài liệu này:
- Tập trung vào flow nghiệp vụ và hành vi người dùng
- Phục vụ thiết kế màn hình, trạng thái, interaction và decision point
- Không map API
- Không mô tả chi tiết BE

---

## 2. Khung flow tổng cho role Operation Staff

### 2.1 Mô hình thao tác chung
Hầu hết function của Operation Staff nên đi theo pattern:

**Dashboard / Queue**  
→ **List screen**  
→ **Detail screen**  
→ **Review / Decision panel**  
→ **Confirmation modal**  
→ **Success state**  
→ **History / Audit trail**

### 2.2 Loại flow trong module Ops
Có 3 loại flow chính:

#### A. Monitoring flow
Dùng cho:
- Monitor Platform Activity
- View Activity Reports

Đặc điểm:
- đọc dữ liệu tổng quan
- drill-down sang danh sách case
- ít action nhạy cảm

#### B. Case handling flow
Dùng cho:
- KYC
- AI exception
- Complaint / dispute
- Issue report
- Sensitive profile changes
- Consulting exception

Đặc điểm:
- list nhiều case
- mở detail
- review evidence
- ra quyết định

#### C. Approval flow
Dùng cho:
- Approve KYC
- Reject KYC
- Request resubmission
- Approve payout
- Approve refund

Đặc điểm:
- action nhạy cảm
- cần confirm
- cần reason/note
- cần update timeline

### 2.3 Quy tắc UX chung
- Mọi case đều phải có: **Case ID, status, priority, created at, actor liên quan**
- Mọi action nhạy cảm đều phải có:
  - confirm
  - note hoặc reason
  - audit trail
- Không nên để user approve/reject ngay từ list row
- List chỉ để scan, filter, open detail
- Decision chính nên diễn ra ở **detail page** hoặc **review workspace**

---

# 3. Flow chi tiết cho từng function

---

# OS-F01. Monitor Platform Activity

## Mục tiêu
Cho Operation Staff theo dõi tình trạng hoạt động chung của nền tảng và phát hiện module/case cần xử lý.

## Entry points
- Sidebar: `Platform Activity`
- Dashboard widget: `Platform Health`, `Abnormal Activity`, `Ops Alerts`

## Flow chính
### Bước 1: Staff mở màn Platform Activity
Hệ thống hiển thị:
- date range mặc định
- KPI cards
- trend charts
- alert panel
- recent operational activities

### Bước 2: Staff scan dữ liệu tổng quan
Các block nên có:
- số lượng KYC pending
- dispute đang mở
- payout pending
- refund pending
- AI exception
- issue reports
- case overdue

### Bước 3: Staff phát hiện bất thường
Ví dụ:
- KYC tăng đột biến
- complaint spike
- payout queue quá hạn
- issue severity cao

UI nên cho click vào từng card/chart point/alert item.

### Bước 4: Staff click drill-down
Hệ thống điều hướng đến list tương ứng:
- KYC list
- Dispute list
- Payout approval list
- Issue reports list

### Bước 5: Staff tiếp tục xử lý tại module đích
Đây là điểm nối từ monitoring sang case handling.

## Luồng phụ
### Trường hợp không có dữ liệu
Hiển thị:
- empty chart
- thông báo “Không có dữ liệu trong khoảng thời gian đã chọn”

### Trường hợp data delayed
Hiển thị:
- banner cảnh báo dữ liệu có thể chưa realtime
- last updated timestamp

### Trường hợp một module lỗi
Ví dụ chỉ lỗi KYC metrics:
- block KYC báo lỗi riêng
- phần còn lại vẫn hoạt động

## UI/UX cần có
- KPI card click được
- Chart hover xem số liệu
- Alert panel ưu tiên màu cảnh báo
- Filter date range nằm cố định trên đầu

## State cần thiết kế
- Loading
- Empty
- Partial error
- Success
- Data stale warning

---

# OS-F02. View Activity Reports

## Mục tiêu
Cho staff xem báo cáo tổng hợp theo thời gian và module.

## Entry points
- Từ `Platform Activity`
- Sidebar: `Activity Reports`

## Flow chính
### Bước 1: Staff mở Activity Reports
Hệ thống hiển thị:
- filter bar
- report summary blocks
- bảng dữ liệu báo cáo

### Bước 2: Staff chọn loại báo cáo
Ví dụ:
- KYC report
- Complaint/dispute report
- Payment operations report
- Issue resolution report
- AI exception report

### Bước 3: Staff áp filter
Các filter nên có:
- date range
- module
- role type
- status
- reviewer [ASSUMPTION nếu cần]

### Bước 4: Hệ thống render summary
Ví dụ:
- total cases
- resolved cases
- avg handling time
- rejection rate
- overdue count

### Bước 5: Staff đọc report detail
Có thể theo:
- ngày
- tuần
- tháng

### Bước 6: Staff export hoặc save preset
Nếu có:
- export file
- lưu bộ lọc

## Luồng phụ
### Không có kết quả
Hiển thị empty state + nút reset filter

### Bộ lọc quá hẹp
Cho hint “Hãy mở rộng thời gian hoặc bỏ bớt filter”

## UI/UX cần có
- summary trước, detail sau
- bảng dữ liệu có sort
- export nằm góc phải
- report blocks clickable để drill-down

## State cần thiết kế
- Loading report
- Empty result
- Exporting
- Export success / fail

---

# OS-F03. View Pending KYC Submissions

## Mục tiêu
Cho staff xem toàn bộ hồ sơ KYC đang chờ xử lý.

## Entry points
- Dashboard widget: Pending KYC
- Sidebar: KYC Review
- Drill-down từ Platform Activity

## Flow chính
### Bước 1: Staff mở danh sách Pending KYC
Hệ thống hiển thị:
- search
- filter
- table danh sách hồ sơ pending

### Bước 2: Staff scan danh sách
Mỗi row nên có:
- Case ID
- applicant name
- role type
- KYC subtype
- submitted at
- status
- priority
- aging/SLA

### Bước 3: Staff lọc case
Filter đề xuất:
- Startup / Investor / Advisor
- subtype
- date submitted
- priority
- overdue only

### Bước 4: Staff chọn 1 case
Click row để mở `KYC Submission Detail`

### Bước 5: Hệ thống chuyển sang màn detail
Giữ lại filter/list state để khi quay lại không bị mất context

## Luồng phụ
### Staff muốn xử lý nhanh case ưu tiên cao
Có thể sort:
- high priority first
- oldest first
- overdue first

### Không có pending KYC
Hiển thị empty state và thống kê “0 hồ sơ đang chờ”

## UI/UX cần có
- list scan nhanh
- badge role type rõ
- aging nổi bật nếu quá hạn
- không approve/reject trực tiếp tại row

## State cần thiết kế
- Loading list
- Empty
- Filter no result
- Error loading list

---

# OS-F04. View KYC Submission Details

## Mục tiêu
Cho staff xem toàn bộ nội dung hồ sơ KYC trước khi review.

## Entry points
- Từ Pending KYC list
- Từ KYC history
- Từ notification về resubmission [ASSUMPTION]

## Flow chính
### Bước 1: Staff mở KYC case detail
Hệ thống hiển thị phần header:
- Case ID
- applicant name
- role type
- subtype
- current status
- submitted at
- current label nếu có
- risk flag nếu có

### Bước 2: Staff xem thông tin hồ sơ
Phần main content render theo subtype:
- Startup có pháp nhân
- Startup chưa có pháp nhân
- Institutional Investor
- Individual Investor
- Advisor

### Bước 3: Staff xem evidence
- preview file
- mở link công khai
- tải file
- xem metadata tài liệu

### Bước 4: Staff xem timeline
Timeline nên cho thấy:
- submitted
- previous resubmission
- previous review
- current reviewer [ASSUMPTION]

### Bước 5: Staff quyết định bước tiếp theo
Các CTA:
- Start Review
- View Review History
- Compare Previous Submission
- Download Evidence

### Bước 6: Staff bấm `Start Review`
Chuyển sang `KYC Review Workspace`

## Luồng phụ
### File không preview được
Hiện fallback:
- file icon
- file name
- download button

### Link công khai bị lỗi
Hiển thị warning:
- “Không thể truy cập link”
- staff vẫn có thể tiếp tục review hoặc yêu cầu resubmission

### Có nhiều vòng resubmission
Có tab/selector đổi version submission

## UI/UX cần có
- evidence preview nằm sticky
- timeline dễ đọc
- thông tin hồ sơ và review action không trộn lẫn
- nút review nổi bật

## State cần thiết kế
- Loading detail
- Missing evidence
- Broken link warning
- Error file preview

---

# OS-F05. Review KYC Submission

## Mục tiêu
Cho staff review từng field của hồ sơ KYC và chuẩn bị decision.

## Entry points
- Từ `KYC Submission Detail` → `Start Review`

## Flow chính
### Bước 1: Staff vào Review Workspace
Hệ thống hiển thị:
- thông tin hồ sơ bên trái
- review form bên phải
- summary status ở top

### Bước 2: Staff review từng field
Mỗi field nên có:
- submitted value
- evidence liên quan
- reviewer result dropdown / check
- optional note per field [ASSUMPTION]

Ví dụ:
- Match / Not Match / Unclear
hoặc
- Valid / Invalid / Need More Info

### Bước 3: Staff review xong từng nhóm
Nên chia section:
- identity/entity info
- contact/professional info
- public presence
- supporting evidence
- declaration/consent

### Bước 4: Hệ thống tính trạng thái review
[ASSUMPTION] Có thể hiển thị:
- completed fields / total fields
- hard fail detected
- recommended decision

### Bước 5: Staff nhập reviewer note
Có thể gồm:
- internal note
- applicant-visible note
- resubmission instruction draft

### Bước 6: Staff chọn decision
Các CTA:
- Save Draft
- Approve
- Reject
- Request Resubmission

### Bước 7: Hệ thống mở luồng decision tương ứng
- Approve → OS-F06
- Reject → OS-F07
- Request Resubmission → OS-F08

## Luồng phụ
### Chưa review đủ field
Không cho submit final decision
Hiển thị:
- field còn thiếu
- section chưa hoàn tất

### Có hard fail
Hiển thị warning banner
Có thể disable Approve

### Staff đang review dở muốn thoát
Hiện modal:
- Save Draft & Exit
- Discard
- Continue editing

## UI/UX cần có
- sticky action bar
- progress indicator
- section collapse/expand
- note tách internal và user-visible

## State cần thiết kế
- Draft saved
- Unsaved changes
- Missing required review
- Hard fail warning

---

# OS-F06. Approve KYC Verification

## Mục tiêu
Cho staff approve hồ sơ KYC đã review xong.

## Entry points
- Từ KYC Review Workspace

## Flow chính
### Bước 1: Staff bấm `Approve`
Hệ thống kiểm tra:
- đã review đủ field chưa
- có blocker không
- có hard fail không

### Bước 2: Nếu hợp lệ, mở confirmation modal
Modal hiển thị:
- Case ID
- applicant
- role type
- final verification label
- summary review result
- optional note

### Bước 3: Staff confirm approve
Hệ thống xử lý:
- cập nhật trạng thái case
- gán verification label
- ghi timeline
- log actor + timestamp

### Bước 4: Hiển thị success state
- toast success
- status badge đổi thành Approved / Verified
- CTA:
  - Back to KYC list
  - View next pending case
  - Stay on detail

## Luồng phụ
### Thiếu review field
Modal không mở, hiển thị validation message

### Có hard fail
Approve bị disable hoặc blocked

### Lỗi submit
Giữ nguyên dữ liệu review, hiển thị error toast

## UI/UX cần có
- confirmation modal ngắn gọn
- label cuối hiển thị rõ
- action sau khi approve nên thuận tiện cho staff xử lý tiếp case khác

## State cần thiết kế
- Confirming
- Submitting
- Success
- Failed submit

---

# OS-F07. Reject KYC Verification

## Mục tiêu
Cho staff từ chối hồ sơ KYC không đạt.

## Entry points
- Từ KYC Review Workspace

## Flow chính
### Bước 1: Staff bấm `Reject`
Hệ thống mở reject modal

### Bước 2: Staff chọn lý do từ chối
Reason list gợi ý:
- Information mismatch
- Invalid document/evidence
- Unverifiable identity/entity
- Broken or unrelated professional/public link
- Suspicious submission
- Other

### Bước 3: Staff nhập note chi tiết
Note này nên bắt buộc

### Bước 4: Staff confirm reject
Hệ thống:
- cập nhật status Rejected / Verification Failed
- lưu reason
- ghi timeline
- log reviewer

### Bước 5: Hiển thị success state
- toast success
- case status đổi
- có thể quay về list hoặc sang case khác

## Luồng phụ
### Staff chưa nhập note
Disable confirm

### Reject do hard fail
Nên có banner:
- hard fail reason
- reject recommended

## UI/UX cần có
- reject phải là action rõ nhưng không gây click nhầm
- warning màu đỏ/cam
- reason và note phân biệt rõ

## State cần thiết kế
- Missing reject reason
- Confirm reject
- Success
- Failed

---

# OS-F08. Request KYC Resubmission

## Mục tiêu
Cho staff yêu cầu applicant bổ sung hoặc nộp lại hồ sơ.

## Entry points
- Từ KYC Review Workspace
- Có thể từ KYC Detail nếu chưa vào review sâu [ASSUMPTION]

## Flow chính
### Bước 1: Staff bấm `Request Resubmission`
Hệ thống mở drawer/modal

### Bước 2: Staff chọn nhóm thiếu sót
Có thể là checklist:
- missing evidence
- invalid link
- unclear organization relation
- insufficient professional proof
- incomplete form
- unsupported document

### Bước 3: Staff chọn field cụ thể cần bổ sung
Ví dụ:
- company registration proof
- LinkedIn/profile link
- founder identity info
- work email
- expertise proof

### Bước 4: Staff nhập hướng dẫn cho applicant
Có thể có:
- template gợi ý
- preview message

### Bước 5: Staff confirm submit
Hệ thống:
- đổi trạng thái sang Pending More Info
- lưu review note
- ghi timeline

### Bước 6: Staff quay về case detail hoặc list
Case vẫn còn trong lịch sử nhưng không còn là pending review chuẩn nữa

## Luồng phụ
### Staff không chọn field nào
Cho phép nhưng khuyến nghị nên chỉ rõ để applicant sửa đúng

### Có nhiều lần resubmission
Hệ thống hiển thị submission round

## UI/UX cần có
- checklist field thiếu
- message preview
- internal note tách riêng

## State cần thiết kế
- Draft message
- Validation thiếu reason
- Success
- Error sending request

---

# OS-F09. View KYC Review History

## Mục tiêu
Cho staff xem lịch sử xử lý KYC của một case hoặc nhiều case.

## Entry points
- Từ KYC Detail
- Sidebar: KYC History

## Flow chính
### Bước 1: Staff mở KYC Review History
Có 2 mode:
- global history list
- timeline của 1 case cụ thể

### Bước 2: Staff lọc lịch sử
Filter:
- applicant
- role type
- reviewer
- action
- date range
- decision type

### Bước 3: Staff xem timeline / table
Mỗi record hiển thị:
- timestamp
- actor
- action
- old status
- new status
- note
- version/submission round

### Bước 4: Staff mở 1 historical record
Có thể xem:
- snapshot hồ sơ lúc đó
- note lúc review
- decision đã ra

### Bước 5: [ASSUMPTION] Staff compare versions
Nếu có nhiều lần resubmission:
- compare before/after

## Luồng phụ
### Không có history
Hiển thị “Chưa có lịch sử review”

### Case mới chỉ có submission ban đầu
Timeline ngắn nhưng vẫn phải hiển thị created event

## UI/UX cần có
- timeline cho 1 case
- table cho global history
- version label rõ

## State cần thiết kế
- Loading history
- Empty history
- Compare mode

---

# OS-F10. Approve Exceptional AI Evaluation Cases

## Mục tiêu
Cho staff xử lý các case AI evaluation ngoại lệ hoặc cần can thiệp thủ công.

## Entry points
- Sidebar: AI Exceptions
- Dashboard widget
- Alert panel từ Platform Activity

## Flow chính
### Bước 1: Staff mở danh sách AI Exceptions
Hệ thống hiển thị table:
- exception ID
- startup
- type
- AI status
- created at
- priority

### Bước 2: Staff chọn 1 case
Mở detail page

### Bước 3: Staff xem detail case
Các section:
- startup summary
- AI request context
- exception type
- error message / anomaly summary
- related evaluation state
- timeline

### Bước 4: Staff quyết định xử lý
Possible actions:
- Approve exceptional handling
- Reject exceptional handling
- Retry / Requeue [ASSUMPTION]
- Escalate
- Add internal note

### Bước 5: Nếu chọn approve
Mở confirm modal:
- case summary
- effect of approval
- note

### Bước 6: Hệ thống cập nhật trạng thái
Ghi timeline và trả staff về list/detail

## Luồng phụ
### Technical failure
Case thiên về retry/requeue

### Content anomaly/manual review
Case thiên về approve/reject/escalate

## UI/UX cần có
- phân biệt type bằng badge:
  - Technical
  - Content
  - Manual Review
- detail phải dễ scan, không quá kỹ thuật

## State cần thiết kế
- New
- Under review
- Approved
- Rejected
- Escalated

---

# OS-F11. Approve Complaints / Disputes / Flagged Feedback

## Mục tiêu
Cho staff review complaint, dispute hoặc feedback bị gắn cờ và ra quyết định.

## Entry points
- Sidebar: Complaints & Disputes
- Dashboard
- Alert panel

## Flow chính
### Bước 1: Staff mở danh sách case
Có tabs:
- Complaints
- Disputes
- Flagged Feedback

### Bước 2: Staff lọc case
Filter:
- category
- severity
- status
- date
- related module

### Bước 3: Staff mở detail case
Detail nên có:
- ai gửi
- ai bị phản ánh
- liên quan entity nào
- summary
- evidence
- timeline
- prior actions

### Bước 4: Staff đọc evidence
Có thể gồm:
- file
- text
- consultation report excerpt
- flagged feedback content
- related notes

### Bước 5: Staff chọn action
- Mark Under Review
- Request More Evidence
- Approve Complaint/Dispute
- Reject
- Resolve
- Escalate

### Bước 6: Nếu action là decision cuối
Mở modal:
- decision type
- reason
- note
- confirm

### Bước 7: Hệ thống cập nhật case
- đổi status
- lưu note
- ghi timeline

## Luồng phụ
### Thiếu evidence
Staff chọn Request More Evidence

### Case nghiêm trọng
Staff chọn Escalate

### Feedback chỉ bị flag nhẹ
Có thể resolve nhanh sau khi review

## UI/UX cần có
- tab rõ 3 loại case
- severity nổi bật
- preview content ngay trong detail
- action group sticky

## State cần thiết kế
- New
- Under Review
- Waiting for Evidence
- Approved
- Rejected
- Resolved
- Escalated

---

# OS-F12. Approve Sensitive Verified-Profile Changes

## Mục tiêu
Cho staff review thay đổi nhạy cảm trên hồ sơ đã được verified.

## Entry points
- Sidebar: Sensitive Profile Changes
- Notification/alert [ASSUMPTION]

## Flow chính
### Bước 1: Staff mở danh sách request
Table hiển thị:
- request ID
- user/entity
- role type
- changed fields
- current verification label
- requested at
- status

### Bước 2: Staff mở detail
Detail nên có:
- before vs after
- user reason
- supporting evidence
- change impact warning

### Bước 3: Staff đánh giá ảnh hưởng
Câu hỏi UX cần hỗ trợ:
- thay đổi này có làm mất độ tin cậy hiện tại không
- có cần re-verification không
- có cần thêm bằng chứng không

### Bước 4: Staff chọn action
- Approve Change
- Reject Change
- Request More Evidence
- Flag for Re-verification [ASSUMPTION]

### Bước 5: Xác nhận decision
Modal hiển thị:
- changed fields
- current label
- impact summary
- note

### Bước 6: Hệ thống cập nhật request
- status đổi
- timeline thêm bản ghi
- nếu có re-verification thì hiển thị link sang KYC flow [ASSUMPTION]

## Luồng phụ
### Change nhỏ nhưng vẫn thuộc nhóm sensitive
Ví dụ đổi website chính
Staff có thể approve nhanh nhưng vẫn cần audit

### Change ảnh hưởng mạnh đến verified label
Hiển thị warning đỏ/cam
Có thể đề xuất re-verification

## UI/UX cần có
- before/after diff rất rõ
- changed field highlight
- ảnh hưởng tới verification label hiển thị nổi bật

## State cần thiết kế
- New
- Under Review
- More Evidence Requested
- Approved
- Rejected
- Re-verification Required [ASSUMPTION]

---

# OS-F13. Resolve Issue Report

## Mục tiêu
Cho staff xử lý issue report từ người dùng hoặc hệ thống.

## Entry points
- Sidebar: Issue Reports
- Dashboard widget
- Alert panel

## Flow chính
### Bước 1: Staff mở danh sách issue
Table hiển thị:
- issue ID
- title
- module
- reporter/source
- severity
- status
- created at

### Bước 2: Staff lọc issue
Theo:
- source user/system
- severity
- module
- status

### Bước 3: Staff mở detail issue
Detail gồm:
- description
- screenshots / attachment
- affected workflow/entity
- related case links
- current handling status
- timeline

### Bước 4: Staff đánh giá issue
Các option:
- mark under review
- assign priority
- resolve
- reject report
- escalate

### Bước 5: Staff nhập resolution note
Khi resolve hoặc reject, note nên bắt buộc

### Bước 6: Hệ thống cập nhật status
- resolved / rejected / escalated
- ghi timeline
- log actor

## Luồng phụ
### Issue trùng lặp
[ASSUMPTION] Hệ thống gợi ý duplicate
Staff có thể link sang issue gốc

### Issue không đủ thông tin
Staff có thể giữ Under Review hoặc Request More Info [ASSUMPTION]

## UI/UX cần có
- severity badge rõ
- link các entity liên quan
- note resolution nằm vùng cuối nhưng dễ thấy

## State cần thiết kế
- New
- Under Review
- Resolved
- Rejected
- Escalated

---

# OS-F14. Review Consulting Completion Exception

## Mục tiêu
Cho staff review các case bất thường liên quan hoàn tất buổi tư vấn.

## Entry points
- Sidebar: Consulting Ops
- Dashboard alert
- From payout blocker

## Flow chính
### Bước 1: Staff mở danh sách exception
Table nên có:
- session ID
- startup
- advisor
- scheduled time
- exception type
- session status
- payout status
- dispute flag

### Bước 2: Staff mở detail
Detail gồm:
- session summary
- lịch hẹn
- participants
- consultation report summary
- evidence
- dispute/complaint links
- payout dependency

### Bước 3: Staff xác định nguyên nhân ngoại lệ
Ví dụ:
- advisor marked completed nhưng startup chưa xác nhận
- thiếu evidence hoàn thành
- report chưa đạt
- dispute đang mở

### Bước 4: Staff chọn hướng xử lý
- Mark Valid Completion
- Mark Incomplete
- Request Clarification
- Escalate to Dispute
- Block Payout

### Bước 5: Hệ thống cập nhật status
- session exception status đổi
- payout blocker cập nhật nếu có
- timeline ghi lại

## Luồng phụ
### Có dispute active
Case không nên resolve hoàn tất theo hướng payout-ready

### Thiếu consultation report
Điều hướng/link sang `Review Consultation Report for Payout`

## UI/UX cần có
- quan hệ giữa session, report, payout, dispute phải nhìn thấy trên cùng một màn
- decision panel sticky

## State cần thiết kế
- Awaiting Review
- Needs Clarification
- Valid Completion
- Incomplete
- Escalated
- Payout Blocked

---

# OS-F15. Review Consultation Report for Payout

## Mục tiêu
Cho staff review consultation report trước khi approve payout.

## Entry points
- Sidebar: Consultation Reports
- Từ consulting completion exception
- Từ payout approval detail

## Flow chính
### Bước 1: Staff mở danh sách report
Table hiển thị:
- report ID
- session ID
- advisor
- startup
- submitted at
- completeness
- payout eligibility
- review status

### Bước 2: Staff mở report detail
Detail gồm:
1. session summary  
2. advisor report content  
3. file/attachment  
4. completeness checklist  
5. related complaint/dispute  
6. review note  

### Bước 3: Staff kiểm tra completeness
Checklist [ASSUMPTION]:
- session objective có không
- tóm tắt nội dung có không
- recommendation/deliverable có không
- bằng chứng đầy đủ không
- không có dispute blocker

### Bước 4: Staff chọn action
- Approve for Payout
- Return for Clarification
- Reject for Payout
- Open Related Dispute

### Bước 5: Hệ thống cập nhật review result
- report review status đổi
- payout eligibility cập nhật
- timeline ghi lại

## Luồng phụ
### Report chưa đủ
Staff trả về clarification

### Có dispute active
Approve for payout nên bị block hoặc warning

## UI/UX cần có
- report content readable
- checklist nổi bật
- payout readiness card nằm bên phải hoặc phía trên

## State cần thiết kế
- Awaiting Review
- Clarification Requested
- Approved for Payout
- Rejected for Payout

---

# OS-F16. Approve Payment Release to Advisor

## Mục tiêu
Cho staff phê duyệt payout cho advisor sau khi đủ điều kiện.

## Entry points
- Sidebar: Payment Ops
- Dashboard widget
- Từ consultation report review

## Flow chính
### Bước 1: Staff mở payout approval list
Table hiển thị:
- payout ID
- session ID
- advisor
- eligibility status
- report review status
- dispute status
- requested at

### Bước 2: Staff mở payout detail
Detail nên có:
- payout summary
- session info
- consultation report review result
- blockers
- prior actions
- internal note

### Bước 3: Staff kiểm tra điều kiện payout
Cần nhìn rõ:
- report đã approved chưa
- completion exception đã clear chưa
- dispute có đang mở không
- refund flow có pending không [ASSUMPTION]

### Bước 4: Staff chọn action
- Approve Release
- Reject Release
- Hold Payout
- Request Further Review

### Bước 5: Nếu Approve Release
Mở confirm modal:
- payout ID
- advisor
- session
- summary conditions met
- note

### Bước 6: Hệ thống cập nhật payout status
- Approved / Released hoặc Awaiting next step [tùy scope]
- ghi timeline
- log actor

## Luồng phụ
### Có blocker
Approve bị disable hoặc warning đỏ rõ ràng

### Staff muốn giữ payout
Chọn Hold Payout + note reason

## UI/UX cần có
- conditions checklist
- blocker warnings
- decision action rất rõ, tránh bấm nhầm

## State cần thiết kế
- Awaiting Approval
- Held
- Approved
- Rejected
- Released [nếu scope tách]

---

# OS-F17. Approve Refund Decision

## Mục tiêu
Cho staff phê duyệt quyết định hoàn tiền.

## Entry points
- Sidebar: Refund Approvals
- Dashboard widget
- Từ dispute/complaint case

## Flow chính
### Bước 1: Staff mở refund approval list
Table hiển thị:
- refund ID
- related session/case
- startup
- advisor
- refund reason
- dispute status
- review status
- requested at

### Bước 2: Staff mở refund detail
Detail gồm:
- refund summary
- dispute/complaint context
- evidence
- consulting report status
- payout status
- decision notes

### Bước 3: Staff xem logic liên quan
Phải nhìn rõ:
- vì sao refund được đề xuất
- payout đã release chưa
- dispute đã resolve chưa
- case có đủ evidence chưa

### Bước 4: Staff chọn action
- Approve Refund
- Reject Refund
- Hold for Review
- Escalate to Dispute Review

### Bước 5: Nếu approve/reject
Mở confirm modal:
- refund ID
- related case
- selected decision
- note/reason

### Bước 6: Hệ thống cập nhật refund case
- đổi status
- ghi timeline
- đồng bộ quan hệ với payout nếu có blocker [ASSUMPTION]

## Luồng phụ
### Payout đã approved/released
UI phải cảnh báo mạnh để staff không quyết định thiếu context

### Evidence chưa đủ
Staff chọn hold hoặc escalate

## UI/UX cần có
- block thể hiện liên kết giữa refund, payout, dispute
- decision note rõ
- cảnh báo nếu financial action có xung đột

## State cần thiết kế
- Awaiting Review
- Held
- Approved
- Rejected
- Escalated

---

## 4. Gợi ý cấu trúc màn hình để thiết kế nhanh

### 4.1 Màn list chuẩn
Dùng cho:
- KYC
- AI exceptions
- disputes
- issues
- consulting exceptions
- payouts
- refunds

#### Cấu trúc
- Page title
- Filter bar
- Summary chips
- Data table
- Pagination / load more

#### Row click behavior
- click row → detail
- không action nhạy cảm trực tiếp trong row

### 4.2 Màn detail chuẩn
Dùng cho hầu hết case handling

#### Cấu trúc
- Header summary
- Tabs hoặc sections:
  - Overview
  - Evidence
  - Timeline
  - Related Cases
- Sticky decision panel

### 4.3 Màn review workspace chuẩn
Dùng rõ nhất cho:
- KYC review
- consultation report review

#### Cấu trúc
- Bên trái: data/evidence
- Bên phải: checklist/review form/decision
- Top: status + warning + progress

---

## 5. Mapping flow thành screen cho Figma/UI

Để thiết kế nhanh, có thể tách screen set như sau:

### Dashboard / Monitoring
1. Ops Dashboard
2. Platform Activity
3. Activity Reports

### KYC
4. KYC Pending List
5. KYC Submission Detail
6. KYC Review Workspace
7. KYC Resubmission Modal
8. KYC Approval Modal
9. KYC Reject Modal
10. KYC History

### Governance / Trust
11. AI Exceptions List
12. AI Exception Detail
13. Complaints & Disputes List
14. Complaint/Dispute Detail
15. Sensitive Profile Change List
16. Sensitive Profile Change Detail
17. Issue Reports List
18. Issue Report Detail

### Consulting / Payment
19. Consulting Exception List
20. Consulting Exception Detail
21. Consultation Report List
22. Consultation Report Detail
23. Payout Approval List
24. Payout Approval Detail
25. Refund Approval List
26. Refund Approval Detail

---

## 6. Điểm rất quan trọng khi thiết kế UI/UX cho role này

### 6.1 Không thiết kế như dashboard chỉ để đẹp
Role này cần:
- scan nhanh
- ra quyết định nhanh
- ít sai thao tác
- audit được

Nên ưu tiên:
- density vừa phải
- badge rõ
- filter dễ dùng
- decision panel logic

### 6.2 Không trộn note nội bộ và note gửi user
Phải tách:
- Internal note
- Applicant-visible note / resolution note

### 6.3 Action nhạy cảm không nên nằm trong dropdown mờ
Approve / Reject / Release / Refund là action lớn.  
Nên đặt rõ ở decision panel hoặc footer detail.

### 6.4 Cần nhìn thấy blocker
Ví dụ:
- dispute active
- report chưa approved
- hard fail
- missing evidence

Các blocker này phải hiện ngay đầu màn, không được giấu sâu.

---

## 7. Kết luận
Nếu thiết kế theo flow trên, role Operation Staff sẽ có logic rất rõ:
- **Monitoring** để phát hiện việc cần xử lý
- **List** để quét hàng đợi
- **Detail** để xác minh case
- **Review workspace** để đánh giá
- **Decision modal/panel** để chốt hành động
- **History/timeline** để audit

Trọng tâm lớn nhất của role này là:
- xử lý đúng
- xử lý nhanh
- truy vết được
- tránh sai thao tác trên action nhạy cảm
