const mongoose = require("mongoose")

const CultivosScheme = new mongoose.Schema(
    {
        tipo:{
            type: String,
            enum: ["tomate", "aguacate", "pepino", "maiz", "zanahoria", "cebolla", "patata"],
            default: "tomate",
        },
        numero_tlf:{
            type: String,
        },
        regado:{
            type: Boolean,
            default:false,
        },
        fecha_regado: {
            type: Date,
        },
        listo:{
            type: Boolean,
            default:false,
        },
        muerto:{
            type: Boolean,
            default:false,
        },
    },
    {
        timestamps:true, //crea dos columnas createdAt y updatedAt MUY UTILES PARA LO QUE QUEREMOS HACER
        versionKey:false,
    },
);

module.exports = mongoose.model("cultivos", CultivosScheme)