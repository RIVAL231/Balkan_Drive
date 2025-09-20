import AuditLogs from '@/components/audit/AuditLogs'
import Breadcrumb from '@/components/ui/Breadcrumb'

/**
 * AuditLogsPage component for displaying user activity logs
 * 
 * Features:
 * - Personal activity log viewing for regular users
 * - Integration with AuditLogs component in user mode
 * - Breadcrumb navigation for consistent UI
 * - Security and compliance tracking
 * - Real-time activity monitoring
 * - Responsive design for mobile access
 * 
 * @example
 * ```tsx
 * // Used as a route component
 * <Route path="/activity" component={AuditLogsPage} />
 * 
 * // Shows user's personal activity logs including:
 * // - File uploads, downloads, shares
 * // - Login/logout activities
 * // - Permission changes
 * // - Account modifications
 * ```
 */
export default function AuditLogsPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "My Activity" }]} />
      <AuditLogs isAdmin={false} />
    </div>
  )
}