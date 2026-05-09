/**
 * ------------------------------------------------------------------------
 * File: checklistController.test.js
 * Date: 2026-05-09
 * Description: Unit testing do controller de checklists
 * ------------------------------------------------------------------------
 */

const mockService = {
  obterChecklistPorID: jest.fn(),
  obterChecklistReserva: jest.fn(),
  criarChecklist: jest.fn(),
};

jest.mock("../../../services/checklistService", () => mockService);

const controller = require("../../../controllers/checklistController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("checklistController", () => {
  beforeEach(() => jest.clearAllMocks());

  // obterChecklistPorID
  test("obterChecklistPorID retorna 400 quando id nao e numero", async () => {
    const res = mockRes();
    await controller.obterChecklistPorID({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterChecklistPorID retorna 404 quando nao encontrada", async () => {
    mockService.obterChecklistPorID.mockResolvedValue(null);
    const res = mockRes();
    await controller.obterChecklistPorID({ params: { id: "999" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("obterChecklistPorID retorna 200 quando encontrada", async () => {
    mockService.obterChecklistPorID.mockResolvedValue({ id: 1 });
    const res = mockRes();
    await controller.obterChecklistPorID({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // obterChecklistReserva
  test("obterChecklistReserva retorna 400 quando id nao e numero", async () => {
    const res = mockRes();
    await controller.obterChecklistReserva({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterChecklistReserva retorna 200 com lista", async () => {
    mockService.obterChecklistReserva.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await controller.obterChecklistReserva({ params: { id: "10" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // criarChecklist
  test("criarChecklist retorna 400 quando id_tipo_checklist em falta", async () => {
    const req = {
      user: { id: 1 },
      params: { id: "10" },
      body: { itens: [{ idfigurino: 5 }] },
    };
    const res = mockRes();
    await controller.criarChecklist(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("criarChecklist retorna 400 quando itens vazios", async () => {
    const req = {
      user: { id: 1 },
      params: { id: "10" },
      body: { id_tipo_checklist: 1, itens: [] },
    };
    const res = mockRes();
    await controller.criarChecklist(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("criarChecklist retorna 201 em criacao valida", async () => {
    mockService.criarChecklist.mockResolvedValue({ id: 1, checklist_item: [] });
    const req = {
      user: { id: 1 },
      params: { id: "10" },
      body: {
        id_tipo_checklist: 1,
        itens: [{ id_linha_reserva: 1, idfigurino: 5, id_estado: 1 }],
      },
    };
    const res = mockRes();
    await controller.criarChecklist(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("criarChecklist propaga status do erro do service", async () => {
    const err = new Error("Reserva nao existe."); err.status = 404;
    mockService.criarChecklist.mockRejectedValue(err);
    const req = {
      user: { id: 1 },
      params: { id: "999" },
      body: {
        id_tipo_checklist: 1,
        itens: [{ id_linha_reserva: 1, idfigurino: 5, id_estado: 1 }],
      },
    };
    const res = mockRes();
    await controller.criarChecklist(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
