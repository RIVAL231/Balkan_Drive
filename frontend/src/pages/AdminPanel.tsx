import { Users, FileText, HardDrive, TrendingUp, Shield } from "lucide-react"
import { useAdminStats } from "@/hooks/useStatistics"
import { formatFileSize } from "@/lib/utils"
import Breadcrumb from "@/components/ui/Breadcrumb"
import StatCard from "@/components/ui/StatCard"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function AdminPanel() {
  const { stats, loading } = useAdminStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Admin Panel" }]} />

      {/* Admin Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-6 h-6" />} />

        <StatCard title="Total Files" value={stats.totalFiles} icon={<FileText className="w-6 h-6" />} />

        <StatCard
          title="Total Storage"
          value={formatFileSize(stats.totalStorage)}
          icon={<HardDrive className="w-6 h-6" />}
        />

        <StatCard title="Storage Savings" value={`${stats.totalSavings}%`} icon={<TrendingUp className="w-6 h-6" />} />
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          </div>

          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">View All Users</div>
              <div className="text-sm text-gray-500">Manage user accounts and permissions</div>
            </button>

            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Storage Quotas</div>
              <div className="text-sm text-gray-500">Set and manage user storage limits</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">File Management</h3>
          </div>

          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">All Files</div>
              <div className="text-sm text-gray-500">Browse and manage all user files</div>
            </button>

            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">File Reports</div>
              <div className="text-sm text-gray-500">Generate usage and activity reports</div>
            </button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-gray-900">API Status</p>
            <p className="text-sm text-green-600">Operational</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-gray-900">Database</p>
            <p className="text-sm text-green-600">Healthy</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-gray-900">Storage</p>
            <p className="text-sm text-green-600">Available</p>
          </div>
        </div>
      </div>
    </div>
  )
}
