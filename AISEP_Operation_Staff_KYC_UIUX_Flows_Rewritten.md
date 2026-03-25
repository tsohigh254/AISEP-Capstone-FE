# AISEP - Operation Staff KYC UI/UX Flows (Rewritten)

## 1. Scope điều chỉnh
Tài liệu này **viết lại riêng module KYC của Operation Staff** để thay thế phần KYC generic trước đó.

Nguyên tắc mới:
- KYC phải tách theo **5 applicant type / subtype**
- Staff review theo **dropdown value của từng reviewed field**
- System phải xử lý theo thứ tự:
  1. render đúng bộ field theo subtype
  2. kiểm tra hard fail
  3. nếu không hard fail thì tính điểm
  4. system auto-gán label / auto-suggest decision
  5. staff xác nhận decision cuối cùng
- Staff **không tự chọn label tùy ý** nếu rule auto-label đã xác định kết quả

---

## 2. Applicant types cần hỗ trợ
1. Startup đã có pháp nhân
2. Startup chưa có pháp nhân
3. Institutional Investor
4. Individual / Angel Investor
5. Advisor

---

## 3. KYC flow tổng cho Operation Staff

### 3.1 End-to-end flow
1. Staff mở danh sách KYC pending
2. Chọn một hồ sơ
3. Hệ thống render `KYC Submission Detail` theo đúng applicant type
4. Staff bấm `Start Review`
5. Hệ thống mở `KYC Review Workspace`
6. Staff review từng field bằng dropdown value chuẩn
7. Hệ thống kiểm tra hard fail realtime
8. Nếu không hard fail, hệ thống tính điểm theo rule scoring
9. Hệ thống hiển thị:
   - total score
   - hard fail status
   - suggested label
   - suggested decision
10. Staff chọn action cuối:
   - Confirm Auto Decision
   - Request More Info
   - Save Draft
11. Hệ thống ghi audit trail
12. Case chuyển sang trạng thái cuối cùng

### 3.2 Decision precedence
Thứ tự ưu tiên logic:
1. Hard fail
2. Score band
3. Additional qualifying conditions for highest label
4. Final decision confirmation by staff

### 3.3 Vai trò của staff
Staff làm 3 việc:
- đánh giá từng field
- kiểm tra context/evidence
- xác nhận decision cuối cùng

Staff **không nên được nhập label tự do** kiểu manual text hoặc manual dropdown không ràng buộc.

---

## 4. Shared UI architecture cho KYC module

## 4.1 Screens
1. KYC Pending List
2. KYC Submission Detail
3. KYC Review Workspace
4. KYC Decision Confirmation Modal
5. KYC Resubmission Request Modal
6. KYC History / Audit Timeline

## 4.2 Shared layout
### KYC Pending List
- Search
- Filters
- Queue summary
- Table list

### KYC Submission Detail
- Header summary
- Applicant data
- Evidence preview
- Submission metadata
- Previous reviews / versions
- CTA: Start Review

### KYC Review Workspace
- Left: submitted info + evidence
- Right: review form + scoring + decision panel
- Top: subtype badge + status + risk warning

### Decision Modal
- Decision summary
- Final label
- Optional / required note
- Confirm action

---

## 5. Shared KYC list flow

## 5.1 KYC Pending List flow
1. Staff vào `KYC Review`
2. Hệ thống hiển thị danh sách hồ sơ pending
3. Staff filter theo:
   - role: Startup / Investor / Advisor
   - subtype
   - priority
   - submitted date
   - overdue
4. Staff click 1 row
5. Hệ thống mở `KYC Submission Detail`

## 5.2 Table columns nên có
- Case ID
- Applicant Type
- Applicant Name
- Subtype
- Submitted At
- Current Status
- Priority
- Aging / SLA

## 5.3 UX rules
- Không approve/reject trực tiếp tại list row
- Row click mở detail
- Overdue case phải highlight
- Có thể có quick filter `Needs manual attention`

---

# 6. Flow chi tiết theo subtype

---

## KYC-01. Startup đã có pháp nhân

