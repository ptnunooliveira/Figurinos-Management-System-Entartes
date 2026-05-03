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
 * ------------------------------------------------------------
 */

const anunciosEscolaService = require('../services/anunciosEscolaService');


// Função do controller responsável por criar um anúncio da escola
const criarAnuncioEscola = async (req, res) => {
    try {
        const { id_figurino, valordiarioaluguer, id_estado } = req.body;

        const novoAnuncio = await anunciosEscolaService.criarAnuncioEscola({
            id_figurino: id_figurino ? parseInt(id_figurino) : null,
            valordiarioaluguer: valordiarioaluguer ? parseFloat(valordiarioaluguer) : null,
            id_estado: id_estado ? parseInt(id_estado) : 1,
        });
        return res.status(201).json(novoAnuncio);

    } catch (erro) {
        console.error('Erro no controller de anúncios da escola:', erro);
        return res.status(500).json({ erro: erro.message ?? 'Ocorreu um erro ao criar o anúncio da escola.' });
    }
};

// Função do controller responsável por listar todos os anúncios da escola
const listarAnunciosEscola = async (req, res) => {

    try {

        const { categoria, tamanho, sexo} = req.query;

        const filtros = {

            categoria: categoria,
            tamanho: tamanho,
            sexo: sexo
        };

        const anuncios = await anunciosEscolaService.obterTodosAnunciosEscola(filtros);
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
        const anuncio = await anunciosEscolaService.obterAnuncioEscolaPorId(id);

        if (!anuncio) {
            return res.status(404).json({ erro: 'Anúncio da escola não encontrado.' });
        }

        return res.status(200).json(anuncio);

    } catch (erro) {
        console.error('Erro no controller de anúncios da escola:', erro);
        return res.status(500).json({ erro: 'Ocorreu um erro ao obter o anúncio da escola.' });
    }
};

const obterDisponibilidadeAnuncio = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { dataInicio, dataFim } = req.query;

        if (isNaN(id)) {
            return res.status(400).json({ erro: 'O ID do anÃºncio tem que ser um nÃºmero vÃ¡lido.' });
        }

        if (!dataInicio || !dataFim) {
            return res.status(400).json({ erro: "Os parÃ¢metros 'dataInicio' e 'dataFim' sÃ£o obrigatÃ³rios." });
        }

        const disponibilidade = await anunciosEscolaService.obterDisponibilidadeAnuncio(id, dataInicio, dataFim);
        return res.status(200).json(disponibilidade);
    } catch (erro) {
        console.error('Erro no controller de disponibilidade de anÃºncio:', erro);
        return res.status(erro.status || 500).json({ erro: erro.message || 'Erro ao obter disponibilidade do anÃºncio.' });
    }
};

// Função do controller responsável por atualizar um anúncio da escola
const atualizarAnuncioEscola = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const anuncio = await anunciosEscolaService.atualizarAnuncioEscola(id, req.body);
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
        await anunciosEscolaService.eliminarAnuncioEscola(id);
        return res.status(204).send();

    } catch (erro) {
        console.error('Erro no controller de anúncios da escola:', erro);
        if (erro.code === 'HAS_RESERVAS') {
            return res.status(409).json({ erro: erro.message });
        }
        return res.status(500).json({ erro: 'Ocorreu um erro ao eliminar o anúncio da escola.' });
    }
};

module.exports = {
    criarAnuncioEscola,
    listarAnunciosEscola,
    obterAnuncioEscolaPorId,
    obterDisponibilidadeAnuncio,
    atualizarAnuncioEscola,
    eliminarAnuncioEscola
};
