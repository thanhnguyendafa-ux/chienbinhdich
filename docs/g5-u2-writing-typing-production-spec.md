# Global Success 5 · Unit 2 · Our homes · Writing Typing Production Spec

Status: **CONTENT LOCKED · PRODUCTION SPEC**  
Repo: `thanhnguyendafa-ux/chienbinhdich`  
Production project: Vercel `chien-binh-dich`  
Production branch: `main`  
Spec path: `docs/g5-u2-writing-typing-production-spec.md`

---

## 1. Mục tiêu production

Tạo **16 mini lessons Typing Việt → Anh** cho Global Success 5 Unit 2 **Our homes**.

Nguyên tắc khóa:

> **Một lesson = một target sentence. Mọi từ, cụm, article, auxiliary, contraction, preposition hoặc morphology cần cho FINAL phải được giới thiệu lại ngay trong chính lesson đó.**

Học sinh đi theo flow:

**NHÌN & CHÉP / SEE → RECALL → CHUNK → BUILD / BRIDGE → FINAL**

Mục tiêu:

1. Học sinh có thể mở bất kỳ lesson nào mà không cần nhớ lesson trước.
2. Nếu quên cả từ cơ bản như `I`, `you`, `live`, học sinh vẫn được nhìn/gõ lại trước khi recall.
3. FINAL không được chứa một lexical/grammar dependency chưa được chuẩn bị trước đó.
4. Không bắt học sinh tự đoán `a / the`, `this / that`, `Do`, `don't`, `What's`, `It's`, `in / at`, hoặc `live → lives`.
5. Title learner-safe, không lộ nguyên câu FINAL.
6. Web, Student Print, Teacher Key, QR và Link Index dùng **cùng một source-of-truth**.
7. Mỗi lesson có số phút dự kiến.

**Tổng thời gian dự kiến: 97 phút.**

---

## 2. Source scope và khóa dữ liệu

### 2.1 Tách Unit 1 khỏi transcript

Phần transcript trước `Unit two — Our homes` vẫn là phần cuối Unit 1, gồm `dolphin`, `tennis`, `What's your favourite animal?`, `What's your favourite sport?`.

**Không đưa phần này vào corpus Unit 2.**

### 2.2 Các nhóm output Unit 2

- **HOME TYPE:** house / flat / building / tower
- **YES / NO:** `Do you live ...?` → `Yes, I do.` / `No, I don't.`
- **WHERE:** `Where do you live?` / `I live ...`
- **NEAR / DISTANCE:** `near the school` / `about 1 kilometre from here`
- **ADDRESS:** `What's your address?` / `It's ... Street.`
- **ADDRESS STATEMENT:** `I live at ... Street.` / `She lives at ... Street.`

### 2.3 Address source gate — RESOLVED

Caption tự động có một số tên đường nhận sai. Production không dùng OCR để đoán.

Địa chỉ Lesson 15 đã được đối chiếu và khóa:

- source wording: `I live at fifteen Ba Dinh Street.`
- canonical Typing target: `I live at 15 Ba Dinh Street.`

Lesson 16 được khóa:

- source wording: `She lives at sixteen London Street.`
- canonical Typing target: `She lives at 16 London Street.`

Từ thời điểm content lock này, **không còn placeholder `[VERIFIED STREET]` trong source/content production.**

---

## 3. Cold-start contract

Tiêu chuẩn nghiệm thu:

> **Không có lexical/grammar dependency nào trong FINAL mà học sinh buộc phải nhớ từ trước lesson.**

### C1. Local independence
Mỗi lesson tự chứa đủ vocabulary/chunk để đi đến FINAL.

### C2. SEE before recall
Từ/cụm cần nhớ phải được nhìn nghĩa + English + gõ lại trước khi recall.

### C3. Basic words cũng được reteach
Không mặc định học sinh nhớ `I`, `you`, `live`, `do`, `in`, `at` nếu chúng cần cho target.

### C4. 100% local FINAL token coverage
Mọi token meaningful trong FINAL phải xuất hiện ở ít nhất một pre-final step.

