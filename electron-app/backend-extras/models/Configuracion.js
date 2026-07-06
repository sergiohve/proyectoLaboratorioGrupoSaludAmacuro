const { Schema, model } = require("mongoose");

const firmanteSchema = new Schema({
  nombre: { type: String, default: "" },
  cargo:  { type: String, default: "" },
  firma:  { type: String, default: "" },  // base64 data URL
  sello:  { type: String, default: "" },  // base64 data URL
}, { _id: false });

const configuracionSchema = new Schema({
  singleton:  { type: String, default: "main", unique: true },
  firmantes:  { type: [firmanteSchema], default: [{ nombre: "", cargo: "", firma: "", sello: "" }, { nombre: "", cargo: "", firma: "", sello: "" }] },
}, { timestamps: true });

module.exports = model("Configuracion", configuracionSchema);
