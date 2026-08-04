# Chiến Binh Dịch

Webapp luyện **Việt → Anh** theo progression **Từ → Cụm từ → Câu**, thiết kế cho học sinh Việt Nam cần củng cố output chính xác phục vụ Speaking & Writing.

## V1

- Global Success 7 · Unit 1 · Hobbies
- Set 1: **My Hobby · Like & Benefit**
- 16 lượt gõ: 7 từ → 6 cụm từ → 3 câu
- Sai: bắt buộc sửa đúng trước khi đi tiếp
- Item sai: không cộng điểm chính xác
- Đạt từ 80%: pass set
- Báo cáo cuối có tên học sinh, thời gian, điểm, session ID và nhắc chụp gửi Thầy Thành MRT
- Local-first: refresh không mất session đang làm
- Lazy-load từng feature screen bằng native `import()`
- Không framework/runtime dependency

## Chạy local

Từ thư mục project:

```bash
python3 -m http.server 4173
```

Mở `http://localhost:4173`.

## Kiểm thử

```bash
npm test
npm run lint:content
```

## Kiến trúc

- `src/core`: domain logic (answer, score, session)
- `src/data`: dataset + content linting
- `src/repositories`: persistence abstraction
- `src/features`: screens được lazy-load
- `styles`: presentation layer
- `tests`: unit tests domain/content
