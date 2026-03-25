# AISEP – Operation Staff Menu UI/UX Specification

## 1. Mục tiêu tài liệu
Tài liệu này mô tả UI/UX cho từng mục menu của **Operation Staff Portal** trong AISEP, dựa trên cấu trúc menu:

1. Bảng điều khiển
2. Giám sát nền tảng
3. Xét duyệt KYC
4. AI Exceptions
5. Khiếu nại & Tranh chấp
6. Thay đổi hồ sơ nhạy cảm
7. Báo cáo sự cố
8. Vận hành tư vấn
9. Vận hành thanh toán

Tài liệu này tập trung vào:
- Information architecture
- Screen structure
- User flow
- Component gợi ý
- States cần thiết kế
- Interaction rules
- Rủi ro UX cần tránh

**Không bao gồm map API.**

---

## 2. Định hướng UI/UX tổng thể

### 2.1 Vai trò người dùng
Operation Staff là nhóm người dùng nội bộ, cần:
- xử lý nhiều case liên tiếp
- scan nhanh danh sách lớn
- phát hiện bất thường và blocker sớm
- ra quyết định có kiểm soát
- truy vết được mọi hành động

### 2.2 Định hướng giao diện
- Ưu tiên **desktop web internal portal**
- Layout nên tối ưu cho 1366px trở lên
- Sidebar cố định bên trái
- Khu vực nội dung chính dùng pattern:
  - Summary/KPI
  - Filter bar
  - Data table hoặc case queue
  - Detail panel / detail page
  - Decision panel

### 2.3 Nguyên tắc UX chung
- Không approve/reject trực tiếp ở row nếu là action nhạy cảm
- Mọi case phải có:
  - Case ID
  - Status
  - Priority
  - Created at / Updated at
  - Actor liên quan
- Action nhạy cảm phải có:
  - confirmation
  - note / reason
  - audit trail
- Luôn hiển thị blocker sớm:
  - hard fail
  - dispute active
  - missing evidence
  - missing review fields
  - pending dependency

### 2.4 Pattern chuẩn
#### A. Monitoring screens
Dùng cho:
- Bảng điều khiển
- Giám sát nền tảng

Pattern:
- KPI cards
- chart/trend
- alert list
- quick drill-down

#### B. Queue/List screens
Dùng cho:
- Xét duyệt KYC
- AI Exceptions
- Khiếu nại & Tranh chấp
- Thay đổi hồ sơ nhạy cảm
- Báo cáo sự cố
- Vận hành tư vấn
- Vận hành thanh toán

Pattern:
- Filter bar
- Status chips
- Table/list
- Row click mở detail

#### C. Review/Decision screens
Dùng cho:
- KYC review
- Complaint/dispute review
- Profile change review
- Consultation report review
- Payout/refund approval

Pattern:
- Header summary
- Main content + evidence
- Timeline
- Sticky decision panel

---

## 3. Cấu trúc menu và mục đích

### 3.1 Bảng điều khiển
Trang tổng quan cho Operation Staff, hiển thị queue, cảnh báo, KPI vận hành và lối tắt vào module cần xử lý.

### 3.2 Giám sát nền tảng
Theo dõi hoạt động hệ thống, khối lượng xử lý, xu hướng bất thường và báo cáo vận hành.

### 3.3 Xét duyệt KYC
Xử lý hồ sơ xác thực của Startup, Investor, Advisor theo workflow review chính thức.

### 3.4 AI Exceptions
Xử lý các trường hợp AI evaluation bất thường hoặc cần can thiệp thủ công.

### 3.5 Khiếu nại & Tranh chấp
Xử lý complaint, dispute, flagged feedback và case escalated.

### 3.6 Thay đổi hồ sơ nhạy cảm
Review các thay đổi ảnh hưởng đến độ tin cậy của hồ sơ đã verified.

### 3.7 Báo cáo sự cố
Theo dõi và xử lý issue report từ người dùng hoặc hệ thống.

### 3.8 Vận hành tư vấn
Xử lý completion exception, consultation report review và các vấn đề liên quan consulting workflow.

### 3.9 Vận hành thanh toán
Xử lý payout approval, refund approval và các case tài chính cần staff phê duyệt.

---

# 4. Thiết kế chi tiết cho từng mục menu

---

# 4.1 Bảng điều khiển

