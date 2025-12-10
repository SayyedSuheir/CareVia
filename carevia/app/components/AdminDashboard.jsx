"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/_context/useAuth';
import { useRouter } from 'next/navigation';

function AdminDashboard() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalUsers: 0, totalDonations: 0 });
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // Check if user is admin (has @carevia.com email)
  const isAdmin = user && user.email && user.email.endsWith('@carevia.com');

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        router.push('/login');
      } else if (!isAdmin) {
        setAccessDenied(true);
      }
    }
  }, [isLoggedIn, isAdmin, authLoading, router]);

  // Fetch dashboard stats
  useEffect(() => {
    if (activeTab === 'dashboard' && isAdmin) {
      fetchStats();
    }
  }, [activeTab, isAdmin]);

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, isAdmin]);

  // Fetch donations when donations tab is active
  useEffect(() => {
    if (activeTab === 'donations' && isAdmin) {
      fetchDonations();
    }
  }, [activeTab, isAdmin]);

  // Fetch reports when reports tab is active
  useEffect(() => {
    if (activeTab === 'reports' && isAdmin) {
      fetchReports();
    }
  }, [activeTab, isAdmin]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
      } else if (res.status === 403) {
        setAccessDenied(true);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users?page=1&limit=50', {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.users);
      } else if (res.status === 403) {
        setAccessDenied(true);
      }
    } catch (err) {
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/donations?page=1&limit=50', {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        setDonations(data.donations);
      } else if (res.status === 403) {
        setAccessDenied(true);
      }
    } catch (err) {
      console.error('Donations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports?type=overview', {
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        setReports(data.data);
      } else if (res.status === 403) {
        setAccessDenied(true);
      }
    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Show loading state
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Show access denied message
  if (accessDenied || !isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: '1rem'
      }}>
        <h1>Access Denied</h1>
        <p>Only users with @carevia.com email can access the admin dashboard.</p>
        <button 
          onClick={() => router.push('/')}
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-head">
          <div className="admin-logo">
            <h2>
              <span style={{ color: "white" }}>Care</span>
              <span style={{ color: "gold" }}>Via</span>
            </h2>
          </div>
          <div className="logout-btn">
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="admin-nav">
          <nav className="admin-nav-items">
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button 
              className={activeTab === 'donations' ? 'active' : ''}
              onClick={() => setActiveTab('donations')}
            >
              Donations
            </button>
            <button 
              className={activeTab === 'reports' ? 'active' : ''}
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="admin-main">
        <section className="dashboard" style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <div className="dashboard-title">
            <h2>Dashboard</h2>
          </div>
          <div className="stats-cards">
            <div className="card">
              Total Users: {loading ? '...' : stats.totalUsers}
            </div>
            <div className="card">
              Total Donations: {loading ? '...' : stats.totalDonations}
            </div>
          </div>
        </section>

        <section className="users-tab" style={{ display: activeTab === 'users' ? 'block' : 'none' }}>
          <div className="users-tab-title">
            <h2>Users Management</h2>
          </div>
          <table className="users-tab-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="donations-tab" style={{ display: activeTab === 'donations' ? 'block' : 'none' }}>
          <h2>Donations Management</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Donor</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : donations.length > 0 ? (
                donations.map((donation) => (
                  <tr key={donation._id}>
                    <td>{donation.name}</td>
                    <td>{donation.Type}</td>
                    <td>{donation.userId?.name || 'Unknown'}</td>
                    <td>{formatDate(donation.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No donations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="reports-tab" style={{ display: activeTab === 'reports' ? 'block' : 'none' }}>
          <h2>Reports</h2>
          {loading ? (
            <p>Loading reports...</p>
          ) : reports ? (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h3>Donations by Type</h3>
                {reports.donationsByType && reports.donationsByType.length > 0 ? (
                  <ul>
                    {reports.donationsByType.map((type) => (
                      <li key={type._id}>
                        {type._id}: {type.count} donations
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No donation data available</p>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3>Top Donors</h3>
                {reports.topDonors && reports.topDonors.length > 0 ? (
                  <ul>
                    {reports.topDonors.map((donor) => (
                      <li key={donor._id}>
                        {donor.name} ({donor.email}) - {donor.donationCount} donations
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No donor data available</p>
                )}
              </div>
            </div>
          ) : (
            <p>Reports content goes here...</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;