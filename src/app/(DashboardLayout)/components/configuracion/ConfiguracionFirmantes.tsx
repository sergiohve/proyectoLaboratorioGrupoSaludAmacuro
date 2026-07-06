"use client";
import React, { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/utils/api";
import {
  Box, Button, Card, CardContent, CircularProgress,
  Divider, Grid, IconButton, Snackbar, Alert,
  TextField, Tooltip, Typography,
} from "@mui/material";
import {
  CloudUpload, Delete, Save, Person,
} from "@mui/icons-material";

interface Firmante {
  nombre: string;
  cargo: string;
  firma: string;
  sello: string;
}

const defaultFirmante = (): Firmante => ({ nombre: "", cargo: "", firma: "", sello: "" });

const ImageUploadBox = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (b64: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <Box>
      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
        {label}
      </Typography>
      <Box
        sx={{
          border: "2px dashed",
          borderColor: value ? "primary.main" : "divider",
          borderRadius: 2,
          p: 1,
          minHeight: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 1,
          bgcolor: value ? "primary.50" : "background.default",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
        }}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              style={{ maxHeight: 80, maxWidth: "100%", objectFit: "contain" }}
            />
            <Typography variant="caption" color="text.secondary">
              Click para cambiar
            </Typography>
          </>
        ) : (
          <>
            <CloudUpload color="action" />
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Click para subir imagen
              <br />
              PNG / JPG recomendado
            </Typography>
          </>
        )}
      </Box>
      {value && (
        <Button
          size="small"
          color="error"
          startIcon={<Delete fontSize="small" />}
          onClick={(e) => { e.stopPropagation(); onChange(""); }}
          sx={{ mt: 0.5 }}
        >
          Quitar
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
    </Box>
  );
};

export default function ConfiguracionFirmantes() {
  const [firmantes, setFirmantes] = useState<Firmante[]>([defaultFirmante(), defaultFirmante()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false, msg: "", severity: "success",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/configuracion`)
      .then((r) => r.json())
      .then((data) => {
        if (data.firmantes && data.firmantes.length >= 2) {
          setFirmantes(data.firmantes);
        } else if (data.firmantes) {
          const filled = [...data.firmantes];
          while (filled.length < 2) filled.push(defaultFirmante());
          setFirmantes(filled);
        }
      })
      .catch(() => setSnack({ open: true, msg: "No se pudo cargar la configuración", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const updateFirmante = (idx: number, field: keyof Firmante, value: string) => {
    setFirmantes((prev) => prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/configuracion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmantes }),
      });
      if (!res.ok) throw new Error();
      setSnack({ open: true, msg: "Configuración guardada correctamente", severity: "success" });
    } catch {
      setSnack({ open: true, msg: "Error al guardar la configuración", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Firmantes del Laboratorio</Typography>
          <Typography variant="body2" color="text.secondary">
            Configura los nombres, cargos, sellos y firmas que aparecen al pie de los exámenes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving}
          size="large"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {firmantes.map((firmante, idx) => (
          <Grid key={idx} size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Person color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Firmante {idx + 1}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Nombre completo"
                    fullWidth
                    size="small"
                    value={firmante.nombre}
                    onChange={(e) => updateFirmante(idx, "nombre", e.target.value)}
                    placeholder="Ej: Dra. María García"
                  />
                  <TextField
                    label="Cargo / Especialidad"
                    fullWidth
                    size="small"
                    value={firmante.cargo}
                    onChange={(e) => updateFirmante(idx, "cargo", e.target.value)}
                    placeholder="Ej: Bioanálista - MPPS 12345"
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <ImageUploadBox
                        label="Firma"
                        value={firmante.firma}
                        onChange={(v) => updateFirmante(idx, "firma", v)}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <ImageUploadBox
                        label="Sello"
                        value={firmante.sello}
                        onChange={(v) => updateFirmante(idx, "sello", v)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
