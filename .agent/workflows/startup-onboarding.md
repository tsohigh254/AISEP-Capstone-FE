---
description: Luồng xử lý Onboarding 5 bước cho Startup mới
---

Quy trình onboarding tập trung vào việc thu thập dữ liệu cốt lõi và hướng dẫn người dùng tới các giá trị then chốt.

1. **Khởi tạo Shell & Stepper**:
   - Sử dụng layout tập trung (Centered Layout) không có sidebar.
   - Hiển thị thanh tiến trình 5 bước.

2. **Xử lý State**:
   - Lưu trữ tạm thời vào `localStorage` hoặc state quản lý tập trung để tránh mất dữ liệu khi F5.

3. **Logic Bước 1 & 2**:
   - Thu thập thông tin định danh và mô tả ngắn gọn.
   - Áp dụng `Design System` (rounded-2xl, premium inputs).

4. **Logic Bước 3 (Tài liệu)**:
   - Tái sử dụng `KycFileUploader` để người dùng upload Pitch Deck.

5. **Logic Bước 4 (Readiness)**:
   - Tính toán % hoàn thiện dựa trên các field đã điền.
   - Hiển thị các hành động gợi ý để tăng điểm tin cậy.

6. **Logic Bước 5 (Launchpad)**:
   - Hiển thị 3 nút CTA chính:
     - `Đánh giá AI`: `/startup/ai-evaluation/request`
     - `Tìm Cố vấn`: `/startup/experts`
     - `Dashboard`: `/startup`