## Mục tiêu
Cho Operation Staff nhìn nhanh toàn cảnh công việc và đi thẳng đến queue ưu tiên.

## Screen name
**Operation Staff Dashboard**

## Layout đề xuất
### A. Header
- Page title: Bảng điều khiển
- Date range selector
- Refresh button
- Global search

### B. KPI cards
- KYC đang chờ xử lý
- AI exceptions đang mở
- Khiếu nại/tranh chấp đang mở
- Thay đổi hồ sơ nhạy cảm chờ duyệt
- Báo cáo sự cố chưa xử lý
- Case tư vấn cần review
- Payout/refund chờ duyệt
- Case overdue

### C. My Queue
- Assigned to me [ASSUMPTION]
- High priority
- Overdue
- Recently updated

### D. Alert / Attention panel
- Hard fail KYC spike
- Complaint severity cao
- Payout bị block nhiều
- AI exception tăng bất thường

### E. Quick links
- Review next KYC
- Open unresolved disputes
- Open pending payouts
- Open high-priority issues

### F. Recent activity feed
- ai xử lý gì gần đây
- case nào vừa đổi trạng thái

## Flow
1. Staff vào dashboard
2. Scan KPI và alert
3. Chọn queue ưu tiên
4. Click card/alert/queue item
5. Điều hướng sang module tương ứng

## Components chính
- KPIStatCard
- QueueCard
- AlertList
- ActivityFeed
- DateRangePicker

## States
- Loading dashboard
- Empty queue
- Partial data unavailable
- Data stale warning

## UX notes
- Dashboard để định hướng, không thay thế list screen
- Card nào click được phải có hover state rõ
- Nên có “View all” ở từng widget

---

# 4.2 Giám sát nền tảng

## Mục tiêu
Giúp staff theo dõi sức khỏe vận hành toàn nền tảng và drill-down sang module cụ thể.

## Screen nhóm đề xuất
1. Platform Activity Overview
2. Activity Reports
3. Module Performance Detail

## 4.2.1 Platform Activity Overview

### Layout
#### Header
- Title: Giám sát nền tảng
- Date range
- Module filter
- Export

#### Summary row
- Total operational events
- New cases by module
- Approval vs rejection ratio
- Avg handling time
- Overdue case count

#### Trend area
- KYC submissions trend
- Complaints/disputes trend
- AI exceptions trend
- Payout/refund trend
- Issue reports trend

#### Alert area
- abnormal spikes
- SLA breach alerts
- repeated failures

#### Recent module activity
- KYC actions
- dispute actions
- payout actions
- issue actions

### Flow
1. Staff mở màn giám sát
2. Chọn khoảng thời gian
3. Xem trend theo module
4. Nhận diện bất thường
5. Click chart point / alert / module card để đi vào list tương ứng

## 4.2.2 Activity Reports

### Layout
- Filter bar
- Report summary blocks
- Report table
- Export actions

### Báo cáo nên có
- KYC performance report
- Governance case report
- Issue resolution report
- Consulting ops report
- Payment ops report

### Flow
1. Staff chọn loại báo cáo
2. Áp filter
3. Xem summary
4. Xem dòng chi tiết
5. Export hoặc lưu preset

## Components chính
- LineChart / BarChart
- KPI cards
- AlertBanner
- ReportsTable
- FilterBar

## States
- No data in range
- Module data error
- Exporting
- Export fail

## UX notes
- Không nên nhồi quá nhiều chart trên một màn
- Drill-down phải rõ ràng: từ trend → list → detail

---

# 4.3 Xét duyệt KYC

## Mục tiêu
Cho staff review và quyết định hồ sơ KYC theo đúng policy của từng loại đối tượng.

## Lưu ý quan trọng
Module này phải bám logic KYC chính thức:
- Startup có pháp nhân
- Startup chưa có pháp nhân
- Institutional Investor
- Individual/Angel Investor
- Advisor

Review flow phải theo thứ tự:
**Open case → review từng field theo dropdown → check hard fail → tính điểm → system gợi ý/auto-label → staff xác nhận decision**

## Screen nhóm đề xuất
1. KYC Queue List
2. KYC Submission Detail
3. KYC Review Workspace
4. KYC Resubmission Drawer/Modal
5. KYC Review History

## 4.3.1 KYC Queue List

