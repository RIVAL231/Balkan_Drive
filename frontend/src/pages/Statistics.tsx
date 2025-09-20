import { HardDrive, FileText, TrendingUp, Users, Share, Share2, ShareIcon } from "lucide-react"
import { useStorageStats } from "@/hooks/useStatistics"
import { formatFileSize } from "@/lib/utils"
import Breadcrumb from "@/components/ui/Breadcrumb"
import StatCard from "@/components/ui/StatCard"
import ProgressBar from "@/components/ui/ProgressBar"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

/**
 * Statistics page component for displaying user storage and file analytics
 * 
 * Features:
 * - Personal storage usage statistics with deduplication savings
 * - File count and sharing metrics visualization
 * - Storage efficiency analysis and savings percentage
 * - Progress bars for visual representation of usage
 * - Responsive card-based layout design
 * - Real-time data updates from GraphQL backend
 * - Mobile-optimized display with appropriate spacing
 * 
 * @example
 * ```tsx
 * // Used as a route component
 * <Route path="/statistics" component={Statistics} />
 * 
 * // Displays user's personal file and storage statistics
 * // including deduplication savings and sharing activity
 * ```
 */
export default function Statistics() {
  const { stats, loading } = useStorageStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const storageLimit = 10 * 1024 * 1024 // 10MB in bytes (as per the app limit)
  const usagePercentage = (stats.totalUsed / storageLimit) * 100

  return (
    <div>
      <Breadcrumb items={[{ label: "Statistics" }]} />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
          title="Files Shared"
          value={stats.totalSharedFiles}
          icon={<Share className="w-6 h-6" />}
        />

        <StatCard
          title="Shared With Me"
          value={stats.totalReceivedShares}
          icon={<Users className="w-6 h-6" />}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deduplication Savings</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Original Size</span>
              <span className="font-medium">{formatFileSize(stats.originalSize)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Deduplicated Size</span>
              <span className="font-medium">{formatFileSize(stats.totalUsed)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium text-green-600">Total Savings</span>
              <span className="font-bold text-green-600">{formatFileSize(stats.savingsBytes)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Sharing Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Sharing Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2 flex items-center justify-center"><ShareIcon /></div>
            <p className="font-medium text-gray-900">Shared by Me</p>
            <p className="text-sm text-blue-600">{stats.totalSharedFiles} files</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2 flex items-center justify-center"><Share2 /></div>
            <p className="font-medium text-gray-900">Shared with Me</p>
            <p className="text-sm text-green-600">{stats.totalReceivedShares} files</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
           <div className="text-2xl mb-2 flex items-center justify-center"><HardDrive /></div>
            <p className="font-medium text-gray-900">Storage Efficiency</p>
            <p className="text-sm text-purple-600">{formatFileSize(stats.savingsBytes)} saved</p>
          </div>
        </div>
      </div>
    </div>
  )
}
