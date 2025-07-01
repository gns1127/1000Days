// src/pages/Map/Map.jsx
import React, { useEffect, useState } from 'react'
import styles from './Map.module.css';
import NavigationBar from '@/components/NavigationBar/NavigationBar';
import { AiOutlineClose } from 'react-icons/ai';

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
        <div className={styles.popupOverlay} /* onClick={() => setPopupVisible(false) } */>
          <div className={styles.memoryCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.closeDiv}>
              <button className={styles.close_btn} onClick={() => setPopupVisible(false)}>
                <AiOutlineClose size={24} />
              </button>
            </div>
            <img src={popupImageUrl} alt="popup" className={styles.memoryImage} />

            <div className={styles.memoryContent}>
              <h2 className={styles.title}>데이트했던 북악산!</h2>
              <p className={styles.dateLocation}>2023.09.14 &nbsp;·&nbsp; 북악팔각정</p>
              <p className={styles.desc}>정말 멋진 풍경과 함께한 하수~</p>

              <div className={styles.actions}>
                <span>♡ 좋아요 3</span>
                <span>💬 댓글 2</span>
              </div>

              <div className={styles.link}>
                <a href="#">자세히 보기 &gt;</a>
              </div>
            </div>
          </div>
        </div>
      )}
      <NavigationBar/>
    </div>
  )
}

export default Map
