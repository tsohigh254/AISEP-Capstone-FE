---
description: Luồng xử lý logic KYC cho Startup (UI/UX)
---

Luồng xác thực Startup KYC bao gồm các trạng thái và điều kiện chuyển hướng sau:

1. **Khởi tạo (NOT_SUBMITTED)**:
   - Truy cập `/startup/verification` để xem yêu cầu.
   - Nhấn "Bắt đầu" dẫn đến `/startup/verification/submit`.

2. **Nộp hồ sơ (SUBMITTING)**:
   - Chọn loại Startup: `WITH_LEGAL_ENTITY` hoặc `WITHOUT_LEGAL_ENTITY`.
   - Điền Form tương ứng.
   - Tải lên tài liệu minh chứng (GPKD hoặc Bằng chứng hoạt động).
   - Xác nhận cam kết thông tin.
   - Gọi API (Mock) để lưu hồ sơ. Chuyển trạng thái sang `SUBMITTED`.

3. **Đang chờ duyệt (UNDER_REVIEW)**:
   - Chuyển hướng người dùng về `/startup/verification/status`.
   - Hiển thị thông báo "Hồ sơ của bạn đang được xem xét".
   - Khóa chức năng chỉnh sửa form.

4. **Yêu cầu bổ sung (PENDING_MORE_INFO)**:
   - Khi Staff yêu cầu sửa đổi, trạng thái chuyển sang `PENDING_MORE_INFO`.
   - Hiển thị danh sách các mục "Cần bổ sung" tại `/startup/verification/additional-info`.
   - Cho phép người dùng nhấn "Nộp lại" dẫn đến `/startup/verification/resubmit`.
   - Tải dữ liệu cũ vào Form để chỉnh sửa.

5. **Hoạt động sau khi Duyệt (APPROVED/FAILED)**:
   - **APPROVED**: Cấp nhãn `Verified Company` hoặc `Verified Founding Team`. Hiển thị huy hiệu tại Profile.
   - **FAILED**: Hiển thị lý do từ chối. Cho phép nộp lại nếu hợp lệ theo chính sách.
