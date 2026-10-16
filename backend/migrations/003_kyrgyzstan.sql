-- Move the demo store from Uzbekistan (UZS, +998) to Kyrgyzstan (KGS, +996).
-- Runs once. Fresh installs seed Kyrgyz data after this and match the same numbers.

UPDATE products
SET price = GREATEST(100, ROUND(price / 145.0 / 100) * 100),
    old_price = CASE WHEN old_price IS NULL THEN NULL ELSE GREATEST(100, ROUND(old_price / 145.0 / 100) * 100) END
WHERE price >= 250000;

UPDATE order_items
SET price = GREATEST(100, ROUND(price / 145.0 / 100) * 100),
    line_total = GREATEST(100, ROUND(line_total / 145.0 / 100) * 100)
WHERE price >= 250000;

UPDATE orders
SET subtotal = GREATEST(0, ROUND(subtotal / 145.0 / 100) * 100),
    delivery_fee = CASE WHEN delivery_fee = 0 THEN 0 ELSE 200 END,
    total = GREATEST(0, ROUND(subtotal / 145.0 / 100) * 100) + CASE WHEN delivery_fee = 0 THEN 0 ELSE 200 END
WHERE subtotal >= 250000;

UPDATE settings
SET value = jsonb_build_object(
  'store_name', 'Mir',
  'tagline', 'Бытовая техника и электроника',
  'tagline_ky', 'Тиричилик техникасы жана электроника',
  'phone', '+996 555 323 300',
  'phone2', COALESCE(value->>'phone2', ''),
  'address', 'Кыргызстан, Ошская область, г. Узген, ул. Манаса, 25',
  'address_ky', 'Кыргызстан, Ош облусу, Өзгөн шаары, Манас көчөсү, 25',
  'hours', COALESCE(value->>'hours', 'Ежедневно 09:00 – 20:00'),
  'hours_ky', COALESCE(value->>'hours_ky', 'Күн сайын 09:00 – 20:00'),
  'telegram', COALESCE(value->>'telegram', ''),  -- renamed to whatsapp in 005_whatsapp.sql
  'instagram', COALESCE(value->>'instagram', ''),
  'delivery_fee', 200,
  'free_delivery_from', 7000,
  'delivery_note', 'Доставка по Узгену и Ошской области за 1–2 дня собственными курьерами',
  'delivery_note_ky', 'Өзгөн жана Ош облусу боюнча 1–2 күндө өз курьерлерибиз жеткирет',
  'regions', '["Өзгөн","Ош","Кара-Суу","Ноокат","Араван","Кара-Кулжа","Алай","Бишкек","Жалал-Абад","Ысык-Көл","Нарын","Талас","Баткен"]'::jsonb,
  'installment', COALESCE(value->'installment', '[{"months":3,"percent":0},{"months":6,"percent":12},{"months":12,"percent":24}]'::jsonb)
)
WHERE key = 'store'
  AND (
    value->>'phone' LIKE '%998%'
    OR value->>'address' LIKE '%Андижан%'
    OR value->>'address' LIKE '%Анжиян%'
    OR value->>'address' LIKE '%Бишкек%'
    OR value->>'address' LIKE '%Чуй%'
    OR value->>'address' LIKE '%Чүй%'
  );

UPDATE banners
SET subtitle = 'Скидки до 15% на смартфоны и ноутбуки. Бесплатная доставка от 7 000 сом.',
    subtitle_ky = 'Смартфондор жана ноутбуктарга 15% чейин арзандатуу. 7 000 сомдон баштап акысыз жеткирүү.'
WHERE subtitle LIKE '%сум%';

UPDATE banners
SET title = 'iPhone 13 Pro — 65 400 сом',
    title_ky = 'iPhone 13 Pro — 65 400 сом'
WHERE title LIKE '%сум%';

UPDATE reviews SET
  author = CASE author
    WHEN 'Азиза' THEN 'Айгерим' WHEN 'Aziza' THEN 'Айгерим'
    WHEN 'Жасур' THEN 'Нурлан' WHEN 'Jasur' THEN 'Нурлан'
    WHEN 'Дилноза' THEN 'Айзада' WHEN 'Dilnoza' THEN 'Айзада'
    WHEN 'Сардор' THEN 'Бакыт' WHEN 'Sardor' THEN 'Бакыт'
    WHEN 'Нодира' THEN 'Жылдыз' WHEN 'Nodira' THEN 'Жылдыз'
    WHEN 'Отабек' THEN 'Эрлан' WHEN 'Otabek' THEN 'Эрлан'
    WHEN 'Камола' THEN 'Асел' WHEN 'Kamola' THEN 'Асел'
    ELSE author END,
  text = CASE text
    WHEN 'Очень быстро доставили, товар оригинальный. Спасибо!' THEN 'Абдан тез жеткиришти, товар оригинал. Рахмат!'
    WHEN 'Цена ниже, чем на рынке, и есть гарантия. Рекомендую.' THEN 'Баасы базардагыдан төмөн, кепилдик бар. Сунуштайм.'
    WHEN 'Всё хорошо, только коробка была немного помята.' THEN 'Баары жакшы, куту гана бир аз бүктөлгөн.'
    WHEN 'Курьер позвонил и привёз в оговорённое время.' THEN 'Курьер чалып, макулдашкан убакта алып келди.'
    WHEN 'Качество хорошее. Рассрочка очень удобная.' THEN 'Сапаты жакшы. Бөлүп төлөө абдан ыңгайлуу.'
    WHEN 'Хорошо, но цвет немного отличается от фото.' THEN 'Жакшы, бирок түсү сүрөттөгүдөн бир аз айырмаланат.'
    WHEN 'Отличный телефон, камера супер!' THEN 'Эң сонун телефон, камерасы супер!'
    ELSE text END
