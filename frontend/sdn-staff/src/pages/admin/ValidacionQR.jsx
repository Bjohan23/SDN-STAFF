import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/AuthContext";
import axios from "../../config/axios";
import {
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  StopIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  TicketIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const ValidacionQR = () => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Estados principales
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const [lastValidation, setLastValidation] = useState(null);
  const [validationHistory, setValidationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventos, setEventos] = useState([]);

  // Estados de estadísticas
  const [stats, setStats] = useState({
    validaciones_exitosas: 0,
    validaciones_fallidas: 0,
    total_validaciones: 0,
  });

  const allowedRoles = ["administrador", "staff"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  useEffect(() => {
    cargarEventos();
    cargarHistorialValidaciones();
    cargarEstadisticas();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const cargarEventos = async () => {
    try {
      const response = await axios.get("/eventos");
      setEventos(response.data.data || []);
      
      // Seleccionar evento activo por defecto
      const eventosActivos = response.data.data.filter(
        e => new Date(e.fecha_fin) > new Date()
      );
      if (eventosActivos.length > 0) {
        setCurrentEvent(eventosActivos[0]);
      }
    } catch (error) {
      console.error("Error cargando eventos:", error);
    }
  };

  const cargarHistorialValidaciones = async () => {
    try {
      const response = await axios.get("/validaciones/historial");
      setValidationHistory(response.data.data || []);
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await axios.get("/validaciones/estadisticas");
      setStats(response.data.data || stats);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const iniciarCamara = async () => {
    try {
      setLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
        
        // Iniciar el escaneo automático
        setTimeout(() => escanearQR(), 1000);
      }
    } catch (error) {
      console.error("Error accediendo a la cámara:", error);
      alert("No se pudo acceder a la cámara. Verifica los permisos.");
    } finally {
      setLoading(false);
    }
  };

  const detenerCamara = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const escanearQR = async () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // Usar una librería QR como jsQR aquí
      // Por ahora, simular detección después de implementar jsQR
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Continuar escaneando si no se detecta QR
      if (isScanning) {
        setTimeout(() => escanearQR(), 100);
      }
    } catch (error) {
      console.error("Error escaneando QR:", error);
      if (isScanning) {
        setTimeout(() => escanearQR(), 500);
      }
    }
  };

  const validarCredencial = async (qrData) => {
    try {
      setLoading(true);
      
      const payload = {
        qr_data: qrData,
        id_evento: currentEvent?.id_evento,
        dispositivo_validacion: "web_scanner",
        punto_acceso: "entrada_principal",
        ubicacion_fisica: "Acceso Principal"
      };

      const response = await axios.post("/validaciones/validar", payload);
      const resultado = response.data;

      setLastValidation({
        ...resultado,
        timestamp: new Date(),
        qr_data: qrData
      });

      // Actualizar historial y estadísticas
      cargarHistorialValidaciones();
      cargarEstadisticas();

      // Mostrar resultado visual
      mostrarResultadoValidacion(resultado);

    } catch (error) {
      console.error("Error validando credencial:", error);
      
      const errorResult = {
        resultado: "fallida",
        motivo_fallo: error.response?.data?.message || "Error de validación",
        timestamp: new Date(),
        qr_data: qrData
      };
      
      setLastValidation(errorResult);
      mostrarResultadoValidacion(errorResult);
    } finally {
      setLoading(false);
    }
  };

  const validarManualmente = async () => {
    if (!manualCode.trim()) {
      alert("Ingresa un código QR válido");
      return;
    }
    
    await validarCredencial(manualCode);
    setManualCode("");
  };

  const mostrarResultadoValidacion = (resultado) => {
    // Aquí podrías agregar efectos visuales, sonidos, etc.
    const color = resultado.resultado === "exitosa" ? "green" : "red";
    document.body.style.backgroundColor = color;
    
    setTimeout(() => {
      document.body.style.backgroundColor = "";
    }, 200);
  };

  const getStatusIcon = (resultado) => {
    switch (resultado) {
      case "exitosa":
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case "fallida":
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case "sospechosa":
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (resultado) => {
    switch (resultado) {
      case "exitosa":
        return "bg-green-100 text-green-800 border-green-200";
      case "fallida":
        return "bg-red-100 text-red-800 border-red-200";
      case "sospechosa":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-gray-700 rounded-lg border border-red-600 p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">No autorizado</h3>
              <p className="text-gray-300">
                No tienes permisos para acceder a esta sección
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <QrCodeIcon className="h-8 w-8 mr-3 text-blue-400" />
          Validación de QR
        </h1>
        <p className="text-gray-400 mt-2">
          Escanea y valida credenciales mediante código QR en tiempo real
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-400">Exitosas</p>
              <p className="text-2xl font-bold text-green-400">{stats.validaciones_exitosas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-400">Fallidas</p>
              <p className="text-2xl font-bold text-red-400">{stats.validaciones_fallidas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
          <div className="flex items-center">
            <TicketIcon className="h-8 w-8 text-blue-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-400">Total</p>
              <p className="text-2xl font-bold text-blue-400">{stats.total_validaciones}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Escáner */}
        <div className="bg-gray-800 rounded-lg border border-gray-600">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <CameraIcon className="h-6 w-6 mr-2 text-blue-400" />
              Escáner QR
            </h2>
            
            {/* Selector de evento */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Evento activo:
              </label>
              <select
                value={currentEvent?.id_evento || ""}
                onChange={(e) => {
                  const evento = eventos.find(ev => ev.id_evento == e.target.value);
                  setCurrentEvent(evento);
                }}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="">Seleccionar evento</option>
                {eventos.map(evento => (
                  <option key={evento.id_evento} value={evento.id_evento}>
                    {evento.nombre_evento}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6">
            {/* Video del escáner */}
            <div className="relative bg-gray-700 rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-64 object-cover ${!isScanning ? 'hidden' : ''}`}
              />
              
              {!isScanning && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <QrCodeIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Cámara desactivada</p>
                  </div>
                </div>
              )}
              
              {/* Overlay de escáner */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-blue-400 w-48 h-48 rounded-lg opacity-70"></div>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Controles de cámara */}
            <div className="flex space-x-3 mb-4">
              {!isScanning ? (
                <button
                  onClick={iniciarCamara}
                  disabled={loading || !currentEvent}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <CameraIcon className="h-5 w-5 mr-2" />
                  )}
                  {loading ? "Iniciando..." : "Iniciar Escáner"}
                </button>
              ) : (
                <button
                  onClick={detenerCamara}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                >
                  <StopIcon className="h-5 w-5 mr-2" />
                  Detener Escáner
                </button>
              )}
            </div>

            {/* Validación manual */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Validación Manual
              </h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ingresa código QR manualmente"
                  className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && validarManualmente()}
                />
                <button
                  onClick={validarManualmente}
                  disabled={!manualCode.trim() || loading || !currentEvent}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Validar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className="space-y-6">
          {/* Última validación */}
          {lastValidation && (
            <div className="bg-gray-800 rounded-lg border border-gray-600">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  {getStatusIcon(lastValidation.resultado)}
                  <span className="ml-2">Última Validación</span>
                </h2>
              </div>

              <div className="p-6">
                <div className={`border rounded-lg p-4 ${getStatusColor(lastValidation.resultado)}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Estado:</p>
                      <p className="font-semibold capitalize">{lastValidation.resultado}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hora:</p>
                      <p>{lastValidation.timestamp?.toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {lastValidation.credencial && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium">{lastValidation.credencial.nombre_completo}</span>
                      </div>
                      
                      {lastValidation.credencial.empresa_organizacion && (
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                          <span>{lastValidation.credencial.empresa_organizacion}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <TicketIcon className="h-4 w-4 mr-2" />
                        <span>{lastValidation.credencial.tipoCredencial?.nombre_tipo}</span>
                      </div>
                    </div>
                  )}

                  {lastValidation.motivo_fallo && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-800">Motivo del fallo:</p>
                      <p className="text-red-700">{lastValidation.motivo_fallo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Historial reciente */}
          <div className="bg-gray-800 rounded-lg border border-gray-600">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                Historial Reciente
              </h2>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {validationHistory.slice(0, 10).map((validation, index) => (
                <div key={index} className="p-4 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(validation.resultado)}
                      <div>
                        <p className="font-medium text-sm text-white">
                          {validation.credencial?.nombre_completo || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(validation.fecha_validacion).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(validation.resultado)}`}>
                      {validation.resultado}
                    </span>
                  </div>
                </div>
              ))}

              {validationHistory.length === 0 && (
                <div className="p-6 text-center text-gray-400">
                  <ClockIcon className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                  <p>No hay validaciones recientes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidacionQR;
