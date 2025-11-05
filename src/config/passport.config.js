import passport from 'passport';
import local from 'passport-local';
import jwt from 'passport-jwt';
import { userModel } from '../models/user.model.js'; // Importamos el modelo de usuario
import { createHash, isValidPassword, JWT_PRIVATE_KEY, cookieExtractor } from '../utils.js'; // Nuestras utilidades
// Importa tu CartManager para poder crear un carrito al registrar un usuario
// Asegúrate de que la ruta sea correcta
// import CartManager from '../managers/CartManager.js'; 
// const cartManager = new CartManager();

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;

const initializePassport = () => {

    // --- ESTRATEGIA DE REGISTRO LOCAL (Nombre: 'register') ---
    passport.use('register', new LocalStrategy(
        // 'passReqToCallback' permite que pasemos 'req' al callback de abajo
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            // Recibimos los datos del formulario (req.body)
            const { first_name, last_name, email, age } = req.body;
            try {
                // 1. Validar campos
                if (!first_name || !last_name || !email || !age || !password) {
                    return done(null, false, { message: 'Faltan campos obligatorios.' });
                }

                // 2. Verificar si el usuario ya existe
                const user = await userModel.findOne({ email: username });
                if (user) {
                    return done(null, false, { message: 'El correo electrónico ya está registrado.' });
                }
                
                // 3. (Opcional pero recomendado) Crear un carrito nuevo para el usuario
                // const newCart = await cartManager.createCart(); // Descomenta esto cuando tengas tu CartManager importado
                
                // 4. Crear el nuevo usuario
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password), // ¡Aquí usamos hashSync! (cumpliendo la consigna)
                    // cart: newCart._id, // Asignar el ID del carrito creado
                    role: 'user' // Rol por defecto
                };

                const result = await userModel.create(newUser);
                // Si todo salió bien, devolvemos el usuario creado
                return done(null, result); 

            } catch (error) {
                return done('Error al registrar el usuario: ' + error);
            }
        }
    ));

    // --- ESTRATEGIA DE LOGIN LOCAL (Nombre: 'login') ---
    passport.use('login', new LocalStrategy(
        { usernameField: 'email' }, // El campo de usuario es 'email'
        async (username, password, done) => {
            try {
                // 1. Buscar usuario por email en la DB
                const user = await userModel.findOne({ email: username });
                if (!user) {
                    // Usuario no encontrado
                    return done(null, false, { message: 'Usuario no encontrado.' });
                }

                // 2. Validar contraseña
                if (!isValidPassword(user, password)) {
                    // Contraseña incorrecta
                    return done(null, false, { message: 'Contraseña incorrecta.' });
                }

                // 3. Si las credenciales son correctas, devolvemos el usuario
                return done(null, user);

            } catch (error) {
                return done('Error al iniciar sesión: ' + error);
            }
        }
    ));

    // --- ESTRATEGIA JWT (Nombre: 'jwt') ---
    // Esta es la estrategia que usará la ruta /current
    passport.use('jwt', new JWTStrategy(
        {
            // Le decimos que extraiga el token desde la cookie 'ecommerceToken'
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]), 
            secretOrKey: JWT_PRIVATE_KEY, // La misma clave secreta que en utils.js
        },
        async (jwt_payload, done) => {
            // jwt_payload es el objeto que guardamos en el token (ver generateToken en utils.js)
            try {
                // Pasamos el payload (los datos del usuario) al 'done'
                // Esto se adjuntará a req.user en la ruta que use esta estrategia
                return done(null, jwt_payload);
            } catch (error) {
                // Si hay un error (ej. token inválido), Passport lo manejará
                return done(error);
            }
        }
    ));

    // (Opcional pero buena práctica) Serialización y Deserialización
    // Aunque con JWT no manejamos sesiones de Express,
    // Passport puede necesitarlos internamente.
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

export default initializePassport;