## 6.1 Submission fields
Hồ sơ cần hiển thị cho staff:
- Tên pháp lý đầy đủ
- Mã số doanh nghiệp / mã số thuế
- File Giấy chứng nhận đăng ký doanh nghiệp
- Họ tên người nộp hồ sơ
- Vai trò người nộp hồ sơ
- Email công việc
- Website hoặc product link
- Cam kết thông tin trung thực

## 6.2 Review fields và dropdown
Review workspace phải render đúng 8 field:
1. legalFullNameReview
   - EXACT_MATCH / PARTIAL_MATCH / CANNOT_VERIFY / MISMATCH
2. enterpriseCodeReview
   - VALID_MATCH / FOUND_BUT_DIFFERS / NOT_FOUND / INVALID_FORMAT
3. businessRegistrationFileReview
   - CLEAR_AND_MATCH / UNCLEAR_BUT_PLAUSIBLE / INCOMPLETE / MISMATCH_OR_SUSPICIOUS
4. submitterFullNameReview
   - STRONG_LINK / PLAUSIBLE_LINK / CANNOT_VERIFY / SUSPICIOUS
5. submitterRoleReview
   - ROLE_SUPPORTED / ROLE_PLAUSIBLE / ROLE_UNSUPPORTED / ROLE_INCONSISTENT
6. workEmailReview
   - COMPANY_DOMAIN_MATCH / PERSONAL_BUT_PLAUSIBLE / UNRELATED / INVALID
7. officialLinkReview
   - ACTIVE_AND_MATCH / ACTIVE_BUT_WEAK / INACTIVE_OR_BROKEN / NOT_RELATED
8. honestyDeclarationReview
   - ACCEPTED / MISSING

## 6.3 Detail flow
1. Staff mở case Startup đã có pháp nhân
2. Xem submitted data + file preview + external link
3. Bấm `Start Review`
4. Hệ thống render 8 review rows
5. Staff chọn dropdown cho từng field
6. Hệ thống kiểm tra hard fail realtime
7. Nếu không hard fail, hệ thống tính score
8. Hệ thống hiển thị suggested label
9. Staff xác nhận decision hoặc request more info

## 6.4 Hard fail rules
Nếu có một trong các giá trị sau, case phải vào `Verification Failed` ngay:
- enterpriseCodeReview = NOT_FOUND
- enterpriseCodeReview = INVALID_FORMAT
- businessRegistrationFileReview = MISMATCH_OR_SUSPICIOUS
- legalFullNameReview = MISMATCH
- submitterFullNameReview = SUSPICIOUS
- officialLinkReview = NOT_RELATED

## 6.5 Scoring UX
Nếu không hard fail, hệ thống tính điểm theo nhóm:
- nhóm tốt = 2 điểm
- nhóm chấp nhận được = 1 điểm
- nhóm chưa đủ cơ sở = 0 điểm
- nhóm rủi ro cao = -2 điểm

UI nên hiển thị:
- total score
- per-field score badge [optional]
- current label suggestion

## 6.6 Auto-label rules
### Verified Company
Khi:
- total score >= 10
- enterpriseCodeReview = VALID_MATCH hoặc FOUND_BUT_DIFFERS
- businessRegistrationFileReview = CLEAR_AND_MATCH hoặc UNCLEAR_BUT_PLAUSIBLE
- submitterFullNameReview != SUSPICIOUS
- officialLinkReview != NOT_RELATED

### Basic Verified
- total score từ 6 đến 9
- không có hard fail

### Pending More Info
- total score từ 2 đến 5
- không có hard fail

### Verification Failed
- total score <= 1
- hoặc có hard fail

## 6.7 Decision UI
Decision panel nên có:
- Hard fail status
- Total score
- Suggested label
- Staff note
- Buttons:
  - Confirm Decision
  - Request More Info
  - Save Draft

## 6.8 Notes cho designer
- `enterpriseCodeReview` và `businessRegistrationFileReview` là 2 field trọng yếu, nên nổi bật hơn
- Nếu hard fail xuất hiện, hiển thị warning banner đỏ ngay đầu review form
- `Confirm Decision` nên đổi label động theo suggested outcome, ví dụ `Confirm Verified Company`

