import React, { useEffect, useState } from 'react';
import { Users, Briefcase, GraduationCap, FileCheck, TrendingUp, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getAllUsers, calculateStats, AdminStats } from '../src/services/adminService';

const AdminPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [placementData, setPlacementData] = useState<any[]>([]);
  const [riskList, setRiskList] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const users = await getAllUsers();
      const { adminStats, roleChartData, placementChartData, riskList } = calculateStats(users);

      setStats(adminStats);
      setRoleData(roleChartData);
      setPlacementData(placementChartData);
      setRiskList(riskList);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 xl:px-12 w-full max-w-[1600px] mx-auto">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Placement Cell Dashboard</h1>
          <p className="text-gray-500">Real-time student readiness and participation analytics.</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          title="Refresh Data"
        >
          <RefreshCw size={20} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <AdminStat icon={<Users className="text-indigo-600" />} label="Total Students" value={stats?.totalStudents.toString() || "0"} delta="Live" />
        <AdminStat icon={<Briefcase className="text-green-600" />} label="Active Internships" value={stats?.activeInternships.toString() || "0"} delta="Est." />
        <AdminStat icon={<GraduationCap className="text-purple-600" />} label="Avg Readiness" value={`${stats?.avgReadiness}%`} delta="Avg" />
        <AdminStat icon={<FileCheck className="text-orange-600" />} label="Resumes Verified" value={stats?.resumesVerified.toString() || "0"} delta="Clean" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Readiness Heatmap / Chart */}
        <section className="bg-white p-8 rounded-2xl border shadow-sm">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" /> Role Distribution
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Placement Funnel */}
        <section className="bg-white p-8 rounded-2xl border shadow-sm">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Users size={20} className="text-indigo-600" /> Real-time Placement Funnel
          </h2>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={placementData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {placementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 pr-12">
              {placementData.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                  <span className="text-sm font-medium text-gray-600">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Critical List */}
      <section className="bg-white p-8 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-bold mb-6">Students at Risk (Behind Prep Schedule)</h2>
        <div className="overflow-x-auto">
          {riskList.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No students currently at critical risk.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase">Student Name</th>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase">Target Role</th>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase">Progress</th>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase">Review In</th>
                  <th className="pb-4 font-bold text-gray-400 text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {riskList.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium">{s.name}</td>
                    <td className="py-4 text-gray-600">{s.role}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${s.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold">{Math.round(s.progress)}%</span>
                      </div>
                    </td>
                    <td className="py-4 font-bold">{s.days}d</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${s.status === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

const AdminStat: React.FC<{ icon: React.ReactNode; label: string; value: string; delta: string }> = ({ icon, label, value, delta }) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">{icon}</div>
      <span className="text-xs font-bold text-green-600">{delta}</span>
    </div>
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  </div>
);

export default AdminPanel;
