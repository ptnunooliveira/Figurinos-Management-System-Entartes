/**
 * ------------------------------------------------------------
 * File: anunciosEscolaRoutes.js
 * Author: Marina Silva
 * Date: 2026-03-31
 * Version: 1.0
 * Description:
 * Rotas para os anúncios da escola.
 * ------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const anunciosEscolaController = require('../controllers/anunciosEscolaController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarPerfil = require('../middleware/perfilMiddleware');

/**
 * @route   POST /anuncios-escola
 * @desc    Criar um novo anúncio da escola
 * @access  Privado (funcionário)
 */
router.post('/', authMiddleware, verificarPerfil(['FUNCIONARIO', 'ADMIN']), anunciosEscolaController.criarAnuncioEscola);

/**
 * @route   GET /anuncios-escola
 * @desc    Listar todos os anúncios da escola
 * @access  Privado (qualquer utilizador autenticado e ativo)
 *
 * O authMiddleware revalida o flag "ativo" na BD a cada pedido,
 * pelo que utilizadores suspensos sao bloqueados com 403 mesmo
 * que ainda tenham um JWT valido em cache.
 */
router.get('/', authMiddleware, anunciosEscolaController.listarAnunciosEscola);

/**
 * @route   GET /anuncios-escola/:id/disponibilidade
 * @desc    Obter disponibilidade diária do anúncio
 * @access  Privado (qualquer utilizador autenticado e ativo)
 */
router.get('/:id/disponibilidade', authMiddleware, anunciosEscolaController.obterDisponibilidadeAnuncio);

/**
 * @route   GET /anuncios-escola/:id
 * @desc    Obter anúncio da escola por ID
 * @access  Privado (qualquer utilizador autenticado e ativo)
 */
router.get('/:id', authMiddleware, anunciosEscolaController.obterAnuncioEscolaPorId);

/**
 * @route   PUT /anuncios-escola/:id
 * @desc    Atualizar anúncio da escola
 * @access  Privado (funcionário)
 */
router.put('/:id', authMiddleware, verificarPerfil(['FUNCIONARIO', 'ADMIN']), anunciosEscolaController.atualizarAnuncioEscola);

/**
 * @route   PATCH /anuncios-escola/:id
 * @desc    Atualizar parcialmente anúncio da escola
 * @access  Privado (funcionário)
 */
router.patch('/:id', authMiddleware, verificarPerfil(['FUNCIONARIO', 'ADMIN']), anunciosEscolaController.atualizarAnuncioEscola);

/**
 * @route   DELETE /anuncios-escola/:id
 * @desc    Eliminar anúncio da escola
 * @access  Privado (funcionário)
 */
router.delete('/:id', authMiddleware, verificarPerfil(['FUNCIONARIO', 'ADMIN']), anunciosEscolaController.eliminarAnuncioEscola);

module.exports = router;
