/** Demo catalog in Russian (base) and Kyrgyz (`*_ky`). Images live in `public/uploads/seed/<img>/<n>.webp`. */

export const CATEGORIES = [
  { slug: "smartfonlar", name: "Смартфоны", name_ky: "Смартфондор", icon: "smartphone", sort: 1, active: true },
  { slug: "noutbuklar", name: "Ноутбуки", name_ky: "Ноутбуктар", icon: "laptop", sort: 2, active: true },
  { slug: "planshetlar", name: "Планшеты", name_ky: "Планшеттер", icon: "tablet", sort: 3, active: true },
  { slug: "audio", name: "Аудио и наушники", name_ky: "Аудио жана кулакчындар", icon: "headphones", sort: 4, active: true },
  { slug: "gadjetlar", name: "Гаджеты и аксессуары", name_ky: "Гаджеттер жана аксессуарлар", icon: "watch", sort: 5, active: true },
  { slug: "oshxona-texnikasi", name: "Кухонная техника", name_ky: "Ашкана техникасы", icon: "cooking-pot", sort: 6, active: true },
  { slug: "televizorlar", name: "Телевизоры", name_ky: "Телевизорлор", icon: "tv", sort: 7, active: false },
  { slug: "muzlatgichlar", name: "Холодильники", name_ky: "Муздаткычтар", icon: "refrigerator", sort: 8, active: false },
  { slug: "kir-yuvish-mashinalari", name: "Стиральные машины", name_ky: "Кир жуугуч машиналар", icon: "washing-machine", sort: 9, active: false },
  { slug: "konditsionerlar", name: "Кондиционеры", name_ky: "Кондиционерлер", icon: "air-vent", sort: 10, active: false },
];

/** [label (ru), value (ru), value (ky) when it differs]. Kyrgyz labels come from `SPEC_KY`. */
type Spec = [string, string, string?];

const SPEC_KY: Record<string, string> = {
  "Экран": "Экран",
  "Процессор": "Процессор",
  "Оперативная память": "Оперативдүү эс тутум",
  "Встроенная память": "Ички эс тутум",
  "Основная камера": "Негизги камера",
  "Аккумулятор": "Аккумулятор",
  "SIM-карта": "SIM-карта",
  "SSD": "SSD",
  "Вес": "Салмагы",
  "Операционная система": "Операциялык система",
  "Память": "Эс тутум",
  "Подключение": "Туташуу",
  "В комплекте": "Топтомдо",
  "Тип": "Түрү",
  "Шумоподавление": "Ызы-чууну басуу",
  "Время работы": "Иштөө убактысы",
  "Чип": "Чип",
  "Зарядка": "Кубаттоо",
  "Звук": "Үн",
  "Цвет": "Түсү",
  "Корпус": "Корпус",
  "Датчики": "Сенсорлор",
  "Водозащита": "Сууга туруктуулук",
  "Ёмкость": "Сыйымдуулук",
  "Совместимость": "Шайкештик",
  "Мощность": "Кубаттуулук",
  "Стандарт": "Стандарт",
  "Порт": "Порт",
  "Объём": "Көлөмү",
  "Управление": "Башкаруу",
  "Гриль": "Гриль",
  "Конфорки": "Конфоркалар",
  "Поверхность": "Бети",
  "Скорости": "Ылдамдыктар",
  "Нож": "Бычак",
  "Гарантия": "Кепилдик",
};

export interface SeedProduct {
  cat: string;
  img: string;
  name: string;
  name_ky?: string;
  brand: string;
  price: number;
  old?: number;
  stock: number;
  badge?: "Хит" | "Новинка";
  featured?: boolean;
  warranty?: number;
  short: string;
  short_ky: string;
  specs: Spec[];
}

const BADGE_KY = { "Хит": "Хит", "Новинка": "Жаңы" } as const;

/** Demo UZS amounts → Kyrgyz som (nearest 100). 1 сом ≈ 145 сум. */
const som = (uzs: number) => Math.max(100, Math.round(uzs / 145 / 100) * 100);
const somText = (n: number) => `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n).replace(/\u00a0|\u202f/g, " ")} сом`;

