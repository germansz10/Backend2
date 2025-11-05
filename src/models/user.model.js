import mongoose from 'mongoose';

// Nombre de la colección en la base de datos
const userCollection = 'users';

// Definición del esquema de usuario
const userSchema = new mongoose.Schema({
    first_name: { 
        type: String, 
        required: true 
    },
    last_name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true // Asegura que no haya dos correos iguales
    },
    age: { 
        type: Number, 
        required: true 
    },
    password: { 
        type: String, 
        required: true // Almacenará el hash, no la contraseña original
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts' // Referencia al modelo de carritos
    },
    role: { 
        type: String, 
        default: 'user' // Valor por defecto
    }
});



// Exportamos el modelo
export const userModel = mongoose.model(userCollection, userSchema);