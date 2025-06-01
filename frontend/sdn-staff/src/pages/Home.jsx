import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fondo de video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <iframe
          className="w-full scale-102 h-full"
          src="https://www.youtube.com/embed/4wB_zCuqm54?autoplay=1&mute=1&controls=0&loop=1&playlist=4wB_zCuqm54&modestbranding=1&showinfo=0"
          title="YouTube video player"
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        ></iframe>
      </div>

      {/* Capa oscura para mejor contraste */}
      <div className="absolute inset-0 bg-[#0007] bg-opacity-50 z-10"></div>

      {/* Contenido */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center text-white">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Bienvenido a SDN Staff
          </h1>
          <p className="max-w-xl mx-auto text-xl text-gray-200">
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
    </div>
  );
};

export default Home;
