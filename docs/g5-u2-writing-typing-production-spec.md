# Global Success 5 · Unit 2 · Our homes · Writing Typing Production Spec

Status: **CONTENT LOCK CANDIDATE — ADDRESS SOURCE GATE PENDING**  
Repo: `thanhnguyendafa-ux/chienbinhdich`  
Production project: Vercel `chien-binh-dich`  
Production branch: `main`  
Spec path: `docs/g5-u2-writing-typing-production-spec.md`

---

## 1. Mục tiêu production

Tạo một bộ **16 mini lessons Typing Việt → Anh** cho Global Success 5 Unit 2 **Our homes**, dựa trên transcript Student Book do giáo viên cung cấp.

Nguyên tắc khóa:

> **Một lesson = một target sentence. Mọi từ, cụm, article, auxiliary, contraction hoặc morphology cần cho FINAL phải được giới thiệu lại ngay trong chính lesson đó.**

Mục tiêu học sinh:

1. Có thể mở bất kỳ lesson nào mà không cần nhớ lesson trước.
2. Nếu quên từ vựng cơ bản như `I`, `you`, `live`, `is`, `in`, học sinh vẫn được nhìn/gõ lại trước khi recall.
3. Đi theo đường:  
   **NHÌN & CHÉP / SEE → RECALL → CHUNK → BUILD / BRIDGE → FINAL**.
4. Không có từ/cụm/ngữ pháp mới xuất hiện lần đầu ở FINAL.
5. Không phải đoán `a / the`, `this / that`, `do / don't`, `What's`, `live → lives`, hoặc `in / at`.
6. Title learner-safe, không lộ nguyên câu FINAL.
7. Mỗi lesson có số phút dự kiến.
8. Web, Student Print, Teacher Key và Link Index dùng **cùng một source-of-truth**.

Tổng thời gian dự kiến cho 16 lesson: **97 phút**.

---

## 2. Transcript scope và source gate

### 2.1 Phần không thuộc Unit 2

Transcript từ khoảng `0:02` đến `2:35` vẫn là phần cuối Unit 1 Lesson 3, có các nội dung như:

- `dolphin`
- `tennis`
- `What's your favourite animal?`
- `What's your favourite sport?`

**Không đưa các câu này vào corpus Unit 2.**

### 2.2 Điểm bắt đầu Unit 2

Unit 2 bắt đầu tại:

> `Unit two — Our homes`

Từ đây mới lấy source cho bộ Writing Typing Unit 2.

### 2.3 Các nhóm output chính trong transcript

Corpus Unit 2 được gom theo 6 nhóm:

1. **HOME TYPE**
   - house
   - flat
   - building
   - tower

2. **YES / NO ABOUT HOME**
   - `Do you live in this/that ...?`
   - `Yes, I do.`
   - `No, I don't.`

3. **WHERE YOU LIVE**
   - `Where do you live?`
   - `I live in ...`

4. **NEAR / DISTANCE**
   - `Do you live near the school?`
   - `I live about 1 kilometre from here.`

5. **ADDRESS**
   - `What's your address?`
   - `It's ... Street.`

6. **ADDRESS STATEMENT**
   - `I live at ... Street.`
   - `She lives at ... Street.`

### 2.4 Address source gate bắt buộc

Transcript auto-caption có nhiều tên đường bị méo như:

- `H Bing Street`
- `dban Street`
- `B ding Street`
- `balloon Street`
- `cartoon Street`

**Không được production những tên đường này bằng cách đoán.**

Trước khi code Lesson 15, phải đối chiếu Student Book/Teacher Book hoặc transcript chuẩn để khóa chính xác địa chỉ.

Các địa chỉ nghe khá rõ trong transcript và có thể giữ làm candidate:

- `93 Oxford Street`
- `23 Queen Street`
- `53 London Street`
- `16 London Street`

Trong spec này:

- Lesson 14 khóa provisional target: `It's 93 Oxford Street.`
- Lesson 16 khóa target: `She lives at 16 London Street.`
- Lesson 15 giữ **placeholder có source gate** cho đến khi xác minh đúng tên đường.

Không merge production Unit 2 nếu Lesson 15 vẫn còn placeholder.

---

## 3. Cold-start contract

Không thể đảm bảo tuyệt đối rằng mọi học sinh sẽ không bao giờ hỏi giáo viên. Tiêu chuẩn nghiệm thu thực tế là:

> **Không có lexical/grammar dependency nào trong FINAL mà học sinh buộc phải nhớ từ trước lesson.**

### C1. Local independence

Mỗi lesson tự chứa toàn bộ vocabulary/chunk cần cho target.

### C2. SEE before recall

Lexical unit quan trọng phải được nhìn nghĩa + English + gõ lại trước khi bị recall.

Ví dụ:

`căn hộ = flat · Nhìn và gõ lại.`  
→ học sinh gõ `flat`.

### C3. Basic words cũng được reteach khi cần

Không mặc định học sinh nhớ:

- `I`
- `you`
- `live`
- `is`
- `in`
- `at`

