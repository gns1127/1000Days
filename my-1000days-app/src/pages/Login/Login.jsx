import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 페이지 이동을 위한 훅
import './Login.css';
import heartLogo from '@/assets/image/heartLogo.png';
import DateInputWithCalendar from '@/components/DateInputWithCalendar';
import LoginButton from '@/components/LoginButton';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../features/auth/useAuth'
import Swal from 'sweetalert2';
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

const email = import.meta.env.VITE_EMAIL || '';
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

    //if (formatted === '20221127') {
    if (formatted === '20221127') {

      Swal.fire({
        title: '🎉 1000일 축하해 🎉<br>💖',
        html: `
        <strong style="font-size: 1.2rem; color: #ff6f91;">
우리의 추억을 담은 <br>포토앱에 온 걸 환영해!<br/>
앞으로도 좋은 추억 같이 쌓아가자 😊<br/>
사랑해 💌

    </strong>
  `,
        confirmButtonText: 'OK',
      });

      try {
        const { user } = await loginWithEmail(email, password);
        console.log('로그인 성공 이동중..');
        //setMessage('로그인 성공! 이동 중…');
        if (user) navigate('/home'); // ✅ 이동

      } catch (err) {
        //setMessage(`로그인 실패: ${err.message}`);
      }

    } else {
      Swal.fire({
        icon: 'error',
        title: '너 누구야👀👀',
        confirmButtonText: 'OK',
      });

    }
  };


  return (
    <div className="login">
      <div className="login__container">
        <div className="login__logo">
          <img src={heartLogo} alt="우리의 1000일 추억 로고" />

        </div>
        <h1 className="login__title">우리가 사귄 날은 언제였나요? 💕</h1>
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