### Layout
- Search
- Filters:
  - applicant type
  - subtype
  - status
  - priority
  - submitted date
  - overdue only
- Status chips
- Table

### Columns gợi ý
- Case ID
- Applicant name
- Role type
- KYC subtype
- Submitted at
- Current status
- Priority
- Aging/SLA

### Flow
1. Staff mở KYC queue
2. Scan danh sách case
3. Lọc theo role/subtype
4. Click row để mở detail

## 4.3.2 KYC Submission Detail

### Layout
#### Header summary
- Case ID
- Applicant
- Role type
- Subtype
- Current status
- Submitted at
- Current label nếu có
- Risk flag

#### Main content
Render theo subtype.

#### Evidence panel
- file preview
- download
- external link open

#### Timeline
- submission
- resubmission
- review actions
- decision history

#### Action area
- Start Review
- View History
- Compare Previous Submission [ASSUMPTION]

### Flow
1. Staff xem chi tiết hồ sơ
2. Staff xem tài liệu/link
3. Staff đọc timeline
4. Click Start Review

## 4.3.3 KYC Review Workspace

### Layout
#### Top panel
- applicant summary
- subtype
- review progress
- hard fail warning
- system suggestion area

#### Left column
- submitted data
- evidence preview

#### Right column
- field-by-field review form
- reviewer note
- applicant-visible note
- action buttons

### Review behavior
Mỗi field có dropdown review value theo policy tương ứng.

### Action buttons
- Save Draft
- Request Resubmission
- Reject
- Approve

### Decision logic
1. Staff review hết field bắt buộc
2. System check hard fail
3. Nếu không hard fail, system tính score
4. System hiển thị suggested label
5. Staff confirm final action

## 4.3.4 KYC Resubmission Drawer/Modal

### Inputs
- reason category
- missing fields checklist
- applicant-visible instruction
- internal note

### Flow
1. Staff chọn Request Resubmission
2. Chọn lý do và field thiếu
3. Soạn instruction
4. Confirm
5. Case chuyển sang Pending More Info

## 4.3.5 KYC Review History

### Layout
- Timeline view cho 1 case
- Table view cho nhiều case
- Filters theo reviewer/date/action

## Components chính
- DataTable
- SubmissionSummaryCard
- EvidencePreviewCard
- KYCFieldReviewRow
- HardFailWarningBanner
- ReviewProgressBar
- Timeline
- DecisionPanel

## States
- Loading case
- Missing evidence
- Broken public link
- Hard fail detected
- Review incomplete
- Draft saved
- Decision success / fail

## UX notes
- Không để staff tự gán label tự do ngoài policy
- Action approve/reject chỉ nên xuất hiện sau khi review đủ
- Tách rõ internal note và note gửi applicant

---

# 4.4 AI Exceptions

## Mục tiêu
Cho staff xử lý các case AI bất thường hoặc cần can thiệp thủ công.

## Screen nhóm đề xuất
1. AI Exceptions List
2. AI Exception Detail
3. Decision Modal

## 4.4.1 AI Exceptions List

### Layout
- Search
- Filters:
  - exception type
  - status
  - priority
  - created date
- Table

### Columns gợi ý
- Exception ID
- Startup name
- Exception type
- AI status
- Created at
- Priority
- Current status

## 4.4.2 AI Exception Detail

### Layout
- Header summary
- Startup summary
- Request context
- Exception summary
- Related AI result state
- Timeline
- Internal notes
- Decision panel

### Main actions
- Approve exceptional handling
- Reject
- Retry / Requeue [ASSUMPTION]
- Escalate
- Add note

### Flow
1. Staff mở list
2. Chọn case
3. Đọc context và exception details
4. Chọn action
5. Confirm decision
6. Status cập nhật + timeline update

## Components chính
- ExceptionBadge
- AIContextCard
- Timeline
- InternalNoteBox
- DecisionPanel

## States
- New
- Under Review
- Approved
- Rejected
- Escalated
- Retry queued [ASSUMPTION]

## UX notes
- Phân biệt rõ lỗi kỹ thuật với lỗi cần manual governance
- Tránh hiển thị log kỹ thuật quá rối cho ops nếu không cần

---

# 4.5 Khiếu nại & Tranh chấp

## Mục tiêu
Giúp staff xử lý complaint, dispute và flagged feedback một cách có cấu trúc.

