const { Router } = require("express");
const router = Router();
const Configuracion = require("../models/Configuracion");

router.get("/", async (req, res) => {
  try {
    let config = await Configuracion.findOne({ singleton: "main" });
    if (!config) {
      config = await Configuracion.create({ singleton: "main" });
    }
    res.json(config);
  } catch (e) {
    res.status(500).json({ message: "Error al obtener configuración", error: e.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const { firmantes } = req.body;
    const config = await Configuracion.findOneAndUpdate(
      { singleton: "main" },
      { firmantes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(config);
  } catch (e) {
    res.status(500).json({ message: "Error al guardar configuración", error: e.message });
  }
});

module.exports = router;
