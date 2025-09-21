import { Router } from 'express';
// Se importan los modelos de Carrito y Producto.
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

const router = Router();

// --- POST para crear un nuevo carrito ---
router.post('/', async (req, res) => {
    try {
        const newCart = await Cart.create({ products: [] });
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- GET para ver un carrito con sus productos completos (usando populate) ---
router.get('/:cid', async (req, res) => {
    try {
        // Se busca el carrito y se usa .populate() para traer la información completa de los productos.
        // 'products.product' es la ruta al campo que queremos poblar.
        const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- POST para agregar un producto a un carrito ---
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }
        
        const product = await Product.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }

        // Se busca si el producto ya existe en el carrito
        const productIndex = cart.products.findIndex(p => p.product.equals(req.params.pid));

        if (productIndex !== -1) {
            // Si ya existe, se incrementa la cantidad
            cart.products[productIndex].quantity++;
        } else {
            // Si no existe, se agrega al array
            cart.products.push({ product: req.params.pid, quantity: 1 });
        }

        await cart.save(); // Se guarda el carrito actualizado
        res.json({ status: 'success', payload: cart });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- PUT para actualizar el carrito con un array de productos ---
router.put('/:cid', async (req, res) => {
    try {
        const { products } = req.body;
        // Se valida que el arreglo de productos sea válido (opcional pero recomendado)
        if (!Array.isArray(products)) {
            return res.status(400).json({ status: 'error', message: 'El formato de los productos es inválido.' });
        }
        const cart = await Cart.findByIdAndUpdate(req.params.cid, { products }, { new: true });
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- PUT para actualizar SÓLO la cantidad de un producto en el carrito ---
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (typeof quantity !== 'number') {
            return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número.' });
        }

        const cart = await Cart.findOneAndUpdate(
            { _id: req.params.cid, 'products.product': req.params.pid },
            { $set: { 'products.$.quantity': quantity } },
            { new: true }
        );
        
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito o producto no encontrado en el carrito' });
        }
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- DELETE para eliminar un producto específico del carrito ---
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await Cart.findByIdAndUpdate(
            req.params.cid,
            // '$pull' es un operador de MongoDB que elimina un elemento de un array que cumpla una condición.
            { $pull: { products: { product: req.params.pid } } },
            { new: true }
        );
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// --- DELETE para vaciar todos los productos del carrito ---
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findByIdAndUpdate(req.params.cid, { products: [] }, { new: true });
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


export default router;