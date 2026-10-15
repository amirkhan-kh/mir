-- Storefront content in two languages: base columns hold Russian (default), *_ky hold Kyrgyz.
-- An empty Kyrgyz value falls back to the Russian one at read time.

ALTER TABLE categories
  ADD COLUMN name_ky TEXT NOT NULL DEFAULT '';

ALTER TABLE products
  ADD COLUMN name_ky              TEXT  NOT NULL DEFAULT '',
  ADD COLUMN short_description_ky TEXT  NOT NULL DEFAULT '',
  ADD COLUMN description_ky       TEXT  NOT NULL DEFAULT '',
  ADD COLUMN specs_ky             JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN badge_ky             TEXT  NOT NULL DEFAULT '';

ALTER TABLE banners
  ADD COLUMN title_ky    TEXT NOT NULL DEFAULT '',
  ADD COLUMN subtitle_ky TEXT NOT NULL DEFAULT '',
  ADD COLUMN cta_ky      TEXT NOT NULL DEFAULT '';
