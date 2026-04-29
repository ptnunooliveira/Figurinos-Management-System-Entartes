/**
 * ------------------------------------------------------------------------
 * File: marketplaceController.test.js
 * Author: Tiago Goncalves
 * Date: 2026-04-29
 * Version: 1.0
 * Description:
 * Unit testes do controller do marketplace
 * ------------------------------------------------------------------------
 */

const mockService = require("../../../services/marketplaceService");
mockService.atualizarEstadoAnuncioMarketplace = jest.fn();
mockService.ressubmeterAnuncioMarketplace = jest.fn();

const controller = require("../../../controllers/marketplaceController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("marketplaceController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("updateMarketplaceStatus retorna 400 quando aprovado nao e boolean", async () => {
    const req = { params: { id: "10" }, body: { aprovado: "sim" } };
    const res = mockRes();

    await controller.updateMarketplaceStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  test("updateMarketplaceStatus retorna 400 quando rejeitado sem motivo", async () => {
    const req = { params: { id: "10" }, body: { aprovado: false, motivorejeicao: "" } };
    const res = mockRes();

    await controller.updateMarketplaceStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateMarketplaceStatus retorna 200 em aprovacao valida", async () => {
    mockService.atualizarEstadoAnuncioMarketplace.mockResolvedValue({ id: 10 });
    const req = { params: { id: "10" }, body: { aprovado: true } };
    const res = mockRes();

    await controller.updateMarketplaceStatus(req, res);

    expect(mockService.atualizarEstadoAnuncioMarketplace).toHaveBeenCalledWith(10, true, null);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("resubmitMarketplace retorna 401 sem user no token", async () => {
    const req = { params: { id: "8" }, user: null, body: {} };
    const res = mockRes();

    await controller.resubmitMarketplace(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("resubmitMarketplace retorna 409 em prazo expirado", async () => {
    mockService.ressubmeterAnuncioMarketplace.mockRejectedValue({
      code: "PRAZO_RESSUBMISSAO_EXPIRADO",
      message: "Prazo de ressubmissao expirado.",
    });

    const req = {
      params: { id: "8" },
      user: { id: 3 },
      body: { titulo: "Novo titulo" },
      marketplaceImageFiles: [],
    };
    const res = mockRes();

    await controller.resubmitMarketplace(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Prazo de ressubmissao expirado." });
  });
});
