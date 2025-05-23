ALTER TABLE articles
ADD COLUMN paragraphs TEXT[];

UPDATE articles
SET paragraphs = ARRAY[topic];

ALTER TABLE articles
DROP COLUMN topic;

ALTER TABLE articles
ALTER COLUMN paragraphs SET NOT NULL;