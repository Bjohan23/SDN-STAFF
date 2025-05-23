import { useAuth } from '../../auth/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Bienvenido, {user?.email}</h2>
        <p className="text-gray-600">
          Este es tu panel de control. Aquí puedes ver un resumen de tu actividad.
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-medium text-indigo-800">Estadísticas</h3>
            <p className="mt-2 text-gray-600">Contenido de estadísticas...</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">Actividad reciente</h3>
            <p className="mt-2 text-gray-600">Contenido de actividad...</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-800">Notificaciones</h3>
            <p className="mt-2 text-gray-600">Contenido de notificaciones...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard