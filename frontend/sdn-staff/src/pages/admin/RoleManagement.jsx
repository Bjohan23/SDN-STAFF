import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'

// Datos de ejemplo - en una aplicación real estos vendrían de una API
const users = [
  { id: 1, email: 'admin@example.com', role: 'admin' },
  { id: 2, email: 'user1@example.com', role: 'user' },
  { id: 3, email: 'user2@example.com', role: 'user' },
]

const RoleManagement = () => {
  const { user } = useAuth()
  const [userList, setUserList] = useState(users)
  const [newRole, setNewRole] = useState('user')

  const handleRoleChange = (userId, newRole) => {
    setUserList(userList.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ))
    // Aquí iría la llamada API para actualizar el rol en el backend
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Roles</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Lista de Usuarios</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona los roles de los usuarios del sistema.
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {userList.map((u) => (
            <div key={u.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{u.email}</p>
                <p className="text-sm text-gray-500">ID: {u.id}</p>
              </div>
              
              <div className="flex items-center">
                {u.id === user?.id ? (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                    {u.role} (Tú)
                  </span>
                ) : (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="admin">Administrador</option>
                    <option value="user">Usuario</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoleManagement