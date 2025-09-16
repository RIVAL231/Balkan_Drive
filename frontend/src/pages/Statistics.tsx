import { HardDrive, FileText, TrendingUp } from "lucide-react"
import { useStorageStats } from "@/hooks/useStatistics"
import { formatFileSize } from "@/lib/utils"
import Breadcrumb from "@/components/ui/Breadcrumb"
import StatCard from "@/components/ui/StatCard"
import ProgressBar from "@/components/ui/ProgressBar"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function Statistics() {
  const { stats, loading } = useStorageStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const storageLimit = 10 * 1024 * 1024 * 1024 // 10GB in bytes
  const usagePercentage = (stats.totalUsed / storageLimit) * 100

  return (
    <div>
      <Breadcrumb items={[{ label: "Statistics" }]} />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Files" value={stats.fileCount} icon={<FileText className="w-6 h-6" />} />

        <StatCard
          title="Storage Used"
          value={formatFileSize(stats.totalUsed)}
          icon={<HardDrive className="w-6 h-6" />}
        />

        <StatCard
          title="Storage Saved"
          value={`${stats.savingsPercentage.toFixed(1)}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: stats.savingsPercentage, isPositive: true }}
        />

        <StatCard
          title="Bytes Saved"
          value={formatFileSize(stats.savingsBytes)}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Storage Usage Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>

          <div className="space-y-4">
            <ProgressBar
              value={stats.totalUsed}
              max={storageLimit}
              label="Used Storage"
              color={usagePercentage > 80 ? "red" : usagePercentage > 60 ? "yellow" : "blue"}
            />

            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatFileSize(stats.totalUsed)} used</span>
              <span>{formatFileSize(storageLimit - stats.totalUsed)} available</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compression Savings</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Original Size</span>
              <span className="font-medium">{formatFileSize(stats.originalSize)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Compressed Size</span>
              <span className="font-medium">{formatFileSize(stats.totalUsed)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium text-green-600">Total Savings</span>
              <span className="font-bold text-green-600">{formatFileSize(stats.savingsBytes)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Type Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Type Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📄</div>
            <p className="font-medium text-gray-900">Documents</p>
            <p className="text-sm text-gray-500">45% of files</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🖼️</div>
            <p className="font-medium text-gray-900">Images</p>
            <p className="text-sm text-gray-500">35% of files</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📹</div>
            <p className="font-medium text-gray-900">Videos</p>
            <p className="text-sm text-gray-500">20% of files</p>
          </div>
        </div>
      </div>
    </div>
  )
}
