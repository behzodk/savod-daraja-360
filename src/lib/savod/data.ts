import type {
  DemoProfile,
  Passage,
  Student,
  AssessmentResult,
} from "./types";

const tokenize = (text: string): { text: string }[] =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ text: w }));

const akmalText =
  "Akmal maktabga ketayotganda daftarini uyda qoldirganini esladi. U tezda ortiga qaytdi. Daftarini olib chiqquncha avtobus ketib qoldi. Akmal maktabga piyoda borishga majbur bo‘ldi. Ertasi kuni u sumkasini uydan chiqishdan oldin tekshirdi.";

const niholText =
  "Nihol darchaning yonida o‘sayotgan kichik bir daraxt edi. Har kuni quyosh uni isitar, yomg‘ir esa ildizlariga kuch berardi. Bir kuni Akmal uning yoniga o‘tirib, daftariga niholning soyasini chizdi. Oradan oylar o‘tdi va nihol katta daraxtga aylandi. Endi u Akmalning o‘zini soyada saqlardi.";

const kalitText =
  "Sevara uyga qaytganda eshik oldida kalitini topa olmadi. U sumkasini, paltosini va hatto maktab partasini ham eslab ko‘rdi. Birdan u kalitni do‘koni peshtaxtasida qoldirganini esladi. Sevara do‘konga yugurdi, lekin do‘kon allaqachon yopilgan edi. U qo‘shni xolasiga qo‘ng‘iroq qildi va onasi qaytgunicha xolasinikida kutib turdi. Ertasi kuni Sevara kaliti uchun maxsus zanjirli ilgich sotib oldi.";

export const passages: Passage[] = [
  {
    id: "akmal",
    title: "Akmalning daftari",
    grade: 3,
    topic: "Mas’uliyat",
    skill: "Sabab va natija",
    wordCount: tokenize(akmalText).length,
    text: akmalText,
    words: tokenize(akmalText),
    expectedConcepts: [
      { id: "c1", label: "Daftar uyda qoldi" },
      { id: "c2", label: "Akmal uyga qaytdi" },
      { id: "c3", label: "Akmal kechikdi" },
      { id: "c4", label: "Avtobus ketdi" },
      { id: "c5", label: "Akmal piyoda bordi" },
      { id: "c6", label: "Ertasi kuni sumkani tekshirdi" },
    ],
    expectedRelations: [
      { from: "c1", to: "c2", label: "shuning uchun" },
      { from: "c2", to: "c3", label: "natijada" },
      { from: "c3", to: "c4", label: "shu sababli" },
      { from: "c4", to: "c5", label: "natijada" },
      { from: "c5", to: "c6", label: "shuning uchun" },
    ],
    inferenceQuestion:
      "Akmal sumkasini uydan chiqishdan oldin tekshirganida, voqea qanday o‘zgarishi mumkin edi?",
    inferenceRubric: [
      "Sumkani oldindan tekshirishni tushundi",
      "Uyga qaytish zarur bo‘lmasligini tushundi",
      "Avtobusga ulgurishi mumkinligini xulosa qildi",
    ],
  },
  {
    id: "nihol",
    title: "Niholning soyasi",
    grade: 3,
    topic: "Tabiat",
    skill: "Ketma-ketlik",
    wordCount: tokenize(niholText).length,
    text: niholText,
    words: tokenize(niholText),
    expectedConcepts: [
      { id: "n1", label: "Nihol o‘sa boshladi" },
      { id: "n2", label: "Quyosh va yomg‘ir kuch berdi" },
      { id: "n3", label: "Akmal soyasini chizdi" },
      { id: "n4", label: "Nihol daraxtga aylandi" },
      { id: "n5", label: "Akmalga soya berdi" },
    ],
    expectedRelations: [
      { from: "n1", to: "n2" },
      { from: "n2", to: "n4" },
      { from: "n3", to: "n5" },
      { from: "n4", to: "n5" },
    ],
    inferenceQuestion:
      "Akmal niholni parvarish qilmaganida, hikoya oxiri qanday tugashi mumkin edi?",
    inferenceRubric: [
      "Daraxt yetilmasligini tushundi",
      "Soya bo‘lmasligini tushundi",
      "Sabab va natijani bog‘ladi",
    ],
  },
  {
    id: "kalit",
    title: "Yo‘qolgan kalit",
    grade: 4,
    topic: "Muammo yechish",
    skill: "Xulosa chiqarish",
    wordCount: tokenize(kalitText).length,
    text: kalitText,
    words: tokenize(kalitText),
    expectedConcepts: [
      { id: "k1", label: "Kalit yo‘qoldi" },
      { id: "k2", label: "Sevara izladi" },
      { id: "k3", label: "Do‘konda qoldirgan" },
      { id: "k4", label: "Do‘kon yopilgan" },
      { id: "k5", label: "Xolasinikida kutdi" },
      { id: "k6", label: "Zanjirli ilgich sotib oldi" },
    ],
    expectedRelations: [
      { from: "k1", to: "k2" },
      { from: "k3", to: "k4" },
      { from: "k4", to: "k5" },
      { from: "k1", to: "k6" },
    ],
    inferenceQuestion:
      "Sevara kalitini har doim zanjirli ilgichda olib yurganida, qanday muammolar oldini olishi mumkin edi?",
    inferenceRubric: [
      "Kalit yo‘qolmasligini tushundi",
      "Vaqt yo‘qotmaslikni xulosa qildi",
      "Xavfsizroq odat haqida fikrladi",
    ],
  },
];