### C5. Article/determiner explicit
Dạy trọn:
- `một ngôi nhà = a house`
- `một căn hộ = a flat`
- `ngôi trường = the school`

### C6. This / that explicit
- `này = this`
- `kia/đó = that`

### C7. Auxiliary explicit
Không để `Do` xuất hiện lần đầu ở FINAL.

### C8. Short answers explicit
- `Do you ...?` → `Yes, I do.`
- `Do you ...?` → `No, I don't.`

### C9. Contractions explicit
- `do not → don't`
- `What is → What's`
- `It is → It's`

### C10. Morphology explicit
- `I live`
- `you live`
- `she lives`

### C11. Preposition contrast explicit
- `in + loại nơi ở`: `in a flat`, `in a house`
- `at + địa chỉ cụ thể`: `at 15 Ba Dinh Street`

### C12. No target leak
Không title hoặc pre-submit theory nào được chứa nguyên FINAL, ngoài các SEE word/chunk cố ý dạy lại.

---

## 4. Target lock — 16 lessons

| # | Learner-safe title | Phút | FINAL target | Family |
|---|---|---:|---|---|
| 01 | Ngôi nhà này | 6 | `Do you live in this house?` | Home type |
| 02 | Căn hộ này | 6 | `Do you live in this flat?` | Home type |
| 03 | Tòa nhà kia | 6 | `Do you live in that building?` | Home type |
| 04 | Tòa tháp kia | 6 | `Do you live in that tower?` | Home type |
| 05 | Trả lời Có | 5 | `Yes, I do.` | Yes / No |
| 06 | Trả lời Không | 5 | `No, I don't.` | Yes / No |
| 07 | Căn hộ kia | 6 | `I live in that flat.` | Where |
| 08 | Bạn sống ở đâu? | 6 | `Where do you live?` | Where |
| 09 | Một ngôi nhà gần đây | 6 | `I live in a house near here.` | Where |
| 10 | Một căn hộ gần đây | 6 | `I live in a flat near here.` | Where |
| 11 | Gần trường | 6 | `Do you live near the school?` | Near / Distance |
| 12 | Cách đây khoảng 1 km | 7 | `I live about 1 kilometre from here.` | Near / Distance |
| 13 | Địa chỉ của bạn | 6 | `What's your address?` | Address |
| 14 | Địa chỉ Oxford | 6 | `It's 93 Oxford Street.` | Address |
| 15 | Tôi sống tại địa chỉ | 7 | `I live at 15 Ba Dinh Street.` | Address statement |
| 16 | Cô ấy sống tại London Street | 7 | `She lives at 16 London Street.` | Address statement |

---

## 5. Nội dung chi tiết từng lesson

### Lesson 01 · Ngôi nhà này — 6 phút
**FINAL:** `Do you live in this house?`

1. SEE `bạn = you` → `you`
2. SEE `sống = live` → `live`
3. SEE `ngôi nhà = house` → `house`
4. SEE `ngôi nhà này = this house` → `this house`
5. CHUNK `ở ngôi nhà này` → `in this house`
6. BUILD `sống ở ngôi nhà này` → `live in this house`
7. BUILD `bạn sống ở ngôi nhà này` → `you live in this house`
8. BRIDGE câu hỏi hiện tại với `you + live` dùng `Do` → `Do you live in this house`
9. FINAL → `Do you live in this house?`

Trap: không dùng `Are you live ...?`.

### Lesson 02 · Căn hộ này — 6 phút
**FINAL:** `Do you live in this flat?`

1. SEE `you`
2. SEE `live`
3. SEE `flat`
4. SEE `this flat`
5. CHUNK `in this flat`
6. BUILD `live in this flat`
7. BUILD `you live in this flat`
8. BRIDGE `Do you live in this flat`
9. FINAL → `Do you live in this flat?`

### Lesson 03 · Tòa nhà kia — 6 phút
**FINAL:** `Do you live in that building?`

