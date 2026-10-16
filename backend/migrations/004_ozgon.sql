-- Demo rows that were stored in Uzbek Latin (not the Russian seed) still named
-- Tashkent / Mustaqillik and used Uzbek mobile prefixes. Point them at Özgen
-- and rewrite numbers into the Kyrgyz mobile shape +996 XXX XXX XXX.

UPDATE orders SET region = CASE region
  WHEN 'Toshkent shahri' THEN 'Өзгөн'
  WHEN 'Toshkent viloyati' THEN 'Ош'
  WHEN 'Samarqand' THEN 'Кара-Суу'
  WHEN 'Farg''ona' THEN 'Ноокат'
  ELSE region END
WHERE region IN ('Toshkent shahri', 'Toshkent viloyati', 'Samarqand', 'Farg''ona');

UPDATE orders SET address = 'Манас көчөсү, 12'
WHERE address LIKE '%Mustaqillik%' OR address LIKE '%Chilonzor%' OR address LIKE '%Chilanzar%';

UPDATE orders SET customer_name = CASE customer_name
  WHEN 'Aziza Karimova' THEN 'Айгерим Бекмаматова'
  WHEN 'Jasur Rahimov' THEN 'Нурлан Садыков'
  WHEN 'Dilnoza Yusupova' THEN 'Айзада Токтосунова'
  WHEN 'Sardor Aliyev' THEN 'Бакыт Асанов'
  WHEN 'Nodira Islomova' THEN 'Жылдыз Мамытова'
  WHEN 'Test Mijoz' THEN 'Тест кардар'
  ELSE customer_name END
WHERE customer_name IN ('Aziza Karimova', 'Jasur Rahimov', 'Dilnoza Yusupova', 'Sardor Aliyev', 'Nodira Islomova', 'Test Mijoz');

-- Uzbek operator codes 90/93/94/97/99 → Kyrgyz 555/700/777/500/550. The other 6 digits stay.
UPDATE orders SET phone = '+996555' || substring(phone FROM 8)
WHERE phone ~ '^\+99690[0-9]';
UPDATE orders SET phone = '+996700' || substring(phone FROM 8)
WHERE phone ~ '^\+99693[0-9]';
UPDATE orders SET phone = '+996777' || substring(phone FROM 8)
WHERE phone ~ '^\+99697[0-9]';
UPDATE orders SET phone = '+996500' || substring(phone FROM 8)
WHERE phone ~ '^\+99694[0-9]';
UPDATE orders SET phone = '+996550' || substring(phone FROM 8)
WHERE phone ~ '^\+99699[0-9]';

UPDATE reviews SET text = CASE
  WHEN text LIKE 'Juda tez%' THEN 'Абдан тез жеткиришти, товар оригинал. Рахмат!'
  WHEN text LIKE 'Narxi bozordagidan%' THEN 'Баасы базардагыдан төмөн, кепилдик бар. Сунуштайм.'
  WHEN text LIKE 'Hammasi yaxshi%' THEN 'Баары жакшы, куту гана бир аз бүктөлгөн.'
  WHEN text LIKE 'Kuryer qo%' THEN 'Курьер чалып, макулдашкан убакта алып келди.'
  WHEN text LIKE 'Sifati yaxshi%' THEN 'Сапаты жакшы. Бөлүп төлөө абдан ыңгайлуу.'
  WHEN text LIKE 'Yaxshi, lekin%' THEN 'Жакшы, бирок түсү сүрөттөгүдөн бир аз айырмаланат.'
  WHEN text LIKE 'Ajoyib telefon%' THEN 'Эң сонун телефон, камерасы супер!'
  ELSE text END
WHERE text ~ '[a-zA-Z'']';
