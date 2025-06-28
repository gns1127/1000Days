// src/pages/Map/Map.jsx
import React, { useEffect } from 'react'
import styles from './Map.module.css';
import NavigationBar from '@/components/NavigationBar/NavigationBar';

const Map = () => {
  useEffect(() => {
    if (window.kakao) {
      const container = document.getElementById('map')
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 7,
      }

      const map = new window.kakao.maps.Map(container, options)

      // 마커 클러스터러 (임시 데이터)
      const markers = [
        new kakao.maps.Marker({ position: new kakao.maps.LatLng(37.57, 126.98) }),
        new kakao.maps.Marker({ position: new kakao.maps.LatLng(37.56, 126.97) }),
        new kakao.maps.Marker({ position: new kakao.maps.LatLng(37.55, 126.96) }),
      ]

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

      <NavigationBar/>
    </div>
  )
}

export default Map
