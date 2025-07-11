
import React, { useEffect, useState } from 'react'
import styles from './Map.module.css';
import { useAuth } from '../../features/auth/useAuth';
import { supabase } from '../../services/supabase';
import NavigationBar from '@/components/NavigationBar/NavigationBar';
import { AiOutlineClose, AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';

const Map = () => {
  const { user } = useAuth();

  const [feedData, setFeedData] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentFeed, setCurrentFeed] = useState(null);

  const prePhoto = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const nextPhoto = () => {
    if (currentIndex < photos.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const fetchFeedPhotos = async (feedId) => {
    const { data, error } = await supabase
      .from('feeds_photo')
      .select('image_url')
      .eq('feed_id', feedId);

    if (error) {
      console.error('📸 feeds_photo 조회 실패:', error);
      return;
    }

    setPhotos(data.map((d) => d.image_url));
  };

  useEffect(() => {
    if (!user) return;

    const selectFeed = async () => {
      const { data, error } = await supabase
        .from('feeds')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('피드 조회 오류:', error);
        return;
      }

      setFeedData(data);
    };

    selectFeed();
  }, [user]);

  useEffect(() => {
    if (!window.kakao || !feedData.length) return;

    const container = document.getElementById('map');
    const map = new window.kakao.maps.Map(container, {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 7,
    });

    const markerData = feedData.map(feed => ({
      position: new kakao.maps.LatLng(feed.location_lat, feed.location_lng),
      id: feed.id,
      feed
    }));

    const markers = markerData.map((item) => {
      const marker = new kakao.maps.Marker({ position: item.position });
      kakao.maps.event.addListener(marker, 'click', () => {
        fetchFeedPhotos(item.id);
        setCurrentFeed(item.feed);
        setCurrentIndex(0);
        setPopupVisible(true);
      });
      return marker;
    });

    new kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 6,
      markers,
    });

  }, [feedData]);

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

      {popupVisible && currentFeed && (
        <div className={styles.popupOverlay}>
          <div className={styles.memoryCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.closeDiv}>
              <button className={styles.close_btn} onClick={() => setPopupVisible(false)}>
                <AiOutlineClose size={24} />
              </button>
            </div>

            <div className={styles.sliderWrapper}>
              <button className={styles.slideBtn} onClick={prePhoto}>〈</button>
              <img src={photos[currentIndex]} alt="popup" className={styles.memoryImage} />
              <button className={styles.slideBtn} onClick={nextPhoto}>〉</button>
            </div>

            <div className={styles.memoryContent}>
              <h2 className={styles.title}>{currentFeed.title}</h2>
              <p className={styles.dateLocation}>{currentFeed.date} · {currentFeed.location}</p>
              <p className={styles.desc}>{currentFeed.description}</p>

              <div className={styles.actions}>
                <span>♡ 좋아요 {currentFeed.likes ?? 0}</span>
                <span>💬 댓글 {currentFeed.comments ?? 0}</span>
              </div>

              <div className={styles.link}>
                <a href="#">자세히 보기 &gt;</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <NavigationBar />
    </div>
  );
};

export default Map;
