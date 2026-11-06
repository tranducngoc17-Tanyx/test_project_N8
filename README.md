# UniCareer – Frontend Sprint 1 (4 task đang làm)

Bộ mã nguồn bổ sung **theo đúng cây thư mục trong ảnh**, dành cho stack **HTML + CSS + JavaScript thuần, Python/FastAPI và MySQL** của SRS_UniCare.docx. Không sử dụng React, Vue, npm hoặc Axios.

> **Lưu ý:** Nhóm chưa cung cấp file code repo hiện tại, chỉ có ảnh chụp cây thư mục. Đây là bộ file **ghép vào repo** (overlay). Không chứa/sửa file của thành viên khác. Nếu repo đã có `style.css`, `api.js`, `candidate.js` hoặc các trang tương ứng, hãy **so sánh & merge Git** trước khi chép đè.

## 1. Bốn task và file triển khai

| Task đang làm trên bảng | Mã giao diện | Nội dung đã viết |
|---|---|---|
| Xây dựng giao diện danh sách việc làm | `frontend/pages/candidate/index.html` | Job Card, logo chữ, công ty, địa điểm, lương, loại hình, nút xem chi tiết; phân trang, tải lỗi/rỗng |
| Xây dựng giao diện chi tiết việc làm | `frontend/pages/candidate/job-detail.html` | Nội dung JD, yêu cầu, quyền lợi (nếu có), công ty, hạn nộp, CTA ứng tuyển, nút vô hiệu hóa nếu tin không hợp lệ |
| Xây dựng giao diện ứng tuyển | `frontend/pages/candidate/apply-job.html` | Hồ sơ sinh viên, CV tuỳ chọn, thư giới thiệu, xác nhận, gửi đơn, thành công/lỗi, chặn ứng tuyển trùng |
| Xây dựng giao diện tìm kiếm và lọc việc làm | `frontend/pages/candidate/index.html` + JS | Tìm tên/kỹ năng/từ khóa không dấu; lọc địa điểm, loại hình, lương, kinh nghiệm; sắp xếp; đồng bộ query URL |

Bổ trợ để chạy luồng hoàn chỉnh: `my-applications.html` (xem đơn và trạng thái) và `cv-manage.html` (cập nhật hồ sơ/CV **dạng văn bản** trong demo).

## 2. Các file cần ghép vào dự án

```text
frontend/
├── assets/
│   ├── css/
│   │   ├── style.css            # CSS chung (nếu đã có, merge trước)
│   │   └── candidate.css        # CSS trang sinh viên
│   ├── js/
│   │   ├── api.js               # Adapter mock / FastAPI (nếu đã có, merge trước)
│   │   └── candidate.js         # Tất cả UI và tương tác của 4 task
│   └── images/
│       └── logo.svg
├── pages/
│   └── candidate/
│       ├── index.html           # Danh sách + tìm kiếm/lọc
│       ├── job-detail.html      # Chi tiết tin
│       ├── apply-job.html       # Ứng tuyển
│       ├── my-applications.html # Theo dõi đơn
│       └── cv-manage.html       # Hồ sơ/CV demo
└── tests/
    └── smoke.mjs              # Kiểm tra logic mock bằng Node.js
```

**Không đụng tới** `pages/auth/`, `pages/company/`, `pages/admin/` và các file JS/CSS của thành viên khác trong ảnh. Không cần tạo các file đó để chạy thử bộ này.

## 3. Chạy ngay, không cần Backend

Trên Windows, tại thư mục gốc chứa `frontend`:

```powershell
cd frontend
py -m http.server 5500
```

Sau đó mở trình duyệt:

**http://localhost:5500/pages/candidate/index.html**

> Đừng nhấp mở `.html` trực tiếp bằng `file://` vì ứng dụng dùng JavaScript ES Modules. Cần chạy qua HTTP server.

Mặc định `APP_CONFIG.MODE = 'mock'` trong `frontend/assets/js/api.js`.
- 13 tin tuyển dụng công khai giả lập; tin đóng/chờ duyệt không xuất hiện trong danh sách.
- Ứng tuyển được lưu trong `localStorage` trình duyệt, **không** được lưu vào MySQL.
- `cv-manage.html` lưu dữ liệu dạng văn bản trong localStorage. Tải file trong form ứng tuyển chỉ lưu **tên file**, không lưu tệp thật ở chế độ mock.
- Không có xác thực thật. Hồ sơ sinh viên mẫu được dùng để kiểm thử giao diện.

Bạn có thể thử tuần tự: lọc `Thực tập` → mở `Backend Python Intern` → `Ứng tuyển ngay` → chọn xác nhận → `Gửi đơn` → xem `Đơn ứng tuyển` → thử nộp lại để thấy cơ chế chống trùng.

## 4. Kết nối FastAPI sau khi Backend hoàn thành

Trong `frontend/assets/js/api.js`, đổi:

```js
export const APP_CONFIG = Object.freeze({
  MODE: 'api',
  API_BASE_URL: 'http://127.0.0.1:8000',
  API_PREFIX: '/api',
  PAGE_SIZE: 6,
  STORAGE_PREFIX: 'unicareer_fe_demo_v1'
});
```

**Cần thống nhất trước với 2 BE**: SRS định nghĩa chức năng nhưng *không có hợp đồng API/endpoint cụ thể*. Bảng dưới chỉ là **đề xuất để tích hợp**, chưa khẳng định backend hiện tại có các route này.

| Method | Endpoint đề xuất | Frontend sử dụng |
|---|---|---|
| `GET` | `/api/jobs` | Danh sách công việc. Adapter bản này kỳ vọng trả *toàn bộ danh sách* để lọc/phân trang phía trình duyệt (phù hợp dataset MVP). |
| `GET` | `/api/jobs/{job_id}` | Chi tiết công việc |
| `GET` | `/api/candidate/profile` | Hồ sơ Candidate |
| `PUT` | `/api/candidate/profile` | Cập nhật hồ sơ, CV text |
| `GET` | `/api/candidate/applications` | Đơn đã ứng tuyển |
| `POST` | `/api/applications` | Gửi đơn, JSON hoặc multipart nếu có CV |

**JSON ví dụ cho `GET /api/jobs/{id}`**:

```json
{
  "job_id": 101,
  "title": "Thực tập sinh Backend Python",
  "company_name": "TechNova",
  "location": "TP. Hồ Chí Minh",
  "salary_range": "3 - 5 triệu",
  "job_type": "INTERNSHIP",
  "experience_level": "Không yêu cầu",
  "description": "Mô tả công việc...",
  "requirements": "Yêu cầu ứng viên...",
  "deadline": "2026-12-20",
  "status": "ACTIVE",
  "approval_status": "APPROVED",
  "created_at": "2026-11-05"
}
```

`GET /api/jobs` có thể trả mảng `[]` hoặc `{ "items": [...] }`. Nếu BE sử dụng **phân trang server**, phải sửa `api.listJobs` để xử lý `total`, `page`, `page_size` từ backend, tránh phân trang hai lần.

**`POST /api/applications` không có file** gửi JSON `{ "job_id": 101, "cover_letter": "..." }`. **Có file** gửi `multipart/form-data` với `job_id`, `cover_letter`, `cv`. Các trường `cover_letter`, CV file, `benefits` là đề xuất hỗ trợ UI; nếu CSDL/API hiện tại không có, Backend phải bỏ qua/điều chỉnh hoặc nhóm thêm trường và migration. Khi sử dụng `multipart/form-data` không tự đặt header `Content-Type` (browser bổ sung boundary).

**Phân quyền và bảo mật:** BE phải kiểm tra token và `role=CANDIDATE` tại API POST; không dựa vào việc ẩn nút FE. BE cũng phải kiểm tra `status=ACTIVE`, `approval_status=APPROVED`, `deadline >= today`, và `UNIQUE(job_id, candidate_id)` khi ghi đơn. FE chỉ hiển thị UX và gửi request; không được tính là cơ chế bảo mật. Trong bản mẫu, module đọc token tạm từ `sessionStorage['unicareer_access_token']`; khi tích hợp xác thực thật nên thống nhất cơ chế session/token an toàn với team.

Nếu 2 BE đặt tên route hoặc response khác, **chỉ cần sửa mapping trong `api.js`**, không cần sửa toàn bộ HTML. Cấu hình CORS FastAPI cần cho origin `http://localhost:5500` khi chạy khác cổng. 

## 5. Kiểm tra nhanh

Nếu máy có Node.js >= 22, từ thư mục gốc của ZIP:

```powershell
node frontend/tests/smoke.mjs
```

Kiểm tra các case: search, tiếng Việt không dấu, filter địa điểm/loại hình/lương, pagination, đơn nộp thành công, chặn đơn trùng, chặn tin đóng và chờ duyệt, lưu hồ sơ localStorage.

## 6. Acceptance Criteria để đưa task sang Hoàn thành

- **Danh sách việc làm:** hiển thị đúng tin `ACTIVE/APPROVED/chưa quá hạn`; loading/empty/error; bấm Job Card sang đúng tin; phân trang.
- **Chi tiết việc làm:** hiển thị đúng `job_id`; nội dung/địa điểm/lương/loại hình/yêu cầu/hạn nộp; ẩn hoặc vô hiệu hóa nộp đơn khi tin không hợp lệ.
- **Tìm kiếm & lọc:** từ khóa, địa điểm, loại hình, lương, kinh nghiệm; kết hợp nhiều điều kiện; xóa lọc; trạng thái phân trang cập nhật.
- **Ứng tuyển:** nộp được một đơn; chống nộp trùng; có lỗi/đang tải/thành công; đơn mới xuất hiện trong lịch sử; trạng thái ban đầu `RECEIVED`.

**Lưu ý về mức lương:** trong mock, `salary_range` có dạng "3 - 5 triệu" hoặc "Thỏa thuận". Khi kết nối MySQL thật, nên chuẩn hóa `salary_min`, `salary_max` hoặc chuyển việc lọc lương sang Backend để tránh xử lý sai chuỗi tiền tệ.

**Giới hạn chưa nghiệm thu thực tế:** Chưa có API FastAPI từ nhóm, chưa thử nghiệm trực quan trên trình duyệt trong môi trường tạo mã. Các AC có sự phụ thuộc Backend chỉ đạt khi tích hợp MySQL thật và kiểm thử thủ công/kiểm thử tích hợp.