---

## KYC-02. Startup chưa có pháp nhân

## 6.9 Submission fields
- Tên startup / project name
- Họ tên founder hoặc người đại diện
- Vai trò
- Email liên hệ
- Website / landing page / demo / LinkedIn page / app link
- File chứng minh hoạt động cơ bản
- Cam kết thông tin trung thực

## 6.10 Review fields và dropdown
1. projectNameReview
   - CONSISTENT_PUBLICLY / PARTIAL_MATCH / CANNOT_VERIFY / MISMATCH
2. representativeFullNameReview
   - STRONG_LINK / PLAUSIBLE_LINK / CANNOT_VERIFY / SUSPICIOUS
3. roleReview
   - ROLE_SUPPORTED / ROLE_PLAUSIBLE / ROLE_UNSUPPORTED / ROLE_INCONSISTENT
4. contactEmailReview
   - ALIGNED / PERSONAL_BUT_PLAUSIBLE / UNRELATED / INVALID
5. publicLinkReview
   - ACTIVE_AND_MATCH / ACTIVE_BUT_WEAK / INACTIVE_OR_BROKEN / NOT_RELATED
6. basicActivityProofFileReview
   - CLEAR_AND_RELEVANT / BASIC_BUT_WEAK / UNCLEAR / IRRELEVANT_OR_SUSPICIOUS
7. honestyDeclarationReview
   - ACCEPTED / MISSING

## 6.11 Detail flow
1. Staff mở case Startup chưa có pháp nhân
2. Review public presence và activity evidence
3. Bấm `Start Review`
4. Hệ thống render 7 review rows
5. Staff chọn dropdown
6. Hệ thống check hard fail
7. Nếu không hard fail thì tính score
8. Hệ thống gợi ý label
9. Staff confirm decision

## 6.12 Hard fail rules
- projectNameReview = MISMATCH
- representativeFullNameReview = SUSPICIOUS
- publicLinkReview = NOT_RELATED
- basicActivityProofFileReview = IRRELEVANT_OR_SUSPICIOUS

## 6.13 Auto-label rules
### Verified Founding Team
- total score >= 8
- publicLinkReview = ACTIVE_AND_MATCH hoặc ACTIVE_BUT_WEAK
- basicActivityProofFileReview = CLEAR_AND_RELEVANT hoặc BASIC_BUT_WEAK
- representativeFullNameReview != SUSPICIOUS

### Basic Verified
- total score từ 5 đến 7
- không có hard fail

### Pending More Info
- total score từ 2 đến 4
- không có hard fail

### Verification Failed
- total score <= 1
- hoặc có hard fail

## 6.14 Notes cho designer
- Màn này nên emphasis `publicLink` và `basicActivityProofFile`
- Vì đây là light verification, UI copy nên tránh hàm ý kiểm toán doanh nghiệp

---

## KYC-03. Institutional Investor

## 6.15 Submission fields
- Tên pháp lý tổ chức
- Mã số doanh nghiệp / mã số thuế
- File chứng minh tổ chức
- Họ tên người nộp hồ sơ
- Vai trò người nộp hồ sơ
- Email công việc
- Website / fund page / company page
- Cam kết thông tin trung thực

## 6.16 Review fields và dropdown
1. organizationLegalNameReview
   - EXACT_MATCH / PARTIAL_MATCH / CANNOT_VERIFY / MISMATCH
2. organizationCodeReview
   - VALID_MATCH / FOUND_BUT_DIFFERS / NOT_FOUND / INVALID_FORMAT
3. organizationProofFileReview
   - CLEAR_AND_MATCH / UNCLEAR_BUT_PLAUSIBLE / INCOMPLETE / MISMATCH_OR_SUSPICIOUS
4. submitterFullNameReview
   - STRONG_LINK / PLAUSIBLE_LINK / CANNOT_VERIFY / SUSPICIOUS
5. submitterRoleReview
   - ROLE_SUPPORTED / ROLE_PLAUSIBLE / ROLE_UNSUPPORTED / ROLE_INCONSISTENT
