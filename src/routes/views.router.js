import { Router } from 'express';
// Se importan los modelos para hacer las consultas a la DB.
import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';

const router = Router();

// --- VISTA DE PRODUCTOS CON PAGINACIÓN ---
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query; // Se establece un límite más bajo para probar la paginación
    const options = { 
        page: Number(page), 
        limit: Number(limit), 
        lean: true 
    };
    
    // Se realiza la paginación de productos.
    const result = await Product.paginate({}, options);
    
    // Se renderiza la vista 'products', pasando todos los datos necesarios para la paginación.
    res.render('products', { 
        title: 'Productos',
        products: result.docs,
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${limit}` : null,
        nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${limit}` : null
    });
  } catch (error) {
    res.status(500).send({ status: 'error', message: 'Error al obtener productos' });
  }
});

// --- VISTA PARA UN CARRITO ESPECÍFICO ---
router.get('/carts/:cid', async (req, res) => {
    try {
        // Se busca el carrito y se pueblan los datos de los productos referenciados.
        const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        // Se renderiza la vista 'cart' con los datos del carrito.
        res.render('cart', { 
            title: 'Mi Carrito',
            cart: cart 
        });
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Error al obtener el carrito' });
    }
});


export default router;