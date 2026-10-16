-- Contact link is WhatsApp, not Telegram: rename the settings key and point it at wa.me.
UPDATE settings
SET value = (value - 'telegram') || jsonb_build_object(
  'whatsapp',
  CASE
    WHEN value->>'telegram' IS NULL OR value->>'telegram' = '' OR value->>'telegram' LIKE '%t.me%'
      THEN 'https://wa.me/996555323300'
    ELSE value->>'telegram'
  END
)
WHERE key = 'store';
