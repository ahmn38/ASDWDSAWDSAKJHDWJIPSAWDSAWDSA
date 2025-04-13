import { Card, CardContent } from "@/components/ui/card";
import CaseList from "@/components/dashboard/CaseList";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { useQuery } from "@tanstack/react-query";
import { Case, Evidence, Witness } from "@shared/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const { data: cases, isLoading: casesLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  // Example stats for dashboard
  const stats = [
    { name: "Active Cases", value: cases?.filter(c => c.status === "active").length || 0, icon: "folder", color: "#1A237E" },
    { name: "Open Evidence", value: 23, icon: "inventory_2", color: "#388E3C" },
    { name: "Pending Witnesses", value: 8, icon: "people", color: "#D32F2F" },
    { name: "AI Generated Leads", value: 15, icon: "psychology", color: "#0288D1" },
  ];

  // Case status data for pie chart
  const caseStatusData = [
    { name: "Active", value: cases?.filter(c => c.status === "active").length || 0, color: "#D32F2F" },
    { name: "Pending", value: cases?.filter(c => c.status === "pending").length || 0, color: "#FFC107" },
    { name: "Closed", value: cases?.filter(c => c.status === "closed").length || 0, color: "#0288D1" },
  ];

  // Case priority data for bar chart
  const casePriorityData = [
    { name: "High", value: cases?.filter(c => c.priority === "high").length || 0 },
    { name: "Medium", value: cases?.filter(c => c.priority === "medium").length || 0 },
    { name: "Low", value: cases?.filter(c => c.priority === "low").length || 0 },
  ];

  return (
    <>
      {/* Breadcrumbs and Title */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center text-sm">
          <span className="font-medium text-[#212121]">Dashboard</span>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="font-ibm-plex text-2xl font-bold text-[#212121] mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-center">
                <div className="p-3 rounded-full mr-3" style={{ backgroundColor: `${stat.color}20` }}>
                  <span className="material-icons" style={{ color: stat.color }}>{stat.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-[#757575]">{stat.name}</p>
                  <p className="font-ibm-plex text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="font-ibm-plex text-lg font-semibold text-[#212121] mb-4">Case Status Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={caseStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {caseStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="font-ibm-plex text-lg font-semibold text-[#212121] mb-4">Case Priority Breakdown</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={casePriorityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Cases" fill="#1A237E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cases and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CaseList />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </>
  );
}
