/**
 * ------------------------------------------------------------
 * File: anunciosEscola.routes.js
 * Author: Marina Silva
 * Date: 2026-03-31
 * Version: 1.0
 * Description:
 * Rotas para os anúncios da escola.
 * ------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const { 
  createAnuncioEscola, 
  getAllAnunciosEscola, 
  getAnuncioEscolaById,
  updateAnuncioEscola,
  deleteAnuncioEscola
} = require('../controllers/anunciosEscola.controller');

/**
 * @route   POST /anuncios-escola
 * @desc    Criar um novo anúncio da escola
 * @access  Privado (funcionário)
 */
router.post('/', createAnuncioEscola);

/**
 * @route   GET /anuncios-escola
 * @desc    Listar todos os anúncios da escola
 * @access  Público
 */
router.get('/', getAllAnunciosEscola);

/**
 * @route   GET /anuncios-escola/:id
 * @desc    Obter anúncio da escola por ID
 * @access  Público
 */
router.get('/:id', getAnuncioEscolaById);

/**
 * @route   PUT /anuncios-escola/:id
 * @desc    Atualizar anúncio da escola
 * @access  Privado (funcionário)
 */
router.put('/:id', updateAnuncioEscola);

/**
 * @route   DELETE /anuncios-escola/:id
 * @desc    Eliminar anúncio da escola
 * @access  Privado (funcionário)
 */
router.delete('/:id', deleteAnuncioEscola);

module.exports = router;