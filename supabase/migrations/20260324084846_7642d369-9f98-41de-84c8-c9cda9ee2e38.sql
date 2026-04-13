UPDATE content_blocks 
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(content::jsonb, '{label}', '"Impacto & Resultados"'),
    '{title}', '"Upstream em números"'
  ),
  '{subtitle}', '"Dados que marcam o nosso impacto no presente e no futuro."'
),
updated_at = now()
WHERE id = '5396ebc4-d256-48b9-9485-833c87bddab1';

UPDATE content_blocks 
SET content = jsonb_set(
  jsonb_set(
    jsonb_set(content::jsonb, '{label}', '"Impact & Results"'),
    '{title}', '"Upstream in numbers"'
  ),
  '{subtitle}', '"Data that marks our impact in the present and the future."'
),
updated_at = now()
WHERE id = '72168eee-0c15-4029-b96a-abe03d3fc425';