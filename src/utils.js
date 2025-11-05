import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 🔑 IMPORTANTE: Cambia esta clave secreta.
// Debería ser una cadena larga y aleatoria guardada en variables de entorno (.env)
export const JWT_PRIVATE_KEY = 'miClaveSecretaParaJWT'; 

/**
 * Crea un hash de la contraseña usando bcrypt.hashSync.
 * @param {string} password - La contraseña en texto plano.
 * @returns {string} - La contraseña hasheada.
 */
export const createHash = (password) => {
    // La consigna pide explícitamente usar hashSync
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

/**
 * Compara una contraseña en texto plano con un hash.
 * @param {object} user - El objeto de usuario (que contiene la pass hasheada).
 * @param {string} password - La contraseña en texto plano a comparar.
 * @returns {boolean} - True si las contraseñas coinciden, false si no.
 */
export const isValidPassword = (user, password) => {
    // Compara la contraseña enviada con la guardada en la DB
    return bcrypt.compareSync(password, user.password);
};

/**
 * Genera un token JWT para un usuario.
 * @param {object} user - El objeto de usuario (debe ser el usuario de la DB).
 * @returns {string} - El token JWT.
 */
export const generateToken = (user) => {
    // Firmamos el token con los datos del usuario que queremos guardar en él
    const token = jwt.sign(
        { 
            // Guardamos solo la info necesaria y NO sensible
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            cart: user.cart // Incluimos el ID del carrito
        }, 
        JWT_PRIVATE_KEY, // La clave secreta para firmar
        { expiresIn: '24h' } // El token expira en 24 horas
    );
    return token;
};

/**
 * Extractor de token desde las cookies.
 * Usado por la estrategia JWT de Passport.
 */
export const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        // Buscamos la cookie que nombraremos 'ecommerceToken'
        token = req.cookies['ecommerceToken']; 
    }
    return token;
};