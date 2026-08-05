# Chiến Binh Dịch

Webapp Mastery cho học sinh, hỗ trợ Set Typing và Mixed Question. V1.6.0 thêm **Published Set Library** ở homepage để giáo viên xem các Set đã publish, mở thử và sao chép stable link gửi học sinh.

## Published library

- `/` là thư viện bài tập, không còn tự mở một Set mặc định.
- `/s/:setId` là stable student link của từng Set.
- Folder chỉ dùng để tổ chức thư viện; di chuyển Set giữa folder không làm đổi student link.
- V1.6.0 có folder **Bài tập mẫu** chứa:
  - `g7-u1-mixed-demo` — MCQ + True/False + Sentence Order.
  - `g7-u1-s1` — Typing Việt → Anh.
- Homepage chỉ đọc metadata nhẹ từ `lessonCatalog`; full question content vẫn lazy-load khi Set được mở.
- `lessonCatalog` sở hữu metadata/folder/threshold/loader; dataset modules chỉ sở hữu `items`, tránh split SSOT.

## Learning loop

- Học sinh mở stable link → nhập tên → vào đúng Set.
- Mỗi prompt exposure chỉ attempt đầu tiên được quyền thay đổi Mastery.
- Attempt đầu đúng: `+1` Mastery unit; attempt đầu sai: `-1` Mastery unit.
- Attempt #2 trở đi trong cùng exposure là correction/neutral: `0` Mastery.
- Mastery được replay tuần tự trong biên 0–100, không có hidden negative debt.
- Item sai quay lại sau 2 prompt khác; retry là exposure mới và được chấm lại `+1/-1` ở attempt đầu.
- `Mastery >= passThreshold` đạt chuẩn. Set hiện tại dùng 80%.
- Khi đạt chuẩn, học sinh có **Nộp bài** hoặc **Làm tiếp**. Làm tiếp giữ nguyên Mastery/Retry semantics và cuối cùng vẫn nộp để ra report.

## Attempt evidence SSOT

Mỗi lần submit là một immutable Attempt Event trong `session.attempts`, gồm question type, prompt exposure, response, thời gian, input method, reveal state và `masteryDeltaUnits`.

Mastery, retry/report metrics, correction, reveal, paste/rapid indicators và Activity Timeline đều derive từ Attempt SSOT. Scheduler state chỉ là operational state để resume đúng prompt.

## Responsive targets

Primary classroom viewport:
- 1280 × 529 CSS px
- Google Chrome maximize, không F11
- Chrome Zoom 100%
- Windows Scale 150%
- Bookmarks bar bật

Mobile target:
- iPhone 11 class viewport ~414 × 896 CSS px
- Library 1 cột; Set actions stack; Drill giữ touch-first interactions.

## Architecture guardrails

- Không God Component: orchestration, domain, scheduler, repositories và feature UI tách riêng.
- Không split SSOT: Attempt log là learning evidence SSOT; Catalog là published metadata SSOT.
- Question Type Registry sở hữu renderer/evaluator interaction; Session/Mastery/Retry dùng chung mọi question type.
- Feature screens lazy-load bằng dynamic `import()`.
- Lesson full content lazy-load qua `lessonRepository`.
- Catalog validator khóa duplicate IDs, dangling folders, invalid threshold/itemCount và missing loaders.
- Design tokens tập trung trong `:root`; component CSS không tự khai báo màu hex riêng.
- CSP giữ `style-src 'self'`, không dùng `unsafe-inline`.

## Canonical CI

```bash
npm run ci
```

Quality gate chạy syntax check, catalog/content validation và toàn bộ automated tests.

## Delivery contract

Feature branch → PR → GitHub CI → Vercel Preview → smoke/audit → squash merge `main` → Vercel Production từ Git commit → post-deploy verification.

Không dùng manual file upload như đường release bình thường.
