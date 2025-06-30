// src/pages/Map/Map.jsx
import React, { useEffect, useState } from 'react'
import styles from './Map.module.css';
import NavigationBar from '@/components/NavigationBar/NavigationBar';

const Map = () => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState('');

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
      { position: new kakao.maps.LatLng(37.57, 126.98), imageUrl: '/images/sample1.jpg' },
  { position: new kakao.maps.LatLng(37.56, 126.97), imageUrl: '/images/sample2.jpg' },
  { position: new kakao.maps.LatLng(37.55, 126.96), imageUrl: '/images/sample3.jpg' },
      ]
      
      const markers = markerData.map((item) => {
      const marker = new kakao.maps.Marker({ position: item.position });
        // 👉 클릭 이벤트 연결
        kakao.maps.event.addListener(marker, 'click', () => {
          setPopupImageUrl(item.imageUrl);
          setPopupVisible(true);
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
  }, [])

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button className={styles.backBtn}>←</button>
        <span className={styles.title}>지도에서 보기</span>
      </header>

      <div className={styles.searchBar}>
        <input type="text" placeholder="장소 검색" />
      </div>

      <div id="map" className={styles.mapContainer}></div>
      {popupVisible && (
        <div className={styles.popupOverlay} onClick={() => setPopupVisible(false)}>
          <div className={styles.popupBox}>
            <img src={popupImageUrl} alt="popup" />
          </div>
        </div>
      )}
      <NavigationBar/>
    </div>
  )
}

export default Map