export const students: Student[] = [
  {
    id: "azizbek",
    name: "Azizbek Rasulov",
    age: 9,
    classroom: "3-“A” sinf",
    lastAssessmentDate: "2026-06-24",
    profile: "Tushunish yordami kerak",
    scores: { decoding: 96, fluency: 91, comprehension: 44 },
    trend: [
      { decoding: 90, fluency: 84, comprehension: 48 },
      { decoding: 93, fluency: 88, comprehension: 46 },
      { decoding: 96, fluency: 91, comprehension: 44 },
    ],
  },
  {
    id: "madina",
    name: "Madina Jo‘rayeva",
    age: 9,
    classroom: "3-“A” sinf",
    lastAssessmentDate: "2026-06-25",
    profile: "Ravonlik yordami kerak",
    scores: { decoding: 93, fluency: 61, comprehension: 89 },
    trend: [
      { decoding: 88, fluency: 55, comprehension: 84 },
      { decoding: 90, fluency: 58, comprehension: 86 },
      { decoding: 93, fluency: 61, comprehension: 89 },
    ],
  },
  {
    id: "jasur",
    name: "Jasur Abduqodirov",
    age: 9,
    classroom: "3-“A” sinf",
    lastAssessmentDate: "2026-06-22",
    profile: "Dekodlash yordami kerak",
    scores: { decoding: 67, fluency: 58, comprehension: 64 },
    trend: [
      { decoding: 60, fluency: 52, comprehension: 58 },
      { decoding: 64, fluency: 55, comprehension: 61 },
      { decoding: 67, fluency: 58, comprehension: 64 },
    ],
  },
  { id: "nodira", name: "Nodira Tursunova", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-23", profile: "Mustaqil o‘quvchi", scores: { decoding: 95, fluency: 90, comprehension: 88 } },
  { id: "shaxnoza", name: "Shaxnoza Yo‘ldosheva", age: 8, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-21", profile: "Mustaqil o‘quvchi", scores: { decoding: 94, fluency: 86, comprehension: 84 } },
  { id: "javohir", name: "Javohir Saidov", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-20", profile: "Ravonlik yordami kerak", scores: { decoding: 89, fluency: 64, comprehension: 78 } },
  { id: "diyora", name: "Diyora Ergasheva", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-19", profile: "Tushunish yordami kerak", scores: { decoding: 91, fluency: 85, comprehension: 51 } },
  { id: "sardor", name: "Sardor Rahimov", age: 10, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-18", profile: "Dekodlash yordami kerak", scores: { decoding: 62, fluency: 60, comprehension: 70 } },
  { id: "malika", name: "Malika Hamidova", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-17", profile: "Mustaqil o‘quvchi", scores: { decoding: 93, fluency: 88, comprehension: 86 } },
  { id: "ruslan", name: "Ruslan Olimov", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-16", profile: "Tushunish yordami kerak", scores: { decoding: 88, fluency: 82, comprehension: 49 } },
  { id: "kamola", name: "Kamola Sodiqova", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-15", profile: "Mustaqil o‘quvchi", scores: { decoding: 92, fluency: 87, comprehension: 83 } },
  { id: "umid", name: "Umid Qosimov", age: 10, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-14", profile: "Ravonlik yordami kerak", scores: { decoding: 86, fluency: 63, comprehension: 80 } },
  { id: "feruza", name: "Feruza Salimova", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-13", profile: "Tushunish yordami kerak", scores: { decoding: 90, fluency: 84, comprehension: 53 } },
  { id: "begzod", name: "Begzod Olimjonov", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-12", profile: "Dekodlash yordami kerak", scores: { decoding: 65, fluency: 59, comprehension: 67 } },
  { id: "iroda", name: "Iroda Tojiboyeva", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-11", profile: "Mustaqil o‘quvchi", scores: { decoding: 94, fluency: 89, comprehension: 87 } },
  { id: "asilbek", name: "Asilbek Mahmudov", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-10", profile: "Tushunish yordami kerak", scores: { decoding: 87, fluency: 80, comprehension: 50 } },
  { id: "lola", name: "Lola Botirova", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-09", profile: "Ravonlik yordami kerak", scores: { decoding: 88, fluency: 65, comprehension: 79 } },
  { id: "doston", name: "Doston Rashidov", age: 10, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-08", profile: "Dekodlash yordami kerak", scores: { decoding: 64, fluency: 56, comprehension: 65 } },
  { id: "gulnoza", name: "Gulnoza Mirzayeva", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-07", profile: "Mustaqil o‘quvchi", scores: { decoding: 91, fluency: 85, comprehension: 82 } },
  { id: "bekzod", name: "Bekzod Yusupov", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-06", profile: "Qayta baholash kerak" },
  { id: "ravshan", name: "Ravshan Karimov", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-05", profile: "Tushunish yordami kerak", scores: { decoding: 89, fluency: 83, comprehension: 54 } },
  { id: "shahnoza", name: "Shahnoza Asadova", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-04", profile: "Mustaqil o‘quvchi", scores: { decoding: 90, fluency: 86, comprehension: 81 } },
  { id: "abdulla", name: "Abdulla Nasriddinov", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-03", profile: "Ravonlik yordami kerak", scores: { decoding: 87, fluency: 62, comprehension: 77 } },
  { id: "zarina", name: "Zarina Qudratova", age: 9, classroom: "3-“A” sinf", lastAssessmentDate: "2026-06-02", profile: "Qayta baholash kerak" },
];

// Demo profile for Azizbek + Akmal
const akmalWordCount = tokenize(akmalText).length;

const buildAllCorrect = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    index: i,
    status: "correct" as const,
    startTime: i * 0.62,
  }));

const azizbekEvents = buildAllCorrect(akmalWordCount).map((e) => {
  // Words tokenized: ["Akmal","maktabga","ketayotganda","daftarini","uyda","qoldirganini","esladi.","U","tezda","ortiga","qaytdi.","Daftarini","olib","chiqquncha","avtobus","ketib","qoldi.","Akmal","maktabga","piyoda","borishga","majbur","bo‘ldi.","Ertasi","kuni","u","sumkasini","uydan","chiqishdan","oldin","tekshirdi."]
  if (e.index === 2)
    return { ...e, status: "hesitation" as const, startTime: 1.2 };
  if (e.index === 4)
    return { ...e, status: "omitted" as const, startTime: 2.5 };
  if (e.index === 14)
    return {
      ...e,
      status: "substituted" as const,
      detectedText: "avtobusni",
      confidence: 0.81,
      startTime: 8.6,
    };
  if (e.index === 13)
    return { ...e, status: "hesitation" as const, startTime: 7.4 };
  return e;
});

export const demoProfiles: DemoProfile[] = [
  {
    id: "fluent_low_comp",
    label: "Ravon, lekin tushunish zaif",
    studentId: "azizbek",
    scores: { decoding: 94, fluency: 88, comprehension: 52 },
    wordsPerMinute: 92,
    durationSeconds: 30,
    wordEvents: azizbekEvents,
    pauses: [
      { beforeWordIndex: 2, atTime: 1.4, durationSec: 1.4 },
      { beforeWordIndex: 13, atTime: 7.4, durationSec: 1.1 },
    ],
    retellingTranscript:
      "Akmal maktabga ketayotgan edi. U uyga qaytdi. Keyin avtobus ketib qoldi va u maktabga piyoda bordi.",
    detectedConcepts: ["c2", "c4", "c5"],
    missingConcepts: ["c1", "c3", "c6"],
    detectedRelations: ["c4->c5"],
    missingRelations: ["c1->c2", "c2->c3", "c3->c4", "c5->c6"],
    inferenceTranscript:
      "U daftarini unutmagan bo‘lardi va avtobusga ulgurardi.",
    inferenceCriteria: [
      { id: "r1", text: "Sumkani oldindan tekshirishni tushundi", detected: true },
      { id: "r2", text: "Uyga qaytish zarur bo‘lmasligini tushundi", detected: true },
      { id: "r3", text: "Avtobusga ulgurishi mumkinligini xulosa qildi", detected: true },
    ],
    diagnosis:
      "Azizbek matnni ravon va deyarli xatosiz o‘qidi. U voqealarning ko‘p qismini eslab qoldi, ammo daftar uchun uyga qaytish kechikishga, kechikish esa avtobusni o‘tkazib yuborishga sabab bo‘lganini qayta hikoyada tushuntirmadi.",
    recommendation: "Sabab va natija zanjiri mashqi",
    profile: "Tushunish yordami kerak",
  },
  {
    id: "slow_high_comp",
    label: "Sekin, lekin yaxshi tushunadi",
    studentId: "madina",
    scores: { decoding: 91, fluency: 63, comprehension: 92 },
    wordsPerMinute: 64,
    durationSeconds: 48,
    wordEvents: buildAllCorrect(akmalWordCount).map((e) => {
      if ([2, 7, 13, 19, 24].includes(e.index))
        return { ...e, status: "hesitation" as const };
      return e;
    }),
    pauses: [
      { beforeWordIndex: 2, atTime: 2.2, durationSec: 1.8 },
      { beforeWordIndex: 13, atTime: 11, durationSec: 2.1 },
      { beforeWordIndex: 19, atTime: 18, durationSec: 1.5 },
      { beforeWordIndex: 24, atTime: 26, durationSec: 1.4 },
    ],
    retellingTranscript:
      "Akmal daftarini uyda qoldirgani uchun uyga qaytdi. Shuning uchun kechikib avtobusga ulgurmadi va piyoda bordi. Ertasi kuni esa hamma narsani oldindan tekshirib chiqdi.",
    detectedConcepts: ["c1", "c2", "c3", "c4", "c5", "c6"],
    missingConcepts: [],
    detectedRelations: ["c1->c2", "c2->c3", "c3->c4", "c4->c5", "c5->c6"],
    missingRelations: [],
    inferenceTranscript:
      "Agar Akmal sumkasini oldin tekshirsa, uyga qaytmasdi va avtobusga ulgurardi.",
    inferenceCriteria: [
      { id: "r1", text: "Sumkani oldindan tekshirishni tushundi", detected: true },
      { id: "r2", text: "Uyga qaytish zarur bo‘lmasligini tushundi", detected: true },
      { id: "r3", text: "Avtobusga ulgurishi mumkinligini xulosa qildi", detected: true },
    ],
    diagnosis:
      "Madina matnni sekinroq, pauzalar bilan o‘qidi, ammo voqealar zanjirini to‘liq tushundi va sabab-natija bog‘lanishini aniq tushuntirdi.",
    recommendation: "Ravon o‘qish mashqlari (takroriy o‘qish, gaplarni bo‘lib o‘qish)",
    profile: "Ravonlik yordami kerak",
  },
  {
    id: "decoding_hard",
    label: "Dekodlashda qiyinchilik",
    studentId: "jasur",
    scores: { decoding: 66, fluency: 57, comprehension: 61 },
    wordsPerMinute: 52,
    durationSeconds: 55,
    wordEvents: buildAllCorrect(akmalWordCount).map((e) => {
      if ([1, 5, 11, 17, 22].includes(e.index))
        return {
          ...e,
          status: "substituted" as const,
          detectedText: "—",
          confidence: 0.62,
        };
      if ([3, 9].includes(e.index))
        return { ...e, status: "omitted" as const };
      if ([2, 6, 14, 20].includes(e.index))
        return { ...e, status: "hesitation" as const };
      return e;
    }),
    pauses: [
      { beforeWordIndex: 2, atTime: 1.8, durationSec: 1.9 },
      { beforeWordIndex: 6, atTime: 5.2, durationSec: 1.6 },
      { beforeWordIndex: 14, atTime: 16, durationSec: 2.4 },
    ],
    retellingTranscript:
      "Bola maktabga ketdi. Avtobus ketib qoldi. U yurib bordi.",
    detectedConcepts: ["c4", "c5"],
    missingConcepts: ["c1", "c2", "c3", "c6"],
    detectedRelations: ["c4->c5"],
    missingRelations: ["c1->c2", "c2->c3", "c3->c4", "c5->c6"],
    inferenceTranscript: "Bilmadim. Sumkasini olardi.",
    inferenceCriteria: [
      { id: "r1", text: "Sumkani oldindan tekshirishni tushundi", detected: true },
      { id: "r2", text: "Uyga qaytish zarur bo‘lmasligini tushundi", detected: false },
      { id: "r3", text: "Avtobusga ulgurishi mumkinligini xulosa qildi", detected: false },
    ],
    diagnosis:
      "Jasur ayrim so‘zlarni tanishda qiynaldi va bir nechta so‘zlarni almashtirdi. Bu ravonlik va mazmunni tushunishga ham ta’sir qildi.",
    recommendation: "So‘zlarni tanish bo‘yicha bosqichli mashqlar",
    profile: "Dekodlash yordami kerak",
  },
];

// Initial seed assessment results
export const seedAssessments: AssessmentResult[] = [];

export const teacher = {
  name: "Dilnoza Karimova",
  school: "Jizzax shahar 12-maktab",
  classroom: "3-“A” sinf",
};
