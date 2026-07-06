const { Router } = require("express");
const router = Router();
const PrecioExamen = require("../models/PrecioExamen");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.categoria) filter.categoria = req.query.categoria;
    const precios = await PrecioExamen.find(filter).sort({ categoria: 1, nombre: 1 });
    res.json(precios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener precios", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre, precio, categoria, porUnidad, _id } = req.body;
    if (!nombre || !categoria) return res.status(400).json({ message: "nombre y categoria requeridos" });
    if (_id) {
      const doc = await PrecioExamen.findByIdAndUpdate(
        _id,
        { nombre, precio: precio ?? 0, categoria, porUnidad: porUnidad ?? false },
        { upsert: true, new: true }
      );
      return res.status(201).json(doc);
    }
    const nuevo = new PrecioExamen({ nombre, precio: precio ?? 0, categoria, porUnidad: porUnidad ?? false });
    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ message: "Error al crear precio", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nombre, precio, categoria, porUnidad } = req.body;
    const actualizado = await PrecioExamen.findByIdAndUpdate(
      req.params.id,
      { nombre, precio, categoria, porUnidad },
      { new: true, runValidators: true }
    );
    if (!actualizado) return res.status(404).json({ message: "Precio no encontrado" });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar precio", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const eliminado = await PrecioExamen.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ message: "Precio no encontrado" });
    res.json({ message: "Precio eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar precio", error: error.message });
  }
});

module.exports = router;
