import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Se define el "esquema" de nuestros productos.
// Un esquema es un objeto que define la forma y las reglas de los documentos.
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  code: { type: String, required: true, unique: true }, // 'unique:true' asegura que no haya dos productos con el mismo código.
  stock: { type: Number, required: true },
  status: { type: Boolean, default: true }, // 'default:true' asigna este valor si no se envía uno.
  category: { type: String, required: true },
  thumbnails: { type: [String], default: [] } // Un array de strings.
});

// Se aplica el plugin de paginación al esquema.
// Esto le añade un método '.paginate()' a nuestro modelo, que usaremos en la API.
productSchema.plugin(mongoosePaginate);

// Se compila el esquema para crear el modelo.
// El primer argumento 'Product' es el nombre que le damos al modelo.
// Mongoose automáticamente buscará una colección en plural y minúsculas ('products') en la base de datos.
const Product = mongoose.model('Product', productSchema);

export default Product;