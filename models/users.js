const mongoose = require("mongoose")

const UserScheme = new mongoose.Schema(
    {
        name:{
            type: String
        },
        numero_tlf:{
            type: String,
            unique: true,
        },
        monedas:{
            type: Number,
        },
        madurez:{
            type: ["joven", "adulto", "mayor"],
            default: "joven",
        },
        estado:{
            type: Number,
        },
        num_user_comercio:{
            type: String,
            default: null,
        },
        verdura_vender:{
            type: String,
            default: null,
        },
        verdura_comprar:{
            type: String,
            default: null,
        },
        comerciable_vender:{
            type: String,
            default: null,
        },
        comerciable_comprar:{
            type: String,
            default: null,
        },
        cantidad_vender:{
            type: Number,
            default: 0,
        },
        cantidad_comprar:{
            type: Number,
            default: 0,
        },
        semillas_tomate:{
            type: Number,
            default: 1,
        },
        semillas_aguacate:{
            type: Number,
            default: 1,
        },
        semillas_pepino:{
            type: Number,
            default: 1,
        },
        semillas_maiz:{
            type: Number,
            default: 1,
        },
        semillas_zanahoria:{
            type: Number,
            default: 1,
        },
        semillas_cebolla:{
            type: Number,
            default: 1,
        },
        semillas_patata:{
            type: Number,
            default: 1,
        },
        cajas_tomate:{
            type: Number,
            default: 0,
        },
        cajas_aguacate:{
            type: Number,
            default: 0,
        },
        cajas_pepino:{
            type: Number,
            default: 0,
        },
        cajas_maiz:{
            type: Number,
            default: 0,
        },
        cajas_zanahoria:{
            type: Number,
            default: 0,
        },
        cajas_cebolla:{
            type: Number,
            default: 0,
        },
        cajas_patata:{
            type: Number,
            default: 0,
        },
    },
    {
        timestamps:true, //crea dos columnas createdAt y updatedAt MUY UTILES PARA LO QUE QUEREMOS HACER
        versionKey:false,
    },
);

module.exports = mongoose.model("users", UserScheme)