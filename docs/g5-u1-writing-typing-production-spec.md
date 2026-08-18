# Global Success 5 · Unit 1 · Writing Typing Production Spec

Status: **CONTENT LOCK CANDIDATE**  
Repo: `thanhnguyendafa-ux/chienbinhdich`  
Production project: Vercel `chien-binh-dich`  
Production branch: `main`  
Spec path: `docs/g5-u1-writing-typing-production-spec.md`

---

## 1. Mục tiêu production

Tạo một bộ **14 mini lessons Typing Việt → Anh** cho học sinh lớp 5, bám đúng 14 target sentences đang có trong `src/data/g5-u1-writing-01.js`.

Nguyên tắc khóa:

> **Một lesson = một target sentence. Mọi từ, cụm và mảnh câu cần cho FINAL phải được giới thiệu lại ngay trong chính lesson đó.**

Bộ mới là **additive**. Không xóa, không ghi đè bài Writing Select + Order hiện tại `g5-u1-writing-01.js`.

Mục tiêu học sinh:

1. Vào bất kỳ lesson nào mà không cần nhớ lesson trước.
2. Nếu quên từ vựng, vẫn được nhìn lại từ cần dùng trước khi phải recall.
3. Đi theo đường `SEE → WORD → CHUNK → BUILD → FINAL`.
4. Không gặp một từ/cụm mới lần đầu ở câu FINAL.
5. Không phải đoán `a / the / my / your`, dạng viết tắt `What's / I'm`, hoặc `play → playing`.
6. Title không lộ nguyên câu đáp án.
7. Mỗi lesson có số phút dự kiến.

---

## 2. Kết quả audit repo hiện tại

### 2.1 G5 Unit 1 đang có

- `src/data/g5-u1-vocab-01.js`
- `src/data/g5-u1-pattern-01.js`
- `src/data/g5-u1-reading-01.js`
- `src/data/g5-u1-writing-01.js`

Bài Writing hiện tại có **14 câu**, dạng `sentence_order`, có distractor và feedback. Đây là source-of-truth nội dung cho bộ Typing mới.

### 2.2 Kiến trúc Typing đã production ở G6/G7

Repo đã có pattern ổn định:

- `*-writing-source.js`
- `*-writing-lexicon.js` hoặc scaffold metadata tương đương
- `*-writing-typing-builder.js`
- `*-writing-typing-catalog.js`
- `*-writing-typing-content.js`
- `*-writing-typing-partN.js`
- `*-writing-typing-published.js`

G5 Unit 1 hiện **chưa có** bộ typing theo kiến trúc này. Vì vậy không nên nhồi thêm logic vào `g5-u1-writing-01.js`.

### 2.3 Sửa so với bản nháp trước

Bản nháp trước có `My name ...` và `My birthday ...`, nhưng hai target này không nằm trong 14 câu Writing G5 U1 hiện đang khóa ở repo. Ngược lại source hiện tại có:

- `What's your favourite colour?`
- `I love playing table tennis.`
- `I like playing basketball.`
- `My favourite colour is green.`

Production spec này dùng **đúng 14 target hiện có**, không tự thêm câu ngoài source.

---

## 3. Nơi lưu khi production

### 3.1 Tài liệu khóa nội dung

- `docs/g5-u1-writing-typing-production-spec.md`

### 3.2 Source và scaffold

Đề xuất tạo:

- `src/data/g5-u1-writing-source.js`
- `src/data/g5-u1-writing-lexicon.js`
- `src/data/g5-u1-writing-typing-builder.js`
- `src/data/g5-u1-writing-typing-part1.js`
- `src/data/g5-u1-writing-typing-part2.js`
- `src/data/g5-u1-writing-typing-part3.js`
- `src/data/g5-u1-writing-typing-part4.js`
- `src/data/g5-u1-writing-typing-part5.js`
- `src/data/g5-u1-writing-typing-content.js`
- `src/data/g5-u1-writing-typing-catalog.js`
- `src/data/g5-u1-writing-typing-published.js`

Có thể chia 14 lessons thành 5 part theo family:

- Part 1: About yourself + place
- Part 2: Favourite questions
- Part 3: Favourite answers
- Part 4: Like/Love + V-ing
- Part 5: consolidation/remaining targets

**Lưu ý:** việc chia file chỉ để bảo trì code; trên learner UI vẫn là 14 lesson độc lập.

### 3.3 Catalog / publish integration

Cần cập nhật:

- `src/data/lessonCatalog.js`
- `src/data/publishedLessonCatalog.js`

