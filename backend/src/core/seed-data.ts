/** Demo catalog. Images live in `public/uploads/seed/<img>/<n>.webp`. */

export const CATEGORIES = [
  { slug: "smartfonlar", name: "Smartfonlar", icon: "smartphone", sort: 1, active: true },
  { slug: "noutbuklar", name: "Noutbuklar", icon: "laptop", sort: 2, active: true },
  { slug: "planshetlar", name: "Planshetlar", icon: "tablet", sort: 3, active: true },
  { slug: "audio", name: "Audio va quloqchinlar", icon: "headphones", sort: 4, active: true },
  { slug: "gadjetlar", name: "Gadjetlar va aksessuarlar", icon: "watch", sort: 5, active: true },
  { slug: "oshxona-texnikasi", name: "Oshxona texnikasi", icon: "cooking-pot", sort: 6, active: true },
  { slug: "televizorlar", name: "Televizorlar", icon: "tv", sort: 7, active: false },
  { slug: "muzlatgichlar", name: "Muzlatgichlar", icon: "refrigerator", sort: 8, active: false },
  { slug: "kir-yuvish-mashinalari", name: "Kir yuvish mashinalari", icon: "washing-machine", sort: 9, active: false },
  { slug: "konditsionerlar", name: "Konditsionerlar", icon: "air-vent", sort: 10, active: false },
];

type Spec = [string, string];
export interface SeedProduct {
  cat: string;
  img: string;
  name: string;
  brand: string;
  price: number;
  old?: number;
  stock: number;
  badge?: string;
  featured?: boolean;
  warranty?: number;
  short: string;
  specs: Spec[];
}

const phone = (screen: string, chip: string, ram: string, mem: string, cam: string, bat: string): Spec[] => [
  ["Ekran", screen], ["Protsessor", chip], ["Operativ xotira", ram], ["Ichki xotira", mem],
  ["Asosiy kamera", cam], ["Batareya", bat], ["SIM-karta", "2 ta (nano + eSIM)"],
];
const laptop = (screen: string, cpu: string, ram: string, ssd: string, weight: string): Spec[] => [
  ["Ekran", screen], ["Protsessor", cpu], ["Operativ xotira", ram], ["SSD", ssd], ["Og'irligi", weight],
  ["Operatsion tizim", "O'rnatilgan, faollashtirilgan"],
];

