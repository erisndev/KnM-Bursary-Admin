import { useEffect, useState, useCallback } from "react";
import {
  getApplications,
  getUnnotifiedApplications,
  markAsNotified,
} from "../api/Api";
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, color, percentage }) => (
  <div
    className="bg-white rounded-xl shadow-lg p-6 border-l-4 flex flex-col justify-between"
    style={{ borderLeftColor: color }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {percentage && (
          <p className="text-sm text-gray-500 mt-1">{percentage}% of total</p>
        )}
      </div>
      <div
        className="p-3 rounded-full"
        style={{ backgroundColor: `${color}20` }}
      >
        {Icon && <Icon size={24} style={{ color }} />}
      </div>
    </div>
  </div>
);

const ApplicationTable = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const handleStudentDetails = (e, app) => {
    e.preventDefault();
    navigate(`/applications/${app._id}`);
  };
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 10;
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getApplications(page, limit, search);
      let { applications: apps, total } = res.data;
      if (statusFilter) {
        apps = apps.filter((a) => a.status === statusFilter);
        total = apps.length;
      }
      const stats = {
        total,
        approved: apps.filter((a) => a.status === "approved").length,
        pending: apps.filter((a) => a.status === "pending").length,
        rejected: apps.filter((a) => a.status === "rejected").length,
      };
      setApplications(apps);
      setTotal(total);
      setStats(stats);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const checkNewApplications = useCallback(async () => {
    try {
      const res = await getUnnotifiedApplications();
      if (res.data.length > 0) {
        for (const app of res.data) {
          await markAsNotified(app._id);
        }
        fetchApplications();
      }
    } catch (error) {
      console.error("Error fetching unnotified applications:", error);
    }
  }, [fetchApplications]);

  useEffect(() => {
    const interval = setInterval(checkNewApplications, 60000);
    return () => clearInterval(interval);
  }, [checkNewApplications]);

  const totalPages = Math.ceil(total / limit);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-gray-600 text-base sm:text-lg">
            Manage and monitor student applications
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon={Users}
            color="#3B82F6"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={UserCheck}
            color="#10B981"
            percentage={
              stats.total > 0
                ? Math.round((stats.approved / stats.total) * 100)
                : 0
            }
          />
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="#F59E0B"
            percentage={
              stats.total > 0
                ? Math.round((stats.pending / stats.total) * 100)
                : 0
            }
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={UserX}
            color="#EF4444"
            percentage={
              stats.total > 0
                ? Math.round((stats.rejected / stats.total) * 100)
                : 0
            }
          />
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Recent Applications
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Search Input */}
                <div className="relative w-full sm:w-auto">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => {
                      setPage(1);
                      setSearch(e.target.value);
                    }}
                    className="w-full sm:w-56 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                  />
                </div>
                {/* Status Filter */}
                <select
                  className="w-full sm:w-auto pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                  value={statusFilter}
                  onChange={(e) => {
                    setPage(1);
                    setStatusFilter(e.target.value);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 sm:px-6 py-12 text-center text-gray-500"
                        >
                          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">
                            No applications found
                          </p>
                          <p className="text-sm">
                            Try adjusting your search criteria
                          </p>
                        </td>
                      </tr>
                    ) : (
                      applications.map((app) => (
                        <tr
                          key={app._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 break-words">
                                {app.fullName}
                              </div>
                              <div className="text-sm text-gray-500 break-words">
                                {app.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                app.status
                              )}`}
                            >
                              {app.status.charAt(0).toUpperCase() +
                                app.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(app.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => handleStudentDetails(e, app)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center text-sm text-gray-700 mb-2 sm:mb-0">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(page * limit, total)} of {total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium transition ${
                        page === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={page === totalPages}
                      className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium transition ${
                        page === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationTable;
