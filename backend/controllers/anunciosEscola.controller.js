const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

/**
 * POST /anuncios-escola
 * Cria um novo anúncio da escola.
 */
exports.createAnuncioEscola = async (req, res) => {
  try {
    const { id, id_figurino, valordiarioaluguer, id_estado } = req.body;

    // Validação básica dos campos obrigatórios
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
    return res.status(500).json({ message: 'Erro interno ao criar o anúncio da escola.' });
  }
};

/**
 * GET /anuncios-escola
 * Lista todos os anúncios da escola.
 */
exports.getAllAnunciosEscola = async (req, res) => {
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
    return res.status(500).json({ message: 'Erro interno ao listar anúncios da escola.' });
  }
};

/**
 * GET /anuncios-escola/:id
 * Obtém um anúncio da escola pelo ID.
 */
exports.getAnuncioEscolaById = async (req, res) => {
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
    return res.status(500).json({ message: 'Erro interno ao obter o anúncio da escola.' });
  }
};
