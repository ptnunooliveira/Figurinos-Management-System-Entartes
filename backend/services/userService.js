/**
 * ------------------------------------------------------------
 * File: userService.js
 * Author: Nelson Cruz
 * Date: 2026-04-03
 * Version: 1.1
 * Description:
 * Service responsavel pela logica de negocio associada aos
 * utilizadores (CRUD), incluindo:
 *  - Listagens (alunos ativos para reservas e listagem completa
 *    para o painel de administracao).
 *  - Atualizacao parcial de dados (com encriptacao de password).
 *  - Suspensao logica (ativo = false) e reativacao (ativo = true).
 *
 * Arquitetura: Route -> Middleware -> Controller -> Service -> BD
 * ------------------------------------------------------------
 */

const bcrypt = require('bcrypt');

const prisma = require('../prisma/client');


// Conjunto de campos publicos devolvidos nas respostas.
// Centralizado para garantir coerencia entre os varios metodos
// e para nunca expor o pw_hashed.
const utilizadorPublicSelect = {
    id: true,
    nome: true,
    email: true,
    contacto: true,
    ativo: true,
    perfil: true,
    data_registo: true
};


// LISTAR ALUNOS ATIVOS
// Usado, por exemplo, no formulario de criacao de reservas onde
// so faz sentido mostrar alunos que ainda podem alugar figurinos.
const getAllUsers = async () => {
    return await prisma.utilizador.findMany({
        where: { ativo: true, perfil: 'ALUNO' },
        select: utilizadorPublicSelect,
        orderBy: { id: 'asc' }
    });
};


// LISTAR TODOS OS UTILIZADORES (AREA DE ADMIN)
// Inclui qualquer perfil (ALUNO, FUNCIONARIO, ADMIN) e
// inclui tambem utilizadores suspensos (ativo = false), para
// que o painel de administracao consiga reativa-los.
const getAllUsersAdmin = async () => {
    return await prisma.utilizador.findMany({
        select: utilizadorPublicSelect,
        orderBy: { id: 'asc' }
    });
};


// OBTER UTILIZADOR POR ID
const getUserById = async (id) => {
    return await prisma.utilizador.findUnique({
        where: { id: Number(id) },
        select: utilizadorPublicSelect
    });
};


// ATUALIZAR UTILIZADOR
// Atualizacao parcial: apenas escreve os campos que vierem no body.
const updateUser = async (id, data) => {
    const userId = Number(id);

    // Verifica se o utilizador existe antes de atualizar
    const existingUser = await prisma.utilizador.findUnique({
        where: { id: userId }
    });

    if (!existingUser) throw new Error('USER_NOT_FOUND');

    const updateData = {};

    // So altera o que vem definido no body
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.contacto !== undefined) updateData.contacto = data.contacto;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    // Se vier password nova, encriptar antes de guardar
    if (data.password && data.password.trim() !== '') {
        updateData.pw_hashed = await bcrypt.hash(data.password, 10);
    }

    return await prisma.utilizador.update({
        where: { id: userId },
        data: updateData,
        select: utilizadorPublicSelect
    });
};


// Helper interno: aplica a regra de negocio sobre quem pode atuar
// sobre quem nas operacoes de (des)ativacao.
//   - ADMIN nunca pode ser desativado por ninguem (regra absoluta:
//     evita que o sistema fique sem administradores acessiveis).
//   - ADMIN: pode atuar sobre ALUNOS e FUNCIONARIOS.
//   - FUNCIONARIO: so pode atuar sobre utilizadores com perfil ALUNO.
// Lanca FORBIDDEN_TARGET quando a regra e' violada.
const validarPermissaoSobreAlvo = (actorPerfil, alvoPerfil) => {
    // Regra absoluta: contas ADMIN nunca podem ser (des)ativadas
    // atraves desta API, independentemente de quem o tente fazer.
    if (alvoPerfil === 'ADMIN') {
        throw new Error('FORBIDDEN_TARGET');
    }

    if (actorPerfil === 'ADMIN') return;

    if (actorPerfil === 'FUNCIONARIO' && alvoPerfil === 'ALUNO') return;

    throw new Error('FORBIDDEN_TARGET');
};


// DESATIVAR UTILIZADOR (delete logico)
// O registo NAO e apagado: apenas se altera o flag ativo para false.
// Combinado com a verificacao no authMiddleware, isto faz com que o
// utilizador perca acesso ao sistema imediatamente, mantendo o
// historico (reservas, ocorrencias, etc.) consistente.
//
// O parametro actorPerfil identifica o perfil do utilizador
// autenticado que esta a executar a operacao, para aplicar as
// regras de quem pode atuar sobre quem.
const disableUser = async (id, { actorPerfil } = {}) => {
    const userId = Number(id);

    const existingUser = await prisma.utilizador.findUnique({
        where: { id: userId },
        select: { id: true, perfil: true }
    });

    if (!existingUser) throw new Error('USER_NOT_FOUND');

    validarPermissaoSobreAlvo(actorPerfil, existingUser.perfil);

    return await prisma.utilizador.update({
        where: { id: userId },
        data: { ativo: false },
        select: utilizadorPublicSelect
    });
};


// REATIVAR UTILIZADOR
// Operacao simetrica de disableUser: coloca novamente ativo = true,
// permitindo que o utilizador volte a autenticar-se e a usar a app.
//
// Tal como em disableUser, recebe actorPerfil para validar a
// permissao de actuar sobre o alvo.
const enableUser = async (id, { actorPerfil } = {}) => {
    const userId = Number(id);

    const existingUser = await prisma.utilizador.findUnique({
        where: { id: userId },
        select: { id: true, perfil: true }
    });

    if (!existingUser) throw new Error('USER_NOT_FOUND');

    validarPermissaoSobreAlvo(actorPerfil, existingUser.perfil);

    return await prisma.utilizador.update({
        where: { id: userId },
        data: { ativo: true },
        select: utilizadorPublicSelect
    });
};


module.exports = {
    getAllUsers,
    getAllUsersAdmin,
    getUserById,
    updateUser,
    disableUser,
    enableUser
};
