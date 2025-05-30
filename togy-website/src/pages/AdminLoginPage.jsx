import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { signInWithEmailAndPassword } from 'firebase/auth'; // Remove direct firebase import
// import { auth } from '../firebase'; // Remove direct firebase import
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(email, password); // Use the login function from context
      navigate('/admin/prayers'); // Redirect after context handles auth state
    } catch (err) {
      console.error("Login failed: ", err);
      // Error handling can be improved based on specific error codes if needed
      setError('로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div>
      <h2>관리자 로그인</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">이메일:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">로그인</button>
      </form>
      {/* Optionally add Google Sign-In button here */}
    </div>
  );
}

export default AdminLoginPage; 