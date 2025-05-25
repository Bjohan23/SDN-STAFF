import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../services/authService'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate() 
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      // Aquí iría tu llamada API para recuperar contraseña
      await authService.forgotPassword(email)
      navigate('/reset-password', { state: { correo: email } });
      setMessage('Si el correo existe, se ha enviado un enlace para restablecer tu contraseña.')
    } catch (err) {
      
      setError('Error al enviar el correo. Intenta nuevamente.', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#FEF3C7" />
              <path d="M15 10a3 3 0 10-6 0c0 1.657 3 6 3 6s3-4.343 3-6z" stroke="#F59E42" strokeWidth="2" fill="#FDE68A" />
              <circle cx="12" cy="10" r="1" fill="#F59E42" />
            </svg>
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold text-gray-700 mb-2">Recuperar Contraseña</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md w-full text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md w-full text-center">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Enviando...' : 'Enviar Enlace'}
          </button>
        </form>
        <div className="text-center text-sm mt-4">
          <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword