// src/pages/Map/Map.jsx
import React, { useEffect, useState } from 'react'
import styles from './Map.module.css';


import { useAuth } from '../../features/auth/useAuth';
import { supabase } from '../../services/supabase';


import NavigationBar from '@/components/NavigationBar/NavigationBar';
import { AiOutlineClose } from 'react-icons/ai';

import Feed from '../FeedDetail/Feed'; // FeedDetail 컴포넌트 import

import test from '@/assets/image/test_img.jpg';  // 정적 이미지 import 추후 동적 이미지로 변경
import test2 from '@/assets/image/test_img2.jpg';  // 정적 이미지 import 추후 동적 이미지로 변경
import test3 from '@/assets/image/test_img3.jpg';  // 정적 이미지 import 추후 동적 이미지로 변경
import { constructNow } from 'date-fns';


const Map = () => {

  /* ───────── 인증 상태 ───────── */
  const { user } = useAuth();

  /* ───────── 로컬 state ───────── */
  const [feedData, setFeedData] = useState([]);
  const [currentFeed, setCurrentFeed] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFeedId, setSelectedFeedId] = useState('');
  //const [popupImageUrl, setPopupImageUrl] = useState(''); 
  const [photos, setPhotos] = useState([]);

  /* ───────── 로그인 안 된 경우 가드 ───────── */
  //if (!user) return navigate('/login');


  const prePhoto = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1) };
  const nextPhoto = () => { if (currentIndex < photos.length - 1) setCurrentIndex(currentIndex + 1) };

  //const fn_test = () => { console.log( 'test 실행 ')};
  const fetchFeedPhotos = async (feedId) => {
    const { data, error } = await supabase
      .from('feed_photos')
      .select('photo_url')
      .eq('feed_id', feedId);

    if (error) {
      console.error('📸 feeds_photo 조회 실패:', error);
      return;
    }

    setPhotos(data.map((d) => d.photo_url)); // 또는 전체 data 그대로
  };


  /* 피드 조회 */
  useEffect(() => {
    if (!user) return;      // 아직 세션이 안 왔으면 기다림

    // 피드 데이터 조회
    const selectFeed = async () => {

      console.log('selectFeed 실행');
      if (!user) return;                  // user 준비됐는지 가드

      const { data, error } = await supabase
        .from('feeds')
        .select('*')
        .in('user_id', [user.id]);

      if (error) {
        console.error('피드 조회 오류:', error);
        return;
      }
      setFeedData(data);
    };

    selectFeed();

  }, [user]);

  /* 지도 생성 */
  useEffect(() => {

    if (window.kakao) {
      const container = document.getElementById('map')
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 7,
      }


      const map = new window.kakao.maps.Map(container, options)

      // 마커 클러스터러 (임시 데이터) 추후 db통신해서 가져오기
      const markerData = [
        { position: new kakao.maps.LatLng(37.57, 126.98), id: 999 },
        { position: new kakao.maps.LatLng(37.56, 126.97), id: 998 },
        { position: new kakao.maps.LatLng(37.55, 126.96), id: 997 },
      ]

      feedData.forEach(e => {
        markerData.push({ position: new kakao.maps.LatLng(e.location_lat, e.location_lng), id: e.id, feed: e });
      });

      const markers = markerData.map((item) => {
        const marker = new kakao.maps.Marker({ position: item.position });
        // 👉 클릭 이벤트 연결
        kakao.maps.event.addListener(marker, 'click', () => {
          console.log( '마커 클릭');
          // Feed 이미지 연결
          fetchFeedPhotos( item.id );

          setSelectedFeedId( item.id );

        });
        return marker;
      });

      new kakao.maps.MarkerClusterer({
        map,
        averageCenter: true,
        minLevel: 6,
        markers,
        styles: [{
          width: '40px', height: '40px',
          background: 'rgba(255, 85, 115, 0.9)',
          borderRadius: '20px',
          color: '#fff',
          textAlign: 'center',
          lineHeight: '40px',
          fontWeight: 'bold'
        }]
      })
    }
  }, [feedData]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <span className={styles.title}>지도에서 보기</span>
      </header>

      <div className={styles.searchBar}>
        <input type="text" placeholder="장소 검색" />
      </div>


      <div id="map" className={styles.mapContainer}></div>

      {/* 팝업 */}
      {selectedFeedId && (
        <div className={styles.popupOverlay}>
          <Feed feedId={selectedFeedId} onClose={() => setSelectedFeedId(null)} />
        </div>
      )}

      <NavigationBar />
    </div>
  )
}

export default Map
