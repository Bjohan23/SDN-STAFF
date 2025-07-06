import React, { useEffect, useState } from "react";
import { getActividades } from "../../services/actividadesService";
import {
  Card,
  Table,
  Tabs,
  Tab,
  Button,
  Input,
  Select,
  Spin,
  Alert,
} from "antd";

const { Option } = Select;

const AgendaEvento = ({ idEvento }) => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [vista, setVista] = useState("cronologica");

  useEffect(() => {
    fetchActividades();
    // eslint-disable-next-line
  }, [idEvento, filtros, vista]);

  const fetchActividades = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { id_evento: idEvento, ...filtros, limit: 100 };
      const res = await getActividades(params);
      setActividades(res.data || []);
    } catch {
      setError("Error al cargar actividades");
    }
    setLoading(false);
  };

  // Filtros básicos: track, ponente, tipo, modalidad, fechas
  const handleFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  // Renderizado por vista
  const renderActividades = () => {
    if (vista === "cronologica") {
      return (
        <Table
          dataSource={actividades}
          rowKey="id_actividad"
          columns={[
            { title: "Título", dataIndex: "titulo" },
            { title: "Track", dataIndex: ["track", "nombre_track"] },
            {
              title: "Ponentes",
              render: (_, rec) =>
                rec.asignacionesPonente
                  ?.map((p) => p.ponente?.nombre_completo)
                  .join(", "),
            },
            { title: "Duración", dataIndex: "duracion_minutos" },
            { title: "Ubicación", dataIndex: "ubicacion" },
            { title: "Aforo", dataIndex: "aforo_maximo" },
            { title: "Modalidad", dataIndex: "modalidad" },
            {
              title: "Sala Virtual",
              dataIndex: ["salaVirtual", "nombre_sala"],
            },
            {
              title: "Recursos",
              render: (_, rec) =>
                rec.asignacionesRecurso
                  ?.map((r) => r.recurso?.nombre_recurso)
                  .join(", "),
            },
          ]}
        />
      );
    }
    // Otras vistas: por track, por ponente...
    // Puedes expandir aquí según necesidad
    return null;
  };

  return (
    <Card title="Agenda del Evento">
      <Tabs activeKey={vista} onChange={setVista}>
        <Tab key="cronologica" tab="Vista Cronológica" />
        {/* Puedes agregar más tabs para track, ponente, etc. */}
      </Tabs>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input.Search
          placeholder="Buscar título o descripción"
          onSearch={(val) => handleFiltro("search", val)}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Modalidad"
          onChange={(val) => handleFiltro("modalidad", val)}
          allowClear
          style={{ width: 120 }}
        >
          <Option value="presencial">Presencial</Option>
          <Option value="virtual">Virtual</Option>
          <Option value="hibrido">Híbrido</Option>
        </Select>
        {/* Puedes agregar más filtros aquí: track, ponente, fechas, etc. */}
        <Button onClick={() => setFiltros({})}>Limpiar filtros</Button>
      </div>
      {error && <Alert type="error" message={error} />}
      {loading ? <Spin /> : renderActividades()}
    </Card>
  );
};

export default AgendaEvento;
