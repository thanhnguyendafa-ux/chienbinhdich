# Chiến Binh Dịch

Webapp Mastery cho học sinh, hỗ trợ Set Typing và Mixed Question. V1.6.0 thêm **Published Set Library** ở homepage để giáo viên xem các Set đã publish, mở thử và sao chép stable link gửi học sinh.

## Published library

- `/` là thư viện bài tập, không còn tự mở một Set mặc định.
- `/a/:lessonSlug` là fixed student link của từng Set.
- Folder chỉ dùng để tổ chức thư viện; di chuyển Set giữa folder không làm đổi student link.
- Homepage/Admin chỉ đọc metadata nhẹ từ `lessonCatalog`; full question content vẫn lazy-load khi Set được mở.
- `lessonCatalog` sở hữu published metadata và default Mastery; dataset modules chỉ sở hữu `items`, tránh split SSOT.
- Mutable runtime lesson settings không được copy ngược vào Catalog; chúng nằm riêng trong Firestore `lessonSettings/{setId}`.

## Learning loop

- Học sinh mở fixed link → nhập tên → vào đúng Set.
- Mỗi prompt exposure chỉ attempt đầu tiên được quyền thay đổi Mastery.
- Attempt đầu đúng: `+1` Mastery unit; attempt đầu sai: `-1` Mastery unit.
- Attempt #2 trở đi trong cùng exposure là correction/neutral: `0` Mastery.
- Mastery được replay tuần tự trong biên 0–100, không có hidden negative debt.
- Item sai quay lại sau 2 prompt khác; retry là exposure mới và được chấm lại `+1/-1` ở attempt đầu.
- `Mastery >= passThresholdAtStart` đạt chuẩn, cùng với `completionPolicy` của Set nếu có.
- Khi đạt chuẩn, học sinh có **Nộp bài** hoặc **Làm tiếp**. Làm tiếp giữ nguyên Mastery/Retry semantics và cuối cùng vẫn nộp để ra report.

## Runtime Mastery policy

- Default toàn hệ thống là **80%**; lesson có thể khai báo default riêng từ 1–100 trong Catalog.
- Admin có thể đặt runtime override từ 1–100 hoặc reset về default mà không đổi fixed link.
- Runtime override chỉ áp dụng cho session bắt đầu sau khi setting được lưu.
- Khi học sinh bấm **Bắt đầu**, effective threshold được snapshot vào Session V7 dưới `passThresholdAtStart`.
- Resume, qualification và report dùng snapshot; thay đổi Admin sau đó không dịch chuyển vạch đích của session đang làm hoặc lịch sử.
- Session V7 cũ không có snapshot được resolve về 80%, vì trước runtime settings toàn bộ published lesson đều dùng 80%.
- Nếu live `lessonSettings` không đọc được, app không âm thầm fallback sang default cho một lượt mới; phải retry để tránh dùng sai mốc PASS.

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
- Không split SSOT: Attempt log là learning evidence SSOT; Catalog là published metadata/default policy SSOT; Firestore lesson settings chỉ chứa mutable override.
- `masteryPolicy` sở hữu default/validation/resolution; UI và repositories không tự diễn giải threshold.
- `effectiveLessonService` compose static lesson + runtime setting và session snapshot; SessionMachine không phụ thuộc Firebase.
- Student lesson-settings reader là read-only; Admin settings writer là repository riêng, không phình `adminRepository`.
- Shared Admin Mastery editor chỉ emit Save/Reset callbacks và không chứa Firebase logic.
- Question Type Registry sở hữu renderer/evaluator interaction; Session/Mastery/Retry dùng chung mọi question type.
- Feature screens lazy-load bằng dynamic `import()`.
- Lesson full content lazy-load qua `lessonRepository`.
- Catalog/content validator dùng chung Mastery policy validation, không hard-code một threshold riêng.
- Design tokens tập trung trong `:root`; component CSS ưu tiên semantic tokens.
- CSP giữ `style-src 'self'`, không dùng `unsafe-inline`.

## Canonical CI

```bash
npm run ci
```

Quality gate chạy syntax check, catalog/content validation và toàn bộ automated tests.

## Firebase rules delivery

Runtime Mastery settings yêu cầu production Firestore rules có `lessonSettings/{setId}` trước khi web code bắt đầu đọc collection này.

Có hai đường deploy hợp lệ:

1. **Firebase Console**: Firestore → Rules → paste bản `firestore.rules` đã review → Publish → xác minh phiên bản mới xuất hiện trong Rules history.
2. **GitHub Actions**: chạy thủ công workflow `.github/workflows/firebase-rules.yml` sau khi repository có secret `FIREBASE_SERVICE_ACCOUNT_CHIENBINHDICH` chứa service-account JSON phù hợp. Workflow pin `firebase-tools@15.24.0`.

Không commit service-account JSON vào repository.

Release chứa thay đổi Firestore contract phải theo thứ tự an toàn:

1. `npm run ci` xanh cho code và rule-contract tests.
2. Deploy `firestore.rules` vào project `chienbinhdich` bằng một trong hai đường trên.
3. Xác minh Rules history hoặc deployment job cho thấy bản mới đã lên production.
4. Sau đó mới merge/deploy web code lên Production.
5. Smoke-test signed-in learner read-only và Admin save/reset.

Không merge web code phụ thuộc rule mới trước khi rules mới đã ở production, vì Vercel không triển khai Firestore rules.

## Delivery contract

Feature branch → Draft PR → GitHub CI → deploy Firestore Rules → Ready PR → merge `main` → Vercel Production → post-deploy verification.

Không dùng manual file upload web như đường release bình thường.
