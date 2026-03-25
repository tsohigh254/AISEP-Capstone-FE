# Trợ giúp phê duyệt KYC cho Operation Staff

## 1. Mục tiêu của quy trình KYC
Quy trình KYC của AISEP là **light verification**.

Mục tiêu không phải kiểm toán pháp lý chuyên sâu, mà để xác nhận rằng hồ sơ trên nền tảng:

- Có tồn tại ở mức cơ bản
- Không phải tài khoản giả mạo
- Có dấu hiệu liên hệ hợp lý giữa người nộp hồ sơ và tổ chức/cá nhân được khai báo
- Đủ cơ sở để gán nhãn xác thực phù hợp trên nền tảng

Operation Staff cần tập trung vào việc phát hiện:

- Dấu hiệu giả mạo rõ ràng
- Thông tin mâu thuẫn lớn
- Tài liệu không liên quan hoặc có dấu hiệu đáng ngờ
- Hồ sơ chưa đủ cơ sở xác minh và cần bổ sung thêm thông tin

---

## 2. Nguyên tắc review chung
Khi review KYC, hãy áp dụng các nguyên tắc sau:

### 2.1 Review theo bằng chứng có sẵn
Chỉ đánh giá dựa trên:
- Thông tin người dùng đã nộp
- Link công khai
- File chứng minh
- Mức độ liên kết hợp lý giữa các trường thông tin

### 2.2 Không yêu cầu xác minh vượt quá scope
AISEP chỉ cần xác minh ở mức cơ bản.

Ví dụ:
- Với **Startup**, không cần kiểm toán doanh nghiệp
- Với **Investor**, không cần chứng minh chắc chắn họ giàu hoặc chắc chắn sẽ đầu tư
- Với **Advisor**, không cần chứng minh họ là chuyên gia hàng đầu, chỉ cần có danh tính nghề nghiệp và chuyên môn cơ bản phù hợp

### 2.3 Ưu tiên “Pending More Info” khi chưa đủ cơ sở
Nếu hồ sơ:
- Chưa có hard fail
- Nhưng bằng chứng còn yếu
- Hoặc chưa đủ rõ để approve

Hãy ưu tiên **Pending More Info** thay vì reject ngay.

---

## 3. Quy trình review đề xuất

### Bước 1. Kiểm tra loại hồ sơ
Xác định đúng nhóm KYC:
- Startup đã có pháp nhân
- Startup chưa có pháp nhân
- Institutional Investor
- Individual / Angel Investor
- Advisor

### Bước 2. Review từng trường
Mỗi trường cần được chọn đúng giá trị đánh giá trong dropdown review, ví dụ:
- Match tốt
- Match một phần
- Không đủ cơ sở xác minh
- Mismatch / suspicious

### Bước 3. Kiểm tra hard fail
Nếu có bất kỳ điều kiện hard fail nào, hồ sơ phải bị gán ngay:
- **Verification Failed**

### Bước 4. Xem điểm tổng và điều kiện label
Nếu không có hard fail:
- Hệ thống tính điểm
- Đối chiếu ngưỡng điểm và điều kiện bắt buộc
- Gán label tương ứng

### Bước 5. Ra quyết định xử lý
Operation Staff có thể:
- Phê duyệt
- Yêu cầu bổ sung thông tin
- Từ chối xác thực

---

## 4. Cách hiểu các mức đánh giá

### Nhóm tốt = 2 điểm
Dùng khi bằng chứng rõ, hợp lý, có độ tin cậy cao.

Ví dụ:
- EXACT_MATCH
- VALID_MATCH
- CLEAR_AND_MATCH
- STRONG_LINK
- COMPANY_DOMAIN_MATCH
- ACTIVE_AND_MATCH
- CLEAR_AND_RELEVANT
- ACCEPTED

### Nhóm chấp nhận được = 1 điểm
Dùng khi có tín hiệu hợp lý nhưng chưa mạnh.

Ví dụ:
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
Dùng khi chưa thể xác minh rõ, nhưng chưa có dấu hiệu fail mạnh.

Ví dụ:
- CANNOT_VERIFY
- INCOMPLETE
- ROLE_UNSUPPORTED
- INACTIVE_OR_BROKEN
- UNCLEAR
- MISSING

### Nhóm rủi ro cao = -2 điểm
Dùng khi có dấu hiệu sai lệch, không liên quan, hoặc đáng ngờ.

Ví dụ:
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

---

## 5. Hướng dẫn theo từng loại hồ sơ

## 5.1 Startup đã có pháp nhân

