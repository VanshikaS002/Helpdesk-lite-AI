import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token'); // assuming JWT is stored here
        const res = await axios.get('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <div>Loading Admin Stats...</div>;

  const statusData = [
    { name: 'Resolved', value: stats.resolvedTickets },
    { name: 'Pending', value: stats.pendingTickets }
  ];

  const agentData = stats.ticketsByAgent.map(agent => ({
    name: agent.agent,
    Tickets: agent.count
  }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket Status Pie Chart */}
        <div className="bg-white p-4 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-2">Ticket Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Agent Bar Chart */}
        <div className="bg-white p-4 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-2">Tickets by Agent</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Tickets" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">
        Total Tickets: <span className="font-semibold">{stats.totalTickets}</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
