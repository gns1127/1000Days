import { useState, useEffect, useCallback } from 'react';
//import { supabase } from '../../services/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return null;
    // 초기 세션 로드
    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   setUser(session?.user ?? null);
    // });

    // // 인증 상태 변경 리스너
    // const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    //   setUser(session?.user ?? null);
    // });

    // return () => {
    //   listener.subscription.unsubscribe();
    // };
  }, []);

  const loginWithProvider = useCallback((provider) => {
    //supabase.auth.signInWithOAuth({ provider });
  }, []);

  const logout = useCallback(() => {
    //supabase.auth.signOut();
  }, []);

  return { user, loginWithProvider, logout };
};