const phone = (screen: string, chip: string, ram: string, mem: string, cam: string, bat: string): Spec[] => [
  ["Экран", screen], ["Процессор", chip], ["Оперативная память", ram], ["Встроенная память", mem],
  ["Основная камера", cam], ["Аккумулятор", bat], ["SIM-карта", "2 (nano + eSIM)"],
];
const laptop = (screen: [string, string?], cpu: [string, string?], ram: string, ssd: string, weight: string): Spec[] => [
  ["Экран", ...screen], ["Процессор", ...cpu], ["Оперативная память", ram], ["SSD", ssd], ["Вес", weight],
  ["Операционная система", "Установлена, активирована", "Орнотулган, активдештирилген"],
];

export const PRODUCTS: SeedProduct[] = [
  { cat: "smartfonlar", img: "iphone-13-pro", name: "Apple iPhone 13 Pro 128 GB", brand: "Apple", price: 9_490_000, old: 10_990_000, stock: 12, badge: "Хит", featured: true,
    short: "Экран ProMotion 120 Гц, три камеры и батарея на весь день.",
    short_ky: "ProMotion 120 Гц экран, үч камера жана күн бою иштеген батарея.",
    specs: phone("6.1\" Super Retina XDR, 120 Hz", "A15 Bionic", "6 GB", "128 GB", "12 + 12 + 12 MP", "3095 mAh") },
  { cat: "smartfonlar", img: "samsung-galaxy-s10", name: "Samsung Galaxy S10 8/128 GB", brand: "Samsung", price: 4_290_000, old: 4_990_000, stock: 8,
    short: "Экран Dynamic AMOLED и сканер отпечатка пальца в экране.",
    short_ky: "Dynamic AMOLED экран жана экрандын ичиндеги манжа изи сканери.",
    specs: phone("6.1\" Dynamic AMOLED", "Exynos 9820", "8 GB", "128 GB", "12 + 12 + 16 MP", "3400 mAh") },
  { cat: "smartfonlar", img: "oppo-f19-pro-plus", name: "OPPO F19 Pro+ 5G 8/128 GB", brand: "OPPO", price: 3_590_000, stock: 15, badge: "Новинка",
    short: "Сеть 5G, быстрая зарядка 50 Вт и четыре камеры 48 Мп.",
    short_ky: "5G тармагы, 50 Вт тез кубаттоо жана 48 Мп төрт камера.",
    specs: phone("6.4\" AMOLED", "MediaTek Dimensity 800U", "8 GB", "128 GB", "48 + 8 + 2 + 2 MP", "4310 mAh") },
  { cat: "smartfonlar", img: "realme-xt", name: "Realme XT 8/128 GB", brand: "Realme", price: 2_490_000, old: 2_790_000, stock: 20,
    short: "Камера 64 Мп и большой AMOLED-экран по доступной цене.",
    short_ky: "64 Мп камера жана чоң AMOLED экран жеткиликтүү баада.",
    specs: phone("6.4\" Super AMOLED", "Snapdragon 712", "8 GB", "128 GB", "64 + 8 + 2 + 2 MP", "4000 mAh") },
  { cat: "smartfonlar", img: "vivo-x21", name: "Vivo X21 6/128 GB", brand: "Vivo", price: 2_190_000, stock: 6,
    short: "Тонкий корпус, яркий AMOLED-экран и быстрая работа.",
    short_ky: "Ичке корпус, жаркыраган AMOLED экран жана тез иштөө.",
    specs: phone("6.28\" Super AMOLED", "Snapdragon 660", "6 GB", "128 GB", "12 + 5 MP", "3200 mAh") },
  { cat: "smartfonlar", img: "samsung-galaxy-s8", name: "Samsung Galaxy S8 4/64 GB", brand: "Samsung", price: 1_990_000, stock: 2,
    short: "Компактный флагман с экраном Infinity.",
    short_ky: "Infinity экраны бар компакттуу флагман.",
    specs: phone("5.8\" Super AMOLED", "Exynos 8895", "4 GB", "64 GB", "12 MP", "3000 mAh") },
  { cat: "smartfonlar", img: "iphone-x", name: "Apple iPhone X 64 GB", brand: "Apple", price: 3_990_000, stock: 0,
    short: "Первый безрамочный iPhone с Face ID и OLED-экраном.",
    short_ky: "Face ID жана OLED экраны бар биринчи алкаксыз iPhone.",
    specs: phone("5.8\" Super Retina OLED", "A11 Bionic", "3 GB", "64 GB", "12 + 12 MP", "2716 mAh") },

  { cat: "noutbuklar", img: "apple-macbook-pro-14-inch-space-grey", name: "Apple MacBook Pro 14\" M1 Pro 16/512 GB", brand: "Apple", price: 23_990_000, old: 26_500_000, stock: 4, badge: "Хит", featured: true,
    short: "Экран Liquid Retina XDR, чип M1 Pro и до 17 часов автономной работы.",
    short_ky: "Liquid Retina XDR экран, M1 Pro чиби жана 17 саатка чейин автономдуу иштөө.",
    specs: laptop(["14.2\" Liquid Retina XDR"], ["Apple M1 Pro, 8 ядер", "Apple M1 Pro, 8 ядро"], "16 GB", "512 GB", "1.6 кг") },
  { cat: "noutbuklar", img: "asus-zenbook-pro-dual-screen-laptop", name: "ASUS ZenBook Pro Duo 15 OLED", brand: "ASUS", price: 21_490_000, stock: 3,
    short: "Ноутбук с двумя экранами — идеален для дизайна и монтажа.",
    short_ky: "Эки экрандуу ноутбук — дизайн жана монтаж үчүн идеалдуу.",
    specs: laptop(["15.6\" OLED 4K + ScreenPad Plus"], ["Intel Core i9"], "32 GB", "1 TB", "2.3 кг") },
  { cat: "noutbuklar", img: "huawei-matebook-x-pro", name: "HUAWEI MateBook X Pro 13.9\"", brand: "HUAWEI", price: 14_990_000, old: 16_490_000, stock: 5,
    short: "Сенсорный 3K-экран и металлический корпус — для работы и учёбы.",
    short_ky: "3K сенсордук экран жана металл корпус — иш жана окуу үчүн.",
    specs: laptop(["13.9\" 3K LTPS, сенсорный", "13.9\" 3K LTPS, сенсордук"], ["Intel Core i7"], "16 GB", "512 GB", "1.33 кг") },
  { cat: "noutbuklar", img: "lenovo-yoga-920", name: "Lenovo Yoga 920 2-in-1", brand: "Lenovo", price: 9_890_000, stock: 7,
    short: "Ноутбук-трансформер с поворотом на 360°, поддерживает стилус.",
    short_ky: "360° айланган трансформер ноутбук, стилусту колдойт.",
    specs: laptop(["13.9\" FHD IPS, сенсорный", "13.9\" FHD IPS, сенсордук"], ["Intel Core i7"], "8 GB", "512 GB", "1.37 кг") },
  { cat: "noutbuklar", img: "new-dell-xps-13-9300-laptop", name: "Dell XPS 13 9300", brand: "Dell", price: 12_490_000, stock: 6, badge: "Новинка",
    short: "Один из самых компактных 13-дюймовых ноутбуков с экраном InfinityEdge.",
    short_ky: "InfinityEdge экраны бар эң компакттуу 13 дюймдук ноутбуктардын бири.",
    specs: laptop(["13.4\" FHD+ InfinityEdge"], ["Intel Core i7 10-го поколения", "Intel Core i7, 10-муун"], "16 GB", "512 GB", "1.2 кг") },

  { cat: "planshetlar", img: "ipad-mini-2021-starlight", name: "Apple iPad mini 6 64 GB Starlight", brand: "Apple", price: 6_290_000, stock: 9, featured: true,
    short: "Маленький размер, большие возможности: чип A15 и Apple Pencil 2.",
    short_ky: "Кичинекей өлчөм, чоң мүмкүнчүлүк: A15 чиби жана Apple Pencil 2.",
    specs: [["Экран", "8.3\" Liquid Retina"], ["Процессор", "A15 Bionic"], ["Память", "64 GB"], ["Подключение", "Wi-Fi, USB-C"], ["Вес", "293 г"]] },
  { cat: "planshetlar", img: "samsung-galaxy-tab-s8-plus-grey", name: "Samsung Galaxy Tab S8+ 128 GB", brand: "Samsung", price: 8_790_000, old: 9_990_000, stock: 4,
    short: "Экран Super AMOLED 120 Гц и S Pen в комплекте.",
    short_ky: "Super AMOLED 120 Гц экран жана топтомдо S Pen.",
    specs: [["Экран", "12.4\" Super AMOLED, 120 Hz"], ["Процессор", "Snapdragon 8 Gen 1"], ["Память", "8 / 128 GB"], ["Аккумулятор", "10090 mAh"], ["В комплекте", "S Pen"]] },
  { cat: "planshetlar", img: "samsung-galaxy-tab-white", name: "Samsung Galaxy Tab A8 32 GB", brand: "Samsung", price: 2_690_000, stock: 14,
    short: "Удобный планшет для всей семьи и детей.",
    short_ky: "Үй-бүлө жана балдар үчүн ыңгайлуу планшет.",
    specs: [["Экран", "10.5\" TFT"], ["Память", "3 / 32 GB"], ["Аккумулятор", "7040 mAh"], ["Подключение", "Wi-Fi"]] },

  { cat: "audio", img: "apple-airpods", name: "Apple AirPods (2-го поколения)", name_ky: "Apple AirPods (2-муун)", brand: "Apple", price: 1_590_000, old: 1_890_000, stock: 25, badge: "Хит", featured: true,
    short: "Подключение в одно касание и до 24 часов прослушивания (с футляром).",
    short_ky: "Бир тийүү менен туташуу жана 24 саатка чейин угуу (кап менен).",
    specs: [["Тип", "Беспроводные, TWS", "Зымсыз, TWS"], ["Подключение", "Bluetooth 5.0"], ["Время работы", "5 ч / 24 ч с футляром", "5 саат / кап менен 24 саат"], ["Чип", "Apple H1"]] },
  { cat: "audio", img: "apple-airpods-max-silver", name: "Apple AirPods Max Silver", brand: "Apple", price: 6_990_000, stock: 3,
    short: "Активное шумоподавление и пространственное аудио.",
    short_ky: "Активдүү ызы-чууну басуу жана мейкиндик аудиосу.",
    specs: [["Тип", "Полноразмерные", "Толук өлчөмдүү"], ["Шумоподавление", "Активное (ANC)", "Активдүү (ANC)"], ["Время работы", "20 ч", "20 саат"], ["Чип", "Apple H1 × 2"]] },
  { cat: "audio", img: "beats-flex-wireless-earphones", name: "Беспроводные наушники Beats Flex", name_ky: "Beats Flex зымсыз кулакчыны", brand: "Beats", price: 690_000, stock: 18,
    short: "Лёгкие беспроводные наушники для ношения весь день.",
    short_ky: "Күн бою тагынууга ылайыктуу жеңил зымсыз кулакчын.",
    specs: [["Тип", "С шейным ободком", "Моюн тасмасы менен"], ["Время работы", "12 ч", "12 саат"], ["Зарядка", "USB-C"]] },
  { cat: "audio", img: "amazon-echo-plus", name: "Умная колонка Amazon Echo Plus", name_ky: "Amazon Echo Plus акылдуу колонкасы", brand: "Amazon", price: 1_290_000, stock: 5,
    short: "Звук 360° и управление умным домом.",
    short_ky: "360° үн жана акылдуу үйдү башкаруу.",
    specs: [["Звук", "360°, 3\" вуфер"], ["Подключение", "Wi-Fi, Bluetooth, Zigbee"]] },
  { cat: "audio", img: "apple-homepod-mini-cosmic-grey", name: "Apple HomePod mini", brand: "Apple", price: 1_390_000, stock: 7, badge: "Новинка",
    short: "Большой звук и Siri в компактном корпусе.",
    short_ky: "Компакттуу корпуста чоң үн жана Siri.",
    specs: [["Звук", "360°, вычислительное аудио", "360°, эсептөөчү аудио"], ["Подключение", "Wi-Fi, Bluetooth 5.0"], ["Цвет", "Cosmic Grey"]] },

  { cat: "gadjetlar", img: "apple-watch-series-4-gold", name: "Apple Watch Series 4 44 mm Gold", brand: "Apple", price: 2_990_000, old: 3_490_000, stock: 6,
    short: "ЭКГ, распознавание падений и спортивные режимы.",
    short_ky: "ЭКГ, жыгылууну аныктоо жана спорттук режимдер.",
    specs: [["Корпус", "44 мм, алюминий"], ["Датчики", "ЭКГ, пульс", "ЭКГ, жүрөктүн согушу"], ["Водозащита", "50 м"]] },
  { cat: "gadjetlar", img: "apple-magsafe-battery-pack", name: "Apple MagSafe Battery Pack", brand: "Apple", price: 1_190_000, stock: 10,
    short: "Магнитный внешний аккумулятор для iPhone.",
    short_ky: "iPhone үчүн магниттүү тышкы аккумулятор.",
    specs: [["Ёмкость", "1460 mAh"], ["Подключение", "MagSafe"], ["Совместимость", "iPhone 12 и новее", "iPhone 12 жана жаңылары"]] },
  { cat: "gadjetlar", img: "apple-airpower-wireless-charger", name: "Беспроводное зарядное устройство 15 W", name_ky: "Зымсыз кубаттагыч 15 W", brand: "Apple", price: 390_000, stock: 30,
    short: "Быстрая беспроводная зарядка стандарта Qi.",
    short_ky: "Qi стандартындагы тез зымсыз кубаттоо.",
    specs: [["Мощность", "15 W"], ["Стандарт", "Qi"]] },
  { cat: "gadjetlar", img: "apple-iphone-charger", name: "Зарядное устройство Apple 20 W USB-C", name_ky: "Apple 20 W USB-C кубаттагычы", brand: "Apple", price: 290_000, stock: 40,
    short: "Оригинальное быстрое зарядное устройство для iPhone и iPad.",
    short_ky: "iPhone жана iPad үчүн оригиналдуу тез кубаттагыч.",
    specs: [["Мощность", "20 W"], ["Порт", "USB-C"]] },

  { cat: "oshxona-texnikasi", img: "microwave-oven", name: "Микроволновая печь 20 л", name_ky: "Микротолкундуу меш 20 л", brand: "Mir Home", price: 1_290_000, old: 1_490_000, stock: 11, featured: true, warranty: 24,
    short: "Разогрев, разморозка и гриль — 5 уровней мощности.",
    short_ky: "Ысытуу, эритүү жана гриль — 5 кубаттуулук деңгээли.",
    specs: [["Объём", "20 л"], ["Мощность", "700 W"], ["Управление", "Механическое", "Механикалык"], ["Гриль", "Есть", "Бар"]] },
  { cat: "oshxona-texnikasi", img: "electric-stove", name: "Электроплита на 2 конфорки", name_ky: "2 конфоркалуу электр плитасы", brand: "Mir Home", price: 990_000, stock: 8, warranty: 24,
    short: "Стеклокерамическая поверхность, быстро нагревается и легко чистится.",
    short_ky: "Айнек-керамика бети, тез ысыйт жана оңой тазаланат.",
    specs: [["Конфорки", "2"], ["Мощность", "3000 W"], ["Поверхность", "Стеклокерамика", "Айнек-керамика"]] },
  { cat: "oshxona-texnikasi", img: "boxed-blender", name: "Стационарный блендер 1,5 л", name_ky: "Стационардык блендер 1,5 л", brand: "Mir Home", price: 690_000, old: 850_000, stock: 13, warranty: 12,
    short: "Мощный блендер для смузи, соусов и колки льда.",
    short_ky: "Смузи, соус жана муз майдалоо үчүн күчтүү блендер.",
    specs: [["Объём", "1.5 л"], ["Мощность", "600 W"], ["Скорости", "5 + импульс"]] },
  { cat: "oshxona-texnikasi", img: "hand-blender", name: "Погружной блендер 800 W", name_ky: "Кол блендери 800 W", brand: "Mir Home", price: 390_000, stock: 16, warranty: 12,
    short: "Удобен для пюре и детского питания.",
    short_ky: "Пюре жана балдар тамагы үчүн ыңгайлуу.",
    specs: [["Мощность", "800 W"], ["Нож", "Нержавеющая сталь", "Дат баспаган болот"]] },
];