Nếu FINAL cần chúng, lesson phải có bước chuẩn bị phù hợp.

### C4. 100% local token coverage

Mọi meaning-bearing token/chunk trong FINAL phải xuất hiện trước FINAL trong cùng lesson.

### C5. Article/determiner explicit

Không dạy `house` rồi bắt FINAL `a house`.

Phải có:

- `một ngôi nhà = a house`
- `một căn hộ = a flat`
- `ngôi trường = the school`

### C6. This / that explicit

Không để học sinh tự đoán:

- `này = this`
- `kia/đó = that`

### C7. Auxiliary explicit

Không được để `Do` xuất hiện lần đầu ở FINAL.

Flow cần thể hiện:

`you live ...`  
→ câu hỏi hiện tại với `you + live` dùng `Do`  
→ `Do you live ...?`

### C8. Yes/No short answer explicit

Phải dạy local bridge:

- `Do you ...?` → `Yes, I do.`
- `Do you ...?` → `No, I don't.`

Không chấp nhận học sinh phải tự suy ra từ `live`.

### C9. Contraction explicit

- `do not = don't`
- `What is = What's`
- `It is = It's`

Nếu evaluator hỗ trợ full form, có thể accepted:

- `What is your address?`
- `It is 93 Oxford Street.`

Canonical source vẫn dùng form đã khóa.

### C10. Morphology explicit

Lesson 16 không được dạy `live` rồi nhảy thẳng tới `lives`.

Phải có bridge:

- `I live`
- `You live`
- `She lives`

### C11. Preposition contrast explicit

Phải giữ contrast:

- `in + loại nơi ở`: `in a flat`, `in a house`
- `at + địa chỉ cụ thể`: `at 16 London Street`

### C12. No full target leak

Không title hoặc theory trước submit nào được chứa nguyên FINAL target.

---

## 4. 16 lesson target lock

| # | Learner-safe title | Phút | FINAL target | Family |
|---|---|---:|---|---|
| 01 | Ngôi nhà này | 6 | `Do you live in this house?` | Home type |
| 02 | Căn hộ này | 6 | `Do you live in this flat?` | Home type |
| 03 | Tòa nhà kia | 6 | `Do you live in that building?` | Home type |
| 04 | Tòa tháp kia | 6 | `Do you live in that tower?` | Home type |
| 05 | Trả lời Có | 5 | `Yes, I do.` | Yes/No |
| 06 | Trả lời Không | 5 | `No, I don't.` | Yes/No |
| 07 | Căn hộ kia | 6 | `I live in that flat.` | Where |
| 08 | Bạn sống ở đâu? | 6 | `Where do you live?` | Where |
| 09 | Một ngôi nhà gần đây | 6 | `I live in a house near here.` | Where |
| 10 | Một căn hộ gần đây | 6 | `I live in a flat near here.` | Where |
| 11 | Gần trường | 6 | `Do you live near the school?` | Near |
| 12 | Cách đây khoảng 1 km | 7 | `I live about 1 kilometre from here.` | Distance |
| 13 | Địa chỉ của bạn | 6 | `What's your address?` | Address |
| 14 | Địa chỉ Oxford | 6 | `It's 93 Oxford Street.` | Address |
| 15 | Tôi sống tại địa chỉ... | 7 | `I live at 15 [VERIFIED STREET].` | Address statement |
| 16 | Cô ấy sống tại London Street | 7 | `She lives at 16 London Street.` | 3rd person |

**Production gate:** Lesson 15 phải thay `[VERIFIED STREET]` bằng địa chỉ được đối chiếu từ source trước khi merge.

---

# 5. Nội dung chi tiết từng lesson

## Lesson 01 · Ngôi nhà này — 6 phút

**FINAL:** `Do you live in this house?`

### Scaffold

1. SEE — `bạn = you · Nhìn và gõ lại.` → `you`
2. SEE — `sống = live · Nhìn và gõ lại.` → `live`
3. SEE — `ngôi nhà = house · Nhìn và gõ lại.` → `house`
4. SEE — `ngôi nhà này = this house · Nhìn và gõ lại.` → `this house`
5. CHUNK — `ở ngôi nhà này` → `in this house`
6. BUILD — `sống ở ngôi nhà này` → `live in this house`
7. BUILD — `bạn sống ở ngôi nhà này` → `you live in this house`
8. BRIDGE — `Câu hỏi hiện tại với you + live dùng trợ động từ Do.` → `Do you live in this house`
9. FINAL — `Bạn có sống trong ngôi nhà này không?` → `Do you live in this house?`

### Teacher trap

- ❌ `Are you live in this house?`
- ❌ `You live in this house?`
- ✅ `Do you live in this house?`

---

## Lesson 02 · Căn hộ này — 6 phút

**FINAL:** `Do you live in this flat?`

### Scaffold

