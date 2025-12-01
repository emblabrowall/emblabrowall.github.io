import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { motion } from 'motion/react'
import { Shield, Trash2, Search, User, Mail, CheckCircle2, XCircle, Crown, RefreshCw } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'

interface AdminPageProps {
  user: any
  onLoginRequired: () => void
}

interface UserData {
  id: string
  email: string
  name: string
  verified: boolean
  admin: boolean
  createdAt: string | null
}

export function AdminPage({ user, onLoginRequired }: AdminPageProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user) {
      onLoginRequired()
      return
    }
    if (!user.admin) {
      toast.error('Admin access required')
      return
    }
    loadUsers()
  }, [user])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { users: fetchedUsers, error } = await api.getAllUsers()
      if (error) {
        toast.error(error || 'Failed to load users')
        return
      }
      setUsers(fetchedUsers || [])
    } catch (error: any) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (userData: UserData) => {
    setUserToDelete(userData)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    setDeleting(true)
    try {
      const { error } = await api.deleteUser(userToDelete.id)
      if (error) {
        toast.error(error || 'Failed to delete user')
        return
      }
      toast.success('User deleted successfully')
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      await loadUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const filteredUsers = users.filter((userData) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        userData.name.toLowerCase().includes(query) ||
        userData.email.toLowerCase().includes(query) ||
        userData.id.toLowerCase().includes(query)
      )
    }
    return true
  })

  if (!user || !user.admin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Admin Access Required</h2>
        <p className="text-gray-500">You need admin privileges to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage all user accounts</p>
        </div>
        <Button
          onClick={loadUsers}
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-border"
        >
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-border"
        >
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.verified).length}
          </div>
          <div className="text-sm text-muted-foreground">Verified</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-border"
        >
          <div className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.admin).length}
          </div>
          <div className="text-sm text-muted-foreground">Admins</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-border"
        >
          <div className="text-2xl font-bold text-gray-600">
            {users.filter((u) => !u.verified && !u.admin).length}
          </div>
          <div className="text-sm text-muted-foreground">Unverified</div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          placeholder="Search users by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 mx-auto text-blue-600 animate-spin mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-border">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? 'No users found matching your search' : 'No users found'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {filteredUsers.map((userData, index) => (
                  <motion.tr
                    key={userData.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                          {userData.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {userData.name}
                            {userData.admin && (
                              <Crown className="h-4 w-4 text-purple-600" title="Admin" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {userData.email}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-1">
                            {userData.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {userData.verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                            <XCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </span>
                        )}
                        {userData.admin && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
                            <Crown className="h-3 w-3 mr-1" />
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {userData.createdAt
                        ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {userData.id !== user.id ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(userData)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">Current User</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong> (
              {userToDelete?.email})? This action cannot be undone and will delete all their
              posts, comments, threads, and replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