### Cần review các trường
- Tên pháp lý đầy đủ
- Mã số doanh nghiệp / mã số thuế
- File Giấy chứng nhận đăng ký doanh nghiệp
- Họ tên người nộp hồ sơ
- Vai trò người nộp hồ sơ
- Email công việc
- Website hoặc product link
- Cam kết thông tin trung thực

### Hard fail nếu có một trong các trường hợp sau
- `enterpriseCodeReview = NOT_FOUND`
- `enterpriseCodeReview = INVALID_FORMAT`
- `businessRegistrationFileReview = MISMATCH_OR_SUSPICIOUS`
- `legalFullNameReview = MISMATCH`
- `submitterFullNameReview = SUSPICIOUS`
- `officialLinkReview = NOT_RELATED`

### Cách hiểu label
**Verified Company**
- Tổng điểm ≥ 10
- Và đồng thời:
  - `enterpriseCodeReview = VALID_MATCH` hoặc `FOUND_BUT_DIFFERS`
  - `businessRegistrationFileReview = CLEAR_AND_MATCH` hoặc `UNCLEAR_BUT_PLAUSIBLE`
  - `submitterFullNameReview ≠ SUSPICIOUS`
  - `officialLinkReview ≠ NOT_RELATED`

**Basic Verified**
- Tổng điểm từ 6 đến 9
- Không có hard fail

**Pending More Info**
- Tổng điểm từ 2 đến 5
- Không có hard fail

**Verification Failed**
- Tổng điểm ≤ 1 hoặc có hard fail

---

## 5.2 Startup chưa có pháp nhân

### Cần review các trường
- Tên startup / project name
- Họ tên founder hoặc người đại diện
- Vai trò
- Email liên hệ
- Website / landing page / demo / LinkedIn page / app link
- File chứng minh hoạt động cơ bản
- Cam kết thông tin trung thực

### Hard fail nếu có
- `projectNameReview = MISMATCH`
- `representativeFullNameReview = SUSPICIOUS`
- `publicLinkReview = NOT_RELATED`
- `basicActivityProofFileReview = IRRELEVANT_OR_SUSPICIOUS`

### Cách hiểu label
**Verified Founding Team**
- Tổng điểm ≥ 8
- Và đồng thời:
  - `publicLinkReview = ACTIVE_AND_MATCH` hoặc `ACTIVE_BUT_WEAK`
  - `basicActivityProofFileReview = CLEAR_AND_RELEVANT` hoặc `BASIC_BUT_WEAK`
  - `representativeFullNameReview ≠ SUSPICIOUS`

**Basic Verified**
- Tổng điểm từ 5 đến 7

**Pending More Info**
- Tổng điểm từ 2 đến 4

**Verification Failed**
- Tổng điểm ≤ 1 hoặc có hard fail

---

## 5.3 Institutional Investor

### Cần review các trường
- Tên pháp lý tổ chức
- Mã số doanh nghiệp / mã số thuế
- File chứng minh tổ chức
- Họ tên người nộp hồ sơ
- Vai trò người nộp hồ sơ
- Email công việc
- Website / fund page / company page
- Cam kết trung thực

### Hard fail nếu có
- `organizationCodeReview = NOT_FOUND`
- `organizationCodeReview = INVALID_FORMAT`
- `organizationProofFileReview = MISMATCH_OR_SUSPICIOUS`
- `organizationLegalNameReview = MISMATCH`
- `submitterFullNameReview = SUSPICIOUS`
- `officialLinkReview = NOT_RELATED`

### Cách hiểu label
**Verified Investor Entity**
- Tổng điểm ≥ 10
- Và đồng thời:
  - `organizationCodeReview = VALID_MATCH` hoặc `FOUND_BUT_DIFFERS`
  - `organizationProofFileReview = CLEAR_AND_MATCH` hoặc `UNCLEAR_BUT_PLAUSIBLE`
  - `officialLinkReview ≠ NOT_RELATED`

**Basic Verified**
- Tổng điểm từ 6 đến 9

**Pending More Info**
- Tổng điểm từ 2 đến 5

**Verification Failed**
- Tổng điểm ≤ 1 hoặc có hard fail

---

## 5.4 Individual / Angel Investor

### Cần review các trường
- Họ tên đầy đủ
- Chức danh hiện tại
- Tổ chức hiện tại (nếu có)
- Email liên hệ
- LinkedIn / professional profile
- File chứng minh hoạt động đầu tư cơ bản
- Cam kết trung thực

### Hard fail nếu có
- `investorFullNameReview = SUSPICIOUS`
- `professionalProfileLinkReview = NOT_RELATED`
- `basicInvestorProofFileReview = IRRELEVANT_OR_SUSPICIOUS`

