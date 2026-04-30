-- Adiciona o estado "A aguardar resposta do aluno" usado quando uma proposta
-- de cobrança é enviada ao cliente.
INSERT INTO "estado_ocorrencia" ("id", "nome")
VALUES (5, 'A aguardar resposta do aluno')
ON CONFLICT ("id") DO NOTHING;
