import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../utils.js'; // Importamos el generador de token

const router = Router();

// --- RUTA DE REGISTRO ---
// Llama a la estrategia 'register' de Passport.
// { session: false } es para que no inicie una sesión de Express.
router.post('/register', passport.authenticate('register', { 
    failureRedirect: '/api/sessions/registerfail', // Redirige si falla
    session: false 
}), async (req, res) => {
    // Si 'register' fue exitoso, el usuario ya se creó.
    res.status(201).json({ status: 'success', message: 'Usuario registrado exitosamente.' });
});

// Ruta en caso de que falle el registro
router.get('/registerfail', (req, res) => {
    // Passport puede agregar mensajes de error a 'req.session.messages' si se usa session
    // Pero como usamos JWT (stateless), mejor devolvemos un error genérico
    res.status(400).json({ status: 'error', error: 'Error al registrarse. Verifique los campos.' });
});

// --- RUTA DE LOGIN ---
// Llama a la estrategia 'login' de Passport.
router.post('/login', passport.authenticate('login', { 
    failureRedirect: '/api/sessions/loginfail', 
    session: false 
}), async (req, res) => {
    
    // Si 'login' fue exitoso, Passport nos devuelve el usuario en req.user
    // Generamos el token JWT para este usuario
    const token = generateToken(req.user);

    // Enviamos el token en una cookie llamada 'ecommerceToken'
    res.cookie('ecommerceToken', token, {
        httpOnly: true, // La cookie no es accesible desde JS en el cliente (más segura)
        maxAge: 24 * 60 * 60 * 1000 // Expira en 24 horas (en milisegundos)
    }).json({
        status: 'success',
        message: 'Login exitoso.',
    });
});

// Ruta en caso de que falle el login
router.get('/loginfail', (req, res) => {
    res.status(401).json({ status: 'error', error: 'Login fallido. Credenciales incorrectas.' });
});

// --- RUTA "CURRENT" (Requerida por la consigna) ---
// Esta ruta valida el token JWT que viene en la cookie.
// Llama a la estrategia 'jwt' de Passport.
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    // Si la estrategia 'jwt' fue exitosa (el token es válido),
    // Passport adjunta el payload del token (nuestros datos de usuario) a req.user
    res.status(200).json({
        status: 'success',
        user: req.user // Devolvemos los datos del usuario extraídos del token
    });
});

// --- RUTA DE LOGOUT ---
router.post('/logout', (req, res) => {
    // Para hacer logout con JWT, simplemente borramos la cookie del token
    res.clearCookie('ecommerceToken');
    res.status(200).json({ status: 'success', message: 'Logout exitoso.' });
});

export default router;