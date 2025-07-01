import React from 'react';
import './Home.css';
import { FaClock, FaMapMarkerAlt, FaHome, FaPlus, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // ✅ 페이지 이동을 위한 훅

import NavigationBar from '@/components/NavigationBar/NavigationBar';
import test from '@/assets/image/test_img.jpg'  // 정적 이미지 import 추후 동적 이미지로 변경

const Home = () => {

  // test 입니다.
  const today = new Date();
  const date = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  
  const photos = new Array(20).fill(test); // 예시 이미지 경로

  return (
    <div className="home-wrapper">
      <header className="home-header">
        <p className="home-date">{date}</p>
        <h1 className="home-title">우리의 <strong>1000일</strong> 추억</h1>
      </header>

      <div className="home-icons-fixed">
        <FaClock className="home-icon" />
        <FaMapMarkerAlt className="home-icon" />
      </div>

      <div className="scroll-area">
        <div className="home-photo-grid">
          {photos.map((src, index) => (
            <img key={index} src={src} alt={`추억${index + 1}`} className="photo" />
          ))}
        </div>
      </div>

      <NavigationBar/>
    </div>
  );
};

export default Home;