1. SEE — `bạn = you` → `you`
2. SEE — `sống = live` → `live`
3. SEE — `căn hộ = flat` → `flat`
4. SEE — `căn hộ này = this flat` → `this flat`
5. CHUNK — `ở căn hộ này` → `in this flat`
6. BUILD — `sống ở căn hộ này` → `live in this flat`
7. BUILD — `bạn sống ở căn hộ này` → `you live in this flat`
8. BRIDGE — `Câu hỏi Yes/No dùng Do.` → `Do you live in this flat`
9. FINAL — `Bạn có sống trong căn hộ này không?` → `Do you live in this flat?`

---

## Lesson 03 · Tòa nhà kia — 6 phút

**FINAL:** `Do you live in that building?`

### Scaffold

1. SEE — `bạn = you` → `you`
2. SEE — `sống = live` → `live`
3. SEE — `tòa nhà = building` → `building`
4. SEE — `kia/đó = that` → `that`
5. CHUNK — `tòa nhà kia` → `that building`
6. CHUNK — `ở tòa nhà kia` → `in that building`
7. BUILD — `bạn sống ở tòa nhà kia` → `you live in that building`
8. BRIDGE — `Do + you + live ...?` → `Do you live in that building`
9. FINAL — `Bạn có sống trong tòa nhà kia không?` → `Do you live in that building?`

### Contrast

- `this` = này
- `that` = kia/đó

---

## Lesson 04 · Tòa tháp kia — 6 phút

**FINAL:** `Do you live in that tower?`

### Scaffold

1. SEE — `bạn = you` → `you`
2. SEE — `sống = live` → `live`
3. SEE — `tòa tháp = tower` → `tower`
4. SEE — `tòa tháp kia = that tower` → `that tower`
5. CHUNK — `ở tòa tháp kia` → `in that tower`
6. BUILD — `sống ở tòa tháp kia` → `live in that tower`
7. BUILD — `bạn sống ở tòa tháp kia` → `you live in that tower`
8. BRIDGE — `Do + you + live ...?` → `Do you live in that tower`
9. FINAL — `Bạn có sống trong tòa tháp kia không?` → `Do you live in that tower?`

---

## Lesson 05 · Trả lời Có — 5 phút

**FINAL:** `Yes, I do.`

### Scaffold

1. SEE — `vâng/có = yes` → `yes`
2. SEE — `tôi = I` → `I`
3. SEE — `do = từ dùng lại trong câu trả lời ngắn cho câu hỏi Do you...?` → `do`
4. CHUNK — `tôi có = I do` → `I do`
5. BRIDGE — `Do you ...? → trả lời Có: Yes, I do.` → `Yes, I do`
6. FINAL — `Vâng, tôi có.` → `Yes, I do.`

### Teacher trap

- ❌ `Yes, I live.`
- ❌ `Yes, I am.`
- ✅ `Yes, I do.`

---

## Lesson 06 · Trả lời Không — 5 phút

**FINAL:** `No, I don't.`

### Scaffold

1. SEE — `không = no` → `no`
2. SEE — `tôi = I` → `I`
3. SEE — `do not` → `do not`
4. BRIDGE — `do not viết tắt = don't` → `don't`
5. CHUNK — `tôi không = I don't` → `I don't`
6. BUILD — `No + I don't` → `No, I don't`
7. FINAL — `Không, tôi không.` → `No, I don't.`

### Teacher trap

- ❌ `No, I not.`
- ❌ `No, I am not.`
- ✅ `No, I don't.`

---

## Lesson 07 · Căn hộ kia — 6 phút

**FINAL:** `I live in that flat.`

### Scaffold

1. SEE — `tôi = I` → `I`
2. SEE — `sống = live` → `live`
3. SEE — `căn hộ = flat` → `flat`
4. SEE — `căn hộ kia = that flat` → `that flat`
5. CHUNK — `ở căn hộ kia` → `in that flat`
6. BUILD — `sống ở căn hộ kia` → `live in that flat`
7. FINAL — `Tôi sống trong căn hộ kia.` → `I live in that flat.`

---

## Lesson 08 · Bạn sống ở đâu? — 6 phút

**FINAL:** `Where do you live?`

### Scaffold

1. SEE — `ở đâu = where` → `where`
2. SEE — `bạn = you` → `you`
3. SEE — `sống = live` → `live`
4. CHUNK — `bạn sống` → `you live`
5. BRIDGE — `Câu hỏi hiện tại với you + live cần do.` → `do`
6. BUILD — `do + you + live` → `do you live`
7. BUILD — `where + do you live` → `Where do you live`
8. FINAL — `Bạn sống ở đâu?` → `Where do you live?`

### Teacher trap

- ❌ `Where you live?`
- ❌ `Where are you live?`
- ✅ `Where do you live?`

---

## Lesson 09 · Một ngôi nhà gần đây — 6 phút

**FINAL:** `I live in a house near here.`

### Scaffold

1. SEE — `tôi = I` → `I`
2. SEE — `sống = live` → `live`
3. SEE — `một ngôi nhà = a house` → `a house`
4. SEE — `gần = near` → `near`
5. SEE — `ở đây = here` → `here`
6. CHUNK — `gần đây = near here` → `near here`
7. CHUNK — `trong một ngôi nhà = in a house` → `in a house`
8. BUILD — `một ngôi nhà gần đây` → `a house near here`
9. BUILD — `sống trong một ngôi nhà gần đây` → `live in a house near here`
10. FINAL — `Tôi sống trong một ngôi nhà gần đây.` → `I live in a house near here.`

### Article gate

Không dùng bare noun `house` làm scaffold cuối. Phải có `a house`.

---

## Lesson 10 · Một căn hộ gần đây — 6 phút

**FINAL:** `I live in a flat near here.`

### Scaffold

1. SEE — `tôi = I` → `I`
2. SEE — `sống = live` → `live`
3. SEE — `một căn hộ = a flat` → `a flat`
4. SEE — `gần đây = near here` → `near here`
5. CHUNK — `trong một căn hộ = in a flat` → `in a flat`
6. BUILD — `một căn hộ gần đây` → `a flat near here`
7. BUILD — `sống trong một căn hộ gần đây` → `live in a flat near here`
8. FINAL — `Tôi sống trong một căn hộ gần đây.` → `I live in a flat near here.`

---

## Lesson 11 · Gần trường — 6 phút

**FINAL:** `Do you live near the school?`

### Scaffold

1. SEE — `bạn = you` → `you`
2. SEE — `sống = live` → `live`
3. SEE — `ngôi trường = the school` → `the school`
4. SEE — `gần = near` → `near`
5. CHUNK — `gần trường = near the school` → `near the school`
6. BUILD — `sống gần trường` → `live near the school`
7. BUILD — `bạn sống gần trường` → `you live near the school`
8. BRIDGE — `Câu hỏi Yes/No dùng Do.` → `Do you live near the school`
9. FINAL — `Bạn có sống gần trường không?` → `Do you live near the school?`

### Determiner gate

Canonical local surface form: `the school`.

---

## Lesson 12 · Cách đây khoảng 1 km — 7 phút

**FINAL:** `I live about 1 kilometre from here.`

### Scaffold

1. SEE — `tôi = I` → `I`
2. SEE — `sống = live` → `live`
3. SEE — `khoảng = about` → `about`
4. SEE — `1 ki-lô-mét = 1 kilometre` → `1 kilometre`
5. SEE — `từ = from` → `from`
6. SEE — `ở đây = here` → `here`
7. CHUNK — `từ đây = from here` → `from here`
8. CHUNK — `khoảng 1 ki-lô-mét` → `about 1 kilometre`
9. BUILD — `khoảng 1 ki-lô-mét từ đây` → `about 1 kilometre from here`
10. BUILD — `sống cách đây khoảng 1 ki-lô-mét` → `live about 1 kilometre from here`
11. FINAL — `Tôi sống cách đây khoảng 1 ki-lô-mét.` → `I live about 1 kilometre from here.`

### Teaching note

Cụm khoảng cách được dạy theo chunk; không ép dịch word-by-word cứng nhắc.

---

## Lesson 13 · Địa chỉ của bạn — 6 phút

**FINAL:** `What's your address?`

### Scaffold

1. SEE — `địa chỉ = address` → `address`
2. SEE — `của bạn = your` → `your`
3. CHUNK — `địa chỉ của bạn = your address` → `your address`
4. SEE — `What is` → `What is`
5. BRIDGE — `What is viết tắt = What's` → `What's`
6. BUILD — `What's + your address` → `What's your address`
7. FINAL — `Địa chỉ của bạn là gì?` → `What's your address?`

### Accepted answer candidate

Nếu evaluator dùng young-learner contraction tolerance: `What is your address?` có thể được chấp nhận tương đương.

---

## Lesson 14 · Địa chỉ Oxford — 6 phút

**FINAL provisional:** `It's 93 Oxford Street.`

### Scaffold

1. SEE — `Oxford Street` → `Oxford Street`
2. SEE — `93` → `93`
3. CHUNK — `93 Oxford Street` → `93 Oxford Street`
4. SEE — `It is` → `It is`
5. BRIDGE — `It is viết tắt = It's` → `It's`
6. BUILD — `It's + 93 Oxford Street` → `It's 93 Oxford Street`
7. FINAL — `Địa chỉ là 93 Oxford Street.` → `It's 93 Oxford Street.`

### Teacher trap

Nếu target sách là `It's + address`:

- ❌ `It's at 93 Oxford Street.`
- ✅ `It's 93 Oxford Street.`

`at` được dạy riêng trong Lesson 15–16 với `live at + full address`.

---

## Lesson 15 · Tôi sống tại địa chỉ... — 7 phút

**FINAL:** `I live at 15 [VERIFIED STREET].`

**Status:** BLOCKED UNTIL SOURCE VERIFICATION.

### Scaffold sau khi source được xác minh

1. SEE — `tôi = I` → `I`
2. SEE — `sống = live` → `live`
3. SEE — `[VERIFIED STREET]` → `[VERIFIED STREET]`
4. SEE — `15 [VERIFIED STREET]` → `15 [VERIFIED STREET]`
5. SEE — `tại/ở địa chỉ cụ thể = at` → `at`
6. CHUNK — `tại 15 [VERIFIED STREET]` → `at 15 [VERIFIED STREET]`
7. BUILD — `sống tại 15 [VERIFIED STREET]` → `live at 15 [VERIFIED STREET]`
8. FINAL — `Tôi sống tại 15 [VERIFIED STREET].` → `I live at 15 [VERIFIED STREET].`

### Required contrast

- `I live in a flat.`
- `I live at 15 [VERIFIED STREET].`

### Merge gate

Không được:

- đoán `Ba Dinh Street`;
- dùng caption méo làm source;
- để placeholder `[VERIFIED STREET]` trên production.

---

## Lesson 16 · Cô ấy sống tại London Street — 7 phút

**FINAL:** `She lives at 16 London Street.`

### Scaffold

1. SEE — `cô ấy = she` → `she`
2. SEE — `sống = live` → `live`
3. BRIDGE — `I live / you live / she lives` → `lives`
4. SEE — `London Street` → `London Street`
5. SEE — `16 London Street` → `16 London Street`
6. SEE — `tại địa chỉ cụ thể = at` → `at`
7. CHUNK — `tại 16 London Street` → `at 16 London Street`
8. BUILD — `cô ấy sống tại 16 London Street` → `She lives at 16 London Street`
9. FINAL — `Cô ấy sống tại 16 London Street.` → `She lives at 16 London Street.`

### Teacher trap

- `I live`
- `You live`
- `She lives`

Không cần mở rộng sang toàn bộ lý thuyết Present Simple; chỉ dạy bridge phục vụ target hiện tại.

---

# 6. Learning arc toàn Unit

16 lesson phải tạo một đường dây giao tiếp rõ:

## Phase A · Home type — Lessons 01–04

- `Do you live in this house?`
- `Do you live in this flat?`
- `Do you live in that building?`
- `Do you live in that tower?`

## Phase B · Yes / No — Lessons 05–06

- `Yes, I do.`
- `No, I don't.`

## Phase C · Where — Lessons 07–10

- `I live in that flat.`
- `Where do you live?`
- `I live in a house near here.`
- `I live in a flat near here.`

## Phase D · Near / Distance — Lessons 11–12

- `Do you live near the school?`
- `I live about 1 kilometre from here.`

## Phase E · Address — Lessons 13–16

- `What's your address?`
- `It's 93 Oxford Street.`
- `I live at 15 [VERIFIED STREET].`
- `She lives at 16 London Street.`

### Integrated communicative outcome

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

Mục tiêu không phải “thuộc 16 câu rời”, mà là hình thành mạng:

**HOME → YES/NO → WHERE → NEAR/DISTANCE → ADDRESS**

---

# 7. Kiến trúc code khi production

Bám kiến trúc G5 U1 hiện đã production.

## 7.1 Source

Tạo:

- `src/data/g5-u2-writing-source.js`

Mỗi source record tối thiểu có:

- `id`
- `order`
- `targetSentence`
- `targetVi`
- `family`
- `sourceType`
- `sourceNote`
- `expectedTimeMinutes`
- `difficulty`

Lesson 15 phải có source trace chỉ sau khi xác minh địa chỉ.

## 7.2 Typing builder

Tạo:

- `src/data/g5-u2-writing-typing-builder.js`

Contract:

- mỗi item có `id`
- `stage`
- `scaffoldRole`
- `vi`
- `en`
- `buildsFrom` nếu cần
- exactly one `FINAL` per lesson
- FINAL phải bằng đúng `source.targetSentence`

## 7.3 Content

Tạo:

- `src/data/g5-u2-writing-typing-content.js`

Có thể tách part nếu file quá dài:

- `src/data/g5-u2-writing-typing-part1.js`
- `src/data/g5-u2-writing-typing-part2.js`
- `src/data/g5-u2-writing-typing-part3.js`
- `src/data/g5-u2-writing-typing-part4.js`

Khuyến nghị:

- Part 1: Lessons 01–04 Home type
- Part 2: Lessons 05–08 Yes/No + Where
- Part 3: Lessons 09–12 Place + Distance
- Part 4: Lessons 13–16 Address

## 7.4 Catalog

Tạo:

- `src/data/g5-u2-writing-typing-catalog.js`

Folder:

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

### Suggested fixed slugs

- `g5u2-writing-01`
- `g5u2-writing-02`
- ...
- `g5u2-writing-16`

Canonical learner URL:

`https://chien-binh-dich.vercel.app/a/<lessonSlug>`

Ví dụ:

`https://chien-binh-dich.vercel.app/a/g5u2-writing-01`

## 7.5 Published catalog integration

Update:

- `src/data/publishedLessonCatalog.js`

Không tạo route engine mới.

Không thay đổi:

- evaluator architecture
- Session semantics
- Mastery
- Retry
- Firebase
- Universal Content CMS

---

# 8. Web lesson production contract

