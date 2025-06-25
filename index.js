const express = require('express');
require('dotenv').config();

const cors = require('cors');
const app = express();
const validador = require('./routes/validadorDoc.route');

app.use(cors());
app.use(express.json());
app.use('/api/usuarios', require('./routes/usuario.routes'));
app.use('/api/lugares', require('./routes/lugar.routes'));
app.use('/api/viajes', require('./routes/viaje.routes'));
app.use('/api/boletos', require('./routes/boleto.routes'));
app.use('/api/compras', require('./routes/compra.routes'));
app.use('/api/auth', require('./routes/auth.routes')); 
app.use('/api/rutas', require('./routes/ruta.routes')); 
app.use('/api/buses', require('./routes/bus.routes')); 
app.use('/api/asiento-viaje', require('./routes/asientoViaje.routes')); 
app.use('/api/distribucion', require('./routes/distribucion.routes')); 
app.use('/api', require('./routes/analisisIA.routes'));
app.use('/api/validar-docs', validador);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
