/**
 * ------------------------------------------------------------
 * File: anunciosEscola.controller.js
 * Author: Marina Silva
 * Date: 2026-03-31
 * Version: 1.0
 * Description:
 * Controller responsável pelos anúncios da escola.
 * Recebe os pedidos HTTP, chama o service
 * e devolve as respostas ao cliente.
 * ------------------------------------------------------------
 */

const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

// CRIAR ANÚNCIO DA ESCOLA
const createAnuncioEscola = async (req, res) => {
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
  } catch (error) {
    console.error('Erro ao criar anúncio da escola:', error);
    return res.status(500).json({ message: 'Erro ao criar anúncio da escola.' });
  }
};

// LISTAR TODOS OS ANÚNCIOS DA ESCOLA
const getAllAnunciosEscola = async (req, res) => {
  try {
    const anuncios = await prisma.anuncio_escola.findMany({
      include: {
        figurino: true,
        estado_anuncio: true,
      },
    });

    return res.status(200).json(anuncios);
  } catch (error) {
    console.error('Erro ao listar anúncios da escola:', error);
    return res.status(500).json({ message: 'Erro ao listar anúncios da escola.' });
  }
};

// OBTER ANÚNCIO DA ESCOLA POR ID
const getAnuncioEscolaById = async (req, res) => {
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
      return res.status(404).json({ message: 'Anúncio da escola não encontrado.' });
    }

    return res.status(200).json(anuncio);
  } catch (error) {
    console.error('Erro ao obter anúncio da escola:', error);
    return res.status(500).json({ message: 'Erro ao obter anúncio da escola.' });
  }
};

// ATUALIZAR ANÚNCIO DA ESCOLA
const updateAnuncioEscola = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { id_figurino, valordiarioaluguer, id_estado } = req.body;

    const anuncio = await prisma.anuncio_escola.update({
      where: { id },
      data: {
        id_figurino: id_figurino ?? null,
        valordiarioaluguer: valordiarioaluguer ?? null,
        id_estado: id_estado ?? null,
      },
    });

    return res.status(200).json(anuncio);
  } catch (error) {
    console.error('Erro ao atualizar anúncio da escola:', error);
    return res.status(500).json({ message: 'Erro ao atualizar anúncio da escola.' });
  }
};

// ELIMINAR ANÚNCIO DA ESCOLA
const deleteAnuncioEscola = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.anuncio_escola.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao eliminar anúncio da escola:', error);
    return res.status(500).json({ message: 'Erro ao eliminar anúncio da escola.' });
  }
};

module.exports = {
  createAnuncioEscola,
  getAllAnunciosEscola,
  getAnuncioEscolaById,
  updateAnuncioEscola,
  deleteAnuncioEscola
};