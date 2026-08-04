# Chiến Binh Dịch

Webapp luyện Việt → Anh cho học sinh THCS theo mạch **Từ → Cụm từ → Câu**. V1 tập trung Global Success 7 · Unit 1 · Hobbies.

## Learning loop

- Học sinh gõ chính xác output tiếng Anh được chỉ định.
- Đúng ngay lần đầu: item được cộng vào điểm chính xác.
- Sai lần 1: chưa hiện đáp án, học sinh tự thử lại.
- Sai lần 2: hiện đáp án chuẩn, nhưng học sinh vẫn phải tự gõ lại đúng mới được đi tiếp.
- Item đã sai không được cộng điểm chính xác.
- Hoàn thành set với điểm từ 80% được tính PASS.

## Attempt evidence

Mỗi lần submit là một immutable Attempt Event trong `session.attempts`, gồm thời gian bắt đầu/gửi, thời lượng phản hồi, answer, input method, paste flag và trạng thái reveal. Score, corrected count, reveal count, paste/rapid indicators và Activity Timeline đều **derive từ cùng Attempt SSOT**.

Paste/rapid chỉ là **dấu hiệu cần xem lại**, không tự động kết luận gian lận.

## Architecture guardrails

- Không God Component: orchestration, domain, repositories và feature UI tách riêng.
- Không split SSOT: attempt history là nguồn sự thật cho scoring + report analytics.
- Feature screens lazy-load bằng dynamic `import()`.
- Lesson dataset lazy-load qua `lessonRepository`.
- Local storage nằm sau repository abstraction.
- Design tokens tập trung trong `:root`; component không tự khai báo màu hex riêng.
- Loading state rõ ràng cho module/data transitions.
- Automated tests khóa các invariants kiến trúc quan trọng.

## Viewport targets

Primary classroom viewport:
- 1280 × 529 CSS px
- Chrome maximize, 100% zoom
- Windows Scale 150%
- Bookmarks bar bật

Mobile target:
- iPhone 11 class viewport ~414 × 896 CSS px

## Quality gates

```bash
npm run ci
```

`npm run ci` là SSOT cho kiểm tra local và GitHub Actions: syntax → content lint → automated tests.

## CI/CD

GitHub Actions chạy quality gates trên mọi pull request và push vào `main`. Chi tiết release contract, Vercel Git integration và rollback nằm ở [`docs/ci-cd.md`](docs/ci-cd.md).

## Deploy

Static ES Modules, không dependency runtime. Vercel phục vụ trực tiếp `index.html`, `styles/` và `src/`.