Folder đề xuất:

- `global5`
  - `global5-unit1`
    - `global5-unit1-writing-sentence-builder`
      - `global5-unit1-writing-about-self`
      - `global5-unit1-writing-favourite-questions`
      - `global5-unit1-writing-favourite-answers`
      - `global5-unit1-writing-like-love`

### 3.4 Tests

Tạo tối thiểu:

- `tests/g5Unit1WritingTyping.test.js`

Có thể thêm regression riêng nếu cần:

- `tests/g5Unit1WritingTypingColdStart.test.js`
- `tests/g5Unit1WritingTypingTitleSafety.test.js`

---

## 4. Cold-start contract: chứng minh học sinh quên từ vẫn không bị lạc

Không thể chứng minh tuyệt đối rằng **mọi** học sinh sẽ không bao giờ hỏi giáo viên. Tiêu chuẩn nghiệm thu thực tế hơn là:

> **Không có lexical/grammar dependency nào trong FINAL mà học sinh buộc phải nhớ từ trước lesson.**

Bộ lesson phải thỏa cả 10 điều sau.

### C1. Local independence

Mỗi lesson tự chứa toàn bộ vocabulary/chunk cần cho target. Học sinh có thể mở Lesson 14 trước Lesson 1.

### C2. SEE before recall

Mỗi lexical unit dễ quên phải có lượt đầu dạng **nhìn nghĩa + nhìn English + gõ lại**, ví dụ:

- `sống = live → gõ: live`
- `một con cá heo = a dolphin → gõ: a dolphin`

Lượt này là **dạy lại**, không phải kiểm tra trí nhớ cũ.

### C3. Recall after exposure

Sau khi đã SEE, cue Việt mới yêu cầu học sinh tự gõ lại English.

Ví dụ:

`SEE: vùng nông thôn = the countryside`  
→ `RECALL: vùng nông thôn → the countryside`  
→ `CHUNK: ở vùng nông thôn → in the countryside`

### C4. 100% local token coverage

Mọi meaning-bearing token/chunk trong FINAL phải xuất hiện ở ít nhất một step trước FINAL của cùng lesson.

FINAL không được tự nhiên xuất hiện một từ mới.

### C5. One Vietnamese cue → one expected surface form

Trong cùng bộ G5 U1 typing, một cue Việt không được lúc thì map sang surface form A, lúc thì map sang surface form B nếu không có chỉ dẫn.

Ví dụ không được:

- `nông thôn → countryside`
- rồi FINAL bắt học sinh tự thêm `the countryside`

Phải dạy ngay:

- `vùng nông thôn = the countryside`

### C6. Article/determiner phải được cue rõ

- `một chiếc bánh sandwich → a sandwich`
- `một con cá heo → a dolphin`
- `của tôi → my`
- `của bạn → your`
- `vùng nông thôn → the countryside`
- `thành phố → the city`

Học sinh không phải đoán article/determiner.

### C7. Contraction phải được dạy trong lesson

- `What is = What's`
- `I am = I'm`

Canonical answer dùng dạng viết tắt theo source hiện tại; dạng đầy đủ được accepted nếu evaluator hỗ trợ accepted answers.

### C8. Morphology phải được bridge

Không được dạy `play` rồi nhảy thẳng sang `playing` ở FINAL.

Phải có:

- `chơi = play`
- `chơi, sau like/love = playing`
- `playing table tennis / playing basketball`

### C9. Không leak full target trong title

Title chỉ dùng keyword Việt ngắn. Ví dụ:

- `01 · Giới thiệu bản thân`
- `08 · Bóng đá yêu thích`

Không title nào chứa nguyên target sentence.

### C10. Error = reteach, không = dead end

Nếu học sinh quên và gõ sai ở WORD/CHUNK, feedback sau submit phải:

1. hiện đáp án đúng;
2. giải nghĩa ngắn bằng tiếng Việt;
3. nhắc đúng chunk sẽ được dùng tiếp;
4. không chặn học sinh vô thời hạn ở một từ đã quên.

---

## 5. Source-of-truth: 14 target sentences

| # | Target | Canonical | Accepted variant | Dự kiến |
|---|---|---|---|---:|
| 01 | Hỏi người khác nói về bản thân | `Can you tell me about yourself?` | — | 7 phút |
| 02 | Sống ở vùng nông thôn | `I live in the countryside.` | — | 6 phút |
| 03 | Hỏi màu sắc yêu thích | `What's your favourite colour?` | `What is your favourite colour?` | 7 phút |
| 04 | Thích chơi bóng bàn | `I love playing table tennis.` | — | 6 phút |
| 05 | Học lớp 5A | `I'm in Class 5A.` | `I am in Class 5A.` | 6 phút |
| 06 | Sống ở thành phố | `I live in the city.` | — | 6 phút |
| 07 | Hỏi môn thể thao yêu thích | `What's your favourite sport?` | `What is your favourite sport?` | 7 phút |
| 08 | Môn thể thao yêu thích là bóng đá | `My favourite sport is football.` | — | 6 phút |
| 09 | Hỏi món ăn yêu thích | `What's your favourite food?` | `What is your favourite food?` | 7 phút |
| 10 | Món ăn yêu thích là sandwich | `My favourite food is a sandwich.` | — | 6 phút |
| 11 | Hỏi con vật yêu thích | `What's your favourite animal?` | `What is your favourite animal?` | 7 phút |
| 12 | Con vật yêu thích là cá heo | `My favourite animal is a dolphin.` | — | 6 phút |
| 13 | Thích chơi bóng rổ | `I like playing basketball.` | — | 6 phút |
| 14 | Màu yêu thích là xanh lá | `My favourite colour is green.` | — | 6 phút |

**Tổng thời lượng dự kiến: 89 phút.** Không dùng như một bài 89 phút; nên chia 4–5 lượt học ngắn.

---

# 6. Nội dung chi tiết từng lesson

## Lesson 01 · Giới thiệu bản thân

**Target:** `Can you tell me about yourself?`  
**Dự kiến:** 7 phút  
**Title learner-safe:** `01 · Giới thiệu bản thân`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `có thể = can · Gõ lại từ tiếng Anh.` | `can` |
| 2 | SEE/CHUNK | `nói/kể cho tôi = tell me · Gõ lại.` | `tell me` |
| 3 | SEE/CHUNK | `về bản thân bạn = about yourself · Gõ lại.` | `about yourself` |
| 4 | RECALL | `bạn có thể` | `can you` |
| 5 | CHUNK | `nói cho tôi về bản thân bạn` | `tell me about yourself` |
| 6 | BUILD | `Bạn có thể nói cho tôi ...` | `Can you tell me` |
| 7 | BUILD | `... về bản thân bạn` | `about yourself` |
| 8 | FINAL | `Bạn có thể nói cho tôi về bản thân bạn không?` | `Can you tell me about yourself?` |

**Tại sao cold-start được:** `can`, `tell me`, `about yourself` đều được nhìn và gõ trước; `you` xuất hiện trong `can you`; FINAL không có lexical item mới.

**Feedback trap:** sau `can you` dùng `tell`, không dùng `telling`.

---

## Lesson 02 · Sống ở nông thôn

**Target:** `I live in the countryside.`  
**Dự kiến:** 6 phút  
**Title:** `02 · Sống ở nông thôn`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `sống = live · Gõ lại.` | `live` |
| 2 | SEE/CHUNK | `vùng nông thôn = the countryside · Gõ lại cả cụm.` | `the countryside` |
| 3 | RECALL | `sống` | `live` |
| 4 | CHUNK | `ở vùng nông thôn` | `in the countryside` |
| 5 | BUILD | `sống ở vùng nông thôn` | `live in the countryside` |
| 6 | FINAL | `Tôi sống ở vùng nông thôn.` | `I live in the countryside.` |

**Cold-start proof:** `the` không bị “mọc ra” ở FINAL; học sinh đã học nguyên surface form `the countryside` từ Step 2.

---

## Lesson 03 · Màu em thích

**Target:** `What's your favourite colour?`  
**Accepted:** `What is your favourite colour?`  
**Dự kiến:** 7 phút  
**Title:** `03 · Màu em thích`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `yêu thích = favourite · Gõ lại.` | `favourite` |
| 2 | SEE/WORD | `màu sắc = colour · Gõ lại.` | `colour` |
| 3 | SEE/CHUNK | `của bạn = your · Gõ lại.` | `your` |
| 4 | CHUNK | `màu sắc yêu thích` | `favourite colour` |
| 5 | CHUNK | `màu sắc yêu thích của bạn` | `your favourite colour` |
| 6 | SEE/BUILD | `What is viết tắt = What's · Gõ lại.` | `What's` |
| 7 | BUILD | `What's + màu sắc yêu thích của bạn` | `What's your favourite colour` |
| 8 | FINAL | `Màu sắc yêu thích của bạn là gì?` | `What's your favourite colour?` |

**Cold-start proof:** học sinh không phải nhớ `favourite`, `colour`, `your` hoặc apostrophe; contraction được dạy ngay trong lesson.

---

## Lesson 04 · Chơi bóng bàn

**Target:** `I love playing table tennis.`  
**Dự kiến:** 6 phút  
**Title:** `04 · Chơi bóng bàn`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `rất thích/yêu thích = love · Gõ lại.` | `love` |
| 2 | SEE/WORD | `chơi = play · Gõ lại.` | `play` |
| 3 | SEE/CHUNK | `bóng bàn = table tennis · Gõ lại.` | `table tennis` |
| 4 | BRIDGE | `chơi, khi đứng sau love = playing` | `playing` |
| 5 | CHUNK | `chơi bóng bàn, sau love` | `playing table tennis` |
| 6 | BUILD | `Tôi rất thích` | `I love` |
| 7 | FINAL | `Tôi rất thích chơi bóng bàn.` | `I love playing table tennis.` |

**Cold-start proof:** `play → playing` có bridge riêng; không yêu cầu học sinh nhớ quy tắc V-ing từ bài trước.

---

## Lesson 05 · Lớp của em

**Target:** `I'm in Class 5A.`  
**Accepted:** `I am in Class 5A.`  
**Dự kiến:** 6 phút  
**Title:** `05 · Lớp của em`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `tôi = I · Gõ lại.` | `I` |
| 2 | SEE/WORD | `am = dạng be đi với I · Gõ lại.` | `am` |
| 3 | SEE/CHUNK | `lớp 5A = Class 5A · Gõ lại.` | `Class 5A` |
| 4 | CHUNK | `ở lớp 5A` | `in Class 5A` |
| 5 | BUILD | `I am` | `I am` |
| 6 | SEE/BUILD | `I am viết tắt = I'm · Gõ lại.` | `I'm` |
| 7 | FINAL | `Tôi học lớp 5A.` | `I'm in Class 5A.` |

**Cold-start proof:** `am` và `I'm` đều được giới thiệu; học sinh không phải tự suy ra dấu apostrophe.

---

## Lesson 06 · Sống ở thành phố

**Target:** `I live in the city.`  
**Dự kiến:** 6 phút  
**Title:** `06 · Sống ở thành phố`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `sống = live · Gõ lại.` | `live` |
| 2 | SEE/CHUNK | `thành phố = the city · Gõ lại cả cụm.` | `the city` |
| 3 | RECALL | `sống` | `live` |
| 4 | CHUNK | `ở thành phố` | `in the city` |
| 5 | BUILD | `sống ở thành phố` | `live in the city` |
| 6 | FINAL | `Tôi sống ở thành phố.` | `I live in the city.` |

**Cold-start proof:** lesson lặp lại `live` dù Lesson 02 đã dạy. Mở Lesson 06 trực tiếp vẫn đủ input.

---

## Lesson 07 · Môn thể thao em thích

**Target:** `What's your favourite sport?`  
**Accepted:** `What is your favourite sport?`  
**Dự kiến:** 7 phút  
**Title:** `07 · Môn thể thao em thích`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `yêu thích = favourite · Gõ lại.` | `favourite` |
| 2 | SEE/WORD | `môn thể thao = sport · Gõ lại.` | `sport` |
| 3 | SEE/WORD | `của bạn = your · Gõ lại.` | `your` |
| 4 | CHUNK | `môn thể thao yêu thích` | `favourite sport` |
| 5 | CHUNK | `môn thể thao yêu thích của bạn` | `your favourite sport` |
| 6 | SEE/BUILD | `What is viết tắt = What's · Gõ lại.` | `What's` |
| 7 | BUILD | `What's + môn thể thao yêu thích của bạn` | `What's your favourite sport` |
| 8 | FINAL | `Môn thể thao yêu thích của bạn là gì?` | `What's your favourite sport?` |

**Cold-start proof:** không phụ thuộc Lesson 03 dù cùng pattern `What's your favourite ...?`.

---

## Lesson 08 · Bóng đá yêu thích

