import { useAuth } from "../../auth/AuthContext";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";

Chart.register(...registerables);

const Dashboard = () => {
  const { user, hasRole } = useAuth();

  const simulatedData = {
    admin: {
      users: [
        { id: 1, email: "admin@example.com", role: "admin", status: "activo" },
        {
          id: 2,
          email: "organizer@example.com",
          role: "organizador",
          status: "activo",
        },
        {
          id: 3,
          email: "exhibitor@example.com",
          role: "expositor",
          status: "pendiente",
        },
      ],
      stats: {
        totalUsuarios: 125,
        usuariosActivos: 98,
        usuariosPendientes: 27,
        totalEventos: 15,
        sesionesHoy: 12,
        nuevosRegistros: 8,
      },
      chartData: {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
        datasets: [
          {
            label: "Usuarios registrados",
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
          {
            label: "Eventos creados",
            data: [2, 3, 1, 5, 4, 2],
            backgroundColor: "rgba(153, 102, 255, 0.6)",
          },
        ],
      },
      // Nuevo gráfico admin: usuarios activos vs pendientes por mes (línea)
      chartData2: {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
        datasets: [
          {
            label: "Usuarios Activos",
            data: [8, 15, 10, 20, 18, 25],
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: true,
            tension: 0.3,
            type: "line",
          },
          {
            label: "Usuarios Pendientes",
            data: [4, 3, 5, 2, 6, 1],
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: true,
            tension: 0.3,
            type: "line",
          },
        ],
      },
    },
    organizador: {
      events: [
        {
          id: 1,
          name: "Feria Tecnológica",
          date: "2023-06-15",
          status: "activo",
          exhibitors: 25,
        },
        {
          id: 2,
          name: "Expo Arte",
          date: "2023-07-20",
          status: "planeado",
          exhibitors: 12,
        },
      ],
      stats: {
        totalEventos: 5,
        eventosActivos: 3,
        eventosPlaneados: 2,
        totalExpositores: 87,
        visitasTotales: 850,
      },
      chartData: {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
        datasets: [
          {
            label: "Visitantes",
            data: [120, 190, 130, 250, 120, 180],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
          },
          {
            label: "Expositores",
            data: [20, 30, 22, 35, 40, 45],
            backgroundColor: "rgba(255, 159, 64, 0.6)",
          },
        ],
      },
      // Nuevo gráfico organizador: eventos activos vs planeados (pie)
      chartData2: {
        labels: ["Eventos Activos", "Eventos Planeados"],
        datasets: [
          {
            data: [3, 2],
            backgroundColor: [
              "rgba(75, 192, 192, 0.7)",
              "rgba(255, 206, 86, 0.7)",
            ],
          },
        ],
      },
    },
    expositor: {
      products: [
        { id: 1, name: "Producto A", price: 100, stock: 50 },
        { id: 2, name: "Producto B", price: 150, stock: 30 },
      ],
      stats: {
        productosTotales: 8,
        visitasTotales: 124,
        contactosGenerados: 42,
        ventas: 28,
        ganancias: 4380,
      },
      chartData: {
        labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
        datasets: [
          {
            label: "Visitas al stand",
            data: [12, 19, 13, 15, 12, 13],
            backgroundColor: "rgba(255, 99, 132, 0.6)",
          },
        ],
      },
      // Nuevo gráfico expositor: ventas y contactos generados (barra)
      chartData2: {
        labels: ["Ventas", "Contactos Generados"],
        datasets: [
          {
            label: "Cantidad",
            data: [28, 42],
            backgroundColor: [
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 159, 64, 0.7)",
            ],
          },
        ],
      },
    },
    visitante: {
      events: [
        {
          id: 1,
          name: "Feria Tecnológica",
          date: "2023-06-15",
          location: "Centro de Convenciones",
        },
        {
          id: 2,
          name: "Expo Arte",
          date: "2023-07-20",
          location: "Museo Nacional",
        },
      ],
      stats: {
        eventosGuardados: 3,
        proximosEventos: 2,
        eventosPasados: 5,
        favoritos: 7,
      },
    },
  };

  const exportToExcel = async (data, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Datos");

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      data.forEach((item) => worksheet.addRow(Object.values(item)));
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportToPDF = (data, title, fileName) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 15);
    const headers = [Object.keys(data[0])];
    const rowData = data.map((item) => Object.values(item));
    autoTable(doc, { head: headers, body: rowData, startY: 25 });
    doc.save(`${fileName}.pdf`);
  };

  const renderStats = (stats) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {Object.entries(stats).map(([key, value]) => (
        <div
          key={key}
          className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-4 rounded-xl shadow-md"
        >
          <h3 className="text-sm font-medium text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </h3>
          <p className="text-2xl font-bold text-indigo-900">{value}</p>
        </div>
      ))}
    </div>
  );

  const renderChart = (chartData, type = "bar") => {
    const options = {
      responsive: true,
      plugins: {
        legend: { position: "top" },
      },
    };

    switch (type) {
      case "pie":
        return <Pie data={chartData} options={options} />;
      case "line":
        return <Line data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  const renderExportButtons = (data, title) => (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={() => exportToExcel(data, title)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md shadow"
      >
        Exportar a Excel
      </button>
      <button
        onClick={() => exportToPDF(data, title, title)}
        className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md shadow"
      >
        Exportar a PDF
      </button>
    </div>
  );

  const adminContent = () => {
    const data = simulatedData.admin;
    return (
      <>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Panel de Administración
        </h2>
        {renderStats(data.stats)}
        {renderExportButtons(data.users, "usuarios")}
        <div className="bg-white rounded-xl shadow p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">Resumen de Actividad</h3>
          {renderChart(data.chartData)}
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Usuarios Activos vs Pendientes
          </h3>
          {renderChart(data.chartData2, "line")}
        </div>
      </>
    );
  };

  const organizerContent = () => {
    const data = simulatedData.organizador;
    return (
      <>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Panel de Organizador
        </h2>
        {renderStats(data.stats)}
        {renderExportButtons(data.events, "eventos")}
        <div className="bg-white rounded-xl shadow p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">Actividad Mensual</h3>
          {renderChart(data.chartData, "line")}
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Eventos Activos vs Planeados
          </h3>
          {renderChart(data.chartData2, "pie")}
        </div>
      </>
    );
  };

  const exhibitorContent = () => {
    const data = simulatedData.expositor;
    return (
      <>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Panel de Expositor
        </h2>
        {renderStats(data.stats)}
        {renderExportButtons(data.products, "productos")}
        <div className="bg-white rounded-xl shadow p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">Tráfico del Stand</h3>
          {renderChart(data.chartData)}
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Ventas y Contactos Generados
          </h3>
          {renderChart(data.chartData2)}
        </div>
      </>
    );
  };

  const visitorContent = () => {
    const data = simulatedData.visitante;
    return (
      <>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Panel de Visitante
          </h2>

          {/* Estadísticas con mejor diseño */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Eventos Guardados
                  </p>
                  <p className="text-3xl font-bold text-blue-800 mt-1">
                    {data.stats.eventosGuardados}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Próximos Eventos
                  </p>
                  <p className="text-3xl font-bold text-green-800 mt-1">
                    {data.stats.proximosEventos}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Eventos Pasados
                  </p>
                  <p className="text-3xl font-bold text-purple-800 mt-1">
                    {data.stats.eventosPasados}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-5 rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favoritos</p>
                  <p className="text-3xl font-bold text-pink-800 mt-1">
                    {data.stats.favoritos}
                  </p>
                </div>
                <div className="bg-pink-100 p-3 rounded-lg">
                  <svg
                    className="w-6 h-6 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de exportación mejorados */}
          <div className="flex space-x-3 mb-8">
            <button
              onClick={() => exportToExcel(data.events, "eventos_guardados")}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exportar a Excel
            </button>
            <button
              onClick={() =>
                exportToPDF(
                  data.events,
                  "Eventos Guardados",
                  "eventos_guardados"
                )
              }
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg shadow transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exportar a PDF
            </button>
          </div>

          {/* Gráficos con mejor presentación */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Distribución de Eventos
                </h3>
              </div>
              <div className="p-5" style={{ height: "300px" }}>
                {renderChart(
                  {
                    labels: ["Guardados", "Próximos", "Pasados", "Favoritos"],
                    datasets: [
                      {
                        data: [
                          data.stats.eventosGuardados,
                          data.stats.proximosEventos,
                          data.stats.eventosPasados,
                          data.stats.favoritos,
                        ],
                        backgroundColor: [
                          "rgba(59, 130, 246, 0.7)",
                          "rgba(16, 185, 129, 0.7)",
                          "rgba(139, 92, 246, 0.7)",
                          "rgba(236, 72, 153, 0.7)",
                        ],
                        borderColor: [
                          "rgba(59, 130, 246, 1)",
                          "rgba(16, 185, 129, 1)",
                          "rgba(139, 92, 246, 1)",
                          "rgba(236, 72, 153, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  },
                  "pie"
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Eventos Pasados vs Próximos
                </h3>
              </div>
              <div className="p-5" style={{ height: "300px" }}>
                {renderChart(
                  {
                    labels: ["Eventos Pasados", "Próximos Eventos"],
                    datasets: [
                      {
                        label: "Cantidad",
                        data: [
                          data.stats.eventosPasados,
                          data.stats.proximosEventos,
                        ],
                        backgroundColor: [
                          "rgba(139, 92, 246, 0.7)",
                          "rgba(59, 130, 246, 0.7)",
                        ],
                        borderColor: [
                          "rgba(139, 92, 246, 1)",
                          "rgba(59, 130, 246, 1)",
                        ],
                        borderWidth: 1,
                      },
                    ],
                  },
                  "bar"
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">
        Panel de Control
      </h1>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          Bienvenido, {user?.correo}
        </h2>
        {hasRole("administrador") && adminContent()}
        {hasRole("organizador") && organizerContent()}
        {hasRole("expositor") && exhibitorContent()}
        {hasRole("visitante") && visitorContent()}
      </div>
    </div>
  );
};

export default Dashboard;
