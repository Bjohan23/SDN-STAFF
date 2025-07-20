import { useAuth } from "../../auth/AuthContext";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";
import eventosService from '../../services/eventosService';
import { useEffect, useState, useMemo } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ShoppingBagIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';

Chart.register(...registerables);

// Componente separado para el reloj para evitar re-renders
const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right">
      <p className="text-sm text-indigo-200">Hora actual</p>
      <p className="text-xl font-bold">{currentTime.toLocaleTimeString()}</p>
    </div>
  );
};

const Dashboard = () => {
  const { user, hasRole } = useAuth();

  // Memorizar los datos para evitar re-renders innecesarios
  const simulatedData = useMemo(() => ({
    admin: {
      users: [
        { id: 1, email: "admin@example.com", role: "admin", status: "activo" },
        { id: 2, email: "organizer@example.com", role: "organizador", status: "activo" },
        { id: 3, email: "exhibitor@example.com", role: "expositor", status: "pendiente" },
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
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            borderRadius: 8,
          },
          {
            label: "Eventos creados",
            data: [2, 3, 1, 5, 4, 2],
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      chartData2: {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
        datasets: [
          {
            label: "Usuarios Activos",
            data: [8, 15, 10, 20, 18, 25],
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgba(59, 130, 246, 1)",
            pointBorderWidth: 3,
            pointRadius: 6,
          },
          {
            label: "Usuarios Pendientes",
            data: [4, 3, 5, 2, 6, 1],
            borderColor: "rgba(239, 68, 68, 1)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgba(239, 68, 68, 1)",
            pointBorderWidth: 3,
            pointRadius: 6,
          },
        ],
      },
    },
    organizador: {
      events: [
        { id: 1, name: "Feria Tecnológica", date: "2023-06-15", status: "activo", exhibitors: 25 },
        { id: 2, name: "Expo Arte", date: "2023-07-20", status: "planeado", exhibitors: 12 },
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
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            borderRadius: 8,
          },
          {
            label: "Expositores",
            data: [20, 30, 22, 35, 40, 45],
            backgroundColor: "rgba(245, 158, 11, 0.8)",
            borderColor: "rgba(245, 158, 11, 1)",
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      chartData2: {
        labels: ["Eventos Activos", "Eventos Planeados"],
        datasets: [
          {
            data: [3, 2],
            backgroundColor: [
              "rgba(16, 185, 129, 0.8)",
              "rgba(245, 158, 11, 0.8)",
            ],
            borderColor: [
              "rgba(16, 185, 129, 1)",
              "rgba(245, 158, 11, 1)",
            ],
            borderWidth: 3,
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
            backgroundColor: "rgba(236, 72, 153, 0.8)",
            borderColor: "rgba(236, 72, 153, 1)",
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      chartData2: {
        labels: ["Ventas", "Contactos Generados"],
        datasets: [
          {
            label: "Cantidad",
            data: [28, 42],
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)",
              "rgba(245, 158, 11, 0.8)",
            ],
            borderColor: [
              "rgba(59, 130, 246, 1)",
              "rgba(245, 158, 11, 1)",
            ],
            borderWidth: 3,
            borderRadius: 8,
          },
        ],
      },
    },
    visitante: {
      events: [
        { id: 1, name: "Feria Tecnológica", date: "2023-06-15", location: "Centro de Convenciones" },
        { id: 2, name: "Expo Arte", date: "2023-07-20", location: "Museo Nacional" },
      ],
      stats: {
        eventosGuardados: 3,
        proximosEventos: 2,
        eventosPasados: 5,
        favoritos: 7,
      },
    },
  }), []); // Solo se recalcula una vez

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

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white bg-opacity-5 rounded-full"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
          </div>
          <div className="ml-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-3">
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 text-white/80 mr-1" />
            <span className="text-sm text-white/80">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );

  const ChartCard = ({ title, children, subtitle }) => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const ActionButton = ({ onClick, children, variant = "primary" }) => {
    const variants = {
      primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white",
      secondary: "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white",
      danger: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white",
    };

    return (
      <button
        onClick={onClick}
        className={`flex items-center px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl ${variants[variant]}`}
      >
        {children}
      </button>
    );
  };

  const renderChart = useMemo(() => (chartData, type = "bar") => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
      },
      scales: type !== 'pie' && type !== 'doughnut' ? {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              weight: 'bold'
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            font: {
              weight: 'bold'
            }
          }
        },
      } : {},
    };

    switch (type) {
      case "pie":
        return <Pie data={chartData} options={options} height={300} />;
      case "doughnut":
        return <Doughnut data={chartData} options={options} height={300} />;
      case "line":
        return <Line data={chartData} options={options} height={300} />;
      default:
        return <Bar data={chartData} options={options} height={300} />;
    }
  }, []);

  const adminContent = useMemo(() => {
    const data = simulatedData.admin;
    return (
      <div className="space-y-8">
        {/* Header con tiempo real */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Panel de Administración</h2>
              <p className="text-indigo-100 mt-1">Gestiona usuarios, eventos y el sistema completo</p>
            </div>
            <LiveClock />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total de Usuarios"
            value={data.stats.totalUsuarios}
            icon={UsersIcon}
            color="from-blue-600 to-indigo-600"
            trend="+8% este mes"
          />
          <StatCard
            title="Usuarios Activos"
            value={data.stats.usuariosActivos}
            icon={EyeIcon}
            color="from-emerald-600 to-green-600"
            trend="+12% vs anterior"
          />
          <StatCard
            title="Total Eventos"
            value={data.stats.totalEventos}
            icon={CalendarIcon}
            color="from-purple-600 to-pink-600"
            trend="+2 nuevos"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <ActionButton onClick={() => exportToExcel(data.users, "usuarios")} variant="primary">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exportar a Excel
          </ActionButton>
          <ActionButton onClick={() => exportToPDF(data.users, "Usuarios", "usuarios")} variant="danger">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exportar a PDF
          </ActionButton>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Resumen de Actividad" subtitle="Usuarios y eventos por mes">
            <div style={{ height: '300px' }}>
              {renderChart(data.chartData)}
            </div>
          </ChartCard>
          <ChartCard title="Tendencia de Usuarios" subtitle="Activos vs Pendientes">
            <div style={{ height: '300px' }}>
              {renderChart(data.chartData2, "line")}
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }, [simulatedData.admin, renderChart]);

  const organizerContent = useMemo(() => {
    const data = simulatedData.organizador;
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Panel de Organizador</h2>
              <p className="text-emerald-100 mt-1">Organiza eventos y gestiona expositores</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-200">Eventos activos</p>
              <p className="text-xl font-bold">{data.stats.eventosActivos}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Eventos"
            value={data.stats.totalEventos}
            icon={CalendarIcon}
            color="from-emerald-600 to-teal-600"
          />
          <StatCard
            title="Total Expositores"
            value={data.stats.totalExpositores}
            icon={UsersIcon}
            color="from-orange-600 to-amber-600"
          />
          <StatCard
            title="Visitas Totales"
            value={data.stats.visitasTotales}
            icon={EyeIcon}
            color="from-purple-600 to-indigo-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <ActionButton onClick={() => exportToExcel(data.events, "eventos")} variant="secondary">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exportar Eventos
          </ActionButton>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Actividad Mensual" subtitle="Visitantes y expositores">
            <div style={{ height: '300px' }}>
              {renderChart(data.chartData)}
            </div>
          </ChartCard>
          <ChartCard title="Estado de Eventos" subtitle="Distribución actual">
            <div style={{ height: '300px' }}>
              {renderChart(data.chartData2, "doughnut")}
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }, [simulatedData.organizador, renderChart]);

  const exhibitorContent = useMemo(() => {
    const data = simulatedData.expositor;
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Panel de Expositor</h2>
              <p className="text-pink-100 mt-1">Gestiona tu stand y productos</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-pink-200">Ganancias</p>
              <p className="text-xl font-bold">${data.stats.ganancias}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Productos"
            value={data.stats.productosTotales}
            icon={ShoppingBagIcon}
            color="from-blue-600 to-indigo-600"
          />
          <StatCard
            title="Visitas"
            value={data.stats.visitasTotales}
            icon={EyeIcon}
            color="from-emerald-600 to-green-600"
          />
          <StatCard
            title="Contactos"
            value={data.stats.contactosGenerados}
            icon={UsersIcon}
            color="from-amber-600 to-orange-600"
          />
          <StatCard
            title="Ventas"
            value={data.stats.ventas}
            icon={ChartBarIcon}
            color="from-purple-600 to-pink-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Tráfico del Stand" subtitle="Visitas diarias">
            <div style={{ height: '300px' }}>
              {renderChart(data.chartData)}
            </div>
          </ChartCard>
          <ChartCard title="Rendimiento" subtitle="Ventas vs Contactos">
            <div style={{ height: '300px' }}>
              {renderChart(data.chartData2)}
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }, [simulatedData.expositor, renderChart]);

  const visitorContent = useMemo(() => {
    const data = simulatedData.visitante;
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Panel de Visitante</h2>
              <p className="text-violet-100 mt-1">Descubre eventos y gestiona tus favoritos</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-violet-200">Próximos</p>
              <p className="text-xl font-bold">{data.stats.proximosEventos}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Eventos Guardados"
            value={data.stats.eventosGuardados}
            icon={CalendarIcon}
            color="from-blue-600 to-indigo-600"
          />
          <StatCard
            title="Próximos Eventos"
            value={data.stats.proximosEventos}
            icon={BellIcon}
            color="from-emerald-600 to-green-600"
          />
          <StatCard
            title="Eventos Pasados"
            value={data.stats.eventosPasados}
            icon={ChartBarIcon}
            color="from-purple-600 to-violet-600"
          />
          <StatCard
            title="Favoritos"
            value={data.stats.favoritos}
            icon={StarIcon}
            color="from-pink-600 to-rose-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <ActionButton onClick={() => exportToExcel(data.events, "eventos_guardados")} variant="primary">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exportar a Excel
          </ActionButton>
          <ActionButton onClick={() => exportToPDF(data.events, "Eventos Guardados", "eventos_guardados")} variant="danger">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exportar a PDF
          </ActionButton>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Distribución de Eventos" subtitle="Por categoría">
            <div style={{ height: '300px' }}>
              {renderChart({
                labels: ["Guardados", "Próximos", "Pasados", "Favoritos"],
                datasets: [{
                  data: [
                    data.stats.eventosGuardados,
                    data.stats.proximosEventos,
                    data.stats.eventosPasados,
                    data.stats.favoritos,
                  ],
                  backgroundColor: [
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(139, 92, 246, 0.8)",
                    "rgba(236, 72, 153, 0.8)",
                  ],
                  borderColor: [
                    "rgba(59, 130, 246, 1)",
                    "rgba(16, 185, 129, 1)",
                    "rgba(139, 92, 246, 1)",
                    "rgba(236, 72, 153, 1)",
                  ],
                  borderWidth: 3,
                }],
              }, "doughnut")}
            </div>
          </ChartCard>
          <ChartCard title="Comparativa" subtitle="Pasados vs Próximos">
            <div style={{ height: '300px' }}>
              {renderChart({
                labels: ["Eventos Pasados", "Próximos Eventos"],
                datasets: [{
                  label: "Cantidad",
                  data: [data.stats.eventosPasados, data.stats.proximosEventos],
                  backgroundColor: [
                    "rgba(139, 92, 246, 0.8)",
                    "rgba(59, 130, 246, 0.8)",
                  ],
                  borderColor: [
                    "rgba(139, 92, 246, 1)",
                    "rgba(59, 130, 246, 1)",
                  ],
                  borderWidth: 3,
                  borderRadius: 8,
                }],
              })}
            </div>
          </ChartCard>
        </div>
      </div>
    );
  }, [simulatedData.visitante, renderChart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      <div className="relative z-10 p-6">
        {/* Main Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🚀 Panel de Control
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Bienvenido de vuelta, <span className="text-indigo-600 font-bold">{user?.correo}</span>
          </p>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto">
          {hasRole("administrador") && adminContent}
          {hasRole("organizador") && organizerContent}
          {hasRole("expositor") && exhibitorContent}
          {hasRole("visitante") && visitorContent}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;