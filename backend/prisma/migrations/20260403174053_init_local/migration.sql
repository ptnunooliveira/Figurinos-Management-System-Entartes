-- CreateTable
CREATE TABLE "acessorio" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(255),

    CONSTRAINT "acessorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aluno" (
    "id_utilizador" INTEGER NOT NULL,
    "numeroaluno" INTEGER,

    CONSTRAINT "aluno_pkey" PRIMARY KEY ("id_utilizador")
);

-- CreateTable
CREATE TABLE "anuncio_escola" (
    "id" INTEGER NOT NULL,
    "id_figurino" INTEGER,
    "valordiarioaluguer" DOUBLE PRECISION,
    "id_estado" INTEGER,

    CONSTRAINT "anuncio_escola_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anuncio_marketplace" (
    "id" INTEGER NOT NULL,
    "titulo" VARCHAR(255),
    "dataanuncio" DATE,
    "dataaprovacao" DATE,
    "motivorejeicao" TEXT,
    "descricao" TEXT,
    "tamanho" VARCHAR(50),
    "id_utilizador" INTEGER,
    "id_categoria" INTEGER,
    "id_tipo" INTEGER,
    "id_sexo" INTEGER,
    "id_estado" INTEGER,

    CONSTRAINT "anuncio_marketplace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id" INTEGER NOT NULL,
    "nomecategoria" VARCHAR(255),

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist" (
    "id" INTEGER NOT NULL,
    "dataassinatura" DATE,
    "id_reserva" INTEGER,
    "id_funcionario" INTEGER,
    "assinaturafuncionario" VARCHAR(255),
    "assinaturaencarregado" VARCHAR(255),
    "id_tipo_checklist" INTEGER,

    CONSTRAINT "checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_item" (
    "id" INTEGER NOT NULL,
    "id_checklist" INTEGER,
    "idfigurino" INTEGER,
    "id_estado" INTEGER,
    "observacoes" TEXT,

    CONSTRAINT "checklist_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conta_corrente" (
    "id" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION,
    "exportadofaturacao" BOOLEAN,
    "dataexportacao" DATE,
    "id_utilizador" INTEGER,
    "id_tipo_movimento" INTEGER,
    "id_ocorrencia" INTEGER,
    "id_linha_reserva" INTEGER,

    CONSTRAINT "conta_corrente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contestacao" (
    "id" INTEGER NOT NULL,
    "id_proposta_cobranca" INTEGER,
    "descricao" TEXT,
    "valorcontraproposta" DOUBLE PRECISION,
    "data" DATE,
    "id_utilizador" INTEGER,

    CONSTRAINT "contestacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devolucao" (
    "id" INTEGER NOT NULL,
    "datadevolucao" DATE,
    "id_linha_reserva" INTEGER,
    "id_checklist" INTEGER,

    CONSTRAINT "devolucao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_anuncio" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(100),
    "descricao" TEXT,

    CONSTRAINT "estado_anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_condicao" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(100),

    CONSTRAINT "estado_condicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_linha_reserva" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(100),

    CONSTRAINT "estado_linha_reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_ocorrencia" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(100),

    CONSTRAINT "estado_ocorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_reserva" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(100),

    CONSTRAINT "estado_reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estadopropostacobranca" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(100),

    CONSTRAINT "estadopropostacobranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "figurino" (
    "id" INTEGER NOT NULL,
    "descricao" TEXT,
    "tamanho" VARCHAR(50),
    "localizacao" VARCHAR(255),
    "id_categoria" INTEGER,
    "id_tipo" INTEGER,
    "id_sexo" INTEGER,
    "id_estado_figurino" INTEGER,

    CONSTRAINT "figurino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "figurino_acessorio" (
    "id_figurino" INTEGER NOT NULL,
    "id_acessorio" INTEGER NOT NULL,

    CONSTRAINT "figurino_acessorio_pkey" PRIMARY KEY ("id_figurino","id_acessorio")
);

-- CreateTable
CREATE TABLE "funcionario" (
    "id_utilizador" INTEGER NOT NULL,
    "n_mecanografico" INTEGER,
    "cargo" VARCHAR(255),

    CONSTRAINT "funcionario_pkey" PRIMARY KEY ("id_utilizador")
);

-- CreateTable
CREATE TABLE "linha_reserva" (
    "id" INTEGER NOT NULL,
    "id_reserva" INTEGER,
    "id_anuncio" INTEGER,
    "datainicio" DATE,
    "datafim" DATE,
    "valordiario" DOUBLE PRECISION,
    "id_estado_linha_reserva" INTEGER,

    CONSTRAINT "linha_reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocorrencia" (
    "id" INTEGER NOT NULL,
    "descricao" TEXT,
    "valor" DOUBLE PRECISION,
    "dataregisto" DATE,
    "id_estado" INTEGER,
    "id_linha_reserva" INTEGER,

    CONSTRAINT "ocorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamento" (
    "id" INTEGER NOT NULL,
    "id_ocorrencia" INTEGER,
    "fornecedor" VARCHAR(255),
    "descricao" TEXT,
    "valor" DOUBLE PRECISION,
    "dataorcamento" DATE,
    "aprovado" BOOLEAN,

    CONSTRAINT "orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propostacobranca" (
    "id" INTEGER NOT NULL,
    "id_ocorrencia" INTEGER,
    "valor" DOUBLE PRECISION,
    "dataproposta" DATE,
    "id_estadopropostacobranca" INTEGER,

    CONSTRAINT "propostacobranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva" (
    "id" INTEGER NOT NULL,
    "datareserva" DATE,
    "id_estado" INTEGER,
    "id_utilizador" INTEGER,
    "id_funcionario" INTEGER,

    CONSTRAINT "reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sexo" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(100),

    CONSTRAINT "sexo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_checklist" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(100),

    CONSTRAINT "tipo_checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_figurino" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(255),

    CONSTRAINT "tipo_figurino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_movimento_contacorrente" (
    "id" INTEGER NOT NULL,
    "nome" VARCHAR(100),

    CONSTRAINT "tipo_movimento_contacorrente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilizador" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "pw_hashed" VARCHAR(255) NOT NULL,
    "contacto" VARCHAR(50),
    "data_registo" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "utilizador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilizador_email_key" ON "utilizador"("email");

-- AddForeignKey
ALTER TABLE "aluno" ADD CONSTRAINT "fk_aluno_utilizador" FOREIGN KEY ("id_utilizador") REFERENCES "utilizador"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anuncio_escola" ADD CONSTRAINT "fk_anuncio_escola_estado" FOREIGN KEY ("id_estado") REFERENCES "estado_anuncio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anuncio_escola" ADD CONSTRAINT "fk_anuncio_escola_figurino" FOREIGN KEY ("id_figurino") REFERENCES "figurino"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anuncio_marketplace" ADD CONSTRAINT "fk_anuncio_marketplace_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anuncio_marketplace" ADD CONSTRAINT "fk_anuncio_marketplace_estado" FOREIGN KEY ("id_estado") REFERENCES "estado_anuncio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anuncio_marketplace" ADD CONSTRAINT "fk_anuncio_marketplace_sexo" FOREIGN KEY ("id_sexo") REFERENCES "sexo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anuncio_marketplace" ADD CONSTRAINT "fk_anuncio_marketplace_tipo" FOREIGN KEY ("id_tipo") REFERENCES "tipo_figurino"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anuncio_marketplace" ADD CONSTRAINT "fk_anuncio_marketplace_utilizador" FOREIGN KEY ("id_utilizador") REFERENCES "utilizador"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist" ADD CONSTRAINT "fk_checklist_funcionario" FOREIGN KEY ("id_funcionario") REFERENCES "funcionario"("id_utilizador") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist" ADD CONSTRAINT "fk_checklist_reserva" FOREIGN KEY ("id_reserva") REFERENCES "reserva"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist" ADD CONSTRAINT "fk_checklist_tipo" FOREIGN KEY ("id_tipo_checklist") REFERENCES "tipo_checklist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist_item" ADD CONSTRAINT "fk_checklist_item_checklist" FOREIGN KEY ("id_checklist") REFERENCES "checklist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist_item" ADD CONSTRAINT "fk_checklist_item_estado" FOREIGN KEY ("id_estado") REFERENCES "estado_condicao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "checklist_item" ADD CONSTRAINT "fk_checklist_item_figurino" FOREIGN KEY ("idfigurino") REFERENCES "figurino"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conta_corrente" ADD CONSTRAINT "fk_conta_corrente_linha_reserva" FOREIGN KEY ("id_linha_reserva") REFERENCES "linha_reserva"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conta_corrente" ADD CONSTRAINT "fk_conta_corrente_ocorrencia" FOREIGN KEY ("id_ocorrencia") REFERENCES "ocorrencia"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conta_corrente" ADD CONSTRAINT "fk_conta_corrente_tipo_movimento" FOREIGN KEY ("id_tipo_movimento") REFERENCES "tipo_movimento_contacorrente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "conta_corrente" ADD CONSTRAINT "fk_conta_corrente_utilizador" FOREIGN KEY ("id_utilizador") REFERENCES "utilizador"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contestacao" ADD CONSTRAINT "fk_contestacao_proposta" FOREIGN KEY ("id_proposta_cobranca") REFERENCES "propostacobranca"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contestacao" ADD CONSTRAINT "fk_contestacao_utilizador" FOREIGN KEY ("id_utilizador") REFERENCES "utilizador"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "devolucao" ADD CONSTRAINT "fk_devolucao_checklist" FOREIGN KEY ("id_checklist") REFERENCES "checklist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "devolucao" ADD CONSTRAINT "fk_devolucao_linha_reserva" FOREIGN KEY ("id_linha_reserva") REFERENCES "linha_reserva"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "figurino" ADD CONSTRAINT "fk_figurino_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "figurino" ADD CONSTRAINT "fk_figurino_estado" FOREIGN KEY ("id_estado_figurino") REFERENCES "estado_condicao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "figurino" ADD CONSTRAINT "fk_figurino_sexo" FOREIGN KEY ("id_sexo") REFERENCES "sexo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "figurino" ADD CONSTRAINT "fk_figurino_tipo" FOREIGN KEY ("id_tipo") REFERENCES "tipo_figurino"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "figurino_acessorio" ADD CONSTRAINT "fk_figac_acessorio" FOREIGN KEY ("id_acessorio") REFERENCES "acessorio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "figurino_acessorio" ADD CONSTRAINT "fk_figac_figurino" FOREIGN KEY ("id_figurino") REFERENCES "figurino"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "funcionario" ADD CONSTRAINT "fk_funcionario_utilizador" FOREIGN KEY ("id_utilizador") REFERENCES "utilizador"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "linha_reserva" ADD CONSTRAINT "fk_linha_reserva_anuncio" FOREIGN KEY ("id_anuncio") REFERENCES "anuncio_escola"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "linha_reserva" ADD CONSTRAINT "fk_linha_reserva_estado" FOREIGN KEY ("id_estado_linha_reserva") REFERENCES "estado_linha_reserva"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "linha_reserva" ADD CONSTRAINT "fk_linha_reserva_reserva" FOREIGN KEY ("id_reserva") REFERENCES "reserva"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ocorrencia" ADD CONSTRAINT "fk_ocorrencia_estado" FOREIGN KEY ("id_estado") REFERENCES "estado_ocorrencia"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ocorrencia" ADD CONSTRAINT "fk_ocorrencia_linha_reserva" FOREIGN KEY ("id_linha_reserva") REFERENCES "linha_reserva"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orcamento" ADD CONSTRAINT "fk_orcamento_ocorrencia" FOREIGN KEY ("id_ocorrencia") REFERENCES "ocorrencia"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "propostacobranca" ADD CONSTRAINT "fk_proposta_estado" FOREIGN KEY ("id_estadopropostacobranca") REFERENCES "estadopropostacobranca"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "propostacobranca" ADD CONSTRAINT "fk_proposta_ocorrencia" FOREIGN KEY ("id_ocorrencia") REFERENCES "ocorrencia"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "fk_reserva_estado" FOREIGN KEY ("id_estado") REFERENCES "estado_reserva"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "fk_reserva_funcionario" FOREIGN KEY ("id_funcionario") REFERENCES "funcionario"("id_utilizador") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "fk_reserva_utilizador" FOREIGN KEY ("id_utilizador") REFERENCES "utilizador"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