1. SEE `you`
2. SEE `live`
3. SEE `building`
4. SEE `that`
5. CHUNK `that building`
6. CHUNK `in that building`
7. BUILD `you live in that building`
8. BRIDGE `Do you live in that building`
9. FINAL → `Do you live in that building?`

Contrast: `this = này`, `that = kia/đó`.

### Lesson 04 · Tòa tháp kia — 6 phút
**FINAL:** `Do you live in that tower?`

1. SEE `you`
2. SEE `live`
3. SEE `tower`
4. SEE `that tower`
5. CHUNK `in that tower`
6. BUILD `live in that tower`
7. BUILD `you live in that tower`
8. BRIDGE `Do you live in that tower`
9. FINAL → `Do you live in that tower?`

### Lesson 05 · Trả lời Có — 5 phút
**FINAL:** `Yes, I do.`

1. SEE `yes`
2. SEE `I`
3. SEE `do`
4. CHUNK `I do`
5. BRIDGE `Do you ...? → Yes, I do`
6. FINAL → `Yes, I do.`

Trap: không dùng `Yes, I live.` hoặc `Yes, I am.`.

### Lesson 06 · Trả lời Không — 5 phút
**FINAL:** `No, I don't.`

1. SEE `no`
2. SEE `I`
3. SEE `do not`
4. BRIDGE `do not → don't`
5. CHUNK `I don't`
6. BUILD `No, I don't`
7. FINAL → `No, I don't.`

Trap: không dùng `No, I not.`.

### Lesson 07 · Căn hộ kia — 6 phút
**FINAL:** `I live in that flat.`

1. SEE `I`
2. SEE `live`
3. SEE `flat`
4. SEE `that flat`
5. CHUNK `in that flat`
6. BUILD `live in that flat`
7. FINAL → `I live in that flat.`

### Lesson 08 · Bạn sống ở đâu? — 6 phút
**FINAL:** `Where do you live?`

1. SEE `where`
2. SEE `you`
3. SEE `live`
4. CHUNK `you live`
5. BRIDGE câu hỏi cần `do`
6. BUILD `do you live`
7. BUILD `Where do you live`
8. FINAL → `Where do you live?`

Trap: không dùng `Where you live?` hoặc `Where are you live?`.

### Lesson 09 · Một ngôi nhà gần đây — 6 phút
**FINAL:** `I live in a house near here.`

1. SEE `I`
2. SEE `live`
3. SEE `a house`
4. SEE `near`
5. SEE `here`
6. CHUNK `near here`
7. CHUNK `in a house`
8. BUILD `a house near here`
9. BUILD `live in a house near here`
10. FINAL → `I live in a house near here.`

Article gate: phải dạy `a house`, không bắt học sinh tự thêm `a`.

### Lesson 10 · Một căn hộ gần đây — 6 phút
**FINAL:** `I live in a flat near here.`

1. SEE `I`
2. SEE `live`
3. SEE `a flat`
4. SEE `near here`
5. CHUNK `in a flat`
6. BUILD `a flat near here`
7. BUILD `live in a flat near here`
8. FINAL → `I live in a flat near here.`

### Lesson 11 · Gần trường — 6 phút
**FINAL:** `Do you live near the school?`

1. SEE `you`
2. SEE `live`
3. SEE `the school`
4. SEE `near`
5. CHUNK `near the school`
6. BUILD `live near the school`
7. BUILD `you live near the school`
8. BRIDGE `Do you live near the school`
9. FINAL → `Do you live near the school?`

Determiner gate: dạy trọn `the school`.

### Lesson 12 · Cách đây khoảng 1 km — 7 phút
**FINAL:** `I live about 1 kilometre from here.`

1. SEE `I`
2. SEE `live`
3. SEE `about`
4. SEE `1 kilometre`
5. SEE `from`
6. SEE `here`
7. CHUNK `from here`
8. CHUNK `about 1 kilometre`
9. BUILD `about 1 kilometre from here`
10. BUILD `live about 1 kilometre from here`
11. FINAL → `I live about 1 kilometre from here.`

