import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

type Profile = {
  id: string
  email: string
  role: string
}

const roles = ['admin', 'contract_manager', 'plant_coordinator', 'workforce_coordinator']

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ email: '', role: 'contract_manager' })
  const [newForm, setNewForm] = useState({ email: '', role: 'contract_manager' })

  const fetchProfiles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('is_active', true)
    if (error) {
      setError(error.message)
      setProfiles([])
    } else {
      setProfiles(data ?? [])
      setError(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const validate = (email: string, role: string) => {
    if (!email || !email.includes('@')) {
      return 'Valid email is required'
    }
    if (!roles.includes(role)) {
      return 'Invalid role'
    }
    return null
  }

  const handleCreate = async () => {
    const msg = validate(newForm.email, newForm.role)
    if (msg) {
      setError(msg)
      return
    }
    const tempId = crypto.randomUUID()
    const optimisticProfile = { id: tempId, ...newForm }
    const previous = profiles
    const form = newForm
    setProfiles([...profiles, optimisticProfile])
    setNewForm({ email: '', role: 'contract_manager' })
    setError(null)

    const { data, error } = await supabase
      .from('profiles')
      .insert([newForm])
      .select('id, email, role')
      .single()
    if (error) {
      setProfiles(previous)
      setNewForm(form)
      setError(error.message)
      toast.error(error.message)
    } else if (data) {
      setProfiles((prev) => prev.map((p) => (p.id === tempId ? data : p)))
      toast.success('User created')
    }
  }

  const startEdit = (p: Profile) => {
    setEditingId(p.id)
    setEditForm({ email: p.email, role: p.role })
  }

  const handleUpdate = async (id: string) => {
    const msg = validate(editForm.email, editForm.role)
    if (msg) {
      setError(msg)
      return
    }
    const previousProfiles = profiles
    const previousProfile = profiles.find((p) => p.id === id)!
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, email: editForm.email, role: editForm.role } : p)),
    )
    setEditingId(null)
    setError(null)

    const { data, error } = await supabase
      .from('profiles')
      .update({ email: editForm.email, role: editForm.role })
      .eq('id', id)
      .select('id, email, role')
      .single()
    if (error) {
      setProfiles(previousProfiles)
      setEditingId(id)
      setEditForm({ email: previousProfile.email, role: previousProfile.role })
      setError(error.message)
      toast.error(error.message)
    } else if (data) {
      setProfiles((prev) => prev.map((p) => (p.id === id ? data : p)))
      toast.success('User updated')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user?')) {
      return
    }
    const previousProfiles = profiles
    setProfiles((prev) => prev.filter((p) => p.id !== id))

    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', id)
    if (error) {
      setProfiles(previousProfiles)
      setError(error.message)
      toast.error(error.message)
    } else {
      toast.success('User deleted')
    }
  }

  if (loading) {
    return <div>Loading users...</div>
  }

  return (
    <div>
      <h1>Admin</h1>
      {error && <div>{error}</div>}
      <h2>Add User</h2>
      <div>
        <input
          type='email'
          placeholder='Email'
          value={newForm.email}
          onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
        />
        <select
          value={newForm.role}
          onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button onClick={handleCreate}>Create</button>
      </div>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id}>
              <td>
                {editingId === p.id ? (
                  <input
                    type='email'
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                ) : (
                  p.email
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  p.role
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <>
                    <button onClick={() => handleUpdate(p.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

