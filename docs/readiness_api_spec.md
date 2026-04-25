# Startup Readiness Checklist — API Specification cho FE

> **Version**: V1 · **Status**: Backend đã implement xong, sẵn sàng cho FE tích hợp  
> **Branch**: `fix/investor-startup-display-enrichment`

---

## 1. Tổng quan tính năng

**Startup Readiness Checklist** giúp Startup tự đánh giá mức độ sẵn sàng tiếp cận Investor. Hệ thống chấm điểm 100 dựa trên 5 chiều (dimension), sau đó đưa ra trạng thái, danh sách thiếu sót và hành động gợi ý tiếp theo.

### Công thức tổng

| Dimension | Max | Ý nghĩa |
|---|---|---|
| **Profile** | 25 | Hồ sơ startup đầy đủ (tên, ngành, vấn đề, giải pháp, team...) |
| **KYC** | 20 | Xác thực danh tính (Verified Company = max, Basic = 14, ...) |
| **Documents** | 20 | Tài liệu (Pitch Deck, Business Plan, visibility) |
| **AI** | 20 | Đã chạy AI evaluation và điểm AI tốt |
| **Trust** | 15 | Blockchain proof + dữ liệu cập nhật gần đây |
| **Tổng** | **100** | |

### Phân loại trạng thái

| Score | Status | Mã trả về |
|---|---|---|
| 0–39 | Not Ready | `NOTREADY` |
| 40–69 | Needs Work | `NEEDSWORK` |
| 70–84 | Almost Ready | `ALMOSTREADY` |
| 85–100 | Investor Ready | `INVESTORREADY` |

### Business Rules (Hard Caps)

> [!IMPORTANT]
> Các rule này ép điểm cuối cùng xuống, **không sửa điểm từng dimension**.

| Điều kiện | Cap |
|---|---|
| Chưa có **Pitch Deck** | Tối đa 69 (không bao giờ lên AlmostReady) |
| Chưa có **AI Evaluation** | Tối đa 84 (không bao giờ lên InvestorReady) |
| **KYC bị Rejected** | Tối đa 69 |

---

## 2. API Endpoints

### 2.1. GET `/api/startups/me/readiness`

**Mô tả**: Tính điểm readiness real-time, lưu snapshot mới nhất và trả kết quả.

**Auth**: Bearer Token · Role: `Startup`

**Response** (200 OK):

```json
{
  "isSuccess": true,
  "data": {
    "overallScore": 72,
    "status": "ALMOSTREADY",
    "dimensions": {
      "profile": 20,
      "kyc": 14,
      "documents": 14,
      "ai": 16,
      "trust": 8
    },
    "missingItems": [
      "Upload a Business Plan",
      "Verify at least one key document on blockchain",
      "Add your website or demo URL"
    ],
    "nextActions": [
      {
        "code": "UPLOAD_BP",
        "label": "Upload Business Plan",
        "target": "/startup/documents/upload"
      },
      {
        "code": "VERIFY_DOC",
        "label": "Verify key document on blockchain",
        "target": "/startup/documents"
      },
      {
        "code": "COMPLETE_PROFILE",
        "label": "Complete your startup profile",
        "target": "/startup/profile/edit"
      }
    ],
    "calculatedAt": "2026-04-25T16:50:00Z"
  }
}
```

### 2.2. POST `/api/startups/me/readiness/recalculate`

**Mô tả**: Cùng logic như GET, nhưng là hành động "force refresh" rõ ràng. Dùng cho nút "Recalculate" trên UI hoặc debug.

**Auth**: Bearer Token · Role: `Startup`  
**Body**: Không cần  
**Response**: Giống hệt GET

---

## 3. Response Schema chi tiết

### `ReadinessResultDto`

| Field | Type | Mô tả |
|---|---|---|
| `overallScore` | `int` | 0–100, sau khi áp business caps |
| `status` | `string` | `NOTREADY` \| `NEEDSWORK` \| `ALMOSTREADY` \| `INVESTORREADY` |
| `dimensions` | `object` | Điểm từng chiều (xem bên dưới) |
| `missingItems` | `string[]` | Danh sách mục còn thiếu (human-readable) |
| `nextActions` | `object[]` | Hành động gợi ý với code + target route |
| `calculatedAt` | `datetime` | Thời điểm tính (UTC) |

### `ReadinessDimensionsDto`

