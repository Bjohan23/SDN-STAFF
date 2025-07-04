import { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthContext'
import usuariosService from '../../services/usuarios'

const Profile = () => {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [profile, setProfile] = useState({
    nombre: '',
    correo: '',
    bio: '',
    foto_url: ''
  })
  const [formData, setFormData] = useState({
    nombre: '',
    bio: '',
    foto_url: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [editMode, setEditMode] = useState(false)

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const response = await usuariosService.getProfile()
        const profileData = response.data
        setProfile({
          nombre: profileData.nombre || '',
          correo: profileData.correo || '',
          bio: profileData.bio || '',
          foto_url: profileData.foto_url || ''
        })
        setFormData({
          nombre: profileData.nombre || '',
          bio: profileData.bio || '',
          foto_url: profileData.foto_url || '',
          password: '',
          newPassword: '',
          confirmPassword: ''
        })
      } catch (error) {
        setMessage({ type: 'error', text: 'Error al cargar el perfil' })
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEdit = () => {
    setFormData({
      nombre: profile.nombre,
      bio: profile.bio,
      foto_url: profile.foto_url,
      password: '',
      newPassword: '',
      confirmPassword: ''
    })
    setEditMode(true)
    setMessage({ type: '', text: '' })
  }

  const handleCancel = () => {
    setEditMode(false)
    setMessage({ type: '', text: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar campos obligatorios
    if (!formData.nombre || formData.nombre.trim() === '') {
      setMessage({ type: 'error', text: 'El nombre es requerido' })
      return
    }
    if (!formData.foto_url || formData.foto_url.trim() === '') {
      setMessage({ type: 'error', text: 'La URL de la foto es requerida' })
      return
    }
    if (!formData.bio || formData.bio.trim() === '') {
      setMessage({ type: 'error', text: 'La biografía es requerida' })
      return
    }
    
    // Validar cambio de contraseña si se llenan los campos
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.password) {
        setMessage({ type: 'error', text: 'Debe ingresar la contraseña actual' })
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
        return
      }
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' })
        return
      }
    }
    try {
      setLoading(true)
      setMessage({ type: '', text: '' })
      const updateData = {
        nombre: formData.nombre,
        bio: formData.bio,
        foto_url: formData.foto_url
      }
      if (formData.newPassword) {
        updateData.password = formData.newPassword
        updateData.currentPassword = formData.password
      }
      await usuariosService.updateProfile(updateData)
      setProfile({
        ...profile,
        ...updateData,
        correo: profile.correo // aseguramos que el correo no cambie
      })
      setEditMode(false)
      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar el perfil'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Perfil de Usuario</h1>
      {message.text && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
        {!editMode ? (
          // Modo vista
          <div>
            <div className="flex flex-col items-center mb-6">
              {profile.foto_url ? (
                <img
                  src={profile.foto_url}
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 mb-2"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-bold mb-2 ${
                profile.foto_url ? 'hidden' : ''
              }`}>
                {profile.nombre ? profile.nombre.charAt(0).toUpperCase() : profile.correo?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-semibold mt-2">{profile.nombre || profile.correo}</h2>
              <p className="text-gray-600">{profile.correo}</p>
              {user?.role && <p className="text-gray-400 text-sm">{user.role}</p>}
            </div>
            {profile.bio && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                <div className="text-gray-800 whitespace-pre-line bg-gray-50 rounded p-3 border border-gray-100">
                  {profile.bio}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 font-medium rounded-md shadow-sm bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Editar
              </button>
            </div>
          </div>
        ) : (
          // Modo edición
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese su nombre completo"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={profile.correo}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">El correo no se puede modificar</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="foto_url" className="block text-sm font-medium text-gray-700">
                  URL de foto de perfil <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="foto_url"
                  name="foto_url"
                  value={formData.foto_url}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                                  <p className="mt-1 text-sm text-gray-500">Ingrese la URL de su foto de perfil (requerido)</p>
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Biografía <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Cuéntenos algo sobre usted..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                                  <p className="mt-1 text-sm text-gray-500">Máximo 1000 caracteres (requerido)</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar contraseña</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile