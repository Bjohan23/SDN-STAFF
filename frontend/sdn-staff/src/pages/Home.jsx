import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Bienvenido a SDN Staff
        </h1>
        <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
          Sistema de gestión de personal con control de roles y permisos.
        </p>
        
        <div className="mt-10 flex justify-center space-x-4">
          {isAuthenticated() ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Ir al Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home