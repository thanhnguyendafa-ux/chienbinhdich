# Global Success 6 · Unit 2 · My House
## Writing Typing Production Spec — 16 Mini Lessons

**Status:** CONTENT LOCKED FOR PRODUCTION  
**Course:** Global Success 6  
**Unit:** Unit 2 · My House  
**Output:** Writing · Việt → Anh · Typing  
**Method:** WORD/FIXED WORDING → CHUNK → SENTENCE PART → FULL TARGET  
**Teacher:** Thầy Thành MRT

---

# 1. Mục tiêu sản phẩm

Tạo **16 mini writing lessons**, mỗi lesson phục vụ đúng **01 target sentence** của Global Success 6 Unit 2. Học sinh không học theo công thức trừu tượng như `S + V + O`, `There is + N`, `N's + N`. Học sinh typing chính các mảnh có thật trong target sentence và dựng dần lên câu hoàn chỉnh.

**Nguyên tắc cốt lõi:**

> Một lesson = một target sentence. Mọi scaffold phải phục vụ chính câu đó.

---

# 2. Quy tắc cue Việt → answer Anh

## 2.1. Một cue Việt không được có hai surface forms Anh khác nhau

**Không được:**

```text
phòng khách → living room
phòng khách → the living room
```

**Phải làm:**

```text
một phòng khách → a living room
phòng khách (đã xác định) → the living room
phòng khách của chúng tôi → our living room
```

Tương tự:

```text
một căn nhà phố → a townhouse
căn hộ mới của bạn → your new flat
phòng ngủ của tôi → my bedroom
một cái đồng hồ → a clock
```

## 2.2. Article/determiner phải được giải thích ngay trong cue

Nếu expected answer chứa `a/an/the/my/your/our` hoặc số nhiều thì cue Việt phải đủ rõ để học sinh hiểu vì sao hình thức đó xuất hiện.

## 2.3. Không dạy bare word nếu nó gây nhiễu

Nếu target cần `read books`, ưu tiên:

```text
đọc sách → read books
```

thay vì tách `sách → books` rồi để học sinh thắc mắc vì sao không phải `book`.

Nếu target cần `a townhouse`, ưu tiên:

```text
một căn nhà phố → a townhouse
```

## 2.4. WH-question không được có cue mâu thuẫn

Không dùng cùng cue:

```text
bạn sống → you live
bạn sống → do you live
```

Phải ghi rõ:

```text
phần “bạn sống” sau từ hỏi WHERE → do you live
```

## 2.5. Cho phép normalization từ transcript sang writing

Nếu transcript dùng pronoun phụ thuộc câu trước, có thể thay bằng noun rõ nghĩa để target đứng độc lập, nhưng không đổi meaning core.

Ví dụ:

```text
It's next to the kitchen.
→ The living room is next to the kitchen.
```

```text
It also has a big window and a clock on the wall.
→ My bedroom also has a big window and a clock on the wall.
```

---

# 3. Cây folder hiển thị

```text
Global Success 6
└── Unit 2 · My House
    └── Writing · Sentence Builder
        ├── Cấu trúc 1 · Possessive
        │   └── 01 · It is Elena's room.
        ├── Cấu trúc 2 · Prepositions of Place
        │   ├── 02 · Is there a TV behind you?
        │   └── 03 · The living room is next to the kitchen.
        ├── Cấu trúc 3 · There is / There are
        │   ├── 04 · Are there many rooms in your new flat?
        │   ├── 05 · There is a living room, three bedrooms, a kitchen and two bathrooms.
        │   ├── 06 · There are six rooms in our house.
        │   └── 07 · There is a bed, a desk, a chair and a bookshelf.
        ├── Cấu trúc 4 · Have / Has
        │   ├── 08 · I have my own bedroom.
        │   └── 09 · My bedroom also has a big window and a clock on the wall.
        ├── Cấu trúc 5 · Live & Routine
        │   ├── 10 · Where do you live?
        │   ├── 11 · I live in a townhouse in Hanoi.
        │   ├── 12 · Who do you live with?
        │   ├── 13 · I live with my parents.
        │   └── 14 · I often read books in my bedroom.
        └── Cấu trúc 6 · Description & Because
            ├── 15 · My bedroom is small but beautiful.
            └── 16 · I love our living room the best because it is bright.
```

---

