import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  Package,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import client from '../api/client';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await client.get('/admin/dashboard');
        setStats(data);
      } catch (err) {
        console.error('Lỗi tải stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Thứ 2', revenue: 4000 },
    { name: 'Thứ 3', revenue: 3000 },
    { name: 'Thứ 4', revenue: 2000 },
    { name: 'Thứ 5', revenue: 2780 },
    { name: 'Thứ 6', revenue: 1890 },
    { name: 'Thứ 7', revenue: 2390 },
    { name: 'Chủ Nhật', revenue: 3490 },
  ];

  if (loading) return <div style={styles.loading}>Đang tải dữ liệu...</div>;

  return (
    <div className="animate-fade-in">
      <header style={styles.header}>
        <h1 style={styles.title}>Tổng quan hệ thống</h1>
        <p style={styles.subtitle}>Chào mừng bạn quay lại, đây là những gì đang diễn ra hôm nay.</p>
      </header>

      <div style={styles.grid}>
        <StatCard 
          title="Doanh thu tổng" 
          value={`${stats?.totalRevenue?.toLocaleString()}₫`} 
          icon={<DollarSign size={24} color="#10b981" />} 
          color="#10b981"
          trend="+12.5%"
        />
        <StatCard 
          title="Đơn hàng" 
          value={stats?.totalOrders} 
          icon={<ShoppingBag size={24} color="#2196F3" />} 
          color="#2196F3"
          trend="+5.2%"
        />
        <StatCard 
          title="Người dùng" 
          value={stats?.totalUsers} 
          icon={<Users size={24} color="#8b5cf6" />} 
          color="#8b5cf6"
          trend="+18.7%"
        />
        <StatCard 
          title="Hoa hồng sàn" 
          value={`${stats?.platformRevenue?.toLocaleString()}₫`} 
          icon={<TrendingUp size={24} color="var(--primary)" />} 
          color="var(--primary)"
          trend="+15.3%"
        />
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Doanh thu 7 ngày qua</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Tình trạng hệ thống</h3>
          <div style={styles.statusList}>
            <StatusItem icon={<Package color="#2196F3" />} label="Sản phẩm đang bán" value={stats?.totalProducts} />
            <StatusItem icon={<Users color="#8b5cf6" />} label="Số lượng Seller" value={stats?.totalSellers} />
            <StatusItem icon={<Clock color="#f59e0b" />} label="Đơn hàng chờ xử lý" value="12" />
            <StatusItem icon={<CheckCircle color="#10b981" />} label="Đơn hàng thành công" value="145" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }) => (
  <div style={styles.card}>
    <div style={styles.cardHeader}>
      <div style={{ ...styles.iconWrapper, backgroundColor: `${color}15` }}>{icon}</div>
      <span style={styles.trend}>{trend}</span>
    </div>
    <div style={styles.cardBody}>
      <h4 style={styles.cardTitle}>{title}</h4>
      <p style={styles.cardValue}>{value}</p>
    </div>
  </div>
);

const StatusItem = ({ icon, label, value }) => (
  <div style={styles.statusItem}>
    <div style={styles.statusInfo}>
      {icon}
      <span style={{ marginLeft: '12px' }}>{label}</span>
    </div>
    <span style={styles.statusValue}>{value}</span>
  </div>
);

const styles = {
  loading: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: 'var(--text-muted)',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--text)',
  },
  subtitle: {
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '30px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trend: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#10b981',
    backgroundColor: '#10b98115',
    padding: '4px 8px',
    borderRadius: '20px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-muted)',
  },
  cardValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text)',
    marginTop: '4px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  chartCard: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '20px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border)',
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
    color: 'var(--text)',
  },
  statusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
  },
  statusInfo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '500',
  },
  statusValue: {
    fontWeight: '700',
    color: 'var(--text)',
  }
};

export default Dashboard;
