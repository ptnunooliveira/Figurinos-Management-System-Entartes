-- Renomeia o estado 4 (anteriormente "Proposta contestada") para "Contestada pelo aluno",
-- alinhando com a perspetiva do funcionário.
UPDATE "estado_ocorrencia"
SET "nome" = 'Contestada pelo aluno'
WHERE "id" = 4;

-- Garante que o registo existe (caso ainda não tenha sido criado manualmente).
INSERT INTO "estado_ocorrencia" ("id", "nome")
VALUES (4, 'Contestada pelo aluno')
ON CONFLICT ("id") DO NOTHING;
