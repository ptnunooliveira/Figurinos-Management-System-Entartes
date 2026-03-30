const express = require('express');

const app = express();

app.use(express.json());

const reservaRoutes = require('./routes/reservaRoute.js');

app.use('/api/reservas', reservaRoutes);

app.listen(3000, () => {
    console.log('Backend em formato MVC a correr!');
    console.log('Testa aqui: http://localhost:3000/api/reservas');
});