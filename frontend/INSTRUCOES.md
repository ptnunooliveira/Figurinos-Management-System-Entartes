# FigHappens - Sistema de Gestão de Figurinos

## Visão Geral

FigHappens é uma aplicação completa de gestão de figurinos escolares desenvolvida em português de Portugal. O sistema permite gerir figurinos, reservas, marketplace, checklists e faturação.

## Funcionalidades Principais

### Para Funcionários

1. **Gestão de Figurinos**
   - Criar novos figurinos com múltiplas fotografias
   - Adicionar acessórios associados
   - Definir localização e estado do figurino
   - Estabelecer valor diário de aluguer

2. **Processar Levantamentos**
   - Criar checklist de levantamento
   - Verificar estado do figurino e acessórios
   - Recolher assinaturas digitais do funcionário e cliente
   - Registar observações

3. **Processar Devoluções**
   - Criar checklist de devolução
   - Comparar estado inicial vs final
   - Criar ocorrências para itens danificados ou em falta
   - Propor valores para cobrança
   - Recolher assinaturas

4. **Administração**
   - Aprovar ou rejeitar anúncios do marketplace
   - Gerir ocorrências reportadas
   - Ver alertas e notificações

5. **Faturação**
   - Filtrar movimentos por período
   - Exportar para Excel
   - Ver resumo de valores a faturar

### Para Alunos/Utilizadores

1. **Catálogo de Figurinos**
   - Pesquisar e filtrar por categoria, tamanho, género
   - Ver detalhes e acessórios incluídos
   - Fazer reservas

2. **Marketplace**
   - Criar anúncios com fotografias (até 5 por anúncio)
   - Partilhar figurinos com a comunidade
   - Ver estado de aprovação dos anúncios

3. **Minhas Reservas**
   - Ver reservas ativas e histórico
   - Consultar períodos e valores
   - Ver ocorrências associadas

## Alternar Tipo de Utilizador

No cabeçalho da aplicação, clique na seta (▼) junto ao tipo de utilizador para alternar entre:
- 👔 Funcionário - Acesso completo a todas as funcionalidades
- 🎓 Aluno - Acesso limitado a funcionalidades de utilizador

## Estrutura do Projeto

```
/src/app/
├── components/
│   ├── layout.tsx              # Layout principal com navegação
│   └── figma/
│       └── ImageWithFallback.tsx
├── lib/
│   ├── dados-mock.ts           # Dados de demonstração
│   └── utils.ts                # Funções utilitárias (Excel, formatação)
├── pages/
│   ├── dashboard.tsx           # Painel principal
│   ├── figurinos.tsx           # Catálogo de figurinos
│   ├── criar-figurino.tsx      # Criar novo figurino (funcionário)
│   ├── reservas.tsx            # Lista de reservas
│   ├── levantamento.tsx        # Checklist de levantamento
│   ├── devolucao.tsx           # Checklist de devolução
│   ├── marketplace.tsx         # Anúncios da comunidade
│   ├── administracao.tsx       # Painel administrativo
│   ├── faturacao.tsx           # Exportação para Excel
│   ├── perfil.tsx              # Perfil do utilizador
│   └── nao-encontrado.tsx      # Página 404
├── routes.tsx                  # Configuração das rotas
└── App.tsx                     # Componente principal
```

## Fluxos de Trabalho Principais

### Criar Figurino (Funcionário)
1. Navegar para "Criar Figurino"
2. Carregar fotografias do figurino
3. Preencher informações (nome, descrição, tamanho, etc.)
4. Selecionar acessórios incluídos
5. Guardar figurino

### Processar Levantamento (Funcionário)
1. Ir a "Reservas" → Selecionar reserva
2. Clicar em "Processar Levantamento"
3. Verificar estado do figurino
4. Fazer checklist de todos os acessórios
5. Recolher assinatura do funcionário
6. Recolher assinatura do cliente
7. Confirmar levantamento

### Processar Devolução com Ocorrências (Funcionário)
1. Ir a "Reservas" → Selecionar reserva
2. Clicar em "Processar Devolução"
3. Verificar estado do figurino na devolução
4. Se encontrar problemas:
   - Marcar acessório como "Mau" ou "Em Falta"
   - OU criar nova ocorrência
   - Descrever o problema
   - Propor valor para cobrança
5. Recolher assinaturas
6. Confirmar devolução

### Criar Anúncio no Marketplace (Qualquer Utilizador)
1. Ir a "Marketplace"
2. Clicar em "Criar Anúncio"
3. Carregar até 5 fotografias
4. Preencher detalhes do figurino
5. Submeter para aprovação
6. Aguardar aprovação do funcionário

### Aprovar Anúncios (Funcionário)
1. Ir a "Administração" → Aba "Anúncios"
2. Rever anúncios pendentes
3. Aprovar ou Rejeitar (com motivo)

### Exportar Faturação (Funcionário)
1. Ir a "Faturação"
2. Definir período (opcional)
3. Clicar em "Exportar para Excel"
4. Ficheiro Excel será descarregado

## Tecnologias Utilizadas

- **React** com TypeScript
- **React Router** para navegação
- **Tailwind CSS** para estilos
- **Lucide React** para ícones
- **React Signature Canvas** para assinaturas digitais
- **XLSX** para exportação Excel
- **Sonner** para notificações toast

## Notas Importantes

- Todos os dados são de demonstração (mock data)
- As assinaturas são recolhidas via canvas HTML5
- A exportação Excel gera ficheiros .xlsx com formatação automática
- O sistema está completamente em português de Portugal
- Upload de imagens usa preview local (base64)

## Próximos Passos para Produção

Para utilizar em produção, seria necessário:
1. Conectar a uma base de dados real (ex: Supabase, PostgreSQL)
2. Implementar autenticação e autorização
3. Armazenar imagens em cloud storage
4. Adicionar validações server-side
5. Implementar sistema de notificações por email
6. Adicionar testes automatizados
