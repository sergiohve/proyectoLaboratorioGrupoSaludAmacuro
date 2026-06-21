"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  FormControlLabel,
  Checkbox,
  Skeleton,
  Divider,
  Grid,
} from "@mui/material";
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCurrencyDollar,
  IconCategory,
  IconMicroscope,
  IconPrinter,
  IconX,
  IconCheck,
  IconFlask2,
} from "@tabler/icons-react";
import { usePrecios, PrecioExamen } from "@/context/preciosExamenesContext";

const CATEGORIAS = [
  "TODAS",
  "PRUEBAS ESPECIALES Y HORMONALES",
  "ANALISIS HORMONALES ELISA",
  "ANALISIS SEROLOGICO E INMUNOLOGICOS",
];

const CAT_META: Record<string, { gradient: string; chip: string; light: string; label: string }> = {
  "PRUEBAS ESPECIALES Y HORMONALES": {
    gradient: "linear-gradient(135deg, #5e35b1, #7e57c2)",
    chip: "#5e35b1",
    light: "#f5f3ff",
    label: "Especiales y Hormonales",
  },
  "ANALISIS HORMONALES ELISA": {
    gradient: "linear-gradient(135deg, #1565c0, #1e88e5)",
    chip: "#1565c0",
    light: "#e8f0fe",
    label: "Hormonales ELISA",
  },
  "ANALISIS SEROLOGICO E INMUNOLOGICOS": {
    gradient: "linear-gradient(135deg, #2e7d32, #43a047)",
    chip: "#2e7d32",
    light: "#e8f5e9",
    label: "Serológico e Inmunológico",
  },
};

const EMPTY_FORM: Omit<PrecioExamen, "id"> = {
  nombre: "",
  precio: 0,
  categoria: "PRUEBAS ESPECIALES Y HORMONALES",
  porUnidad: false,
};

const StatCard = ({
  label,
  value,
  gradient,
  icon,
}: {
  label: string;
  value: string | number;
  gradient: string;
  icon: React.ReactNode;
}) => (
  <Card
    sx={{
      background: gradient,
      borderRadius: 3,
      boxShadow: "0 8px 32px -8px rgba(0,0,0,0.18)",
      color: "#fff",
      flex: 1,
      minWidth: 160,
    }}
  >
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "16px !important" }}>
      <Box
        sx={{
          background: "rgba(255,255,255,0.2)",
          borderRadius: 2,
          p: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value}</Typography>
        <Typography sx={{ fontSize: 12, opacity: 0.85, mt: 0.3 }}>{label}</Typography>
      </Box>
    </CardContent>
  </Card>
);