Dạy cụm khoảng cách như chunk; không ép dịch từng chữ máy móc.

### Lesson 13 · Địa chỉ của bạn — 6 phút
**FINAL:** `What's your address?`

1. SEE `address`
2. SEE `your`
3. CHUNK `your address`
4. SEE `What is`
5. BRIDGE `What is → What's`
6. BUILD `What's your address`
7. FINAL → `What's your address?`

Full-form `What is your address?` có thể được xem xét như accepted variant nếu evaluator policy sau này cho phép; canonical target vẫn là contraction.

### Lesson 14 · Địa chỉ Oxford — 6 phút
**FINAL:** `It's 93 Oxford Street.`

1. SEE `Oxford Street`
2. SEE `93`
3. CHUNK `93 Oxford Street`
4. SEE `It is`
5. BRIDGE `It is → It's`
6. BUILD `It's 93 Oxford Street`
7. FINAL → `It's 93 Oxford Street.`

Contrast: pattern trả lời địa chỉ là `It's + address`; `at` được dạy trong câu `live at + address`.

### Lesson 15 · Tôi sống tại địa chỉ — 7 phút
**FINAL:** `I live at 15 Ba Dinh Street.`

1. SEE `I`
2. SEE `live`
3. SEE `Ba Dinh Street`
4. SEE `15 Ba Dinh Street`
5. SEE `at`
6. CHUNK `at 15 Ba Dinh Street`
7. BUILD `live at 15 Ba Dinh Street`
8. FINAL → `I live at 15 Ba Dinh Street.`

Contrast bắt buộc:
- `I live in a flat.`
- `I live at 15 Ba Dinh Street.`

### Lesson 16 · Cô ấy sống tại London Street — 7 phút
**FINAL:** `She lives at 16 London Street.`

1. SEE `she`
2. SEE `live`
3. BRIDGE `I live / you live / she lives` → `lives`
4. SEE `London Street`
5. SEE `16 London Street`
6. SEE `at`
7. CHUNK `at 16 London Street`
8. BUILD `She lives at 16 London Street`
9. FINAL → `She lives at 16 London Street.`

Morphology gate: `live → lives` phải xuất hiện trước FINAL.

---

## 6. Learning arc toàn Unit

### Phase A · Home type — 01–04
Học sinh hỏi được về house / flat / building / tower và phân biệt this / that.

### Phase B · Yes / No — 05–06
Học sinh phản ứng được với `Do you ...?` bằng short answer chuẩn.

### Phase C · Where — 07–10
Học sinh hỏi/nói nơi mình sống và thay `house ↔ flat`.

### Phase D · Near / Distance — 11–12
Học sinh nói gần trường và khoảng cách.

### Phase E · Address — 13–16
Học sinh hỏi địa chỉ, trả lời địa chỉ, dùng `at + full address`, và chuyển `I live → She lives`.

Integrated communicative outcome:

```text
Do you live in this building?
No, I don't.
Where do you live?
I live in a flat near here.
Do you live near the school?
Yes, I do.
What's your address?
It's 93 Oxford Street.
```

Mục tiêu không phải thuộc 16 câu rời mà hình thành mạng:

**HOME → YES/NO → WHERE → NEAR/DISTANCE → ADDRESS**

---

## 7. Production code architecture

Source-of-truth runtime:

- `src/data/g5-u2-writing-source.js`
- `src/data/g5-u2-writing-typing-builder.js`
- `src/data/g5-u2-writing-typing-content.js`
- `src/data/g5-u2-writing-typing-catalog.js`
- `src/data/g5-u2-writing-typing-published.js`

Integration:

- `src/data/publishedLessonCatalog.js`

Regression:

- `tests/g5Unit2WritingTyping.test.js`
- `tests/adminExplorer.test.js`

Không tạo route engine mới và không thay đổi evaluator, Session, Mastery, Retry, Firebase hoặc Universal Content CMS.

---

## 8. Catalog structure