export const PRODUCTS: SeedProduct[] = [
  { cat: "smartfonlar", img: "iphone-13-pro", name: "Apple iPhone 13 Pro 128 GB", brand: "Apple", price: 9_490_000, old: 10_990_000, stock: 12, badge: "Hit", featured: true,
    short: "ProMotion 120 Hz ekran, uchta kamera va kun bo'yi ishlaydigan batareya.",
    specs: phone("6.1\" Super Retina XDR, 120 Hz", "A15 Bionic", "6 GB", "128 GB", "12 + 12 + 12 MP", "3095 mAh") },
  { cat: "smartfonlar", img: "samsung-galaxy-s10", name: "Samsung Galaxy S10 8/128 GB", brand: "Samsung", price: 4_290_000, old: 4_990_000, stock: 8,
    short: "Dynamic AMOLED ekran, ekran ichidagi barmoq izi skaneri.",
    specs: phone("6.1\" Dynamic AMOLED", "Exynos 9820", "8 GB", "128 GB", "12 + 12 + 16 MP", "3400 mAh") },
  { cat: "smartfonlar", img: "oppo-f19-pro-plus", name: "OPPO F19 Pro+ 5G 8/128 GB", brand: "OPPO", price: 3_590_000, stock: 15, badge: "Yangi",
    short: "5G tarmoq, 50 W tez quvvatlash va 48 MP to'rtta kamera.",
    specs: phone("6.4\" AMOLED", "MediaTek Dimensity 800U", "8 GB", "128 GB", "48 + 8 + 2 + 2 MP", "4310 mAh") },
  { cat: "smartfonlar", img: "realme-xt", name: "Realme XT 8/128 GB", brand: "Realme", price: 2_490_000, old: 2_790_000, stock: 20,
    short: "64 MP kamera va katta AMOLED ekran qulay narxda.",
    specs: phone("6.4\" Super AMOLED", "Snapdragon 712", "8 GB", "128 GB", "64 + 8 + 2 + 2 MP", "4000 mAh") },
  { cat: "smartfonlar", img: "vivo-x21", name: "Vivo X21 6/128 GB", brand: "Vivo", price: 2_190_000, stock: 6,
    short: "Ingichka korpus, yorqin AMOLED ekran va tez ishlash.",
    specs: phone("6.28\" Super AMOLED", "Snapdragon 660", "6 GB", "128 GB", "12 + 5 MP", "3200 mAh") },
  { cat: "smartfonlar", img: "samsung-galaxy-s8", name: "Samsung Galaxy S8 4/64 GB", brand: "Samsung", price: 1_990_000, stock: 2,
    short: "Infinity ekranli ixcham flagman.",
    specs: phone("5.8\" Super AMOLED", "Exynos 8895", "4 GB", "64 GB", "12 MP", "3000 mAh") },
  { cat: "smartfonlar", img: "iphone-x", name: "Apple iPhone X 64 GB", brand: "Apple", price: 3_990_000, stock: 0,
    short: "Face ID va OLED ekranli birinchi ramkasiz iPhone.",
    specs: phone("5.8\" Super Retina OLED", "A11 Bionic", "3 GB", "64 GB", "12 + 12 MP", "2716 mAh") },

  { cat: "noutbuklar", img: "apple-macbook-pro-14-inch-space-grey", name: "Apple MacBook Pro 14\" M1 Pro 16/512 GB", brand: "Apple", price: 23_990_000, old: 26_500_000, stock: 4, badge: "Hit", featured: true,
    short: "Liquid Retina XDR ekran, M1 Pro chip va 17 soatgacha avtonom ishlash.",
    specs: laptop("14.2\" Liquid Retina XDR", "Apple M1 Pro, 8 yadro", "16 GB", "512 GB", "1.6 kg") },
  { cat: "noutbuklar", img: "asus-zenbook-pro-dual-screen-laptop", name: "ASUS ZenBook Pro Duo 15 OLED", brand: "ASUS", price: 21_490_000, stock: 3,
    short: "Ikki ekranli noutbuk: dizayn va montaj uchun ideal.",
    specs: laptop("15.6\" OLED 4K + ScreenPad Plus", "Intel Core i9", "32 GB", "1 TB", "2.3 kg") },
  { cat: "noutbuklar", img: "huawei-matebook-x-pro", name: "HUAWEI MateBook X Pro 13.9\"", brand: "HUAWEI", price: 14_990_000, old: 16_490_000, stock: 5,
    short: "3K sensorli ekran va metall korpus — ish va o'qish uchun.",
    specs: laptop("13.9\" 3K LTPS sensorli", "Intel Core i7", "16 GB", "512 GB", "1.33 kg") },
  { cat: "noutbuklar", img: "lenovo-yoga-920", name: "Lenovo Yoga 920 2-in-1", brand: "Lenovo", price: 9_890_000, stock: 7,
    short: "360° buriladigan transformer noutbuk, stylus qo'llab-quvvatlanadi.",
    specs: laptop("13.9\" FHD IPS sensorli", "Intel Core i7", "8 GB", "512 GB", "1.37 kg") },
  { cat: "noutbuklar", img: "new-dell-xps-13-9300-laptop", name: "Dell XPS 13 9300", brand: "Dell", price: 12_490_000, stock: 6, badge: "Yangi",
    short: "InfinityEdge ekranli eng ixcham 13 dyuymli noutbuklardan biri.",
    specs: laptop("13.4\" FHD+ InfinityEdge", "Intel Core i7 10-avlod", "16 GB", "512 GB", "1.2 kg") },

  { cat: "planshetlar", img: "ipad-mini-2021-starlight", name: "Apple iPad mini 6 64 GB Starlight", brand: "Apple", price: 6_290_000, stock: 9, featured: true,
    short: "Kichik o'lcham, katta imkoniyat: A15 chip va Apple Pencil 2.",
    specs: [["Ekran", "8.3\" Liquid Retina"], ["Protsessor", "A15 Bionic"], ["Xotira", "64 GB"], ["Ulanish", "Wi-Fi, USB-C"], ["Og'irligi", "293 g"]] },
  { cat: "planshetlar", img: "samsung-galaxy-tab-s8-plus-grey", name: "Samsung Galaxy Tab S8+ 128 GB", brand: "Samsung", price: 8_790_000, old: 9_990_000, stock: 4,
    short: "Super AMOLED 120 Hz ekran va S Pen to'plamda.",
    specs: [["Ekran", "12.4\" Super AMOLED, 120 Hz"], ["Protsessor", "Snapdragon 8 Gen 1"], ["Xotira", "8 / 128 GB"], ["Batareya", "10090 mAh"], ["To'plamda", "S Pen"]] },
  { cat: "planshetlar", img: "samsung-galaxy-tab-white", name: "Samsung Galaxy Tab A8 32 GB", brand: "Samsung", price: 2_690_000, stock: 14,
    short: "Oila va bolalar uchun qulay planshet.",
    specs: [["Ekran", "10.5\" TFT"], ["Xotira", "3 / 32 GB"], ["Batareya", "7040 mAh"], ["Ulanish", "Wi-Fi"]] },

  { cat: "audio", img: "apple-airpods", name: "Apple AirPods (2-avlod)", brand: "Apple", price: 1_590_000, old: 1_890_000, stock: 25, badge: "Hit", featured: true,
    short: "Bir tegishda ulanish va 24 soatgacha tinglash (g'ilof bilan).",
    specs: [["Turi", "Simsiz, TWS"], ["Ulanish", "Bluetooth 5.0"], ["Ishlash vaqti", "5 soat / 24 soat g'ilof bilan"], ["Chip", "Apple H1"]] },
  { cat: "audio", img: "apple-airpods-max-silver", name: "Apple AirPods Max Silver", brand: "Apple", price: 6_990_000, stock: 3,
    short: "Faol shovqin bostirish va fazoviy audio.",
    specs: [["Turi", "To'liq o'lchamli"], ["Shovqin bostirish", "Faol (ANC)"], ["Ishlash vaqti", "20 soat"], ["Chip", "Apple H1 × 2"]] },
  { cat: "audio", img: "beats-flex-wireless-earphones", name: "Beats Flex simsiz quloqchin", brand: "Beats", price: 690_000, stock: 18,
    short: "Kun bo'yi kiyish uchun yengil simsiz quloqchin.",
    specs: [["Turi", "Bo'yin tasmali"], ["Ishlash vaqti", "12 soat"], ["Zaryadlash", "USB-C"]] },
  { cat: "audio", img: "amazon-echo-plus", name: "Amazon Echo Plus aqlli kolonka", brand: "Amazon", price: 1_290_000, stock: 5,
    short: "360° ovoz va aqlli uy boshqaruvi.",
    specs: [["Ovoz", "360°, 3\" woofer"], ["Ulanish", "Wi-Fi, Bluetooth, Zigbee"]] },
  { cat: "audio", img: "apple-homepod-mini-cosmic-grey", name: "Apple HomePod mini", brand: "Apple", price: 1_390_000, stock: 7, badge: "Yangi",
    short: "Ixcham korpusda katta ovoz va Siri.",
    specs: [["Ovoz", "360° hisoblash audio"], ["Ulanish", "Wi-Fi, Bluetooth 5.0"], ["Rang", "Cosmic Grey"]] },

  { cat: "gadjetlar", img: "apple-watch-series-4-gold", name: "Apple Watch Series 4 44 mm Gold", brand: "Apple", price: 2_990_000, old: 3_490_000, stock: 6,
    short: "EKG, yiqilishni aniqlash va sport rejimlari.",
    specs: [["Korpus", "44 mm, alyuminiy"], ["Sensorlar", "EKG, yurak urishi"], ["Suv o'tkazmaslik", "50 m"]] },
  { cat: "gadjetlar", img: "apple-magsafe-battery-pack", name: "Apple MagSafe Battery Pack", brand: "Apple", price: 1_190_000, stock: 10,
    short: "iPhone uchun magnitli tashqi batareya.",
    specs: [["Sig'im", "1460 mAh"], ["Ulanish", "MagSafe"], ["Moslik", "iPhone 12 va yangilari"]] },
  { cat: "gadjetlar", img: "apple-airpower-wireless-charger", name: "Simsiz zaryadlovchi 15 W", brand: "Apple", price: 390_000, stock: 30,
    short: "Qi standartli tez simsiz zaryadlash.",
    specs: [["Quvvat", "15 W"], ["Standart", "Qi"]] },
  { cat: "gadjetlar", img: "apple-iphone-charger", name: "Apple 20 W USB-C zaryadlovchi", brand: "Apple", price: 290_000, stock: 40,
    short: "iPhone va iPad uchun original tez zaryadlovchi.",
    specs: [["Quvvat", "20 W"], ["Port", "USB-C"]] },

  { cat: "oshxona-texnikasi", img: "microwave-oven", name: "Mikroto'lqinli pech 20 L", brand: "Mir Home", price: 1_290_000, old: 1_490_000, stock: 11, featured: true, warranty: 24,
    short: "Isitish, muzdan tushirish va gril — 5 quvvat darajasi.",
    specs: [["Hajmi", "20 L"], ["Quvvat", "700 W"], ["Boshqaruv", "Mexanik"], ["Gril", "Bor"]] },
  { cat: "oshxona-texnikasi", img: "electric-stove", name: "Elektr plita 2 konforkali", brand: "Mir Home", price: 990_000, stock: 8, warranty: 24,
    short: "Shisha-keramik sirt, tez qiziydi va oson tozalanadi.",
    specs: [["Konforkalar", "2 ta"], ["Quvvat", "3000 W"], ["Sirt", "Shisha-keramika"]] },
  { cat: "oshxona-texnikasi", img: "boxed-blender", name: "Statsionar blender 1.5 L", brand: "Mir Home", price: 690_000, old: 850_000, stock: 13, warranty: 12,
    short: "Smuzi, sous va muz maydalash uchun kuchli blender.",
    specs: [["Hajmi", "1.5 L"], ["Quvvat", "600 W"], ["Tezliklar", "5 + impuls"]] },
  { cat: "oshxona-texnikasi", img: "hand-blender", name: "Qo'l blenderi 800 W", brand: "Mir Home", price: 390_000, stock: 16, warranty: 12,
    short: "Pyure va bolalar ovqati uchun qulay.",
    specs: [["Quvvat", "800 W"], ["Pichoq", "Zanglamaydigan po'lat"]] },
];