for (const p of PRODUCTS) {
  p.price = som(p.price);
  if (p.old) p.old = som(p.old);
}

/** Every stored text of a seed product, in both languages. */
export function productTexts(p: SeedProduct) {
  const warranty = p.warranty ?? 12;
  const nameKy = p.name_ky ?? p.name;
  return {
    name: p.name,
    name_ky: p.name_ky ?? "",
    short_description: p.short,
    short_description_ky: p.short_ky,
    description:
      `${p.short}\n\n${p.name} — с официальной гарантией от магазина Mir. Заказ доставят наши собственные курьеры, ` +
      `оплата при получении наличными или картой.\n\nВ комплекте: устройство, документы и гарантийный талон.`,
    description_ky:
      `${p.short_ky}\n\n${nameKy} — Mir дүкөнүнөн расмий кепилдик менен. Буйрутмаңызды өз курьерлерибиз жеткирет, ` +
      `төлөмдү алганда накталай же карта менен төлөйсүз.\n\nТоптомдо: түзмөк, документтер жана кепилдик талону.`,
    specs: [
      ...p.specs.map(([label, value]) => ({ label, value })),
      { label: "Гарантия", value: `${warranty} мес.` },
    ],
    specs_ky: [
      ...p.specs.map(([label, value, valueKy]) => ({ label: SPEC_KY[label] ?? label, value: valueKy ?? value })),
      { label: SPEC_KY["Гарантия"], value: `${warranty} ай` },
    ],
    badge: p.badge ?? null,
    badge_ky: p.badge ? BADGE_KY[p.badge] : "",
  };
}

export const BANNERS = [
  { title: "Новый сезон — новая техника", title_ky: "Жаңы сезон — жаңы техника",
    subtitle: `Скидки до 15% на смартфоны и ноутбуки. Бесплатная доставка от ${somText(7_000)}.`,
    subtitle_ky: `Смартфондор жана ноутбуктарга 15% чейин арзандатуу. ${somText(7_000)}дон баштап акысыз жеткирүү.`,
    image: "/uploads/seed/apple-macbook-pro-14-inch-space-grey/1.webp", link: "/katalog?discount=1",
    cta: "Смотреть скидки", cta_ky: "Арзандатууларды көрүү", theme: "dark", placement: "hero", sort: 1 },
  { title: `iPhone 13 Pro — ${somText(PRODUCTS[0].price)}`, title_ky: `iPhone 13 Pro — ${somText(PRODUCTS[0].price)}`,
    subtitle: "Рассрочка на 3, 6 или 12 месяцев. Официальная гарантия 12 месяцев.",
    subtitle_ky: "3, 6 же 12 айга бөлүп төлөө. Расмий кепилдик 12 ай.",
    image: "/uploads/seed/iphone-13-pro/1.webp", link: "/mahsulot/apple-iphone-13-pro-128-gb",
    cta: "Подробнее", cta_ky: "Кененирээк", theme: "lime", placement: "hero", sort: 2 },
  { title: "Умные помощники для кухни", title_ky: "Ашкана үчүн акылдуу жардамчылар",
    subtitle: "Блендеры, микроволновки и плиты — с гарантией 24 месяца.",
    subtitle_ky: "Блендерлер, микротолкундуу мештер жана плиталар — 24 ай кепилдик менен.",
    image: "/uploads/seed/microwave-oven/1.webp", link: "/katalog/oshxona-texnikasi",
    cta: "В каталог", cta_ky: "Каталогго өтүү", theme: "light", placement: "hero", sort: 3 },
  { title: "Музыка всегда с вами", title_ky: "Музыка дайыма жаныңызда",
    subtitle: "AirPods и колонки", subtitle_ky: "AirPods жана колонкалар",
    image: "/uploads/seed/apple-airpods/1.webp", link: "/katalog/audio",
    cta: "Выбрать", cta_ky: "Тандоо", theme: "lime", placement: "promo", sort: 1 },
  { title: "Планшеты", title_ky: "Планшеттер",
    subtitle: "Для учёбы, работы и игр", subtitle_ky: "Окуу, иш жана оюн үчүн",
    image: "/uploads/seed/ipad-mini-2021-starlight/1.webp", link: "/katalog/planshetlar",
    cta: "Смотреть", cta_ky: "Көрүү", theme: "dark", placement: "promo", sort: 2 },
];

export const REVIEWS: [string, number, string][] = [
  ["Айгерим", 5, "Абдан тез жеткиришти, товар оригинал. Рахмат!"],
  ["Нурлан", 5, "Баасы базардагыдан төмөн, кепилдик бар. Сунуштайм."],
  ["Айзада", 4, "Баары жакшы, куту гана бир аз бүктөлгөн."],
  ["Бакыт", 5, "Курьер чалып, макулдашкан убакта алып келди."],
  ["Жылдыз", 4, "Сапаты жакшы. Бөлүп төлөө абдан ыңгайлуу."],
  ["Эрлан", 3, "Жакшы, бирок түсү сүрөттөгүдөн бир аз айырмаланат."],
];

/** The one pending review on the first product. */
export const PENDING_REVIEW: [string, number, string] = ["Асел", 5, "Эң сонун телефон, камерасы супер!"];

export const CUSTOMERS: [string, string, string][] = [
  ["Айгерим Бекмаматова", "+996555323111", "Өзгөн"],
  ["Нурлан Садыков", "+996700323443", "Ош"],
  ["Айзада Токтосунова", "+996777323889", "Кара-Суу"],
  ["Бакыт Асанов", "+996550323776", "Өзгөн"],
  ["Жылдыз Мамытова", "+996500323554", "Ноокат"],
];