```text
global5
└── global5-unit2
    └── global5-unit2-writing-typing
        ├── global5-unit2-writing-home-type
        ├── global5-unit2-writing-yes-no
        ├── global5-unit2-writing-where
        ├── global5-unit2-writing-distance
        └── global5-unit2-writing-address
```

Set IDs:

`g5-u2-writing-typing-01` → `g5-u2-writing-typing-16`

Fixed slugs:

`g5u2-writing-01` → `g5u2-writing-16`

Canonical URL pattern:

`https://chien-binh-dich.vercel.app/a/<lessonSlug>`

---

## 9. Web lesson contract

Mỗi lesson:

- learner-safe title;
- `expectedTimeMinutes`;
- subtitle `Typing · Việt → Anh · NHÌN → CHUNK → CÂU`;
- `activityTypes: ['typing']`;
- `completionPolicy: 'all-items'`;
- `typingTolerance: false`;
- stable fixed slug;
- exactly one FINAL;
- FINAL khớp source target;
- không full target leak trong title.

---

## 10. Automated QA contract

Tests phải khóa:

1. đúng 16 source records và 16 registry descriptors;
2. đúng 16 unique slugs;
3. tổng expected time = 97 phút;
4. exactly one FINAL mỗi lesson;
5. FINAL khớp source;
6. learner-safe title;
7. mọi FINAL token đã được expose trước FINAL;
8. `a house`, `a flat`, `the school` explicit;
9. `Do` bridge explicit;
10. `do not → don't` explicit;
11. `What is → What's` explicit;
12. `It is → It's` explicit;
13. `live → lives` explicit;
14. `in` vs `at` explicit;
15. source không chứa `[VERIFIED STREET]` hoặc `TODO_ADDRESS`;
16. Lesson 15 khóa `I live at 15 Ba Dinh Street.`;
17. published Explorer vẫn có đúng hierarchy và recursive counts.

Global 5 sau khi thêm 16 Writing Typing lessons có **46 published Sets** tổng cộng. Unit 2 có **17 Sets** tổng cộng vì đã có sẵn một bài Stress & Vocabulary và thêm 16 Writing Typing lessons.

---

## 11. CI gates

Trước merge:

```bash
npm run check:syntax
npm run lint:content
npm test
npm run ci
```

Chỉ merge khi GitHub Actions xanh.

---

## 12. Vercel verification

Sau merge:

1. deployment target = production;
2. state = READY;
3. Git SHA = merge commit;
4. kiểm tra representative fixed links:
   - `/a/g5u2-writing-01`
   - `/a/g5u2-writing-08`
   - `/a/g5u2-writing-16`
5. xác minh production catalog/content chứa Unit 2 mới.

---

## 13. Student Print contract

Folder: `Student/`

Phải có:

- 16 PDF riêng: `G5U2_Student_01.pdf` … `G5U2_Student_16.pdf`
- 1 PDF gộp: `00_G5U2_Student_All_16_Lessons.pdf`

Mỗi Student page:

- Global Success 5 · Unit 2 · Our homes
- lesson number + learner-safe title
- số phút dự kiến
- Name / Class / Date
- Part A: NHÌN & CHÉP — được phép hiện English word/chunk để reteach
- hướng dẫn **CHE PHẦN A** trước recall
- Part B: RECALL / CHUNK / BUILD không in đáp án
- FINAL cue Việt + vùng trống
- URL đúng lesson
- QR đúng lesson
- clickable PDF hyperlink nếu khả dụng

Không in Teacher Key hoặc full FINAL answer trên student worksheet.

---

## 14. Teacher Key contract

Folder: `Teacher_Key/`

Phải có:

- 16 PDF riêng: `G5U2_Teacher_Key_01.pdf` … `G5U2_Teacher_Key_16.pdf`
- 1 PDF gộp: `00_G5U2_Teacher_Key_All_16_Lessons.pdf`

Teacher page giữ **đúng question order của Student**, đồng thời có:

- answer mọi step;
- FINAL answer;
- trap / bridge note;
- article/determiner note khi liên quan;
- contraction note khi liên quan;
- morphology note khi liên quan;
- source note;
- expected minutes;
- đúng URL + QR của lesson.