| Field | Type | Max | Mô tả |
|---|---|---|---|
| `profile` | `int` | 25 | Độ hoàn thiện hồ sơ |
| `kyc` | `int` | 20 | Trạng thái xác thực KYC |
| `documents` | `int` | 20 | Bộ tài liệu |
| `ai` | `int` | 20 | AI evaluation |
| `trust` | `int` | 15 | Blockchain proof + freshness |

### `NextActionDto`

| Field | Type | Mô tả |
|---|---|---|
| `code` | `string` | Mã hành động (để FE map icon/style) |
| `label` | `string` | Text hiển thị cho user |
| `target` | `string` | Route FE nên navigate tới |

### Danh sách `code` có thể trả về

| Code | Label | Target |
|---|---|---|
| `COMPLETE_PROFILE` | Complete your startup profile | `/startup/profile/edit` |
| `SUBMIT_KYC` | Submit KYC verification | `/startup/kyc` |
| `RESUBMIT_KYC` | Resubmit KYC / Provide additional info | `/startup/kyc` |
| `UPLOAD_PITCH_DECK` | Upload Pitch Deck | `/startup/documents/upload` |
| `UPLOAD_BP` | Upload Business Plan | `/startup/documents/upload` |
| `REQUEST_AI_EVAL` | Request AI Evaluation | `/startup/ai-evaluation` |
| `VERIFY_DOC` | Verify key document on blockchain | `/startup/documents` |

---

## 4. Gợi ý UI cho FE

### 4.1. Card trên Startup Dashboard

```
┌─────────────────────────────────────────┐
│  🎯 Investment Readiness                │
│                                         │
│  ████████████████████░░░░  72/100       │
│  Status: Almost Ready                   │
│                                         │
│  ⚠ Missing 3 items:                    │
│    • Upload Business Plan               │
│    • Verify document on blockchain      │
│    • Add website URL                    │
│                                         │
│  [View Details]  [Recalculate ↻]        │
└─────────────────────────────────────────┘
```

### 4.2. Trang chi tiết — 5 blocks

Mỗi block hiển thị:
- **Tên dimension** + **điểm / max** (ví dụ: Profile 20/25)
- **Thanh progress** (màu theo mức: đỏ < 50%, vàng 50–80%, xanh > 80%)
- **Danh sách thiếu** (lọc từ `missingItems` theo keyword)
- **Nút CTA** (lấy từ `nextActions`, match theo `code`)

### 4.3. Mapping status → UI

| Status | Màu | Icon gợi ý |
|---|---|---|
| `NOTREADY` | 🔴 Red | ❌ |
| `NEEDSWORK` | 🟠 Orange | ⚠️ |
| `ALMOSTREADY` | 🟡 Yellow | 🔶 |
| `INVESTORREADY` | 🟢 Green | ✅ |

### 4.4. Logic FE đơn giản

```js
// Gọi API khi mount trang Dashboard hoặc trang Readiness
const { data } = await api.get('/startups/me/readiness');

// Hiển thị
const score = data.overallScore;
const status = data.status;
const dimensions = data.dimensions;
const missing = data.missingItems;
const actions = data.nextActions;

// Nút Recalculate
const handleRecalculate = async () => {
  const { data } = await api.post('/startups/me/readiness/recalculate');
  // update state
};
```

---

## 5. Edge Cases FE cần handle

| Case | Behavior |
|---|---|
| Startup mới tạo (chưa có gì) | `overallScore = 0`, `status = NOTREADY`, `missingItems` chứa hầu hết mục |
| KYC đang Under Review | `kyc = 4` (partial credit), không hiện "Submit KYC" trong actions |
| Không có AI Evaluation | `ai = 0`, action `REQUEST_AI_EVAL` xuất hiện |
| Profile rất đầy đủ nhưng thiếu Pitch Deck | Score bị cap ở 69, status = `NEEDSWORK` dù raw score > 69 |
| Startup chưa login | API trả 401 Unauthorized |
| User không phải role Startup | API trả 403 Forbidden |

---

## 6. Tổng kết files BE đã thay đổi

| File | Thay đổi |
|---|---|
| `Enums.cs` | Thêm `ReadinessStatus` enum |
| `StartupReadinessSnapshot.cs` | Entity mới |
| `ReadinessDTOs.cs` | 3 DTOs cho response |
| `IReadinessService.cs` | Interface |
| `ReadinessService.cs` | Core logic chấm điểm (5 dimensions + caps) |
| `ApplicationDbContext.cs` | Register DbSet + config |
| `StartupsController.cs` | 2 endpoints mới |
| `Program.cs` | DI registration |
| Migration | `AddStartupReadinessSnapshot` |
