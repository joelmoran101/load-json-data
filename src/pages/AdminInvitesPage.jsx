import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminListInviteRequests, adminApproveInviteRequest, adminDenyInviteRequest, adminSendInviteCode } from '../services/authService';

const AdminInvitesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await adminListInviteRequests(statusFilter === 'all' ? null : statusFilter);
      setRequests(list);
    } catch (e) {
      setError(e?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Unauthorized</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  const approve = async (id) => { 
    try {
      const code = await adminApproveInviteRequest(id); 
      await load();
      alert(`✅ Request approved!\n\nInvitation Code: ${code}\n\nYou can now send this code to the requester.`);
    } catch (e) {
      setError(e?.message || 'Failed to approve');
    }
  };
  
  const deny = async (id) => { 
    try {
      await adminDenyInviteRequest(id); 
      await load(); 
    } catch (e) {
      setError(e?.message || 'Failed to deny');
    }
  };
  
  const sendCode = async (id) => { 
    try {
      const result = await adminSendInviteCode(id); 
      await load();
      if (result.delivered) {
        alert('✅ Invitation code sent via email!');
      } else {
        alert(`📧 Email not configured.\n\nInvitation Code: ${result.inviteCode}\n\nPlease send this code manually.`);
      }
    } catch (e) {
      setError(e?.message || 'Failed to send code');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin: Invite Requests</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label>Filter by Status: </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
        </select>
        <button style={{ marginLeft: '1rem' }} onClick={load}>Refresh</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && requests.length === 0 && <p>No requests</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {requests.map((r) => (
          <li key={r.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem', backgroundColor: r.status === 'approved' ? '#f0f9ff' : r.status === 'denied' ? '#fff1f1' : '#fff' }}>
            <div><strong>Email:</strong> {r.email}</div>
            <div><strong>Status:</strong> <span style={{ color: r.status === 'approved' ? 'green' : r.status === 'denied' ? 'red' : 'orange', textTransform: 'uppercase', fontWeight: 'bold' }}>{r.status}</span></div>
            {r.approvedAt && <div><strong>Approved:</strong> {new Date(r.approvedAt).toLocaleString()}</div>}
            {r.code && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '4px' }}>
                <strong>Invitation Code:</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <code style={{ fontSize: '1.1rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>{r.code}</code>
                  <button 
                    className="btn" 
                    onClick={() => {
                      navigator.clipboard.writeText(r.code);
                      alert('Invitation code copied to clipboard!');
                    }}
                    style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            )}
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              {r.status === 'pending' && (
                <>
                  <button className="btn" onClick={() => approve(r.id)}>✅ Approve</button>
                  <button className="btn" onClick={() => deny(r.id)}>❌ Deny</button>
                </>
              )}
              {r.status === 'approved' && (
                <button className="btn" onClick={() => sendCode(r.id)}>📧 Send Code to Requester</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminInvitesPage;
