# 1. Enquadramento

Este projeto é desenvolvido no âmbito da iniciativa Projeto 50+10 do 2.º ano da Licenciatura em Engenharia de Sistemas Informáticos do IPCA, ano letivo 2025/2026.

O trabalho visa a articulação prática entre as Unidades Curriculares:

Projeto de Desenvolvimento de Software (PDS): Foco na gestão do ciclo de vida, arquitetura e desenvolvimento Back-end.
Programação Web (PW): Foco no desenvolvimento do Front-end e experiência de utilizador.


# 2. Âmbito e Cliente

O tema central do projeto é a "Gestão de Figurinos" e conta com a colaboração da entidade externa Entartes.
O objetivo é desenvolver uma solução de software completa que responda às necessidades identificadas, desde a análise de requisitos até à entrega final do produto.


# 3. Arquitetura e Stack Tecnológica

O sistema segue uma arquitetura distribuída com separação clara entre cliente e servidor, comunicando via API RESTful.

Front-end: REACT.
Back-end: Node.js.
Base de Dados: Microsoft SQL Server.
Controlo de Versões: Git.


# 4. Metodologia de Trabalho

A equipa utiliza a metodologia Scrum para o planeamento e gestão iterativa do desenvolvimento.

Sprints: Ciclos de desenvolvimento com duração média de 2 semanas.
Gestão: O acompanhamento das tarefas (Backlog), Bugs e Sprints é realizado integralmente nesta plataforma Azure DevOps.
Equipa: 5 elementos.


# 5. Principais Milestones

O planeamento está alinhado com as entregas obrigatórias da UC:

Análise de Requisitos e Modelação: Especificação, Diagramas (BPMN, UML) e Mockups - Março.
Versão Beta (vBeta): Funcionalidades principais implementadas e testadas - Data a definir.
Versão RTW (Ready to Web): Versão final, otimizada e pronta para produção - Maio.
Apresentação Final: Defesa do projeto a 29 de Maio de 2026.


# 6. Nota Técnica Marketplace

Para acelerar a implementação do ciclo temporal do Marketplace sem alterar o modelo E-R nesta fase, o campo `dataaprovacao` foi reutilizado como "data da última decisão" do anúncio:

- Quando um anúncio é publicado, `dataaprovacao` guarda a data de publicação.
- Quando um anúncio é rejeitado, `dataaprovacao` guarda a data de rejeição.

Com base nesta data e no estado atual do anúncio, o backend aplica verificações temporais:

- `Rejeitado` por mais de 3 dias passa para `Arquivado` (equivalente funcional de eliminado lógico).
- `Publicado` por mais de 30 dias passa para `PendenteRenovacao` (quando esse estado existe na tabela de estados).

Nota: apesar de funcional, esta abordagem é transitória do ponto de vista semântico; numa fase posterior, recomenda-se renomear o campo para um nome neutro (ex.: `data_decisao`) ou introduzir campos dedicados.


# 7. Política de Imagens (Marketplace)

Para manter o projeto dentro dos limites gratuitos e com boa performance, os anúncios do Marketplace seguem esta política:

- Máximo de `5` imagens por anúncio.
- Tamanho máximo de `2MB` por imagem.
- Formatos aceites: `JPG`, `PNG` e `WEBP`.

Armazenamento:

- As imagens são carregadas para Supabase Storage (bucket configurável por `SUPABASE_STORAGE_BUCKET`, por omissão `marketplace-images`).
- As imagens ficam organizadas por pasta de anúncio em `marketplace/<id_anuncio>/...`.
- As URLs públicas são resolvidas dinamicamente a partir do Storage quando os anúncios são consultados.

Variáveis de ambiente necessárias no backend para upload:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET` (opcional)