---

## 15. Link package contract

Folder: `Links/`

Tạo:

- `00_ALL_16_LESSON_LINKS.txt`
- `00_ALL_16_LESSON_LINKS.csv`
- `00_ALL_16_LESSON_LINKS.md`
- `00_ALL_16_LESSON_LINKS.pdf`

CSV columns:

```text
lesson_number,title,minutes,set_id,slug,url
```

Exactly 16 canonical URLs:

`https://chien-binh-dich.vercel.app/a/g5u2-writing-01`
→
`https://chien-binh-dich.vercel.app/a/g5u2-writing-16`

Mỗi Student PDF và Teacher Key PDF cũng phải chứa **link + QR riêng của chính lesson đó**, không chỉ dựa vào Link Index.

---

## 16. ZIP thành phẩm

Tên:

`G5U2_Writing_Typing_Production_Pack.zip`

Cấu trúc:

```text
G5U2_Writing_Typing_Production_Pack/
├── Student/
│   ├── 00_G5U2_Student_All_16_Lessons.pdf
│   ├── G5U2_Student_01.pdf
│   ├── ...
│   └── G5U2_Student_16.pdf
├── Teacher_Key/
│   ├── 00_G5U2_Teacher_Key_All_16_Lessons.pdf
│   ├── G5U2_Teacher_Key_01.pdf
│   ├── ...
│   └── G5U2_Teacher_Key_16.pdf
├── Links/
│   ├── 00_ALL_16_LESSON_LINKS.txt
│   ├── 00_ALL_16_LESSON_LINKS.csv
│   ├── 00_ALL_16_LESSON_LINKS.md
│   └── 00_ALL_16_LESSON_LINKS.pdf
├── Spec/
│   └── g5-u2-writing-typing-production-spec.md
└── README.md
```

---

## 17. ZIP / PDF acceptance QA

- Student individual PDFs = 16
- Teacher individual PDFs = 16
- Student combined = 1
- Teacher combined = 1
- Link files = 4+
- exactly 16 URLs
- QR lesson N → slug lesson N
- Student/Teacher title, minutes, order, URL align 1:1
- Student không leak answers
- Teacher có answers
- PDF không blank/corrupt
- không clipping/overlap
- không QR đè nội dung
- ZIP integrity test pass

Representative visual QA tối thiểu:

- Lesson 01
- Lesson 06
- Lesson 09
- Lesson 13
- Lesson 16

---

## 18. End-to-end production workflow

### Phase 0 · Source lock
- tách Unit 1 tail;
- khóa 16 targets;
- xác minh Ba Dinh Street / London Street;
- exact spelling/punctuation.

### Phase 1 · Runtime source/content
- source layer;
- cold-start scaffold;
- builder;
- catalog;
- published integration.

### Phase 2 · Regression
- source/target counts;
- 97 minutes;
- local token coverage;
- traps/bridges;
- Explorer hierarchy/counts.

### Phase 3 · PR / CI
- feature branch;
- PR;
- canonical CI;
- fix only real regressions;
- merge when green.

### Phase 4 · Production verification
- Vercel READY;
- merge SHA match;
- representative fixed routes;
- production source/catalog presence.

### Phase 5 · Print generation
- Student from production source;
- Teacher Key from same source;
- per-lesson URL/QR;
- combined PDFs;
- Link Index.

### Phase 6 · Package
- README;
- exact spec copy;
- ZIP;
- integrity test;
- visual QA;
- final delivery.

---

## 19. Definition of Done

Unit 2 được xem là hoàn chỉnh khi chuỗi sau cùng một source-of-truth:

> **Transcript evidence → 16 locked targets → 16 independent cold-start Typing lessons → fixed production links → Student Print → Teacher Key → QR/link index → verified ZIP**

Không chấp nhận tình trạng web một câu, Student một câu khác, Teacher Key một đáp án khác hoặc QR dẫn sai lesson.