export const BANNERS = [
  { title: "Yangi mavsum — yangi texnika", subtitle: "Smartfon va noutbuklarga 15% gacha chegirma. Bepul yetkazib berish 1 mln so'mdan.",
    image: "/uploads/seed/apple-macbook-pro-14-inch-space-grey/1.webp", link: "/katalog?discount=1", cta: "Chegirmalarni ko'rish", theme: "dark", placement: "hero", sort: 1 },
  { title: "iPhone 13 Pro — 9 490 000 so'm", subtitle: "3, 6 yoki 12 oyga muddatli to'lov. Rasmiy kafolat 12 oy.",
    image: "/uploads/seed/iphone-13-pro/1.webp", link: "/mahsulot/apple-iphone-13-pro-128-gb", cta: "Batafsil", theme: "lime", placement: "hero", sort: 2 },
  { title: "Oshxona uchun aqlli yordamchilar", subtitle: "Blender, mikroto'lqinli pech va plitalar — 24 oy kafolat bilan.",
    image: "/uploads/seed/microwave-oven/1.webp", link: "/katalog/oshxona-texnikasi", cta: "Katalogga o'tish", theme: "light", placement: "hero", sort: 3 },
  { title: "Musiqa har doim yoningizda", subtitle: "AirPods va kolonkalar",
    image: "/uploads/seed/apple-airpods/1.webp", link: "/katalog/audio", cta: "Tanlash", theme: "lime", placement: "promo", sort: 1 },
  { title: "Planshetlar", subtitle: "O'qish, ish va o'yin uchun",
    image: "/uploads/seed/ipad-mini-2021-starlight/1.webp", link: "/katalog/planshetlar", cta: "Ko'rish", theme: "dark", placement: "promo", sort: 2 },
];

export const REVIEWS: [string, number, string][] = [
  ["Aziza", 5, "Juda tez yetkazib berishdi, tovar original. Rahmat!"],
  ["Jasur", 5, "Narxi bozordagidan arzon, kafolat ham bor. Tavsiya qilaman."],
  ["Dilnoza", 4, "Hammasi yaxshi, faqat qutisi biroz ezilgan edi."],
  ["Sardor", 5, "Kuryer qo'ng'iroq qilib, aytilgan vaqtda olib keldi."],
  ["Nodira", 4, "Sifati yaxshi. Muddatli to'lov juda qulay bo'ldi."],
  ["Otabek", 3, "Yaxshi, lekin rangi rasmdagidan biroz farq qiladi."],
];

export const CUSTOMERS: [string, string, string][] = [
  ["Aziza Karimova", "+998901112233", "Toshkent shahri"],
  ["Jasur Rahimov", "+998935554433", "Toshkent viloyati"],
  ["Dilnoza Yusupova", "+998977778899", "Samarqand"],
  ["Sardor Aliyev", "+998998887766", "Toshkent shahri"],
  ["Nodira Islomova", "+998946665544", "Farg'ona"],
];
