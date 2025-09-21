import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  // 'products' será un array que contendrá objetos.
  products: {
    type: [
      {
        // El campo 'product' no guardará el producto entero, sino su ID.
        product: {
          type: mongoose.Schema.Types.ObjectId, // Se especifica que el tipo de dato es un ID de objeto de Mongoose.
          ref: 'Product' // 'ref' le dice a Mongoose que este ID se refiere a un documento en la colección 'Product'.
        },
        quantity: { type: Number, required: true }
      }
    ],
    default: [] // Por defecto, un carrito nuevo tendrá un array de productos vacío.
  }
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;