# 4. Vị trí code dự kiến

```text
src/data/
├── g6-u2-writing-source.js
├── g6-u2-writing-typing-catalog.js
├── g6-u2-writing-typing-builder.js
├── g6-u2-writing-typing-content.js
├── g6-u2-writing-typing-part1.js
├── g6-u2-writing-typing-part2.js
├── g6-u2-writing-typing-part3.js
├── g6-u2-writing-typing-part4.js
├── g6-u2-writing-typing-part5.js
└── g6-u2-writing-typing-part6.js

tests/
└── g6Unit2WritingTyping.test.js
```

Tài liệu khóa nội dung:

```text
docs/g6-u2-writing-typing-production-spec.md
```

---

# 5. Nội dung chi tiết 16 lessons

## LESSON 01 · Possessive

**Target:** `It is Elena's room.`  
**Việt:** Đó là phòng của Elena.  
**Mindset:** GÁN / POSSESSION

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | CHUNK | phòng của Elena | `Elena's room` |
| 2 | CHUNK | nó là | `it is` |
| 3 | SENTENCE PART | nó là phòng của Elena | `it is Elena's room` |
| 4 | FINAL | Đó là phòng của Elena. | `It is Elena's room.` |

**Feedback:** `'s` gắn vào Elena để biểu thị sở hữu. Meaning core: room belongs to Elena.

---

## LESSON 02 · Behind

**Target:** `Is there a TV behind you?`  
**Việt:** Có một chiếc TV phía sau bạn không?  
**Mindset:** AURA + LOCATION QUESTION

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | WORD | phía sau | `behind` |
| 2 | CHUNK | phía sau bạn | `behind you` |
| 3 | CHUNK | một chiếc TV | `a TV` |
| 4 | CHUNK | một chiếc TV phía sau bạn | `a TV behind you` |
| 5 | FINAL | Có một chiếc TV phía sau bạn không? | `Is there a TV behind you?` |

**Feedback:** `behind you` là location chunk. `Is there ...?` hỏi xem một vật có tồn tại ở vị trí đó hay không.

---

## LESSON 03 · Next to

**Target:** `The living room is next to the kitchen.`  
**Việt:** Phòng khách ở bên cạnh nhà bếp.  
**Source normalization:** transcript `It's next to the kitchen.` → thay `it` bằng `the living room`.  
**Mindset:** GÁN LOCATION

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | WORD | bên cạnh | `next to` |
| 2 | CHUNK | phòng khách (đã xác định) | `the living room` |
| 3 | CHUNK | nhà bếp (đã xác định) | `the kitchen` |
| 4 | CHUNK | bên cạnh nhà bếp (đã xác định) | `next to the kitchen` |
| 5 | SENTENCE PART | phòng khách (đã xác định) ở bên cạnh... | `the living room is next to` |
| 6 | FINAL | Phòng khách ở bên cạnh nhà bếp. | `The living room is next to the kitchen.` |

**Feedback:** marker `(đã xác định)` giải thích vì sao dùng `the`.

---

## LESSON 04 · Are there many rooms...?

**Target:** `Are there many rooms in your new flat?`  
**Việt:** Có nhiều phòng trong căn hộ mới của bạn không?  
**Mindset:** AURA · PLURAL QUESTION

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | CHUNK | nhiều phòng | `many rooms` |
| 2 | CHUNK | căn hộ mới của bạn | `your new flat` |
| 3 | CHUNK | trong căn hộ mới của bạn | `in your new flat` |
| 4 | CHUNK | nhiều phòng trong căn hộ mới của bạn | `many rooms in your new flat` |
| 5 | FINAL | Có nhiều phòng trong căn hộ mới của bạn không? | `Are there many rooms in your new flat?` |

**Feedback:** `rooms` là số nhiều nên câu hỏi dùng `Are there ...?`.

---

## LESSON 05 · Rooms in the flat

**Target:** `There is a living room, three bedrooms, a kitchen and two bathrooms.`  
**Mindset:** AURA · HOUSE CONTENTS

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | CHUNK | một phòng khách | `a living room` |
| 2 | CHUNK | ba phòng ngủ | `three bedrooms` |
| 3 | CHUNK | một nhà bếp | `a kitchen` |
| 4 | CHUNK | hai phòng tắm | `two bathrooms` |
| 5 | CHUNK | một phòng khách, ba phòng ngủ | `a living room, three bedrooms` |
| 6 | CHUNK | một nhà bếp và hai phòng tắm | `a kitchen and two bathrooms` |
| 7 | SENTENCE PART | Có một phòng khách, ba phòng ngủ... | `There is a living room, three bedrooms` |
| 8 | FINAL | Có một phòng khách, ba phòng ngủ, một nhà bếp và hai phòng tắm. | `There is a living room, three bedrooms, a kitchen and two bathrooms.` |

**Feedback:** article nằm ngay trong cue: `một phòng khách → a living room`.

---

## LESSON 06 · Six rooms

**Target:** `There are six rooms in our house.`  
**Việt:** Có sáu phòng trong nhà của chúng tôi.  
**Mindset:** AURA · PLURAL

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | CHUNK | sáu phòng | `six rooms` |
| 2 | CHUNK | nhà của chúng tôi | `our house` |
| 3 | CHUNK | trong nhà của chúng tôi | `in our house` |
| 4 | SENTENCE PART | có sáu phòng | `there are six rooms` |
| 5 | FINAL | Có sáu phòng trong nhà của chúng tôi. | `There are six rooms in our house.` |

**Feedback:** `six rooms` → plural → `there are`.

---

## LESSON 07 · Bedroom furniture

**Target:** `There is a bed, a desk, a chair and a bookshelf.`  
**Mindset:** AURA · ROOM CONTENTS

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | CHUNK | một cái giường | `a bed` |
| 2 | CHUNK | một cái bàn học | `a desk` |
| 3 | CHUNK | một cái ghế | `a chair` |
| 4 | CHUNK | một giá sách | `a bookshelf` |
| 5 | CHUNK | một cái giường, một cái bàn học | `a bed, a desk` |
| 6 | CHUNK | một cái ghế và một giá sách | `a chair and a bookshelf` |
| 7 | SENTENCE PART | Có một cái giường, một cái bàn học... | `There is a bed, a desk` |
| 8 | FINAL | Có một cái giường, một cái bàn học, một cái ghế và một giá sách. | `There is a bed, a desk, a chair and a bookshelf.` |

**Feedback:** dạy noun cùng article thật của target; không bắt học sinh tự đoán article ở bước sau.

---

## LESSON 08 · My own bedroom

**Target:** `I have my own bedroom.`  
**Việt:** Tôi có phòng ngủ riêng.  
**Mindset:** HÀNH ĐỘNG XYZ · HAVE

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | WORD | có | `have` |
| 2 | CHUNK | phòng ngủ riêng của tôi | `my own bedroom` |
| 3 | CHUNK | có phòng ngủ riêng của tôi | `have my own bedroom` |
| 4 | FINAL | Tôi có phòng ngủ riêng. | `I have my own bedroom.` |

**Feedback:** `my own bedroom` là possession chunk hoàn chỉnh. `I have` khác meaning core với `There is`.

---

## LESSON 09 · Bedroom has a window and clock

**Target:** `My bedroom also has a big window and a clock on the wall.`  
**Source normalization:** transcript `It also has...` → thay `it` bằng `my bedroom`.  
**Mindset:** HÀNH ĐỘNG XYZ · HAS + LOCATION

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | CHUNK | một cửa sổ lớn | `a big window` |
| 2 | CHUNK | một cái đồng hồ | `a clock` |
| 3 | CHUNK | trên tường | `on the wall` |
| 4 | CHUNK | một cái đồng hồ trên tường | `a clock on the wall` |
| 5 | CHUNK | phòng ngủ của tôi | `my bedroom` |
| 6 | SENTENCE PART | phòng ngủ của tôi cũng có | `my bedroom also has` |
| 7 | CHUNK | một cửa sổ lớn và một cái đồng hồ trên tường | `a big window and a clock on the wall` |
| 8 | SENTENCE PART | Phòng ngủ của tôi cũng có một cửa sổ lớn... | `My bedroom also has a big window` |
| 9 | FINAL | Phòng ngủ của tôi cũng có một cửa sổ lớn và một cái đồng hồ trên tường. | `My bedroom also has a big window and a clock on the wall.` |

**Feedback:** không dùng cue mơ hồ `cũng có → also has`; cue phải chứa host `phòng ngủ của tôi cũng có`.

---

## LESSON 10 · Where do you live?

**Target:** `Where do you live?`  
**Việt:** Bạn sống ở đâu?  
**Mindset:** HÀNH ĐỘNG XYZ · WH QUESTION

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | WORD | sống | `live` |
| 2 | WORD | ở đâu | `where` |
| 3 | CHUNK | phần “bạn sống” sau từ hỏi WHERE | `do you live` |
| 4 | FINAL | Bạn sống ở đâu? | `Where do you live?` |

**Feedback:** không tạo hai cue `bạn sống` với hai answer khác nhau. `do` xuất hiện vì đây là câu hỏi Present Simple.

---

## LESSON 11 · Townhouse in Hanoi

**Target:** `I live in a townhouse in Hanoi.`  
**Việt:** Tôi sống trong một căn nhà phố ở Hà Nội.  
**Mindset:** HÀNH ĐỘNG XYZ · LIVE + PLACE

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | WORD | sống | `live` |
| 2 | CHUNK | một căn nhà phố | `a townhouse` |
| 3 | CHUNK | trong một căn nhà phố | `in a townhouse` |
| 4 | CHUNK | ở Hà Nội | `in Hanoi` |
| 5 | CHUNK | sống trong một căn nhà phố | `live in a townhouse` |
| 6 | SENTENCE PART | tôi sống trong một căn nhà phố | `I live in a townhouse` |
| 7 | FINAL | Tôi sống trong một căn nhà phố ở Hà Nội. | `I live in a townhouse in Hanoi.` |

**Feedback:** `một căn nhà phố → a townhouse` giữ surface form ổn định.

---

## LESSON 12 · Who do you live with?

**Target:** `Who do you live with?`  
**Việt:** Bạn sống cùng ai?  
**Mindset:** HÀNH ĐỘNG XYZ · WH QUESTION

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | WORD | ai | `who` |
| 2 | CHUNK | sống cùng | `live with` |
| 3 | CHUNK | phần “bạn sống cùng” sau từ hỏi WHO | `do you live with` |
| 4 | FINAL | Bạn sống cùng ai? | `Who do you live with?` |

**Feedback:** `with` được giữ ở cuối vì thuộc chunk `live with`. Cue nói rõ đây là phần đứng sau WHO.

---

## LESSON 13 · Live with parents

**Target:** `I live with my parents.`  
**Việt:** Tôi sống cùng bố mẹ.  
**Mindset:** HÀNH ĐỘNG XYZ · LIVE WITH

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | CHUNK | bố mẹ của tôi | `my parents` |
| 2 | CHUNK | cùng bố mẹ của tôi | `with my parents` |
| 3 | CHUNK | sống cùng bố mẹ của tôi | `live with my parents` |
| 4 | FINAL | Tôi sống cùng bố mẹ. | `I live with my parents.` |

**Feedback:** Lesson 12 hỏi `Who do you live with?`; Lesson 13 trả lời bằng `live with my parents`.

---

## LESSON 14 · Read books in my bedroom

**Target:** `I often read books in my bedroom.`  
**Việt:** Tôi thường đọc sách trong phòng ngủ của mình.  
**Mindset:** HÀNH ĐỘNG XYZ · FREQUENCY + LOCATION

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | WORD | thường | `often` |
| 2 | CHUNK | đọc sách | `read books` |
| 3 | CHUNK | phòng ngủ của tôi | `my bedroom` |
| 4 | CHUNK | trong phòng ngủ của tôi | `in my bedroom` |
| 5 | CHUNK | thường đọc sách | `often read books` |
| 6 | SENTENCE PART | tôi thường đọc sách | `I often read books` |
| 7 | FINAL | Tôi thường đọc sách trong phòng ngủ của mình. | `I often read books in my bedroom.` |

**Feedback:** ưu tiên `đọc sách → read books`; `often` đứng trước lexical verb `read`.

---

## LESSON 15 · Small but beautiful

**Target:** `My bedroom is small but beautiful.`  
**Việt:** Phòng ngủ của tôi nhỏ nhưng đẹp.  
**Source normalization:** transcript `It's small but beautiful.` → thay `it` bằng `my bedroom`.  
**Mindset:** GÁN · ADJECTIVE + BUT

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | WORD | nhỏ | `small` |
| 2 | WORD | đẹp | `beautiful` |
| 3 | CHUNK | nhỏ nhưng đẹp | `small but beautiful` |
| 4 | CHUNK | phòng ngủ của tôi | `my bedroom` |
| 5 | SENTENCE PART | phòng ngủ của tôi thì nhỏ | `my bedroom is small` |
| 6 | FINAL | Phòng ngủ của tôi nhỏ nhưng đẹp. | `My bedroom is small but beautiful.` |

**Feedback:** meaning core là GÁN đặc điểm; `but` nối hai đặc điểm tương phản.

---

## LESSON 16 · Favourite room + reason

**Target:** `I love our living room the best because it is bright.`  
**Việt:** Tôi thích phòng khách của chúng tôi nhất vì nó sáng.  
**Mindset:** MIXED · LOVE + BECAUSE + GÁN REASON

| Step | Stage | Cue Việt | Expected answer |
|---|---|---|---|
| 1 | WORD | bởi vì | `because` |
| 2 | WORD | sáng | `bright` |
| 3 | CHUNK | phòng khách của chúng tôi | `our living room` |
| 4 | CHUNK | nó sáng | `it is bright` |
| 5 | CHUNK | vì nó sáng | `because it is bright` |
| 6 | CHUNK | thích phòng khách của chúng tôi nhất | `love our living room the best` |
| 7 | SENTENCE PART | tôi thích phòng khách của chúng tôi nhất | `I love our living room the best` |
| 8 | FINAL | Tôi thích phòng khách của chúng tôi nhất vì nó sáng. | `I love our living room the best because it is bright.` |

**Feedback:** không dùng cue mơ hồ `thích nhất → love the best`; học chunk đầy đủ `love our living room the best`.

---

# 6. Progression toàn bộ Unit 2

```text
POSSESSION
01 It is Elena's room.
        ↓
LOCATION
02 Is there a TV behind you?
03 The living room is next to the kitchen.
        ↓
EXISTENCE / CONTENTS
04 Are there many rooms in your new flat?
05 There is a living room, three bedrooms, a kitchen and two bathrooms.
06 There are six rooms in our house.
07 There is a bed, a desk, a chair and a bookshelf.
        ↓
HAVE / HAS
08 I have my own bedroom.
09 My bedroom also has a big window and a clock on the wall.
        ↓
LIVE / PEOPLE / ROUTINE
10 Where do you live?
11 I live in a townhouse in Hanoi.
12 Who do you live with?
13 I live with my parents.
14 I often read books in my bedroom.
        ↓
DESCRIPTION / REASON
15 My bedroom is small but beautiful.
16 I love our living room the best because it is bright.
```

Output logic cuối Unit:

> **Where I live → Who I live with → Rooms → Furniture → Location → My bedroom → Activity → Description → Favourite room + Reason**

---

# 7. Schema dữ liệu đề xuất

```js
{
  key: '01',
  targetSentence: "It is Elena's room.",
  targetVi: 'Đó là phòng của Elena.',
  mindset: 'GÁN',
  core: 'POSSESSION',
  sourceType: 'transcript' | 'normalized-transcript',
  sourceNote: '...',
  items: [
    {
      stage: 'word' | 'chunk' | 'sentence_part' | 'final',
      vi: '...',
      en: '...'
    }
  ]
}
```

Builder không được tự thêm sentence mới ngoài target đã khóa.

---

# 8. Quy trình đầu-cuối production

## Phase 0 · Content freeze

1. Khóa 16 target sentences trong spec này.
2. Khóa cue Việt và expected answer từng step.
3. Mọi thay đổi nội dung phải sửa spec trước, code sau.
4. Không tự “làm đẹp” câu trong code mà không cập nhật source spec.

**Acceptance:** 16/16 lesson có target + progression rõ ràng.

## Phase 1 · Tạo source SSoT

Tạo `src/data/g6-u2-writing-source.js` chứa:

- 16 target sentences;
- bản dịch Việt;
- grammar family;
- source type;
- normalization note;
- lesson order.

**Acceptance:** đúng 16 records, không trùng target.

## Phase 2 · Tạo 6 lesson spec files

```text
g6-u2-writing-typing-part1.js → Possessive
g6-u2-writing-typing-part2.js → Prepositions
g6-u2-writing-typing-part3.js → There is / There are
g6-u2-writing-typing-part4.js → Have / Has
g6-u2-writing-typing-part5.js → Live & Routine
g6-u2-writing-typing-part6.js → Description & Because
```

Mỗi file chứa đúng progression ở Section 5.

**Không dùng auto lexical expansion có thể tự sinh bare words hoặc article mâu thuẫn.**

## Phase 3 · Builder an toàn

Tạo `g6-u2-writing-typing-builder.js`.

Builder chỉ được:

- chuyển static spec thành typing items;
- tạo IDs;
- tạo `buildsFrom`;
- thêm teaching feedback;
- freeze object nếu cần.

Builder **không được**:

- tự sinh từ;
- tự sinh phrase;
- tự sinh sentence;
- thay article;
- normalize target;
- lấy lexical item ngoài lesson spec.

## Phase 4 · Content loader

Tạo `g6-u2-writing-typing-content.js`:

- merge 6 part files;
- expose `getG6U2WritingTypingContent(key)`;
- báo lỗi nếu key không tồn tại;
- không mutate data.

## Phase 5 · Catalog + tree

Tạo `g6-u2-writing-typing-catalog.js` với:

```text
Global Success 6
→ Unit 2 · My House
→ Writing · Sentence Builder
→ 6 grammar folders
→ 16 lessons
```

Mỗi descriptor cần:

- course/unit/title/subtitle;
- expectedTimeMinutes;
- `passThreshold: 80`;
- `completionPolicy: all-items`;
- `activityTypes: ['typing']`;
- targetSentenceId;
- itemCount thực tế.

Không hard-code 9 items cho tất cả bài.

## Phase 6 · Tích hợp root catalog

- thêm `global6-unit2` nếu chưa có;
- merge folders/registry của G6 U2;
- không phá G6 U1;
- giữ order rõ ràng.

## Phase 7 · Automated tests

Tạo `tests/g6Unit2WritingTyping.test.js`.

### Test contract bắt buộc

1. **Exactly 16 lessons** — registry có đúng 16 lesson.
2. **One lesson = one target** — mỗi lesson đúng 01 targetSentenceId.
3. **Final exact match** — final item = target đã khóa.
4. **No foreign full sentence** — không có full sentence khác target trong lesson.
5. **Cue uniqueness** — cùng cue Việt thì answer Anh phải giống nhau, trừ khi cue có explicit context marker.
6. **Determiner cue audit** — answer chứa `a/an/the/my/your/our` phải có cue đủ nghĩa hoặc marker `(đã xác định)`.
7. **WH ambiguity audit** — bắt lỗi `bạn sống → you live` và `bạn sống → do you live`.
8. **No generic formula question** — cấm `S + V + O`, `There is + N`, `N's + N` làm exercise item.
9. **Scaffold containment** — answer trước FINAL phải phục vụ lexical/chunk của chính target.
10. **Normalization audit** — L03, L09, L15 phải có source normalization note.
11. **Item count integrity** — catalog itemCount khớp content.
12. **Regression** — toàn bộ test hiện tại của repo vẫn PASS.

## Phase 8 · Manual content audit

Đọc thủ công 16 bài từ góc nhìn học sinh yếu. Với từng item hỏi:

1. Cue này có thể có hai answer Anh hợp lý không?
2. Học sinh có thể hỏi “sao lúc trước khác lúc này?” không?
3. Article/determiner có xuất hiện bất ngờ không?
4. Số ít/số nhiều có được cue giải thích không?
5. Chunk có thực sự nằm trong target không?
6. Step sau có xây rõ từ step trước không?
7. Có step thừa chỉ để tăng itemCount không?
8. Final có đúng target không?

Nếu câu 1 hoặc 2 = **có**, sửa cue trước deploy.

## Phase 9 · Local validation

Đọc `package.json` và chạy script thực tế của repo. Tối thiểu:

- syntax check;
- Unit 2 tests;
- full regression tests;
- import/catalog validation.

Acceptance:

- syntax PASS;
- G6 U2 tests PASS;
- existing tests PASS;
- no import error;
- registry loads 16 lessons.

## Phase 10 · Browser verification

Kiểm tra:

1. Global Success 6 hiển thị.
2. Unit 2 · My House hiển thị.
3. Writing · Sentence Builder hiển thị.
4. 6 grammar folders đúng order.
5. 16 lessons đúng order.
6. Open ít nhất L01, L03, L05, L09, L10, L16.
7. Typing hoạt động.
8. Submit đúng/sai hoạt động.
9. Feedback không lộ answer trước submit.
10. Retry/mastery hoạt động.
11. Mobile width không vỡ.
12. Không console error.

