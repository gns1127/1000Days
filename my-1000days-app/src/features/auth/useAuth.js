// src/features/auth/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 로드
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // OAuth 로그인 (google, kakao 등)
  const loginWithProvider = useCallback((provider) => {
    setLoading(true);
    supabase.auth.signInWithOAuth({ provider }).catch((err) => {
      console.error('OAuth 로그인 중 오류', err);
      setLoading(false);
    });
  }, []);

  // 이메일 로그인
  const loginWithEmail = useCallback (async( email, password ) => {

    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log( '현재 로그인된 유저 :: ' + data.user.id );

    if (error) {
      setError(`로그인 실패: ${error.message}`);
      setLoading(false);
      console.error('❌ 로그인 실패:', error.message);
      throw error;
    } 
    
    // user state는 onAuthStateChange 리스너가 업데이트해 줍니다.
    setLoading(false);
    return data; // { session, user }

  }, []);;

  // 로그아웃
  const logout = useCallback(() => {
    supabase.auth.signOut().catch((err) => {
      console.error('로그아웃 중 오류', err);
    });
  }, []);

  return {
    user,              // 현재 사용자 객체 (or null)
    loading,           // 로딩 중 상태
    loginWithEmail,
    loginWithProvider, // (provider: 'google' | 'kakao' | ...) => void
    logout,            // () => void
  };
}
