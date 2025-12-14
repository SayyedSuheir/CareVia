"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/_context/useAuth';
import { useRouter } from 'next/navigation';

function AdminDashboard() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('users');
 const [stats, setStats] = useState({ totalUsers: 0, totalDonations: 0 });
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);
const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState(null);


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
    const res = await fetch('/api/admin/users?page=1&limit=50', { 
      credentials: 'include' 
    });
    const data = await res.json();
    if (data.success) {
      setUsers(data.users);
      console.log('Fetched users:', data.users);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    setLoading(false);
  }
};
  const isAdmin = user && user.email && user.email.endsWith('@carevia.com');
// Fetch real users
useEffect(() => {
  if (isAdmin) {
    fetchUsers();
  }
}, [isAdmin]);

const handleRemoveClick = (userId) => {
    console.log('Remove clicked for:', userId);
    setUserIdToDelete(userId);
    setShowModal(true);
  };

  const handleCancelDelete = () => {
    console.log('Cancel clicked');
    setShowModal(false);
    setUserIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    console.log('Confirm delete clicked for:', userIdToDelete);
    alert(`Deleting user: ${userIdToDelete}`);
    
    try {
      const response = await fetch(`/api/admin/users/${userIdToDelete}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setUsers(users.filter(u => u._id !== userIdToDelete));
        alert('User deleted successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    }
    
    setShowModal(false);
    setUserIdToDelete(null);
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
  useEffect(() => {
    if (activeTab === 'dashboard' && isAdmin) fetchStats();
  }, [activeTab, isAdmin]);

  useEffect(() => {
      if (activeTab === 'donations' && isAdmin) fetchDonations();
    }, [activeTab, isAdmin]);
  
  useEffect(() => {
    if (activeTab === 'reports' && isAdmin) fetchReports();
  }, [activeTab, isAdmin]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  if (authLoading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access Denied</div>;

  return (
    <div style={{ padding: '20px' }}>
      
      
      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            minWidth: '300px'
          }}>
            <h3>Confirm Delete</h3>
            <p>Delete user {userIdToDelete}?</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleCancelDelete}
                style={{
                  padding: '10px 20px',
                  background: 'gray',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                style={{
                  padding: '10px 20px',
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

         {/* Sidebar */}
      <div className="admin-sidebar">
        {/* <div className="admin-sidebar-head">
          <div className="admin-logo"><h2><span style={{color:"white"}}>Care</span><span style={{color:"gold"}}>Via</span></h2></div>
          <div className="logout-btn"><button onClick={handleLogout}>Logout</button></div>
        </div> */}
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
        <section className="dashboard" style={{display:activeTab==='dashboard'?'block':'none'}}>
          <div className="dashboard-title"><h2>Dashboard</h2></div>
          <div className="stats-cards">
            <div className="card">Total Users: {loading?'...':stats.totalUsers}</div>
            <div className="card">Total Donations: {loading?'...':stats.totalDonations}</div>
          </div>
        </section>


      {/* Users Table */}
      <section className="users-tab" style={{display:activeTab==='users'?'block':'none'}}>
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
                    style={{
                      padding: '5px 15px',
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
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
    </div>
  );
}

export default AdminDashboard;