Mỗi lesson web phải có:

1. Learner-safe title.
2. `expectedTimeMinutes`.
3. Subtitle dạng: `Typing · Việt → Anh · NHÌN → CHUNK → CÂU`.
4. `activityTypes: ['typing']`.
5. `completionPolicy: 'all-items'`.
6. Mastery mặc định theo repo.
7. Stable fixed slug.
8. Exactly one FINAL.
9. Không full target trong title.
10. Không answer-bearing theory trước submit ngoài các SEE step cố ý dạy **word/chunk**, không được hiển thị full FINAL.

---

# 9. Automated QA / regression tests

Tạo tối thiểu:

- `tests/g5Unit2WritingTyping.test.js`

Test phải khóa:

### T1. Exactly 16 lessons
Published registry phải có đúng 16 lesson Unit 2 Writing Typing.

### T2. Exactly one FINAL per lesson
Mỗi lesson đúng một `scaffoldRole === 'final'`.

### T3. FINAL source match
FINAL answer bằng đúng `targetSentence` trong source.

### T4. Time metadata
Tất cả lesson có `expectedTimeMinutes`. Tổng = **97 phút** nếu timing spec không đổi.

### T5. Title safety
Không title nào normalize thành hoặc chứa full target.

### T6. Activity type
Tất cả chỉ dùng native `typing`.

### T7. Stable fixed slugs
16 slug unique: `g5u2-writing-01` → `g5u2-writing-16`.

### T8. Local cold-start coverage
Mọi token/chunk meaningful của FINAL phải được expose trước FINAL trong cùng lesson.

### T9. Article coverage
Các target có `a house`, `a flat`, `the school` phải có scaffold explicit.

### T10. Auxiliary coverage
Các câu hỏi `Do you ...?` phải có `Do` bridge trước FINAL.

### T11. Contraction coverage
- Lesson 06: `do not → don't`
- Lesson 13: `What is → What's`
- Lesson 14: `It is → It's`

### T12. Morphology coverage
Lesson 16 phải có `live → lives` trước FINAL.

### T13. Preposition contrast
Test bảo đảm nơi ở loại hình dùng `in`, địa chỉ cụ thể dùng `at`.

### T14. No address placeholder in production
CI phải fail nếu source/catalog/content chứa `[VERIFIED STREET]`, `TODO_ADDRESS` hoặc marker source gate tương đương khi file đã được đưa vào published catalog.

### T15. Catalog / Explorer regression
Nếu thêm 16 lessons làm thay đổi recursive count Global 5 hoặc Unit 2, cập nhật test count đúng theo dữ liệu mới; không hard-code sai count cũ.

---

# 10. Canonical CI gates

Trước merge:

```bash
npm run check:syntax
npm run lint:content
npm test
npm run ci
```

Không nói “CI pass” nếu chưa kiểm tra live GitHub Actions run.

Nếu CI fail:

1. đọc failing job;
2. xác định root cause;
3. sửa đúng regression;
4. chạy lại CI;
5. chỉ merge khi CI xanh.

---

# 11. Vercel Preview và Production QA

## 11.1 Preview

Trước merge, kiểm tra representative lessons:

- Lesson 01 — `Do` question
- Lesson 05 — Yes short answer
- Lesson 06 — `don't`
- Lesson 08 — WH + `do`
- Lesson 09 — `a house`
- Lesson 11 — `the school`
- Lesson 13 — `What's`
- Lesson 14 — `It's`
- Lesson 15 — `at + address`
- Lesson 16 — `lives`

Kiểm tra:

- page loads;
- title không leak target;
- số phút hiển thị;
- các step đúng thứ tự;
- FINAL là step cuối;
- answer evaluation đúng;
- mobile/classroom không vỡ layout.

## 11.2 Production

Sau merge:

1. xác nhận Vercel deployment `target: production`;
2. `state: READY`;
3. commit SHA đúng merge commit;
4. test ít nhất lesson đầu, giữa, cuối:
   - `/a/g5u2-writing-01`
   - `/a/g5u2-writing-08`
   - `/a/g5u2-writing-16`
5. xác minh production JS/catalog thực sự chứa Unit 2 mới.

---

# 12. Print package contract

Bộ in phải được tạo **từ cùng source/scaffold production**, không soạn lại bằng một bảng riêng.

## 12.1 Student Print

Folder: `Student/`

Phải có:

- 16 PDF riêng: `G5U2_Student_01.pdf` ... `G5U2_Student_16.pdf`
- 1 PDF gộp: `00_G5U2_Student_All_16_Lessons.pdf`

### Mỗi trang Student

Phải có:

- `Global Success 5 · Unit 2 · Our homes`
- Lesson number
- learner-safe title
- `⏱ Dự kiến: X phút`
- Name / Class / Date
- phần NHÌN & CHÉP
- phần RECALL / CHUNK / BUILD
- FINAL Vietnamese cue
- vùng trống để học sinh viết/gõ câu
- URL lesson online dạng chữ
- QR code tới đúng lesson
- clickable link trong PDF nếu thư viện PDF hỗ trợ

### Student answer safety

Student Print:

- không in Teacher Key;
- không in full FINAL answer trong phần bài làm;
- SEE word/chunk vẫn được phép hiển thị vì đó là scaffold có chủ đích;
- không để full target xuất hiện ở title/header/QR caption.

## 12.2 Teacher Key

Folder: `Teacher_Key/`

Phải có:

- 16 PDF riêng: `G5U2_Teacher_Key_01.pdf` ... `G5U2_Teacher_Key_16.pdf`
- 1 PDF gộp: `00_G5U2_Teacher_Key_All_16_Lessons.pdf`

### Mỗi trang Teacher

Giữ cùng question order Student, nhưng có:

- answer cho mọi step;
- FINAL answer;
- trap note;
- article/determiner note;
- contraction note;
- auxiliary note;
- morphology note nếu liên quan;
- source note;
- expected minutes;
- URL + QR của đúng web lesson.

Teacher key không được xáo thứ tự khác Student.

---

# 13. Link package contract

Folder: `Links/`

Phải có ít nhất:

1. `00_ALL_16_LESSON_LINKS.txt`
2. `00_ALL_16_LESSON_LINKS.csv`
3. `00_ALL_16_LESSON_LINKS.md`
4. `00_ALL_16_LESSON_LINKS.pdf`

## 13.1 TXT

Mỗi dòng một URL:

```text
https://chien-binh-dich.vercel.app/a/g5u2-writing-01
...
https://chien-binh-dich.vercel.app/a/g5u2-writing-16
```

## 13.2 CSV

Columns:

```text
lesson_number,title,minutes,set_id,slug,url
```

## 13.3 Markdown

Phải có bảng:

| # | Title | Minutes | Web lesson |
|---|---|---:|---|

Mỗi Web lesson là clickable link.

## 13.4 PDF Link Index

Mỗi lesson có:

- number
- title
- minutes
- full URL
- QR
- clickable URL

Có thể in một hoặc nhiều trang A4, ưu tiên dễ scan.

---

# 14. Links phải xuất hiện trong Student và Teacher

Không chỉ có Link Index riêng.

**Mỗi PDF lesson Student và Teacher đều phải chứa link đúng lesson tương ứng.**

Ví dụ Lesson 01:

```text
https://chien-binh-dich.vercel.app/a/g5u2-writing-01
```

Lesson 16:

```text
https://chien-binh-dich.vercel.app/a/g5u2-writing-16
```

Không được:

- dùng cùng một QR cho cả 16 bài;
- link về homepage thay vì lesson;
- Student link một slug và Teacher key link slug khác.

---

# 15. ZIP thành phẩm

Tên gợi ý:

`G5U2_Writing_Typing_Production_Pack.zip`

Cấu trúc:

```text
G5U2_Writing_Typing_Production_Pack/
│
├── Student/
│   ├── 00_G5U2_Student_All_16_Lessons.pdf
│   ├── G5U2_Student_01.pdf
│   ├── ...
│   └── G5U2_Student_16.pdf
│
├── Teacher_Key/
│   ├── 00_G5U2_Teacher_Key_All_16_Lessons.pdf
│   ├── G5U2_Teacher_Key_01.pdf
│   ├── ...
│   └── G5U2_Teacher_Key_16.pdf
│
├── Links/
│   ├── 00_ALL_16_LESSON_LINKS.txt
│   ├── 00_ALL_16_LESSON_LINKS.csv
│   ├── 00_ALL_16_LESSON_LINKS.md
│   └── 00_ALL_16_LESSON_LINKS.pdf
│
├── Spec/
│   └── g5-u2-writing-typing-production-spec.md
│
└── README.md
```

---

# 16. ZIP integrity QA

Trước giao file:

### Z1. Count

- Student individual PDFs = 16
- Teacher individual PDFs = 16
- Student merged = 1
- Teacher merged = 1
- Link files = 4+
- README = 1
- spec copy = 1

### Z2. Page count

Nếu mỗi lesson là 1 trang:

- Student merged = 16 pages
- Teacher merged = 16 pages

Nếu một lesson cần 2 trang vì readability, phải ghi rõ và kiểm tra page mapping.

### Z3. URL count

Exactly 16 canonical URLs.

### Z4. QR mapping

QR lesson N phải decode thành slug lesson N.

### Z5. Student/Teacher alignment

Với mỗi N:

- cùng title;
- cùng step order;
- cùng minutes;
- cùng web URL;
- Teacher có answer, Student không.

### Z6. ZIP test

Chạy integrity test:

- ZIP mở được;
- không corrupt;
- không tên file trùng;
- không missing file;
- không blank PDF.

### Z7. Visual PDF QA

Kiểm tra representative pages:

- Lesson 01
- Lesson 06
- Lesson 09
- Lesson 13
- Lesson 16

Đảm bảo:

- không chữ tràn;
- QR không đè nội dung;
- URL đọc được;
- đáp án Teacher không lọt sang Student;
- không có black border/frame lỗi ngoài ý muốn.