**Target:** `My favourite sport is football.`  
**Dự kiến:** 6 phút  
**Title:** `08 · Bóng đá yêu thích`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `của tôi = my · Gõ lại.` | `my` |
| 2 | SEE/CHUNK | `môn thể thao yêu thích = favourite sport · Gõ lại.` | `favourite sport` |
| 3 | SEE/WORD | `bóng đá = football · Gõ lại.` | `football` |
| 4 | CHUNK | `môn thể thao yêu thích của tôi` | `my favourite sport` |
| 5 | CHUNK | `là bóng đá` | `is football` |
| 6 | BUILD | `Môn thể thao yêu thích của tôi là ...` | `My favourite sport is` |
| 7 | FINAL | `Môn thể thao yêu thích của tôi là bóng đá.` | `My favourite sport is football.` |

**Cold-start proof:** `my`, `favourite sport`, `football`, `is football` đều có local exposure.

---

## Lesson 09 · Món ăn em thích

**Target:** `What's your favourite food?`  
**Accepted:** `What is your favourite food?`  
**Dự kiến:** 7 phút  
**Title:** `09 · Món ăn em thích`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `yêu thích = favourite · Gõ lại.` | `favourite` |
| 2 | SEE/WORD | `món ăn/thức ăn = food · Gõ lại.` | `food` |
| 3 | SEE/WORD | `của bạn = your · Gõ lại.` | `your` |
| 4 | CHUNK | `món ăn yêu thích` | `favourite food` |
| 5 | CHUNK | `món ăn yêu thích của bạn` | `your favourite food` |
| 6 | SEE/BUILD | `What is viết tắt = What's · Gõ lại.` | `What's` |
| 7 | BUILD | `What's + món ăn yêu thích của bạn` | `What's your favourite food` |
| 8 | FINAL | `Món ăn yêu thích của bạn là gì?` | `What's your favourite food?` |

**Cold-start proof:** pattern được dựng lại từ đầu; không giả định học sinh nhớ Lesson 03/07.

---

## Lesson 10 · Sandwich yêu thích

**Target:** `My favourite food is a sandwich.`  
**Dự kiến:** 6 phút  
**Title:** `10 · Sandwich yêu thích`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `của tôi = my · Gõ lại.` | `my` |
| 2 | SEE/CHUNK | `món ăn yêu thích = favourite food · Gõ lại.` | `favourite food` |
| 3 | SEE/CHUNK | `một chiếc bánh sandwich = a sandwich · Gõ lại cả cụm.` | `a sandwich` |
| 4 | CHUNK | `món ăn yêu thích của tôi` | `my favourite food` |
| 5 | CHUNK | `là một chiếc bánh sandwich` | `is a sandwich` |
| 6 | BUILD | `Món ăn yêu thích của tôi là ...` | `My favourite food is` |
| 7 | FINAL | `Món ăn yêu thích của tôi là một chiếc bánh sandwich.` | `My favourite food is a sandwich.` |

**Cold-start proof:** `a` được dạy cùng noun ngay Step 3. Không bao giờ có cue `sandwich` rồi bắt học sinh tự đoán article.

---

## Lesson 11 · Con vật em thích

**Target:** `What's your favourite animal?`  
**Accepted:** `What is your favourite animal?`  
**Dự kiến:** 7 phút  
**Title:** `11 · Con vật em thích`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `yêu thích = favourite · Gõ lại.` | `favourite` |
| 2 | SEE/WORD | `con vật/động vật = animal · Gõ lại.` | `animal` |
| 3 | SEE/WORD | `của bạn = your · Gõ lại.` | `your` |
| 4 | CHUNK | `con vật yêu thích` | `favourite animal` |
| 5 | CHUNK | `con vật yêu thích của bạn` | `your favourite animal` |
| 6 | SEE/BUILD | `What is viết tắt = What's · Gõ lại.` | `What's` |
| 7 | BUILD | `What's + con vật yêu thích của bạn` | `What's your favourite animal` |
| 8 | FINAL | `Con vật yêu thích của bạn là gì?` | `What's your favourite animal?` |

**Cold-start proof:** toàn bộ lexical core được local-reteach trước FINAL.

---

## Lesson 12 · Cá heo yêu thích

**Target:** `My favourite animal is a dolphin.`  
**Dự kiến:** 6 phút  
**Title:** `12 · Cá heo yêu thích`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `của tôi = my · Gõ lại.` | `my` |
| 2 | SEE/CHUNK | `con vật yêu thích = favourite animal · Gõ lại.` | `favourite animal` |
| 3 | SEE/CHUNK | `một con cá heo = a dolphin · Gõ lại cả cụm.` | `a dolphin` |
| 4 | CHUNK | `con vật yêu thích của tôi` | `my favourite animal` |
| 5 | CHUNK | `là một con cá heo` | `is a dolphin` |
| 6 | BUILD | `Con vật yêu thích của tôi là ...` | `My favourite animal is` |
| 7 | FINAL | `Con vật yêu thích của tôi là một con cá heo.` | `My favourite animal is a dolphin.` |

