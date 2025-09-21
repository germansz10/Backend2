import { Router } from 'express';
// Se importa el Modelo de Productos en lugar del Manager.
import Product from '../models/product.model.js';

const router = Router();

// === RUTA GET PARA OBTENER PRODUCTOS CON PAGINACIÓN, FILTROS Y ORDENAMIENTO ===

router.get('/', async (req, res) => {
  try {
    // 1. Se obtienen los parámetros de la query (consulta).
    // Se asignan valores por defecto si no se proporcionan.
    const { limit = 10, page = 1, sort, query } = req.query;

    // 2. Se construye el objeto de filtro para la consulta a la base de datos.
    const filter = {};
    if (query) {
      // Si se proporciona una query, se busca por categoría o disponibilidad.
      // '$or' permite buscar documentos que cumplan CUALQUIERA de las condiciones.
      filter.$or = [
        { category: query },
        // Se comprueba si la query es 'true' o 'false' para buscar por el campo 'status'.
        { status: query === 'true' ? true : query === 'false' ? false : undefined }
      ];
    }

    // 3. Se construye el objeto de opciones para la paginación y el ordenamiento.
    const options = {
      page: Number(page),
      limit: Number(limit),
      lean: true // 'lean:true' para que devuelva objetos JSON simples y no documentos de Mongoose.
    };
    if (sort) {
      // Si se proporciona 'sort', se configura el ordenamiento por precio ('asc' o 'desc').
      options.sort = { price: sort === 'asc' ? 1 : -1 };
    }

    // 4. Se realiza la consulta a la base de datos con el método 'paginate' del plugin.
    const result = await Product.paginate(filter, options);

    // 5. Se construye el objeto de respuesta final con el formato solicitado.
    const response = {
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      // Se construyen los enlaces a las páginas previa y siguiente.
      prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null,
      nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null
    };

    // Se envía la respuesta.
    res.json(response);

  } catch (error) {
    // Si algo sale mal, se envía una respuesta de error.
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// === OTRAS RUTAS (GET por ID, POST, PUT, DELETE) AHORA USANDO MONGOOSE ===

router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.json({ status: 'success', payload: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    // Lógica de WebSocket sigue siendo válida
    const io = req.app.get('socketio');
    const products = await Product.find().lean();
    io.emit('updateProducts', products);
    res.status(201).json({ status: 'success', payload: newProduct });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true }).lean();
        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', payload: updatedProduct });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.pid);
        if (!deletedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        // Lógica de WebSocket sigue siendo válida
        const io = req.app.get('socketio');
        const products = await Product.find().lean();
        io.emit('updateProducts', products);
        res.json({ status: 'success', message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


export default router;