---

# 17. README thành phẩm

README phải giải thích ngắn:

## Dùng trên lớp

1. In Student lesson.
2. Học sinh làm NHÌN & CHÉP.
3. Giáo viên có thể yêu cầu che phần SEE trước RECALL.
4. Học sinh làm CHUNK/BUILD/FINAL.
5. Dùng QR/link để làm lại online.
6. Teacher dùng Key để chữa nhanh.

## Dùng giao bài online

1. Mở `Links/00_ALL_16_LESSON_LINKS.pdf` hoặc `.csv`.
2. Copy đúng link lesson.
3. Gửi cho học sinh.
4. Không cần tạo random assignment nếu fixed lesson link đã đáp ứng mục tiêu.

---

# 18. End-to-end production workflow

## Phase 0 · Source verification

1. Tách Unit 1 khỏi transcript.
2. Audit 16 targets.
3. Xác minh Lesson 15 address.
4. Khóa exact spelling/punctuation.
5. Cập nhật spec từ `CONTENT LOCK CANDIDATE` → `CONTENT LOCKED`.

## Phase 1 · Source layer

1. Tạo `g5-u2-writing-source.js`.
2. Ghi source metadata.
3. Khóa expected minutes.
4. Khóa lesson family.

## Phase 2 · Cold-start scaffold

1. Author SEE items.
2. Author RECALL items.
3. Author CHUNK.
4. Author BUILD/BRIDGE.
5. Author FINAL.
6. Audit 100% local coverage.

## Phase 3 · Catalog

1. Tạo Unit 2 Writing folders.
2. Tạo 16 descriptors.
3. Gán stable slugs.
4. Integrate published catalog.
5. Không overwrite bài Unit 2 khác đang tồn tại.

## Phase 4 · Tests

1. Add Unit 2 regression tests.
2. Run syntax.
3. Run content validation.
4. Run tests.
5. Run canonical CI.

## Phase 5 · PR + Preview

1. Feature branch.
2. Commit intentional scope.
3. Open PR.
4. GitHub Actions pass.
5. Vercel Preview.
6. Browser QA representative lessons.

## Phase 6 · Merge + Production

1. Merge only after source gate + CI + preview pass.
2. Vercel production READY.
3. Verify commit SHA.
4. Verify fixed links.

## Phase 7 · Generate print assets

Chỉ sau khi canonical slugs production-ready:

1. Generate Student PDFs from production scaffold.
2. Generate Teacher Key PDFs from same scaffold.
3. Add URL text.
4. Generate QR.
5. Merge Student.
6. Merge Teacher.
7. Generate Link TXT/CSV/MD/PDF.

## Phase 8 · Package

1. Assemble directory tree.
2. Add README.
3. Add exact spec copy.
4. ZIP.
5. Integrity test.
6. Visual QA.
7. Deliver final ZIP.

---

# 19. Acceptance checklist

Production chỉ được gọi là **DONE** khi tất cả đều đúng:

- [ ] Unit 1 tail không bị trộn vào Unit 2.
- [ ] 16 exact targets locked.
- [ ] Lesson 15 address đã xác minh.
- [ ] 16 lessons published.
- [ ] 16 stable slugs.
- [ ] 16 expected times.
- [ ] Exactly one FINAL mỗi lesson.
- [ ] 100% local cold-start coverage.
- [ ] `a house / a flat / the school` explicit.
- [ ] `this / that` explicit.
- [ ] `Do` bridge explicit.
- [ ] `do not → don't` explicit.
- [ ] `What is → What's` explicit.
- [ ] `It is → It's` explicit.
- [ ] `live → lives` explicit.
- [ ] `in` vs `at` contrast explicit.
- [ ] learner-safe titles.
- [ ] CI green.
- [ ] Vercel production READY.
- [ ] 16 student individual PDFs.
- [ ] 1 student merged PDF.
- [ ] 16 teacher individual PDFs.
- [ ] 1 teacher merged PDF.
- [ ] Teacher keys align 1:1 with Student.
- [ ] 16 web links in TXT.
- [ ] 16 rows in CSV.
- [ ] Markdown clickable link list.
- [ ] PDF Link Index.
- [ ] Every Student lesson has its own URL + QR.
- [ ] Every Teacher lesson has its own URL + QR.
- [ ] QR mappings verified.
- [ ] ZIP integrity pass.
- [ ] No blank/corrupt PDF.
- [ ] No answer leak in Student print.

---

# 20. Definition of Done

Unit 2 Writing Typing được xem là hoàn chỉnh khi giáo viên nhận một package duy nhất trong đó:

> **Transcript evidence → 16 target sentences → 16 independent cold-start typing lessons → stable web links → Student Print → Teacher Key → QR/link index → ZIP**

và mọi đầu ra đều truy về **cùng một lesson identity/source-of-truth**, không có tình trạng web một câu, bản Student một câu khác, Teacher Key một đáp án khác hoặc QR dẫn sai lesson.