**Cold-start proof:** article `a` được khóa trong cue `một con cá heo` ngay từ lúc preteach.

---

## Lesson 13 · Chơi bóng rổ

**Target:** `I like playing basketball.`  
**Dự kiến:** 6 phút  
**Title:** `13 · Chơi bóng rổ`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `thích = like · Gõ lại.` | `like` |
| 2 | SEE/WORD | `chơi = play · Gõ lại.` | `play` |
| 3 | SEE/WORD | `bóng rổ = basketball · Gõ lại.` | `basketball` |
| 4 | BRIDGE | `chơi, khi đứng sau like = playing` | `playing` |
| 5 | CHUNK | `chơi bóng rổ, sau like` | `playing basketball` |
| 6 | BUILD | `Tôi thích` | `I like` |
| 7 | FINAL | `Tôi thích chơi bóng rổ.` | `I like playing basketball.` |

**Cold-start proof:** không dựa vào Lesson 04; morphology `playing` được bridge lại từ đầu.

---

## Lesson 14 · Màu xanh lá yêu thích

**Target:** `My favourite colour is green.`  
**Dự kiến:** 6 phút  
**Title:** `14 · Màu xanh lá yêu thích`

| Step | Stage | Cue hiển thị | Expected |
|---:|---|---|---|
| 1 | SEE/WORD | `của tôi = my · Gõ lại.` | `my` |
| 2 | SEE/CHUNK | `màu sắc yêu thích = favourite colour · Gõ lại.` | `favourite colour` |
| 3 | SEE/WORD | `màu xanh lá = green · Gõ lại.` | `green` |
| 4 | CHUNK | `màu sắc yêu thích của tôi` | `my favourite colour` |
| 5 | CHUNK | `là màu xanh lá` | `is green` |
| 6 | BUILD | `Màu sắc yêu thích của tôi là ...` | `My favourite colour is` |
| 7 | FINAL | `Màu sắc yêu thích của tôi là màu xanh lá.` | `My favourite colour is green.` |

**Cold-start proof:** mở Lesson 14 đầu tiên vẫn thấy `my`, `favourite colour`, `green` trước khi viết full sentence.

---

# 7. Coverage proof matrix

Mục tiêu của matrix này là kiểm tra thủ công và tự động rằng FINAL không chứa lexical content mới.

| Lesson | FINAL content chunks | Đã có trước FINAL? |
|---|---|---|
| 01 | `Can you` · `tell me` · `about yourself` | ✅ |
| 02 | `I` · `live` · `in` · `the countryside` | ✅ |
| 03 | `What's` · `your` · `favourite colour` | ✅ |
| 04 | `I` · `love` · `playing` · `table tennis` | ✅ |
| 05 | `I'm` · `in` · `Class 5A` | ✅ |
| 06 | `I` · `live` · `in` · `the city` | ✅ |
| 07 | `What's` · `your` · `favourite sport` | ✅ |
| 08 | `my` · `favourite sport` · `is` · `football` | ✅ |
| 09 | `What's` · `your` · `favourite food` | ✅ |
| 10 | `my` · `favourite food` · `is` · `a sandwich` | ✅ |
| 11 | `What's` · `your` · `favourite animal` | ✅ |
| 12 | `my` · `favourite animal` · `is` · `a dolphin` | ✅ |
| 13 | `I` · `like` · `playing` · `basketball` | ✅ |
| 14 | `my` · `favourite colour` · `is` · `green` | ✅ |

**Production test phải biến matrix này thành regression, không chỉ dựa vào review bằng mắt.**

---

# 8. Quy tắc learner UX

## 8.1 Header

Mỗi lesson hiển thị:

- title keyword Việt, không leak answer;
- `Typing · Việt → Anh`;
- `⏱ Dự kiến: X phút` từ `expectedTimeMinutes`.

Nếu learner header hiện chưa render `expectedTimeMinutes`, thêm rendering không phá schema và regression test cho metadata này.

## 8.2 Progress language

Ưu tiên nhãn dễ hiểu cho học sinh lớp 5:

`NHÌN TỪ → NHỚ TỪ → GHÉP CỤM → GHÉP CÂU → TỰ GÕ`

Không cần bắt học sinh hiểu thuật ngữ grammar trước khi làm.

## 8.3 Feedback

WORD/CHUNK sai:

- `Đúng là: ...`
- `Nghĩa: ...`
- `Con sẽ dùng cụm này ở câu sau.`

FINAL sai:

- nêu đúng điểm sai;
- không chỉ báo `Wrong`;
- nếu lỗi contraction/article/V-ing thì nhắc đúng bridge đã học trong lesson.

## 8.4 Không tạo memory dependency giả

Không dùng câu kiểu:

- `Như bài trước, hãy nhớ ...`
- `Con đã học từ này rồi ...`

Vì learner có thể mở lesson bằng deep link hoặc học không theo thứ tự.

---

# 9. Source model khi code

Mỗi source record nên có tối thiểu:

```js
{
  id,
  order,
  targetSentence,
  targetVi,
  family,
  expectedTimeMinutes,
  difficulty,
  sourceType,
  sourceNote,
  feedbackReason,
  acceptedAnswers
}
```

Canonical typing forms:

- `What's ...?` là canonical; `What is ...?` là accepted.
- `I'm in Class 5A.` là canonical; `I am in Class 5A.` là accepted.

Không bật tolerance rộng làm che lỗi grammar. Có thể normalize:

- trim whitespace;
- repeated spaces;
- case nếu engine hiện tại cho phép theo policy chung.

Nhưng không được coi `you favourite` = `your favourite`, `I lives` = `I live`, hoặc thiếu article là đúng.

---

# 10. Production workflow đầu-cuối

## Phase A · Content lock

1. Audit `g5-u1-writing-01.js`.
2. Khóa 14 target sentence, Vietnamese cue, accepted variants.
3. Khóa thời lượng từng lesson.
4. Khóa cold-start scaffold trong file spec này.
5. Review không có cue mơ hồ hoặc article tự phát sinh.

**Gate A:** 14/14 target có local coverage 100%.

## Phase B · Data implementation

1. Tạo `g5-u1-writing-source.js`.
2. Tạo local lexicon/scaffold helpers.
3. Tạo `g5-u1-writing-typing-builder.js` theo pattern G6/G7.
4. Tạo các `partN.js`.
5. Tạo content resolver.
6. Tạo catalog với `expectedTimeMinutes`.
7. Tạo published registry.
8. Thêm vào lesson catalog/published catalog.

**Gate B:** import được toàn bộ 14 lessons, mỗi lesson đúng 1 FINAL.

## Phase C · Automated QA

Chạy canonical gate:

```bash
npm run ci
```

Tức là:

```bash
npm run check:syntax
npm run lint:content
npm test
```

Regression riêng phải kiểm tra:

1. đúng 14 lessons;
2. đúng 14 target sentences;
3. mỗi lesson đúng 1 FINAL;
4. FINAL = target source;
5. title không chứa target sentence;
6. item IDs unique;
7. lesson IDs / slugs unique;
8. `expectedTimeMinutes` có đủ 14 lesson;
9. accepted forms cho `What's/What is` và `I'm/I am`;
10. article/determiner cues không mơ hồ;
11. `playing` có bridge trước FINAL ở Lesson 04/13;
12. mọi FINAL lexical chunk đã xuất hiện local trước FINAL;
13. không có dependency buộc lesson N cần lesson N-1;
14. existing `g5-u1-writing-01.js` vẫn nguyên vẹn.

**Gate C:** `npm run ci` xanh.

## Phase D · PR + Preview

1. Feature branch.
2. Pull request vào `main`.
3. GitHub CI phải xanh.
4. Vercel Preview deploy.
5. Nghiệm thu learner routes trên desktop + mobile.

Manual preview audit tối thiểu:

- mở Lesson 01 trực tiếp;
- mở Lesson 10 trực tiếp khi chưa học lesson trước;
- mở Lesson 14 trực tiếp khi chưa học lesson trước;
- cố tình gõ sai từ mới ở Step 1 và xác minh feedback dạy lại;
- kiểm tra thời lượng hiển thị;
- kiểm tra title không leak final answer;
- kiểm tra accepted contraction/full form;
- kiểm tra final typing thật sự không có word bank/full answer.

## Phase E · Merge + Production

Chỉ khi Preview đạt:

1. merge PR vào `main`;
2. Vercel auto-deploy production;
3. xác minh deployment state = `READY`;
4. smoke-test route production;
5. kiểm tra runtime errors/logs;
6. xác minh production commit SHA khớp commit vừa merge.

## Phase F · Post-deploy acceptance

