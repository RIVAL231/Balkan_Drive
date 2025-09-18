import AuditLogs from '@/components/audit/AuditLogs'
import Breadcrumb from '@/components/ui/Breadcrumb'

export default function AuditLogsPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "My Activity" }]} />
      <AuditLogs isAdmin={false} />
    </div>
  )
}