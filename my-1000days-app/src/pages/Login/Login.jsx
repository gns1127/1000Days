import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 페이지 이동을 위한 훅
import './Login.css';
import heartLogo from '@/assets/image/heartLogo.png';
import DateInputWithCalendar from '@/components/DateInputWithCalendar';
import LoginButton from '@/components/LoginButton';
import { supabase } from '../../services/supabase';
import { useAuth  } from '../../features/auth/useAuth'

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

const email    = import.meta.env.VITE_EMAIL    || '';
const password = import.meta.env.VITE_PASSWORD || '';

const Login = () => {
  const [selected, setSelected] = useState(null); // ✅ 날짜 상태 관리

  const navigate = useNavigate(); // ✅ 페이지 이동

  const { loginWithEmail, error, loading } = useAuth();
  const handleCheckDate = async () => {
    if (!selected) {
      alert('날짜를 선택해주세요.');
      return;
    }

    const y = selected.getFullYear().toString();
    const m = (selected.getMonth() + 1).toString().padStart(2, '0');
    const d = selected.getDate().toString().padStart(2, '0');
    const formatted = `${y}${m}${d}`;

    if (formatted === '20221127') {
      alert('정답');
      try {
        const { user } = await loginWithEmail(email, password);
        console.log('로그인 성공 이동중..');
        //setMessage('로그인 성공! 이동 중…');
        if ( user ) navigate('/home'); // ✅ 이동
        
    } catch (err) {
      //setMessage(`로그인 실패: ${err.message}`);
    }

    } else {
      alert('틀렸습니다.');
    }
  };


  return (
    <div className="login">
      <div className="login__container">
        <div className="login__logo">
          <img src={heartLogo}  alt="우리의 100일 추억 로고" />
          
        </div>
        <h1 className="login__title">우리가 처음 사귄 날짜는?</h1>
        <div className="login__form">
          <DateInputWithCalendar selected={selected} onChange={setSelected} />
         

          <button className="login__button" onClick={handleCheckDate}>입력</button>
        </div>

      </div>
    </div>
  );
}
export default Login;

/**
 login form1 로그인
<div className="login__form">
<datePicker selected={selected} setSelected={setSelected} />
<div className="login__input-group">
<span className="login__icon user-icon" />
<input type="text" placeholder="아이디" aria-label="아이디" />
</div>
<div className="login__input-group">
<span className="login__icon lock-icon" />
<input type="password" placeholder="비밀번호" aria-label="비밀번호" />
</div>
<button className="login__button">로그인</button>
</div>
*/

/**
 * 
 *  <DatePicker selected={selected} setSelected={setSelected} />
 * 
 * 
 * <div className="login__social">
          <img src="/assets/naver.png" alt="네이버 로그인" />
          <img src="/assets/facebook.png" alt="페이스북 로그인" />
          <img src="/assets/kakao.png" alt="카카오 로그인" />
        </div>
        <p className="login__footnote">
          로그인 시 이용약관 및 개인정보처리방침에 동의한 것으로 간주합니다.
        </p>
 */