## Screen nhóm đề xuất
1. Complaints & Disputes List
2. Complaint/Dispute Detail
3. Request More Evidence Modal
4. Decision Modal

## 4.5.1 Complaints & Disputes List

### Layout
- Tabs:
  - Complaints
  - Disputes
  - Flagged Feedback
- Filters:
  - severity
  - status
  - category
  - related module
  - date range
- Table/list

### Columns gợi ý
- Case ID
- Case type
- Submitted by
- Against
- Category
- Severity
- Status
- Submitted at

## 4.5.2 Complaint/Dispute Detail

### Layout
- Header summary
- Complaint/dispute content
- Evidence section
- Related entity/session/profile
- Timeline
- Internal notes
- Decision panel

### Main actions
- Mark Under Review
- Request More Evidence
- Approve
- Reject
- Resolve
- Escalate

### Flow
1. Staff mở list
2. Chọn case
3. Xem nội dung + bằng chứng
4. Nếu thiếu dữ liệu, request more evidence
5. Nếu đủ, chọn decision
6. Confirm
7. Case cập nhật status

## Components chính
- SeverityBadge
- CaseSummaryCard
- EvidencePreviewCard
- RelatedEntityCard
- Timeline
- DecisionPanel

## States
- New
- Under Review
- Waiting for Evidence
- Resolved
- Approved
- Rejected
- Escalated

## UX notes
- Flagged feedback nên preview nội dung trực tiếp
- Trường severity phải nổi bật để staff ưu tiên đúng case
- Với dispute liên quan consulting/payment, cần link sang module liên quan

---

# 4.6 Thay đổi hồ sơ nhạy cảm

## Mục tiêu
Cho staff review các thay đổi có thể ảnh hưởng độ tin cậy của hồ sơ đã verified.

## Screen nhóm đề xuất
1. Sensitive Profile Changes List
2. Sensitive Profile Change Detail
3. Decision Modal

## 4.6.1 Sensitive Profile Changes List

### Layout
- Search
- Filters:
  - role type
  - status
  - changed field type
  - date range
- Table

### Columns gợi ý
- Request ID
- User / Entity
- Role type
- Changed fields
- Current verification label
- Requested at
- Status

## 4.6.2 Sensitive Profile Change Detail

### Layout
- Header summary
- Before vs After diff
- User-provided reason
- Supporting evidence
- Change impact warning
- Current verification summary
- Timeline
- Decision panel

### Main actions
- Approve Change
- Reject Change
- Request More Evidence
- Flag for Re-verification [ASSUMPTION]

### Flow
1. Staff mở list
2. Chọn request
3. Xem before/after
4. Xem chứng cứ và mức ảnh hưởng
5. Chọn decision
6. Confirm
7. Cập nhật status + audit trail

## Components chính
- BeforeAfterDiffCard
- VerificationImpactBanner
- EvidencePreviewCard
- Timeline
- DecisionPanel

## States
- New
- Under Review
- More Evidence Requested
- Approved
- Rejected
- Re-verification Required [ASSUMPTION]

## UX notes
- Dùng highlight mạnh cho changed fields
- Cần hiển thị rõ thay đổi nào tác động đến verified label
- Không để decision bị ẩn sâu vì staff cần so sánh và ra quyết định nhanh

---

# 4.7 Báo cáo sự cố

## Mục tiêu
Cho staff tiếp nhận và xử lý issue report do người dùng hoặc hệ thống ghi nhận.

## Screen nhóm đề xuất
1. Issue Reports List
2. Issue Report Detail
3. Resolution Modal

## 4.7.1 Issue Reports List

### Layout
- Search
- Filters:
  - source: user/system
  - module
  - severity
  - status
  - date range
- Table

### Columns gợi ý
- Issue ID
- Title
- Module
- Source/Reporter
- Severity
- Status
- Created at
- Last updated

## 4.7.2 Issue Report Detail

### Layout
- Header summary
- Issue description
- Attachments / screenshots
- Affected module/entity
- Related case links
- Timeline
- Internal notes
- Action panel

### Main actions
- Mark Under Review
- Resolve
- Reject Report
- Escalate
- Add resolution note

### Flow
1. Staff mở list
2. Chọn issue
3. Đọc mô tả và bằng chứng
4. Xác định hướng xử lý
5. Nhập resolution note
6. Confirm
7. Status cập nhật