export default function PreciosExamenes() {
  const { precios, loading, addPrecio, updatePrecio, deletePrecio } = usePrecios();

  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<PrecioExamen, "id">>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ nombre?: string; precio?: string }>({});

  const [deleteTarget, setDeleteTarget] = useState<PrecioExamen | null>(null);
  const [snack, setSnack] = useState<{ msg: string; severity: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredCategoria = CATEGORIAS[tabIndex] === "TODAS" ? null : CATEGORIAS[tabIndex];

  const filtered = useMemo(() => {
    let data = precios;
    if (filteredCategoria) data = data.filter((p) => p.categoria === filteredCategoria);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((p) => p.nombre.toLowerCase().includes(q));
    }
    return data;
  }, [precios, filteredCategoria, search]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const stats = useMemo(() => {
    const total = precios.length;
    const cats = CATEGORIAS.length - 1;
    const conPrecio = precios.filter((p) => p.precio > 0);
    const avg = conPrecio.length > 0 ? (conPrecio.reduce((s, p) => s + p.precio, 0) / conPrecio.length).toFixed(2) : "0.00";
    return { total, cats, avg };
  }, [precios]);

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (item: PrecioExamen) => {
    setFormData({ nombre: item.nombre, precio: item.precio, categoria: item.categoria, porUnidad: item.porUnidad });
    setEditingId(item.id);
    setFormErrors({});
    setFormOpen(true);
  };

  const validateForm = () => {
    const errors: { nombre?: string; precio?: string } = {};
    if (!formData.nombre.trim()) errors.nombre = "Nombre requerido";
    if (formData.precio < 0) errors.precio = "Precio inválido";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updatePrecio(editingId, formData);
        setSnack({ msg: "Precio actualizado", severity: "success" });
      } else {
        await addPrecio(formData);
        setSnack({ msg: "Examen agregado", severity: "success" });
      }
      setFormOpen(false);
    } catch {
      setSnack({ msg: "Error al guardar", severity: "error" });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePrecio(deleteTarget.id);
      setSnack({ msg: "Examen eliminado", severity: "success" });
    } catch {
      setSnack({ msg: "Error al eliminar", severity: "error" });
    }
    setDeleteTarget(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const catCounts = useMemo(() => {
    const map: Record<string, number> = {};
    CATEGORIAS.slice(1).forEach((c) => {
      map[c] = precios.filter((p) => p.categoria === c).length;
    });
    return map;
  }, [precios]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
          Precios de Exámenes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Gestión del tarifario de pruebas de laboratorio
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <StatCard
          label="Total Exámenes"
          value={stats.total}
          gradient="linear-gradient(135deg, #5e35b1, #7e57c2)"
          icon={<IconMicroscope size={24} color="#fff" />}
        />
        <StatCard
          label="Categorías"
          value={stats.cats}
          gradient="linear-gradient(135deg, #1565c0, #1e88e5)"
          icon={<IconCategory size={24} color="#fff" />}
        />
        <StatCard
          label="Precio Promedio ($)"
          value={stats.avg}
          gradient="linear-gradient(135deg, #2e7d32, #43a047)"
          icon={<IconCurrencyDollar size={24} color="#fff" />}
        />
        <StatCard
          label="En lista actual"
          value={filtered.length}
          gradient="linear-gradient(135deg, #e65100, #ff7043)"
          icon={<IconFlask2 size={24} color="#fff" />}
        />
      </Box>

      {/* Main card */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 24px -4px rgba(0,0,0,0.1)" }}>
        {/* Toolbar */}
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Buscar examen..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            size="small"
            sx={{ flex: 1, minWidth: 200, maxWidth: 380 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
            <Tooltip title="Imprimir tarifario">
              <Button
                variant="outlined"
                startIcon={<IconPrinter size={18} />}
                onClick={handlePrint}
                sx={{ borderRadius: 2 }}
              >
                Imprimir
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<IconPlus size={18} />}
              onClick={openAdd}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #5e35b1, #7e57c2)",
                boxShadow: "0 4px 12px rgba(94,53,177,0.35)",
                "&:hover": { background: "linear-gradient(135deg, #4527a0, #5e35b1)" },
              }}
            >
              Agregar Examen
            </Button>
          </Box>
        </Box>

        {/* Category tabs */}
        <Box sx={{ px: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={(_, v) => { setTabIndex(v); setPage(0); }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": { fontWeight: 600, fontSize: 12, textTransform: "none", minHeight: 44 },
              "& .Mui-selected": { color: "#5e35b1 !important" },
              "& .MuiTabs-indicator": { background: "#5e35b1" },
            }}
          >
            <Tab label={`Todas (${precios.length})`} />
            {CATEGORIAS.slice(1).map((cat) => (
              <Tab
                key={cat}
                label={`${CAT_META[cat].label} (${catCounts[cat] ?? 0})`}
              />
            ))}
          </Tabs>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, fontSize: 12, color: "text.secondary", py: 1.5, whiteSpace: "nowrap" } }}>
                <TableCell sx={{ pl: 2.5 }}>EXAMEN / PRUEBA</TableCell>
                <TableCell>CATEGORÍA</TableCell>
                <TableCell align="center">C/U</TableCell>
                <TableCell align="right">PRECIO ($)</TableCell>
                <TableCell align="center">ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No se encontraron exámenes
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((item, idx) => {
                  const meta = CAT_META[item.categoria];
                  return (
                    <TableRow
                      key={item.id}
                      sx={{
                        "&:hover": {
                          background: meta ? meta.light : "action.hover",
                          transition: "background 0.15s",
                        },
                        "& td": { py: 1.1, fontSize: 13 },
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <TableCell sx={{ pl: 2.5, fontWeight: 500, maxWidth: 400 }}>
                        {item.nombre}
                      </TableCell>
                      <TableCell>
                        {meta && (
                          <Chip
                            label={meta.label}
                            size="small"
                            sx={{
                              background: meta.gradient,
                              color: "#fff",
                              fontWeight: 600,
                              fontSize: 10,
                              height: 22,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {item.porUnidad ? (
                          <Chip
                            label="C/U"
                            size="small"
                            sx={{ background: "#fff3e0", color: "#e65100", fontWeight: 700, fontSize: 10, height: 20 }}
                          />
                        ) : (
                          <span style={{ color: "#bdbdbd", fontSize: 12 }}>—</span>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: item.precio > 0 ? "#2e7d32" : "text.disabled",
                            fontFamily: "monospace",
                          }}
                        >
                          {item.precio > 0 ? `$${item.precio.toFixed(2)}` : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => openEdit(item)}
                              sx={{ color: "#1565c0", "&:hover": { background: "#e8f0fe" } }}
                            >
                              <IconEdit size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => setDeleteTarget(item)}
                              sx={{ color: "#c62828", "&:hover": { background: "#ffebee" } }}
                            >
                              <IconTrash size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 15, 25, 50]}
          labelRowsPerPage="Por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #5e35b1, #7e57c2)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            py: 2,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {editingId ? "Editar Examen" : "Agregar Examen"}
          <IconButton size="small" onClick={() => setFormOpen(false)} sx={{ color: "rgba(255,255,255,0.8)" }}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
            <TextField
              label="Nombre del examen"
              value={formData.nombre}
              onChange={(e) => setFormData((f) => ({ ...f, nombre: e.target.value }))}
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
              fullWidth
              size="small"
              autoFocus
            />
            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={formData.categoria}
                label="Categoría"
                onChange={(e) => setFormData((f) => ({ ...f, categoria: e.target.value }))}
              >
                {CATEGORIAS.slice(1).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {CAT_META[cat].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Precio ($)"
              type="number"
              value={formData.precio}
              onChange={(e) => setFormData((f) => ({ ...f, precio: parseFloat(e.target.value) || 0 }))}
              error={!!formErrors.precio}
              helperText={formErrors.precio}
              fullWidth
              size="small"
              inputProps={{ min: 0, step: 0.5 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.porUnidad}
                  onChange={(e) => setFormData((f) => ({ ...f, porUnidad: e.target.checked }))}
                  sx={{ color: "#5e35b1", "&.Mui-checked": { color: "#5e35b1" } }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>Precio por unidad (C/U)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Aplica cuando el precio es por cada examen individual
                  </Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setFormOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={<IconCheck size={16} />}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #5e35b1, #7e57c2)",
              "&:hover": { background: "linear-gradient(135deg, #4527a0, #5e35b1)" },
            }}
          >
            {saving ? "Guardando..." : editingId ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Eliminar examen</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            ¿Eliminar <strong>{deleteTarget?.nombre}</strong>? Esta acción no se puede deshacer.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<IconTrash size={16} />}
            sx={{ borderRadius: 2 }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print styles */}
      <style>{`
        @media print {
          nav, aside, header, .MuiDrawer-root, .MuiAppBar-root { display: none !important; }
          body { background: white !important; }
          .MuiCard-root { box-shadow: none !important; }
        }
      `}</style>

      {/* Snackbar */}
      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack?.severity ?? "success"} onClose={() => setSnack(null)} sx={{ borderRadius: 2 }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
