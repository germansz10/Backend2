// Se importa la instancia de Express ('app') que ya fue configurada en 'app.js'.
import app from './src/app.js';
import mongoose from 'mongoose';
// Se importa la clase 'Server' desde la librería 'socket.io'.
import { Server } from 'socket.io';

// NOTA: Ya no importamos ProductManager ni path aquí, porque la lógica se moverá a los modelos y rutas.

// Se define el puerto en el que correrá el servidor.
const PORT = 8080;

// --- Conexión a MongoDB ---
// ¡Perfecto! Esta es tu cadena de conexión.
const MONGO_URI = 'mongodb+srv://german16river_db_user:V4QWWAdIawSmybhO@cluster0.tjxur0v.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a la base de datos MongoDB'))
  .catch(err => console.error('Error de conexión:', err));


// ELIMINADO: Ya no necesitamos la instancia del manager de archivos.
// const productManager = new ProductManager(path.resolve('src/data/products.json'));


// --- INICIO DEL SERVIDOR HTTP ---
// Se inicia el servidor UNA SOLA VEZ y se guarda la referencia en httpServer.
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});


// --- INICIO DEL SERVIDOR DE WEBSOCKETS ---
// Se crea la instancia de Socket.io usando el httpServer que ya creamos.
const io = new Server(httpServer);

// Por ahora, vamos a vaciar esta lógica. La reescribiremos después usando los modelos de Mongoose.
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // TODO: Reimplementar esta lógica con Mongoose en el siguiente paso.
  
});

// --- PUENTE ENTRE HTTP Y WEBSOCKETS ---
// Esto sigue siendo correcto y necesario.
app.set('socketio', io);