## Phase 11 · Git/GitHub

Đề xuất branch:

```text
agent/g6-u2-writing-typing
```

Commit:

```text
Add G6 U2 writing typing lessons
```

PR cần ghi:

- 16 target sentences;
- cue consistency policy;
- 3 normalized transcript targets;
- tests đã thêm;
- browser verification result.

Merge khi CI PASS.

## Phase 12 · Vercel production verification

Sau merge:

1. xác minh Vercel source repo = `thanhnguyendafa-ux/chienbinhdich`;
2. production branch = `main`;
3. deployment = READY;
4. Vercel commit SHA = GitHub main SHA;
5. mở production;
6. smoke test L01, L09, L16;
7. kiểm tra console.

Nếu SHA không trùng thì chưa nghiệm thu production.

---

# 9. Expected time / difficulty

| Lesson | Time | Difficulty |
|---|---:|---|
| 01 | 8–10 min | easy |
| 02 | 10–12 min | medium |
| 03 | 10–12 min | medium |
| 04 | 10–12 min | medium |
| 05 | 14–16 min | medium |
| 06 | 9–11 min | easy |
| 07 | 13–15 min | medium |
| 08 | 8–10 min | easy |
| 09 | 15–18 min | hard |
| 10 | 8–10 min | medium |
| 11 | 11–13 min | medium |
| 12 | 8–10 min | medium |
| 13 | 8–10 min | easy |
| 14 | 12–14 min | medium |
| 15 | 10–12 min | medium |
| 16 | 15–18 min | hard |

Không kéo lesson lên 20 phút chỉ để đủ số item.

---

# 10. Mastery / feedback policy

Đề xuất:

- `passThreshold: 80`
- `completionPolicy: all-items`
- giữ article/determiner khi chấm vì cue đã giải thích rõ;
- sai item → retry theo mastery engine hiện tại;
- teaching feedback chỉ mở sau submit.

Mỗi final item feedback nên có:

1. Correct answer.
2. Meaning reason.
3. Micro grammar reason.
4. Connection với chunk vừa luyện.

Ví dụ L06:

```text
Correct: There are six rooms in our house.
Reason: “six rooms” là nhiều phòng nên dùng ARE.
Bạn vừa xây: six rooms → in our house → there are six rooms.
```

---

# 11. Definition of Done

- [ ] 16/16 lessons tồn tại.
- [ ] 1 lesson = 1 target sentence.
- [ ] Final answer 16/16 đúng content lock.
- [ ] Không cue Việt giống nhau nhưng answer Anh khác nhau một cách mơ hồ.
- [ ] Article/determiner được cue giải thích.
- [ ] Không có sentence mẫu ngoài target.
- [ ] Không có generic formula exercise.
- [ ] Normalized targets có source note.
- [ ] G6 U2 tests PASS.
- [ ] Full regression PASS.
- [ ] Folder tree đúng.
- [ ] Browser smoke test PASS.
- [ ] Vercel deployment READY.
- [ ] Vercel production SHA = GitHub main SHA.

---

# 12. Content lock — 16 target sentences

1. `It is Elena's room.`
2. `Is there a TV behind you?`
3. `The living room is next to the kitchen.`
4. `Are there many rooms in your new flat?`
5. `There is a living room, three bedrooms, a kitchen and two bathrooms.`
6. `There are six rooms in our house.`
7. `There is a bed, a desk, a chair and a bookshelf.`
8. `I have my own bedroom.`
9. `My bedroom also has a big window and a clock on the wall.`
10. `Where do you live?`
11. `I live in a townhouse in Hanoi.`
12. `Who do you live with?`
13. `I live with my parents.`
14. `I often read books in my bedroom.`
15. `My bedroom is small but beautiful.`
16. `I love our living room the best because it is bright.`

> **Production principle:** Học sinh không phải tự đoán vì sao một từ bỗng có `a`, `the`, `my`, `our`, số nhiều hoặc auxiliary khác. Cue Việt phải làm rõ surface form ngay từ đầu; scaffold phải đi thẳng vào chính target sentence và không tạo mâu thuẫn nhận thức.
