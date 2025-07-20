import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { 
  CalendarIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Configurar localizer con moment
const localizer = momentLocalizer(moment);

// Configurar idioma español
moment.locale('es', {
  months: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthsShort: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ],
  weekdays: [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ],
  weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  weekdaysMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
});

const InteractiveCalendar = ({ 
  eventos = [], 
  onEventSelect, 
  onEventMove, 
  onSlotSelect,
  userRole = 'visitante',
  view: defaultView = 'month',
  date: defaultDate = new Date()
}) => {
  const [currentView, setCurrentView] = useState(defaultView);
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const [filtros, setFiltros] = useState({
    tipoEvento: 'todos',
    estado: 'todos',
    categoria: 'todos'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  // Tipos de evento disponibles
  const tiposEvento = [
    'todos', 'conferencia', 'workshop', 'networking', 
    'exposicion', 'reunion', 'presentacion'
  ];

  // Estados de evento
  const estadosEvento = [
    'todos', 'programado', 'en_curso', 'completado', 
    'cancelado', 'pospuesto'
  ];

  // Categorías
  const categorias = [
    'todos', 'tecnologia', 'negocios', 'educacion', 
    'salud', 'arte', 'deportes'
  ];

  // Configuración de colores por tipo de evento
  const colorsByType = {
    conferencia: '#3B82F6',
    workshop: '#10B981',
    networking: '#F59E0B',
    exposicion: '#8B5CF6',
    reunion: '#EF4444',
    presentacion: '#06B6D4',
    default: '#6B7280'
  };

  // Configuración de colores por estado
  const colorsByStatus = {
    programado: '#3B82F6',
    en_curso: '#10B981',
    completado: '#6B7280',
    cancelado: '#EF4444',
    pospuesto: '#F59E0B'
  };

  // Formatear eventos para react-big-calendar
  const formattedEvents = useMemo(() => {
    return eventos
      .filter(evento => {
        const matchesTipo = filtros.tipoEvento === 'todos' || evento.tipo === filtros.tipoEvento;
        const matchesEstado = filtros.estado === 'todos' || evento.estado === filtros.estado;
        const matchesCategoria = filtros.categoria === 'todos' || evento.categoria === filtros.categoria;
        return matchesTipo && matchesEstado && matchesCategoria;
      })
      .map(evento => ({
        id: evento.id,
        title: evento.nombre,
        start: new Date(evento.fecha_inicio),
        end: new Date(evento.fecha_fin),
        resource: {
          ...evento,
          color: colorsByType[evento.tipo] || colorsByType.default,
          statusColor: colorsByStatus[evento.estado] || colorsByStatus.programado
        }
      }));
  }, [eventos, filtros]);

  // Detectar conflictos de programación
  useEffect(() => {
    if (userRole === 'administrador' || userRole === 'organizador') {
      const eventConflicts = [];
      
      for (let i = 0; i < formattedEvents.length; i++) {
        for (let j = i + 1; j < formattedEvents.length; j++) {
          const event1 = formattedEvents[i];
          const event2 = formattedEvents[j];
          
          // Verificar si hay solapamiento
          if (
            (event1.start < event2.end && event1.end > event2.start) ||
            (event2.start < event1.end && event2.end > event1.start)
          ) {
            eventConflicts.push({
              event1: event1.title,
              event2: event2.title,
              overlap: {
                start: new Date(Math.max(event1.start, event2.start)),
                end: new Date(Math.min(event1.end, event2.end))
              }
            });
          }
        }
      }
      
      setConflicts(eventConflicts);
    }
  }, [formattedEvents, userRole]);

  // Personalizar el estilo de eventos
  const eventStyleGetter = (event) => {
    const backgroundColor = event.resource?.color || colorsByType.default;
    const borderColor = event.resource?.statusColor || colorsByStatus.programado;
    
    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 6px'
      }
    };
  };

  // Manejar clic en evento
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  // Manejar arrastrar y soltar (solo para administradores/organizadores)
  const handleEventDrop = ({ event, start, end }) => {
    if (userRole === 'administrador' || userRole === 'organizador') {
      if (onEventMove) {
        onEventMove(event, start, end);
      }
    }
  };

  // Manejar selección de slot
  const handleSlotSelect = (slotInfo) => {
    if (userRole === 'administrador' || userRole === 'organizador') {
      if (onSlotSelect) {
        onSlotSelect(slotInfo);
      }
    }
  };

  // Exportar a Google Calendar
  const exportToGoogleCalendar = (event) => {
    const startDate = moment(event.start).format('YYYYMMDDTHHmmss');
    const endDate = moment(event.end).format('YYYYMMDDTHHmmss');
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.resource?.descripcion || '')}`;
    
    window.open(googleUrl, '_blank');
  };

  // Exportar a iCal
  const exportToICal = (event) => {
    const startDate = moment(event.start).format('YYYYMMDDTHHmmss');
    const endDate = moment(event.end).format('YYYYMMDDTHHmmss');
    
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SDN-STAFF//ES
BEGIN:VEVENT
UID:${event.id}@sdn-staff.com
DTSTAMP:${moment().format('YYYYMMDDTHHmmss')}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.resource?.descripcion || ''}
LOCATION:${event.resource?.ubicacion || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title}.ics`;
    link.click();
  };

  // Mensajes en español
  const messages = {
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    allDay: 'Todo el día',
    week: 'Semana',
    work_week: 'Semana laboral',
    day: 'Día',
    month: 'Mes',
    previous: 'Anterior',
    next: 'Siguiente',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    today: 'Hoy',
    agenda: 'Agenda',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: total => `+ Ver ${total} más`
  };

  // Vistas disponibles según el rol
  const availableViews = useMemo(() => {
    const baseViews = ['month', 'week', 'day'];
    if (userRole === 'administrador' || userRole === 'organizador') {
      return [...baseViews, 'agenda'];
    }
    return baseViews;
  }, [userRole]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header con filtros y controles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Calendario de Eventos</h2>
          {conflicts.length > 0 && (
            <div className="flex items-center text-red-600">
              <ExclamationTriangleIcon className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">{conflicts.length} conflictos</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center space-x-2">
          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filtros
          </button>

          {/* Selector de vista */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {availableViews.map(view => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  currentView === view
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view === 'month' ? 'Mes' : 
                 view === 'week' ? 'Semana' :
                 view === 'day' ? 'Día' : 'Agenda'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Evento
              </label>
              <select
                value={filtros.tipoEvento}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipoEvento: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tiposEvento.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo === 'todos' ? 'Todos los tipos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {estadosEvento.map(estado => (
                  <option key={estado} value={estado}>
                    {estado === 'todos' ? 'Todos los estados' : estado.replace('_', ' ').charAt(0).toUpperCase() + estado.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria === 'todos' ? 'Todas las categorías' : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Alertas de conflictos para administradores */}
      {(userRole === 'administrador' || userRole === 'organizador') && conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              Conflictos de Programación Detectados
            </h3>
          </div>
          <div className="space-y-1">
            {conflicts.slice(0, 3).map((conflict, index) => (
              <p key={index} className="text-sm text-red-700">
                {conflict.event1} y {conflict.event2} se superponen
              </p>
            ))}
            {conflicts.length > 3 && (
              <p className="text-sm text-red-600 font-medium">
                Y {conflicts.length - 3} conflictos más...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Calendario principal */}
      <div className="calendar-container" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={formattedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={currentView}
          onView={setCurrentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onSelectEvent={handleEventClick}
          onEventDrop={userRole === 'administrador' || userRole === 'organizador' ? handleEventDrop : undefined}
          onSelectSlot={userRole === 'administrador' || userRole === 'organizador' ? handleSlotSelect : undefined}
          selectable={userRole === 'administrador' || userRole === 'organizador'}
          resizable={userRole === 'administrador' || userRole === 'organizador'}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          views={availableViews}
          step={30}
          timeslots={2}
          className="custom-calendar"
        />
      </div>

      {/* Modal de detalle de evento */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEvent.title}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarDaysIcon className="w-4 h-4 mr-2" />
                  {moment(selectedEvent.start).format('DD/MM/YYYY')}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
                </div>
                
                {selectedEvent.resource?.descripcion && (
                  <p className="text-sm text-gray-700">
                    {selectedEvent.resource.descripcion}
                  </p>
                )}
                
                {selectedEvent.resource?.ubicacion && (
                  <p className="text-sm text-gray-600">
                    <strong>Ubicación:</strong> {selectedEvent.resource.ubicacion}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-2 mt-6">
                <button
                  onClick={() => exportToGoogleCalendar(selectedEvent)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 inline mr-2" />
                  Google Calendar
                </button>
                
                <button
                  onClick={() => exportToICal(selectedEvent)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 inline mr-2" />
                  iCal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leyenda de colores */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="font-medium text-gray-700">Tipos de evento:</div>
        {Object.entries(colorsByType).filter(([key]) => key !== 'default').map(([tipo, color]) => (
          <div key={tipo} className="flex items-center">
            <div 
              className="w-3 h-3 rounded mr-2" 
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-600 capitalize">{tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveCalendar;