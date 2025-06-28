import React from 'react';
import { useAuth } from '../features/auth/useAuth';

const LoginButton = () => {
  const { loginWithProvider } = useAuth();

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => loginWithProvider('google')}
        className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
      >
        Google 로그인
      </button>
      <button
        onClick={() => loginWithProvider('kakao')}
        className="px-4 py-2 bg-yellow-400 text-white rounded shadow hover:bg-yellow-500"
      >
        Kakao 로그인
      </button>
    </div>
  );
};

export default LoginButton;