WHERE author IN ('Азиза','Жасур','Дилноза','Сардор','Нодира','Отабек','Камола','Aziza','Jasur','Dilnoza','Sardor','Nodira','Otabek','Kamola');

UPDATE users SET full_name = 'Айгерим Менеджер', phone = '+996555323001' WHERE username = 'manager' AND (phone LIKE '+998%' OR phone LIKE '+996555000001');
UPDATE users SET full_name = 'Нурлан Курьер', phone = '+996700323002' WHERE username = 'courier1' AND (phone LIKE '+998%' OR phone LIKE '+996700000002');
UPDATE users SET full_name = 'Бакыт Курьер', phone = '+996555323003' WHERE username = 'courier2' AND (phone LIKE '+998%' OR phone LIKE '+996555000003');

UPDATE orders SET customer_name = CASE customer_name
  WHEN 'Азиза Каримова' THEN 'Айгерим Бекмаматова'
  WHEN 'Жасур Рахимов' THEN 'Нурлан Садыков'
  WHEN 'Дилноза Юсупова' THEN 'Айзада Токтосунова'
  WHEN 'Сардор Алиев' THEN 'Бакыт Асанов'
  WHEN 'Нодира Исламова' THEN 'Жылдыз Мамытова'
  ELSE customer_name END
WHERE customer_name IN ('Азиза Каримова','Жасур Рахимов','Дилноза Юсупова','Сардор Алиев','Нодира Исламова');

UPDATE orders SET region = CASE region
  WHEN 'Андижан' THEN 'Өзгөн'
  WHEN 'г. Андижан' THEN 'Өзгөн'
  WHEN 'г. Ташкент' THEN 'Өзгөн'
  WHEN 'Ташкентская область' THEN 'Ош'
  WHEN 'Бухара' THEN 'Ош'
  WHEN 'Фергана' THEN 'Кара-Суу'
  WHEN 'Джизак' THEN 'Ноокат'
  WHEN 'Хорезм' THEN 'Араван'
  WHEN 'Наманган' THEN 'Кара-Кулжа'
  WHEN 'Навои' THEN 'Алай'
  WHEN 'Кашкадарья' THEN 'Ош'
  WHEN 'Каракалпакстан' THEN 'Баткен'
  WHEN 'Самарканд' THEN 'Ош'
  WHEN 'Сырдарья' THEN 'Өзгөн'
  WHEN 'Сурхандарья' THEN 'Жалал-Абад'
  WHEN 'Чүй облусу' THEN 'Өзгөн'
  WHEN 'Жалал-Абад облусу' THEN 'Жалал-Абад'
  WHEN 'Ысык-Көл облусу' THEN 'Ысык-Көл'
  WHEN 'Нарын облусу' THEN 'Нарын'
  WHEN 'Талас облусу' THEN 'Талас'
  WHEN 'Баткен облусу' THEN 'Баткен'
  ELSE region END
WHERE region IN (
  'Андижан','г. Андижан','г. Ташкент','Ташкентская область','Бухара','Фергана','Джизак','Хорезм',
  'Наманган','Навои','Кашкадарья','Каракалпакстан','Самарканд','Сырдарья','Сурхандарья',
  'Чүй облусу','Жалал-Абад облусу','Ысык-Көл облусу','Нарын облусу','Талас облусу','Баткен облусу'
);

UPDATE orders SET phone = regexp_replace(phone, '^\+998', '+996') WHERE phone LIKE '+998%';
UPDATE orders SET address = 'Манас көчөсү, 12' WHERE address LIKE '%Мустакиллик%' OR address LIKE '%Чуй%';
UPDATE users SET phone = regexp_replace(phone, '^\+998', '+996') WHERE phone LIKE '+998%';
UPDATE order_events SET note = 'Буйрутма сайттан кабыл алынды' WHERE note = 'Заказ принят с сайта';
