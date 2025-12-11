"use client";

import { useState, useEffect, useRef } from 'react';
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
  const [bootstrapLoaded, setBootstrapLoaded] = useState(false);

  const isAdmin = user && user.email && user.email.endsWith('@carevia.com');
  const userToDelete = useRef(null);

  // Load Bootstrap JS dynamically
  useEffect(() => {
    const loadBootstrap = async () => {
      try {
        if (typeof window !== 'undefined' && !window.bootstrap) {
          await import('bootstrap/dist/js/bootstrap.bundle.min.js');
          setBootstrapLoaded(true);
        } else if (window.bootstrap) {
          setBootstrapLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load Bootstrap:', err);
      }
    };

    loadBootstrap();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        router.push('/');
      } else if (!isAdmin) {
        setAccessDenied(true);
      }
    }
  }, [isLoggedIn, isAdmin, authLoading, router]);

  const openDeleteModal = (userId) => {
    userToDelete.current = userId;
    
    if (!bootstrapLoaded || typeof window.bootstrap === "undefined") {
      console.error("Bootstrap JS not loaded yet");
      // Fallback: try to load Bootstrap again
      import('bootstrap/dist/js/bootstrap.bundle.min.js')
        .then(() => {
          setBootstrapLoaded(true);
          showModal();
        })
        .catch(err => console.error('Bootstrap load failed:', err));
      return;
    }
    
    showModal();
  };

  const showModal = () => {
    const modalEl = document.getElementById("confirmDeleteModal");
    if (!modalEl) {
      console.error("Modal element not found");
      return;
    }

    try {
      const modal = new window.bootstrap.Modal(modalEl);
      modal.show();
    } catch (err) {
      console.error("Error showing modal:", err);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete.current) return;

    try {
      await fetch(`/api/admin/users/${userToDelete.current}`, {
        method: "DELETE",
        credentials: "include",
      });

      userToDelete.current = null;

      const modalEl = document.getElementById("confirmDeleteModal");
      const modalInstance = window.bootstrap?.Modal?.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }

      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard' && isAdmin) fetchStats();
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (activeTab === 'users' && isAdmin) fetchUsers();
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (activeTab === 'donations' && isAdmin) fetchDonations();
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (activeTab === 'reports' && isAdmin) fetchReports();
  }, [activeTab, isAdmin]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else if (res.status === 403) setAccessDenied(true);
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users?page=1&limit=50', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setUsers(data.users);
      else if (res.status === 403) setAccessDenied(true);
    } catch (err) {
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/donations?page=1&limit=50', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setDonations(data.donations);
      else if (res.status === 403) setAccessDenied(true);
    } catch (err) {
      console.error('Donations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports?type=overview', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setReports(data.data);
      else if (res.status === 403) setAccessDenied(true);
    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  if (authLoading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}><p>Loading...</p></div>;

  if (accessDenied || !isAdmin) return (
    <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', gap:'1rem' }}>
      <h1>Access Denied</h1>
      <p>Only users with @carevia.com email can access the admin dashboard.</p>
      <button onClick={() => router.push('/')} style={{ padding:'0.5rem 1rem', background:'#007bff', color:'white', border:'none', borderRadius:'4px', cursor:'pointer' }}>Go to Home</button>
    </div>
  );

  return (
    <div className="admin-container">
      {/* Delete Modal */}
      <div className="modal fade" id="confirmDeleteModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">Are you sure you want to delete this user?</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-head">
          <div className="admin-logo"><h2><span style={{color:"white"}}>Care</span><span style={{color:"gold"}}>Via</span></h2></div>
          <div className="logout-btn"><button onClick={handleLogout}>Logout</button></div>
        </div>
        <div className="admin-nav">
          <nav className="admin-nav-items">
            <button className={activeTab==='dashboard'?'active':''} onClick={()=>setActiveTab('dashboard')}>Dashboard</button>
            <button className={activeTab==='users'?'active':''} onClick={()=>setActiveTab('users')}>Users</button>
            <button className={activeTab==='donations'?'active':''} onClick={()=>setActiveTab('donations')}>Donations</button>
            <button className={activeTab==='reports'?'active':''} onClick={()=>setActiveTab('reports')}>Reports</button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="admin-main">
        {/* Dashboard */}
        <section className="dashboard" style={{display:activeTab==='dashboard'?'block':'none'}}>
          <div className="dashboard-title"><h2>Dashboard</h2></div>
          <div className="stats-cards">
            <div className="card">Total Users: {loading?'...':stats.totalUsers}</div>
            <div className="card">Total Donations: {loading?'...':stats.totalDonations}</div>
          </div>
        </section>

        {/* Users */}
        <section className="users-tab" style={{display:activeTab==='users'?'block':'none'}}>
          <div className="users-tab-title"><h2>Users Management</h2></div>
          <table className="users-tab-table">
            <thead><tr><th>Name</th><th>Email</th><th>Remove</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="3" style={{textAlign:'center'}}>Loading...</td></tr> :
                users.length>0 ? users.map(u=>(
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={()=>openDeleteModal(u._id)}
                        disabled={!bootstrapLoaded}
                      >
                        Remove User
                      </button>
                    </td>
                  </tr>
                )) :
                <tr><td colSpan="3" style={{textAlign:'center'}}>No users found</td></tr>
              }
            </tbody>
          </table>
        </section>

        {/* Donations */}
        <section className="donations-tab" style={{display:activeTab==='donations'?'block':'none'}}>
          <h2>Donations Management</h2>
          <table>
            <thead><tr><th>Item</th><th>Type</th><th>Donor</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="4" style={{textAlign:'center'}}>Loading...</td></tr> :
                donations.length>0 ? donations.map(d=>(
                  <tr key={d._id}><td>{d.name}</td><td>{d.Type}</td><td>{d.userId?.name||'Unknown'}</td><td>{formatDate(d.createdAt)}</td></tr>
                )) :
                <tr><td colSpan="4" style={{textAlign:'center'}}>No donations found</td></tr>
              }
            </tbody>
          </table>
        </section>

        {/* Reports */}
        <section className="reports-tab" style={{display:activeTab==='reports'?'block':'none'}}>
          <h2>Reports</h2>
          {loading ? <p>Loading reports...</p> :
            reports ? (
              <div>
                <div style={{marginBottom:'2rem'}}>
                  <h3>Donations by Type</h3>
                  {reports.donationsByType?.length>0 ? <ul>{reports.donationsByType.map(t=><li key={t._id}>{t._id}: {t.count} donations</li>)}</ul> : <p>No donation data available</p>}
                </div>
                <div style={{marginBottom:'2rem'}}>
                  <h3>Top Donors</h3>
                  {reports.topDonors?.length>0 ? <ul>{reports.topDonors.map(d=><li key={d._id}>{d.name} ({d.email}) - {d.donationCount} donations</li>)}</ul> : <p>No donor data available</p>}
                </div>
              </div>
            ) : <p>Reports content goes here...</p>
          }
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;