Nghiệm thu 3 nhóm:

### Nội dung
- 14/14 target đúng.
- Không thêm target ngoài source.
- Không cue mơ hồ.

### Học sinh
- Direct-entry bất kỳ lesson vẫn làm được.
- Từ mới được SEE trước recall.
- Không có từ mới xuất hiện lần đầu ở FINAL.
- Feedback sai có reteach.

### Hệ thống
- CI xanh.
- Preview xanh.
- Production READY.
- Không runtime error mới do suite G5 U1.

---

# 11. Test case chứng minh “quên từ vẫn làm được”

## Test A · Quên `countryside`

Học sinh mở thẳng Lesson 02.

1. Step 2 cho thấy `vùng nông thôn = the countryside`.
2. Học sinh gõ lại surface form.
3. Step 4 mới yêu cầu `in the countryside`.
4. Step 5 ghép `live in the countryside`.
5. FINAL mới yêu cầu full sentence.

**Kết quả:** học sinh không cần mang từ `countryside` từ trí nhớ cũ vào lesson.

## Test B · Quên dấu apostrophe trong `What's`

Học sinh mở Lesson 11.

1. Word `favourite`, `animal`, `your` được dạy lại.
2. Step contraction cho thấy `What is = What's`.
3. Học sinh gõ lại `What's` trước khi gặp FINAL.
4. `What is ...?` vẫn là accepted variant.

**Kết quả:** học sinh không bị phạt vì chưa nhớ dạng viết tắt trước khi lesson dạy lại.

## Test C · Quên article `a`

Học sinh mở Lesson 12.

1. Cue dùng `một con cá heo`.
2. Surface form được dạy nguyên cụm `a dolphin`.
3. CHUNK sau dùng `is a dolphin`.
4. FINAL không yêu cầu tự đoán article.

**Kết quả:** không có article surprise.

## Test D · Quên V-ing

Học sinh mở Lesson 13.

1. SEE `play`.
2. BRIDGE riêng: `play → playing` khi đứng sau `like`.
3. CHUNK: `playing basketball`.
4. FINAL: `I like playing basketball.`

**Kết quả:** morphology được dựng ngay trong lesson, không dựa vào grammar memory bên ngoài.

## Test E · Mở Lesson 14 đầu tiên

Học sinh chưa học Lesson 03.

Lesson 14 vẫn tự dạy:

- `my`
- `favourite colour`
- `green`
- `my favourite colour`
- `is green`

**Kết quả:** sequence-independent.

---

# 12. Definition of Done

Chỉ gọi bộ này là **production-ready** khi tất cả điều sau đều PASS:

- [ ] 14 target sentences bám source hiện tại.
- [ ] 14 learner-safe titles không leak đáp án.
- [ ] 14 `expectedTimeMinutes` đã khai báo và hiển thị.
- [ ] Mỗi lesson đúng 1 target sentence.
- [ ] Mỗi lexical unit cần thiết được SEE/RETEACH trong cùng lesson.
- [ ] Không có lexical unit mới xuất hiện lần đầu ở FINAL.
- [ ] `a / the / my / your` được cue rõ.
- [ ] `What's / What is` và `I'm / I am` có policy rõ.
- [ ] `play → playing` có bridge ở cả hai lesson liên quan.
- [ ] Feedback sai dạy lại, không tạo dead end.
- [ ] Existing G5 U1 Select + Order không bị regression.
- [ ] `npm run ci` PASS.
- [ ] Vercel Preview PASS desktop/mobile.
- [ ] Direct-entry cold-start test PASS Lesson 02, 10, 14.
- [ ] Merge `main` xong production deployment = READY.
- [ ] Production route smoke test PASS.
- [ ] Không có runtime error mới liên quan suite.

---

## 13. Kết luận audit

Thiết kế đạt mục tiêu không phải bằng cách giả định học sinh lớp 5 “đã học rồi nên phải nhớ”, mà bằng cách **xóa prerequisite memory ra khỏi lesson**.

Công thức production được khóa là:

> **SEE surface form → TYPE → RECALL → CHUNK → BUILD → FINAL**

Vì vậy một học sinh Việt Nam quên từ trước khi vào bài vẫn được cung cấp lại đúng từ/cụm cần dùng, đúng article/determiner, đúng contraction và đúng morphology **trước khi** bị yêu cầu viết full target sentence.

Đây là tiêu chuẩn có thể kiểm tra bằng regression test, thay vì chỉ dựa vào cảm giác “bài có vẻ dễ hiểu”.
