export type UserRole = 'super_admin' | 'admin_web' | 'finance'

export function canManageStaff(role: UserRole): boolean {
  return role === 'super_admin'
}

export function canManageAssets(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin_web'
}

export function canUpdateWhois(role: UserRole): boolean {
  return role === 'finance' || canManageAssets(role)
} 