/**
 * ------------------------------------------------------------
 * File: anunciosEscolaController.js
 * Author: Marina Silva
 * Date: 2026-03-31
 * Version: 1.0
 * 
 * Description:
 * Controller responsável por gerir as operações relacionadas
 * com anúncios da escola. Recebe os pedidos HTTP das routes e delega
 * a lógica de negócio ao service.
 * Arquitetura: Route -> Controller -> Service
 * ------------------------------------------------------------
 */

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

// Função do controller responsável por criar um anúncio da escola
const criarAnuncioEscola = async (req, res) => {
  try {
    const { id, id_figurino, valordiarioaluguer, id_estado } = req.body;

    if (id === undefined || id === null) {
      return res.status(400).json({ message: 'O campo "id" é obrigatório.' });
    }

    const novoAnuncio = await prisma.anuncio_escola.create({
      data: {
        id,
        id_figurino: id_figurino ?? null,
        valordiarioaluguer: valordiarioaluguer ?? null,
        id_estado: id_estado ?? null,
      },
    });

    return res.status(201).json(novoAnuncio);
  } catch (erro) {
    console.error('Erro no controller de anúncios da escola:', erro);
    return res.status(500).json({ erro: 'Ocorreu um erro ao criar o anúncio da escola.' });
  }
};

// Função do controller responsável por listar todos os anúncios da escola
const listarAnunciosEscola = async (req, res) => {
  try {
    const anuncios = await prisma.anuncio_escola.findMany({
      include: {
        figurino: true,
        estado_anuncio: true,
      },
    });

    return res.status(200).json(anuncios);
  } catch (erro) {
    console.error('Erro no controller de anúncios da escola:', erro);
    return res.status(500).json({ erro: 'Ocorreu um erro ao listar os anúncios da escola.' });
  }
};

// Função do controller responsável por obter um anúncio da escola por ID
const obterAnuncioEscolaPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const anuncio = await prisma.anuncio_escola.findUnique({
      where: { id },
      include: {
        figurino: true,
        estado_anuncio: true,
      },
    });

    if (!anuncio) {
      return res.status(404).json({ erro: 'Anúncio da escola não encontrado.' });
    }

    return res.status(200).json(anuncio);
  } catch (erro) {
    console.error('Erro no controller de anúncios da escola:', erro);
    return res.status(500).json({ erro: 'Ocorreu um erro ao obter o anúncio da escola.' });
  }
};

// Função do controller responsável por atualizar um anúncio da escola
const atualizarAnuncioEscola = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const anuncio = await prisma.anuncio_escola.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json(anuncio);
  } catch (erro) {
    console.error('Erro no controller de anúncios da escola:', erro);
    return res.status(500).json({ erro: 'Ocorreu um erro ao atualizar o anúncio da escola.' });
  }
};

// Função do controller responsável por eliminar um anúncio da escola
const eliminarAnuncioEscola = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.anuncio_escola.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (erro) {
    console.error('Erro no controller de anúncios da escola:', erro);
    return res.status(500).json({ erro: 'Ocorreu um erro ao eliminar o anúncio da escola.' });
  }
};

module.exports = {
  criarAnuncioEscola,
  listarAnunciosEscola,
  obterAnuncioEscolaPorId,
  atualizarAnuncioEscola,
  eliminarAnuncioEscola
};