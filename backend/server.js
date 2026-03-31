const express = require('express');
const app = express();

app.use(express.json());

const anunciosEscolaRoutes = require('./routes/anunciosEscola.routes');
app.use('/anuncios-escola', anunciosEscolaRoutes);

app.listen(3000, () => {
  console.log('Servidor a correr em http://localhost:3000');
});