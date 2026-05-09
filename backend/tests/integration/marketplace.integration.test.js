/**
 * ------------------------------------------------------------------------
 * File: marketplace.integration.test.js
 * Author: Tiago Gonçalves
 * Date: 2026-04-30
 * Version: 1.0
 * Description:
 * Testes de integração do BPMN Marketplace
 * ------------------------------------------------------------------------
 */

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const prisma = require("../../prisma/client");

jest.setTimeout(60000);

const criarToken = (user) => jwt.sign(
  {
    id: user.id,
    email: user.email,
    perfil: user.perfil,
    nome: user.nome,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6p2cQAAAAASUVORK5CYII=",
  "base64"
);

describe("Marketplace BPMN integration", () => {
  let aluno;
  let staff;
  let alunoToken;
  let staffToken;
  const anunciosCriados = [];

  afterAll(async () => {
    if (anunciosCriados.length > 0) {
      await prisma.anuncio_marketplace.deleteMany({
        where: { id: { in: anunciosCriados } },
      });
    }
    await prisma.$disconnect();
  });

  beforeAll(async () => {
    aluno = await prisma.utilizador.findFirst({
      where: { perfil: "ALUNO", ativo: true },
      select: { id: true, nome: true, email: true, perfil: true },
    });

    staff = await prisma.utilizador.findFirst({
      where: { perfil: { in: ["FUNCIONARIO", "ADMIN"] }, ativo: true },
      select: { id: true, nome: true, email: true, perfil: true },
    });

    if (!aluno || !staff) {
      throw new Error("E necessario ter pelo menos 1 ALUNO e 1 FUNCIONARIO/ADMIN ativos na BD.");
    }

    alunoToken = criarToken(aluno);
    staffToken = criarToken(staff);
  });

  // ----------------------------------------------------------------------
  // Testes de integracao - fluxo principal (perfect path)
  // ----------------------------------------------------------------------
  test("submissao -> aprovacao -> publicado", async () => {
    const titulo = `IT-Marketplace-Aprovacao-${Date.now()}`;

    const criarRes = await request(app)
      .post("/marketplace")
      .set("Authorization", `Bearer ${alunoToken}`)
      .field("titulo", titulo)
      .field("descricao", "Integracao caminho feliz")
      .field("tamanho", "M")
      .attach("imagens", tinyPng, { filename: "tiny.png", contentType: "image/png" });

    expect(criarRes.status).toBe(201);
    expect(criarRes.body?.id).toBeDefined();

    const anuncioId = criarRes.body.id;
    anunciosCriados.push(anuncioId);

    const aprovarRes = await request(app)
      .patch(`/marketplace/${anuncioId}/aprovar`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ aprovado: true });

    expect(aprovarRes.status).toBe(200);
    expect(aprovarRes.body?.estado_anuncio?.nome).toBe("Publicado");

    const listagemRes = await request(app)
      .get("/marketplace")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(listagemRes.status).toBe(200);
    expect(Array.isArray(listagemRes.body)).toBe(true);
    expect(listagemRes.body.some((a) => a.id === anuncioId)).toBe(true);
  });

  // ----------------------------------------------------------------------
  // Testes de integracao - fluxo alternativo de rejeicao/ressubmissao
  // ----------------------------------------------------------------------
  test("rejeicao -> ressubmissao valida (dentro do prazo)", async () => {
    const titulo = `IT-Marketplace-Ressubmeter-${Date.now()}`;

    const criarRes = await request(app)
      .post("/marketplace")
      .set("Authorization", `Bearer ${alunoToken}`)
      .field("titulo", titulo)
      .field("descricao", "Integracao rejeicao e ressubmissao")
      .field("tamanho", "L")
      .attach("imagens", tinyPng, { filename: "tiny2.png", contentType: "image/png" });

    expect(criarRes.status).toBe(201);
    const anuncioId = criarRes.body.id;
    anunciosCriados.push(anuncioId);

    const rejeitarRes = await request(app)
      .patch(`/marketplace/${anuncioId}/aprovar`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ aprovado: false, motivorejeicao: "Ajustar descricao" });

    expect(rejeitarRes.status).toBe(200);
    expect(rejeitarRes.body?.estado_anuncio?.nome).toBe("Rejeitado");

    const ressubmeterRes = await request(app)
      .post(`/marketplace/${anuncioId}/ressubmeter`)
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ titulo: `${titulo}-v2` });

    expect(ressubmeterRes.status).toBe(200);
    expect(ressubmeterRes.body?.estado_anuncio?.nome).toBe("Submetido");
  });

  // ----------------------------------------------------------------------
  // Testes de integracao - fluxo de excecao com regra temporal
  // ----------------------------------------------------------------------
  test("ressubmissao fora do prazo devolve 409", async () => {
    const titulo = `IT-Marketplace-Expirado-${Date.now()}`;

    const criarRes = await request(app)
      .post("/marketplace")
      .set("Authorization", `Bearer ${alunoToken}`)
      .field("titulo", titulo)
      .field("descricao", "Integracao regra temporal")
      .field("tamanho", "S")
      .attach("imagens", tinyPng, { filename: "tiny3.png", contentType: "image/png" });

    expect(criarRes.status).toBe(201);
    const anuncioId = criarRes.body.id;
    anunciosCriados.push(anuncioId);

    const rejeitarRes = await request(app)
      .patch(`/marketplace/${anuncioId}/aprovar`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ aprovado: false, motivorejeicao: "Fora do padrao" });

    expect(rejeitarRes.status).toBe(200);

    const dataExpirada = new Date();
    dataExpirada.setDate(dataExpirada.getDate() - 4);

    await prisma.anuncio_marketplace.update({
      where: { id: anuncioId },
      data: { dataaprovacao: dataExpirada },
    });

    const ressubmeterRes = await request(app)
      .post(`/marketplace/${anuncioId}/ressubmeter`)
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ titulo: `${titulo}-late` });

    expect(ressubmeterRes.status).toBe(409);
    expect(ressubmeterRes.body?.error).toMatch(/Prazo de ressubmissao expirado/i);
  });
});
