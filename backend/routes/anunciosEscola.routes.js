const express = require('express');
const router = express.Router();
const anunciosEscolaController = require('../controllers/anunciosEscola.controller');

/**
 * @route   POST /anuncios-escola
 * @desc    Criar um novo anúncio da escola
 * @access  Privado (funcionário)
 */
router.post('/', anunciosEscolaController.createAnuncioEscola);

/**
 * @route   GET /anuncios-escola
 * @desc    Listar todos os anúncios da escola
 * @access  Público
 */
router.get('/', anunciosEscolaController.getAllAnunciosEscola);

/**
 * @route   GET /anuncios-escola/:id
 * @desc    Obter anúncio da escola por ID
 * @access  Público
 */
router.get('/:id', anunciosEscolaController.getAnuncioEscolaById);

module.exports = router;