### Cách hiểu label
**Verified Angel Investor**
- Tổng điểm ≥ 8
- Và đồng thời:
  - `professionalProfileLinkReview = ACTIVE_AND_MATCH` hoặc `ACTIVE_BUT_WEAK`
  - `basicInvestorProofFileReview = CLEAR_AND_RELEVANT` hoặc `BASIC_BUT_WEAK`

**Basic Verified**
- Tổng điểm từ 5 đến 7

**Pending More Info**
- Tổng điểm từ 2 đến 4

**Verification Failed**
- Tổng điểm ≤ 1 hoặc có hard fail

---

## 5.5 Advisor

### Cần review các trường
- Họ tên đầy đủ
- Vai trò / chức danh hiện tại
- Tổ chức hiện tại
- Lĩnh vực chuyên môn chính
- Lĩnh vực chuyên môn phụ
- Email công việc / email liên hệ
- LinkedIn / hồ sơ nghề nghiệp công khai
- File chứng minh chuyên môn cơ bản
- Cam kết trung thực

### Hard fail nếu có
- `advisorFullNameReview = SUSPICIOUS`
- `primaryExpertiseReview = MISMATCH`
- `professionalProfileLinkReview = NOT_RELATED`
- `basicExpertiseProofFileReview = IRRELEVANT_OR_SUSPICIOUS`

### Cách hiểu label
**Verified Advisor**
- Tổng điểm ≥ 11
- Và đồng thời:
  - `primaryExpertiseReview = CLEAR_MATCH` hoặc `PARTIAL_MATCH`
  - `professionalProfileLinkReview = ACTIVE_AND_MATCH` hoặc `ACTIVE_BUT_WEAK`
  - `basicExpertiseProofFileReview = CLEAR_AND_RELEVANT` hoặc `BASIC_BUT_WEAK`

**Basic Verified**
- Tổng điểm từ 7 đến 10

**Pending More Info**
- Tổng điểm từ 3 đến 6

**Verification Failed**
- Tổng điểm ≤ 2 hoặc có hard fail

---

## 6. Khi nào nên chọn Pending More Info
Chọn **Pending More Info** khi:
- Hồ sơ chưa có dấu hiệu giả mạo rõ ràng
- Có một số trường chưa xác minh được
- File đính kèm còn yếu hoặc chưa đủ rõ
- Link công khai hoạt động nhưng chưa đủ mạnh để approve
- Cần người dùng nộp bổ sung tài liệu hoặc cập nhật lại thông tin

Ví dụ:
- Dùng email cá nhân nhưng vẫn có dấu hiệu liên quan hợp lý
- Website hoạt động nhưng nội dung còn sơ sài
- File chứng minh có liên quan nhưng chưa đủ rõ
- Tên tổ chức gần đúng nhưng chưa đủ cơ sở kết luận exact match

---

## 7. Khi nào nên reject / Verification Failed
Chỉ nên reject ngay khi:
- Có hard fail
- Có dấu hiệu giả mạo rõ ràng
- Thông tin mâu thuẫn nghiêm trọng
- Link hoặc tài liệu không liên quan
- File có dấu hiệu đáng ngờ hoặc sai hoàn toàn với hồ sơ khai báo

---

## 8. Lưu ý vận hành quan trọng
- Không đánh giá theo cảm tính, hãy bám vào bằng chứng
- Không yêu cầu quá mức ngoài scope light verification
- Ưu tiên tính nhất quán giữa:
  - Tên
  - Email
  - Vai trò
  - Tổ chức
  - Link công khai
  - File chứng minh
- Nếu hồ sơ chưa đủ mạnh nhưng vẫn có tín hiệu hợp lý, ưu tiên **Pending More Info**
- Mục tiêu là lọc hồ sơ giả mạo hoặc rủi ro cao, không phải loại bỏ mọi hồ sơ chưa hoàn hảo ngay từ đầu

---

## 9. Nội dung ngắn cho tooltip / help box

### Tooltip ngắn
**KYC review của AISEP là xác thực cơ bản (light verification).**  
Operation Staff cần kiểm tra mức độ hợp lý của thông tin, mối liên hệ giữa người nộp hồ sơ và tổ chức/cá nhân khai báo, đồng thời phát hiện các dấu hiệu giả mạo hoặc tài liệu không liên quan.

### Help box ngắn
- Approve khi hồ sơ đủ tín hiệu xác thực cơ bản
- Chọn Pending More Info khi chưa đủ cơ sở nhưng chưa có hard fail
- Reject khi có hard fail hoặc dấu hiệu không phù hợp rõ ràng
