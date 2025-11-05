// Se importa el framework Express para crear y manejar el servidor.
import express from 'express';
// Se importan los diferentes enrutadores que hemos creado.
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
// NUEVO: Importamos el router de sesiones
import sessionsRouter from './routes/sessions.router.js'; 

// Se importa la función 'engine' de express-handlebars para configurar el motor de plantillas.
import { engine } from 'express-handlebars';
// Se importa el módulo 'path' de Node.js para trabajar con rutas de archivos.
import path from 'path';
// Se importan funciones para obtener la ruta del directorio actual (__dirname) en un entorno de Módulos ES.
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// --- NUEVO: Imports para Passport y Cookies ---
import passport from 'passport';
import initializePassport from './config/passport.config.js'; // (Este archivo lo crearemos ahora)
import cookieParser from 'cookie-parser';

// --- Configuración de __dirname para Módulos ES ---
// Estas dos líneas son un truco necesario para replicar el comportamiento de '__dirname'
// que existía en CommonJS. Nos da la ruta absoluta del directorio donde se encuentra este archivo.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Se crea la instancia principal de la aplicación Express.
const app = express();


// --- Configuración del Motor de Plantillas (Handlebars) ---

// Se registra 'handlebars' como el motor de plantillas para los archivos con esa extensión.
app.engine('handlebars', engine());
// Se establece 'handlebars' como el motor de vistas por defecto de la aplicación.
// Esto permite que en 'res.render()' no se tenga que especificar la extensión '.handlebars'.
app.set('view engine', 'handlebars');
// Se le indica a Express dónde se encuentra la carpeta de las vistas.
// 'path.resolve' crea una ruta absoluta para evitar problemas.
app.set('views', path.resolve(__dirname, 'views'));


// --- Middlewares ---
// Un middleware es una función que se ejecuta en el medio, entre la petición y la respuesta.

// Se agrega el middleware para que Express pueda interpretar y trabajar con JSON en el cuerpo de las peticiones.
app.use(express.json());
// Se agrega el middleware para poder interpretar datos complejos que vienen de formularios HTML.
app.use(express.urlencoded({ extended: true }));
// Se configura la carpeta 'public' para servir archivos estáticos.
// Cualquier archivo dentro de 'src/public' (como CSS o JS del cliente) será accesible desde el navegador.
app.use(express.static(path.resolve(__dirname, 'public')));

// --- NUEVO: Middlewares de autenticación ---
app.use(cookieParser()); // Para leer las cookies (donde irá el token)
initializePassport(); // Inicializamos las estrategias de Passport
app.use(passport.initialize()); // Iniciamos Passport en Express
// NOTA: No usamos passport.session() porque estamos usando JWT (es stateless).


// --- Routers ---
// Se "montan" los routers en la aplicación.

// NUEVO: Router de Sesiones
app.use('/api/sessions', sessionsRouter);

// Cualquier petición que empiece con '/api/products' será manejada por 'productsRouter'.
app.use('/api/products', productsRouter);
// Cualquier petición que empiece con '/api/carts' será manejada por 'cartsRouter'.
app.use('/api/carts', cartsRouter);
// Cualquier petición a la raíz ('/') o subrutas (ej: '/realtimeproducts') será manejada por 'viewsRouter'.
app.use('/', viewsRouter);


// Se exporta la instancia de 'app' ya configurada para que 'server.js' pueda importarla y ponerla en marcha.
export default app;