## Components chính
- SeverityBadge
- AttachmentGallery
- RelatedCaseCard
- Timeline
- ResolutionForm

## States
- New
- Under Review
- Resolved
- Rejected
- Escalated

## UX notes
- Severity phải nhìn thấy ngay từ list
- Nếu có duplicate issue [ASSUMPTION], nên gợi ý liên kết issue liên quan
- Resolution note nên bắt buộc khi resolve/reject

---

# 4.8 Vận hành tư vấn

## Mục tiêu
Hỗ trợ staff xử lý các case liên quan consulting workflow, đặc biệt là completion exception và review report trước payout.

## Screen nhóm đề xuất
1. Consulting Ops Overview
2. Consulting Completion Exceptions List
3. Consulting Exception Detail
4. Consultation Reports List
5. Consultation Report Detail

## 4.8.1 Consulting Ops Overview

### Layout
- KPI:
  - completion exceptions
  - consultation reports pending review
  - disputed sessions
  - payout-blocked sessions
- quick links tới 2 queue chính

## 4.8.2 Consulting Completion Exceptions List

### Layout
- Filters:
  - exception type
  - status
  - dispute flag
  - payout blocked
- Table

### Columns gợi ý
- Session ID
- Startup
- Advisor
- Scheduled time
- Exception type
- Session status
- Payout status
- Dispute flag

## 4.8.3 Consulting Exception Detail

### Layout
- Session summary
- Schedule history
- Participant info
- Completion evidence
- Related report summary
- Dispute/complaint summary
- Decision panel

### Main actions
- Mark Valid Completion
- Mark Incomplete
- Request Clarification
- Escalate to Dispute
- Block Payout

### Flow
1. Staff mở exception queue
2. Chọn case
3. Xem session + evidence
4. Kiểm tra report/dispute liên quan
5. Chọn action
6. Confirm
7. Case status cập nhật

## 4.8.4 Consultation Reports List

### Layout
- Filters:
  - advisor
  - status
  - payout eligibility
  - date
- Table

### Columns gợi ý
- Report ID
- Session ID
- Advisor
- Startup
- Submitted at
- Completeness
- Review status
- Payout eligibility

## 4.8.5 Consultation Report Detail

### Layout
- Session summary
- Report content
- Attachments
- Completeness checklist
- Dispute/issue blocker
- Review note
- Decision panel

### Main actions
- Approve for Payout
- Return for Clarification
- Reject for Payout
- Open Related Dispute

### Flow
1. Staff mở report list
2. Chọn report
3. Review nội dung và checklist
4. Xem blocker nếu có
5. Chọn decision
6. Confirm
7. Cập nhật review result

## Components chính
- SessionSummaryCard
- ScheduleTimeline
- EvidencePreviewCard
- CompletenessChecklist
- PayoutReadinessCard
- DecisionPanel

## States
- Awaiting Review
- Needs Clarification
- Valid Completion
- Incomplete
- Approved for Payout
- Rejected for Payout
- Escalated

## UX notes
- Phải thấy rõ quan hệ giữa session, report, dispute, payout
- Không tách rời completion exception khỏi payout context

---

# 4.9 Vận hành thanh toán

## Mục tiêu
Giúp staff phê duyệt payout và refund theo đúng dependency của consulting workflow.

## Screen nhóm đề xuất
1. Payment Ops Overview
2. Payout Approvals List
3. Payout Approval Detail
4. Refund Approvals List
5. Refund Approval Detail

## 4.9.1 Payment Ops Overview

### Layout
- KPI:
  - payouts awaiting approval
  - refunds awaiting review
  - blocked payouts
  - conflict cases
- quick links tới 2 queue

## 4.9.2 Payout Approvals List

### Layout
- Filters:
  - payout status
  - report review status
  - dispute status
  - date
- Table

### Columns gợi ý
- Payout ID
- Session ID
- Advisor
- Eligibility status
- Report review status
- Dispute status
- Requested at

## 4.9.3 Payout Approval Detail

### Layout
- Payout summary
- Session summary
- Consultation report review result
- Completion status
- Blockers
- Timeline
- Internal notes
- Decision panel

### Main actions
- Approve Release
- Reject Release
- Hold Payout
- Request Further Review

### Flow
1. Staff mở payout queue
2. Chọn payout case
3. Kiểm tra đủ điều kiện chưa
4. Xem blockers
5. Chọn action
6. Confirm
7. Status cập nhật

