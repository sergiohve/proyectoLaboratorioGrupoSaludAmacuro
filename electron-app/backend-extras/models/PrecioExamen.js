const { Schema, model } = require("mongoose");

const precioExamenSchema = new Schema({
  nombre:    { type: String, required: true, trim: true },
  precio:    { type: Number, required: true, default: 0, min: 0 },
  categoria: { type: String, required: true, trim: true },
  porUnidad: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model("PrecioExamen", precioExamenSchema);