6. workEmailReview
   - COMPANY_DOMAIN_MATCH / PERSONAL_BUT_PLAUSIBLE / UNRELATED / INVALID
7. officialLinkReview
   - ACTIVE_AND_MATCH / ACTIVE_BUT_WEAK / INACTIVE_OR_BROKEN / NOT_RELATED
8. honestyDeclarationReview
   - ACCEPTED / MISSING

## 6.17 Detail flow
1. Staff mở case Institutional Investor
2. Xem legal entity info và evidence file
3. Bấm `Start Review`
4. Chọn dropdown cho 8 review field
5. System check hard fail
6. Nếu không hard fail thì tính score
7. System gợi ý label
8. Staff confirm decision

## 6.18 Hard fail rules
- organizationCodeReview = NOT_FOUND
- organizationCodeReview = INVALID_FORMAT
- organizationProofFileReview = MISMATCH_OR_SUSPICIOUS
- organizationLegalNameReview = MISMATCH
- submitterFullNameReview = SUSPICIOUS
- officialLinkReview = NOT_RELATED

## 6.19 Auto-label rules
### Verified Investor Entity
- total score >= 10
- organizationCodeReview = VALID_MATCH hoặc FOUND_BUT_DIFFERS
- organizationProofFileReview = CLEAR_AND_MATCH hoặc UNCLEAR_BUT_PLAUSIBLE
- officialLinkReview != NOT_RELATED

### Basic Verified
- total score từ 6 đến 9
- không có hard fail

### Pending More Info
- total score từ 2 đến 5
- không có hard fail

### Verification Failed
- total score <= 1
- hoặc có hard fail

## 6.20 Notes cho designer
- Đây là luồng gần giống Startup có pháp nhân nhưng copy và badge phải thể hiện đây là `Investor Entity`
- Nút confirm cuối nên có text động `Confirm Verified Investor Entity` nếu system suggest label này

---

## KYC-04. Individual / Angel Investor

## 6.21 Submission fields
- Họ tên đầy đủ
- Chức danh hiện tại
- Tổ chức hiện tại (nếu có)
- Email liên hệ
- LinkedIn / professional profile
- File chứng minh hoạt động đầu tư cơ bản
- Cam kết thông tin trung thực

## 6.22 Review fields và dropdown
1. investorFullNameReview
   - STRONG_LINK / PLAUSIBLE_LINK / CANNOT_VERIFY / SUSPICIOUS
2. currentTitleReview
   - CLEAR_AND_RELEVANT / BASIC_BUT_WEAK / UNCLEAR / NOT_RELEVANT
3. currentOrganizationReview
   - ACTIVE_AND_MATCH / PLAUSIBLE / CANNOT_VERIFY / NOT_RELATED
4. contactEmailReview
   - ALIGNED / PERSONAL_BUT_PLAUSIBLE / UNRELATED / INVALID
5. professionalProfileLinkReview
   - ACTIVE_AND_MATCH / ACTIVE_BUT_WEAK / INACTIVE_OR_BROKEN / NOT_RELATED
6. basicInvestorProofFileReview
   - CLEAR_AND_RELEVANT / BASIC_BUT_WEAK / UNCLEAR / IRRELEVANT_OR_SUSPICIOUS
7. honestyDeclarationReview
   - ACCEPTED / MISSING

## 6.23 Detail flow
1. Staff mở case Individual Investor
2. Xem profile công khai và file proof
3. Vào review workspace
4. Review 7 field
5. System check hard fail
6. Nếu không hard fail thì tính score
7. System gợi ý label
8. Staff confirm decision hoặc request more info

## 6.24 Hard fail rules
- investorFullNameReview = SUSPICIOUS
- professionalProfileLinkReview = NOT_RELATED
- basicInvestorProofFileReview = IRRELEVANT_OR_SUSPICIOUS

## 6.25 Auto-label rules
### Verified Angel Investor
- total score >= 8
- professionalProfileLinkReview = ACTIVE_AND_MATCH hoặc ACTIVE_BUT_WEAK
- basicInvestorProofFileReview = CLEAR_AND_RELEVANT hoặc BASIC_BUT_WEAK