## 4.9.4 Refund Approvals List

### Layout
- Filters:
  - refund status
  - dispute status
  - payout status
  - date
- Table

### Columns gợi ý
- Refund ID
- Related session/case
- Startup
- Advisor
- Refund reason
- Review status
- Dispute status
- Requested at

## 4.9.5 Refund Approval Detail

### Layout
- Refund summary
- Dispute/complaint context
- Evidence
- Consulting report status
- Payout status
- Decision notes
- Decision panel

### Main actions
- Approve Refund
- Reject Refund
- Hold for Review
- Escalate to Dispute Review

### Flow
1. Staff mở refund queue
2. Chọn refund case
3. Xem evidence + context
4. Kiểm tra quan hệ với payout/dispute
5. Chọn action
6. Confirm
7. Case status cập nhật

## Components chính
- FinancialStatusBadge
- PayoutConditionChecklist
- RefundReasonCard
- RelatedDisputeCard
- Timeline
- DecisionPanel

## States
- Awaiting Approval
- Held
- Approved
- Rejected
- Released [nếu scope tách]
- Escalated

## UX notes
- Cần cảnh báo mạnh nếu payout và refund đang xung đột
- Các financial blocker phải hiện ở top detail page
- Không đặt action nhạy cảm trong row dropdown

---

# 5. Components dùng chung toàn menu

## 5.1 Components lõi
- Sidebar Navigation
- Page Header
- Global Search
- Filter Bar
- Status Badge
- Priority Badge
- KPI Card
- Data Table
- Empty State
- Error State
- Timeline
- Decision Panel
- Confirmation Modal
- Toast Notification

## 5.2 Components chuyên biệt
- Evidence Preview Card
- Before/After Diff Card
- Hard Fail Banner
- Completeness Checklist
- Payout Readiness Card
- Severity Card
- Queue Summary Card

---

# 6. States chung cần thiết kế

## 6.1 Loading
- dashboard loading
- list skeleton
- detail skeleton
- chart loading

## 6.2 Empty
- không có case nào trong queue
- không có dữ liệu trong khoảng thời gian đã chọn
- không có kết quả sau khi lọc

## 6.3 Error
- không tải được danh sách
- không tải được detail
- preview file lỗi
- submit action thất bại

## 6.4 Warning / Blocker
- hard fail detected
- missing required review fields
- dispute unresolved
- payout blocked
- broken external link
- stale data

## 6.5 Success
- review saved
- decision submitted
- status updated
- note saved

---

# 7. Routing gợi ý

```txt
/ops/dashboard
/ops/platform-activity
/ops/platform-activity/reports

/ops/kyc
/ops/kyc/:id
/ops/kyc/:id/review
/ops/kyc/history

/ops/ai-exceptions
/ops/ai-exceptions/:id

/ops/disputes
/ops/disputes/:id

/ops/profile-change-requests
/ops/profile-change-requests/:id

/ops/issues
/ops/issues/:id

/ops/consulting
/ops/consulting/exceptions
/ops/consulting/exceptions/:id
/ops/consulting/reports
/ops/consulting/reports/:id

/ops/payments
/ops/payments/payouts
/ops/payments/payouts/:id
/ops/payments/refunds
/ops/payments/refunds/:id
```

---

# 8. Rủi ro UX cần tránh

1. Dồn quá nhiều thông tin vào một màn detail
2. Không phân biệt internal note và user-visible note
3. Cho phép approve/reject từ list row gây sai thao tác
4. Trạng thái badge không nhất quán giữa các module
5. Không hiển thị dependency giữa dispute, consulting, payout, refund
6. KYC review không bám đúng subtype policy
7. Không cảnh báo blocker ngay từ đầu màn
8. Chart monitoring đẹp nhưng không drill-down được

---

# 9. Kết luận
Thiết kế UI/UX cho menu Operation Staff nên đi theo tư duy:
- **Dashboard để định hướng**
- **Monitoring để phát hiện bất thường**
- **Queue để scan việc cần làm**
- **Detail để xác minh**
- **Review workspace để đánh giá**
- **Decision panel để phê duyệt có kiểm soát**
- **Timeline để audit**

Mỗi menu item trong sidebar không chỉ là một trang đơn, mà nên là **một module có overview, list, detail và decision flow**.
