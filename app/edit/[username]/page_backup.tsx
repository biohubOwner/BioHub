'use client';

import { useParams, useSearchParams } from 'next/navigation';

export default function EditProfile() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const username = params.username as string;
  const token = searchParams.get('token');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f1e', color: '#fff', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Edit Profile</h1>
      <p>Username: {username || 'loading...'}</p>
      <p>Token: {token ? token.substring(0, 10) + '...' : 'none'}</p>
    </div>
  );
}
