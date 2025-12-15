"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/_context/useAuth';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({ totalUsers: 0, totalDonations: 0 });
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState(null);

  const isAdmin = user && user.email && user.email.endsWith('@carevia.com');

  // ------------------ Fetch Functions ------------------

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error('Stats fetch error:', err);
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users?page=1&limit=50', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        toast.success('Users loaded successfully');
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Network error while fetching users');
    } finally {
      setLoading(false);
    }
  };

  // const fetchDonations = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch('/api/admin/donations?page=1&limit=50', { credentials: 'include' });
  //     const data = await res.json();
  //     if (data.success) setDonations(data.donations);
  //     else toast.error('Failed to fetch donations');
  //   } catch (err) {
  //     console.error('Donations fetch error:', err);
  //     toast.error('Network error while fetching donations');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

const fetchDonations = async () => {
  setLoading(true);
  try {
    const res = await fetch('/api/admin/donations?page=1&limit=50', { credentials: 'include' });
    const data = await res.json();
    if (data.success) setDonations(data.donations);
    else toast.error('Failed to fetch donations');
  } catch (err) {
    console.error('Donations fetch error:', err);
    toast.error('Network error while fetching donations');
  } finally {
    setLoading(false);
  }
};
// ////////////////////////
const handleUpdateStatus = async (donationId, newStatus) => {
  try {
    const res = await fetch(`/api/admin/donations/${donationId}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Donation ${newStatus}`);
      // Update local state
      setDonations(donations.map(d => d._id === donationId ? { ...d, status: newStatus } : d));
    } else {
      toast.error(data.error || 'Failed to update status');
    }
  } catch (err) {
    console.error(err);
    toast.error('Network error');
  }
};



// ////////////////////////
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports?type=overview', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setReports(data.data);
      else toast.error('Failed to fetch reports');
    } catch (err) {
      console.error('Reports fetch error:', err);
      toast.error('Network error while fetching reports');
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Effects ------------------

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'dashboard' && isAdmin) fetchStats();
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (activeTab === 'donations' && isAdmin) fetchDonations();
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (activeTab === 'reports' && isAdmin) fetchReports();
  }, [activeTab, isAdmin]);

  // ------------------ Handlers ------------------

  const handleRemoveClick = (userId) => {
    setUserIdToDelete(userId);
    setShowModal(true);
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setUserIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    toast.loading(`Deleting user: ${userIdToDelete}...`, { id: 'deleteUser' });

    try {
      const response = await fetch(`/api/admin/users/${userIdToDelete}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userIdToDelete));
        toast.success('User deleted successfully!', { id: 'deleteUser' });
      } else {
        toast.error(`Error: ${data.error}`, { id: 'deleteUser' });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error', { id: 'deleteUser' });
    } finally {
      setShowModal(false);
      setUserIdToDelete(null);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  // ------------------ Render ------------------

  if (authLoading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access Denied</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Toaster position="top-right" />

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '10px', minWidth: '300px'
          }}>
            <h3>Confirm Delete</h3>
            <p>Delete user {userIdToDelete}?</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleCancelDelete}
                style={{ padding: '10px 20px', background: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-nav">
          <nav className="admin-nav-items">
            <button className={activeTab==='dashboard'?'active':''} onClick={()=>setActiveTab('dashboard')}>Dashboard</button>
            <button className={activeTab==='users'?'active':''} onClick={()=>setActiveTab('users')}>Users</button>
            <button className={activeTab==='donations'?'active':''} onClick={()=>setActiveTab('donations')}>Donations</button>
            <button className={activeTab==='reports'?'active':''} onClick={()=>setActiveTab('reports')}>Reports</button>
          </nav>
        </div>
      </div>

      {/* Dashboard */}
      {activeTab==='dashboard' && (
        <section className="dashboard">
          <div className="dashboard-title"><h2>Dashboard</h2></div>
          <div className="stats-cards">
            <div className="card">Total Users: {loading?'...':stats.totalUsers}</div>
            <div className="card">Total Donations: {loading?'...':stats.totalDonations}</div>
          </div>
        </section>
      )}

      {/* Users Table */}
      {activeTab==='users' && (
        <section className="users-tab">
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#2BB0A8', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.email}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <button 
                      onClick={() => handleRemoveClick(u._id)}
                      style={{ padding: '5px 15px', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Donations */}
      {activeTab==='donations' && (
        <section className="donations-tab">
          <h2>Donations Management</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Donor</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
                </tr>
                </thead>
            <tbody>
                {loading ? (
          <tr><td colSpan="6" style={{textAlign:'center'}}>Loading...</td></tr>
        ) : donations.length > 0 ? (
          donations.map(d => (
            <tr key={d._id}>
              <td>{d.name}</td>
              <td>{d.Type}</td>
              <td>{d.userId?.name || 'Unknown'}</td>
              <td>{formatDate(d.createdAt)}</td>
              <td>{d.status || 'approved'}</td>
              <td>
                {d.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(d._id, 'approved')}
                      style={{marginRight:'5px', padding:'5px 10px', background:'#2BB0A8', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
                    >Approve</button>
                    <button 
                      onClick={() => handleUpdateStatus(d._id, 'rejected')}
                      style={{padding:'5px 10px', background:'red', color:'#333333', border:'none', borderRadius:'4px', cursor:'pointer'}}
                    >Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr><td colSpan="6" style={{textAlign:'center'}}>No donations found</td></tr>
        )}
      </tbody>
    </table>
  </section>
)}

      

      {/* Reports */}
      {activeTab==='reports' && (
        <section className="reports-tab">
          <h2>Reports</h2>
          {loading ? <p>Loading reports...</p> :
            reports ? (
              <div>
                <div style={{marginBottom:'2rem'}}>
                  <h4>Donations by Type</h4>
                  {reports.donationsByType?.length>0 ? <ul>{reports.donationsByType.map(t => <li key={t._id}>{t._id}: {t.count} donations</li>)}</ul> : <p>No donation data available</p>}
                </div>
                <div style={{marginBottom:'2rem'}}>
                  <h4>Top Donors</h4>
                  {reports.topDonors?.length>0 ? <ul>{reports.topDonors.map(d => <li key={d._id}>{d.name} ({d.email}) - {d.donationCount} donations</li>)}</ul> : <p>No donor data available</p>}
                </div>
              </div>
            ) : <p>Reports content goes here...</p>
          }
        </section>
      )}
    </div>
  );
}

export default AdminDashboard;
