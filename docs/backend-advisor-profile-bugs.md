# Backend Bug Report — Advisor Profile API

**Date:** 2026-03-21
**Tested by:** FE Team
**Base URL:** `http://localhost:5294`

---

## ✅ Đã fix (2026-03-21)

- `POST /api/advisors` — hoạt động đúng
- `GET /api/advisors/me` — hoạt động đúng
- `PUT /api/advisors/me` — hoạt động nhưng **còn bug items bị duplicate** (xem Bug 3 bên dưới)

---

## 🔴 Bug còn lại — Bug 3: PUT `/api/advisors/me` duplicate items

### Mô tả

Mỗi lần gọi PUT, backend đang **append** items mới vào items cũ thay vì replace.

**Ví dụ:**
- Trước PUT: `items = [FUNDRAISING, TECHNOLOGY]`
- Gọi PUT với `Items[0].Category=FUNDRAISING, Items[1].Category=TECHNOLOGY`
- Sau PUT: `items = [FUNDRAISING, TECHNOLOGY, FUNDRAISING, TECHNOLOGY]` ← sai

### Logic FE mong đợi

```
if (FE gửi Items list không rỗng)
    → xóa toàn bộ items cũ, insert items mới (replace-all)

if (FE không gửi Items / Items rỗng)
    → giữ nguyên items hiện tại, không thay đổi
```

### Test case sau khi fix

```http
PUT /api/advisors/me
Authorization: Bearer <token>
Content-Type: multipart/form-data

FullName=Test Advisor
Items[0].Category=FUNDRAISING
Items[0].yearsOfExperience=5
Items[1].Category=TECHNOLOGY
```

**Expected response:**
```json
{
  "isSuccess": true,
  "data": {
    "items": [
      { "category": "FUNDRAISING", "yearsOfExperience": 5 },
      { "category": "TECHNOLOGY", "yearsOfExperience": null }
    ]
  }
}
```
Items phải có **đúng 2 phần tử**, không bị nhân đôi dù gọi PUT nhiều lần.

---

## Tóm tắt ban đầu

| Endpoint | Method | Kết quả |
|---|---|---|
| `POST /api/advisors` | Create profile | ✅ Hoạt động đúng |
| `GET /api/advisors/me` | Lấy profile | ❌ 500 Internal Server Error |
| `PUT /api/advisors/me` | Cập nhật profile | ❌ 500 Internal Server Error |

---

## Bug 1 — GET `/api/advisors/me` trả về 500

### Request
```http
GET /api/advisors/me
Authorization: Bearer <valid_token>
```

### Response thực tế
```json
{
  "message": "An unexpected error occurred. Please try again later.",
  "isSuccess": false,
  "statusCode": 500,
  "data": null
}
```

### Response mong đợi
```json
{
  "isSuccess": true,
  "statusCode": 200,
  "data": {
    "advisorID": 1,
    "userId": 26,
    "fullName": "Huy Nguyen",
    "title": "Senior Advisor",
    "company": "AISEP",
    "bio": "...",
    "website": "https://example.com",
    "linkedInURL": "https://linkedin.com/in/...",
    "mentorshipPhilosophy": "...",
    "profilePhotoURL": "https://...",
    "experienceYears": 5,
    "items": [
      { "category": "FUNDRAISING", "subTopic": null, "proficiencyLevel": null, "yearsOfExperience": null },
      { "category": "GO_TO_MARKET", "subTopic": null, "proficiencyLevel": null, "yearsOfExperience": null }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Impact
- FE không load được profile của advisor
- Trang `/advisor/profile` không hiển thị được dữ liệu
- Guard kiểm tra "đã có profile chưa" (để redirect từ `/advisor/onboard`) không hoạt động được

---

## Bug 2 — PUT `/api/advisors/me` trả về 500

### Request
```http
PUT /api/advisors/me
Authorization: Bearer <valid_token>
Content-Type: multipart/form-data

FullName=Huy Nguyen
Title=Senior Advisor
Company=AISEP
Bio=Experienced advisor in tech and startups
Website=https://example.com
LinkedInURL=https://linkedin.com/in/huynlh04
MentorshipPhilosophy=Help startups grow strategically
ExperienceYears=5
Items[0].Category=FUNDRAISING
Items[1].Category=GO_TO_MARKET
```

### Response thực tế
```json
{
  "message": "An unexpected error occurred. Please try again later.",
  "isSuccess": false,
  "statusCode": 500,
  "data": null
}
```

### Response mong đợi
```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Profile updated successfully.",
  "data": { ... }
}
```

### Impact
- Advisor không thể cập nhật hồ sơ từ trang `/advisor/profile`

---

## Clarification cần confirm — Tên field file upload ảnh

FE hiện đang dùng key `ProfilePhotoURL` để upload file ảnh (IFormFile):

```
ProfilePhotoURL=<binary file>
```

Tuy nhiên suffix `URL` thường gợi ý đây là string URL, không phải file binary.
**Vui lòng confirm backend expect key tên gì cho IFormFile này:**

- `ProfilePhotoURL` ← FE đang dùng
- `ProfilePhoto`
- `ProfilePhotoFile`

FE sẽ cập nhật key trong `buildAdvisorFormData` sau khi có xác nhận.

---

## Endpoint hoạt động đúng (để tham khảo)

### POST `/api/advisors` — ✅ OK

```http
POST /api/advisors
Authorization: Bearer <valid_token>
Content-Type: multipart/form-data

FullName=Huy Nguyen
Title=Senior Advisor
Company=AISEP
Bio=Experienced advisor in tech and startups
Website=https://example.com
LinkedInURL=https://linkedin.com/in/huynlh04
MentorshipPhilosophy=Help startups grow strategically
ExperienceYears=5
Items[0].Category=FUNDRAISING
Items[1].Category=GO_TO_MARKET
```

Response khi profile đã tồn tại:
```json
{
  "message": "Advisor profile already exists for this user.",
  "isSuccess": false,
  "statusCode": 400,
  "data": null
}
```

Response structure và error handling hoạt động đúng.

---

## Ghi chú thêm

Khi GET/PUT được fix, FE cần backend đảm bảo response của `GET /api/advisors/me` trả về field `items` là **array of object** (không phải array of string):

```json
"items": [
  { "category": "FUNDRAISING" },
  { "category": "GO_TO_MARKET" }
]
```

FE đang dựa vào `items[0].category` để xác định `primaryExpertise` và `items[1..3].category` cho `secondaryExpertises`.