### Basic Verified
- total score từ 5 đến 7
- không có hard fail

### Pending More Info
- total score từ 2 đến 4
- không có hard fail

### Verification Failed
- total score <= 1
- hoặc có hard fail

## 6.26 Notes cho designer
- `professionalProfileLink` và `basicInvestorProofFile` là 2 anchor field chính
- Nếu không có organization, UI không nên coi đó là fail mặc định

---

## KYC-05. Advisor

## 6.27 Submission fields
- Họ tên đầy đủ
- Vai trò / chức danh hiện tại
- Tổ chức hiện tại
- Lĩnh vực chuyên môn chính
- Lĩnh vực chuyên môn phụ
- Email công việc / email liên hệ
- LinkedIn / hồ sơ nghề nghiệp công khai
- File chứng minh chuyên môn cơ bản
- Cam kết thông tin trung thực

## 6.28 Review fields và dropdown
1. advisorFullNameReview
   - STRONG_LINK / PLAUSIBLE_LINK / CANNOT_VERIFY / SUSPICIOUS
2. currentRoleTitleReview
   - CLEAR_AND_RELEVANT / BASIC_BUT_WEAK / UNCLEAR / NOT_RELEVANT
3. currentOrganizationReview
   - ACTIVE_AND_MATCH / PLAUSIBLE / CANNOT_VERIFY / NOT_RELATED
4. primaryExpertiseReview
   - CLEAR_MATCH / PARTIAL_MATCH / UNCLEAR / MISMATCH
5. secondaryExpertiseReview
   - CLEAR_MATCH / PARTIAL_MATCH / NOT_ENOUGH_INFO / MISMATCH
6. contactEmailReview
   - ALIGNED / PERSONAL_BUT_PLAUSIBLE / UNRELATED / INVALID
7. professionalProfileLinkReview
   - ACTIVE_AND_MATCH / ACTIVE_BUT_WEAK / INACTIVE_OR_BROKEN / NOT_RELATED
8. basicExpertiseProofFileReview
   - CLEAR_AND_RELEVANT / BASIC_BUT_WEAK / UNCLEAR / IRRELEVANT_OR_SUSPICIOUS
9. honestyDeclarationReview
   - ACCEPTED / MISSING

## 6.29 Detail flow
1. Staff mở case Advisor
2. Xem role, organization, expertise, public profile, proof file
3. Vào review workspace
4. Review 9 field
5. System check hard fail
6. Nếu không hard fail thì tính score
7. System gợi ý label
8. Staff xác nhận decision

## 6.30 Hard fail rules
- advisorFullNameReview = SUSPICIOUS
- primaryExpertiseReview = MISMATCH
- professionalProfileLinkReview = NOT_RELATED
- basicExpertiseProofFileReview = IRRELEVANT_OR_SUSPICIOUS

## 6.31 Auto-label rules
### Verified Advisor
- total score >= 11
- primaryExpertiseReview = CLEAR_MATCH hoặc PARTIAL_MATCH
- professionalProfileLinkReview = ACTIVE_AND_MATCH hoặc ACTIVE_BUT_WEAK
- basicExpertiseProofFileReview = CLEAR_AND_RELEVANT hoặc BASIC_BUT_WEAK

### Basic Verified
- total score từ 7 đến 10
- không có hard fail

### Pending More Info
- total score từ 3 đến 6
- không có hard fail

### Verification Failed
- total score <= 2
- hoặc có hard fail

## 6.32 Notes cho designer
- Đây là flow có số field nhiều nhất, nên chia section:
  - Identity
  - Professional Role
  - Expertise
  - Public Presence
  - Evidence
- `primaryExpertiseReview`, `professionalProfileLinkReview`, `basicExpertiseProofFileReview` là nhóm trọng yếu

---

# 7. Shared scoring UX

## 7.1 Score groups
System cần map giá trị dropdown thành điểm:

### Nhóm tốt = 2 điểm
- EXACT_MATCH
- VALID_MATCH
- CLEAR_AND_MATCH
- STRONG_LINK
- ROLE_SUPPORTED
- COMPANY_DOMAIN_MATCH
- ACTIVE_AND_MATCH
- CONSISTENT_PUBLICLY
- CLEAR_AND_RELEVANT
- ACCEPTED

### Nhóm chấp nhận được = 1 điểm
- PARTIAL_MATCH
- FOUND_BUT_DIFFERS
- UNCLEAR_BUT_PLAUSIBLE
- PLAUSIBLE_LINK
- ROLE_PLAUSIBLE
- PERSONAL_BUT_PLAUSIBLE
- ACTIVE_BUT_WEAK
- BASIC_BUT_WEAK
- ALIGNED

### Nhóm chưa đủ cơ sở = 0 điểm
- CANNOT_VERIFY
- INCOMPLETE
- ROLE_UNSUPPORTED
- INACTIVE_OR_BROKEN
- UNCLEAR
- MISSING

### Nhóm rủi ro cao = -2 điểm
- MISMATCH
- NOT_FOUND
- INVALID_FORMAT
- MISMATCH_OR_SUSPICIOUS
- SUSPICIOUS
- ROLE_INCONSISTENT
- UNRELATED
- INVALID
- NOT_RELATED
- IRRELEVANT_OR_SUSPICIOUS

## 7.2 Score panel UI
Score panel nên hiển thị:
- Hard fail: Yes/No
- Current total score
- Score band meaning
- Suggested label
- Rule explanation (collapsed)

## 7.3 Behavior
- Mỗi lần staff đổi dropdown, score update realtime
- Nếu hard fail xuất hiện, score panel đổi sang failure mode
- Nếu hard fail được staff sửa dropdown, panel trở lại scoring mode

---

# 8. Shared decision flow

## 8.1 Confirm auto decision
1. Staff bấm `Confirm Decision`
2. Modal hiển thị:
   - applicant summary
   - subtype
   - hard fail status
   - total score
   - final label
3. Staff nhập internal note
4. Confirm
5. Hệ thống cập nhật case + audit trail

## 8.2 Request more info
1. Staff bấm `Request More Info`
2. Modal hiển thị:
   - missing / weak fields checklist
   - user-visible note
   - internal note
3. Confirm
4. Hệ thống chuyển case sang `Pending More Info`

## 8.3 Save draft
1. Staff bấm `Save Draft`
2. Hệ thống lưu trạng thái review hiện tại
3. Case vẫn ở `In Review` hoặc `Draft Review` [ASSUMPTION]

---

# 9. States cần thiết kế

## 9.1 Submission detail states
- Loading
- Normal
- Missing file preview
- Broken external link
- Previous resubmission exists

## 9.2 Review workspace states
- Fresh review
- Partial review
- Draft saved
- Hard fail active
- Auto-label ready
- Unsaved changes

## 9.3 Final decision states
- Verified / Basic Verified / Pending More Info / Verification Failed
- Success toast
- Submit error

---

# 10. Audit trail requirements

Mỗi KYC decision cần log:
- Case ID
- Applicant type / subtype
- Reviewer
- Timestamp
- Reviewed field values
- Hard fail result
- Score total
- Final label
- Internal note
- User-visible note nếu có

---

# 11. UX mistakes cần tránh
1. Dùng chung 1 form review cho tất cả role
2. Cho staff tự gõ label thủ công
3. Không hiển thị hard fail realtime
4. Tính điểm xong nhưng không giải thích label
5. Trộn internal note với note gửi applicant
6. Không cho xem previous submission/history
7. Không nhấn mạnh các field trọng yếu theo subtype

---

# 12. Kết luận thiết kế
KYC của Operation Staff trong AISEP không phải flow approve/reject đơn giản.
Nó là flow:
- subtype-specific review
- evidence-based dropdown assessment
- hard fail detection
- score calculation
- auto-label
- staff confirmation

Thiết kế UI/UX đúng phải giúp staff:
- review nhanh
- review nhất quán
- không quyết định sai
- có audit rõ
