import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaMapMarkerAlt, FaHome, FaPlus, FaUser } from 'react-icons/fa';
import { useAuth } from '../../features/auth/useAuth';
import { supabase } from '../../services/supabase';
import NavigationBar from '@/components/NavigationBar/NavigationBar';
import FeedDetail from '../FeedDetail/FeedDetail'; // FeedDetail 컴포넌트 import
import Feed from '../FeedDetail/Feed'; // FeedDetail 컴포넌트 import

import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedId, setSelectedFeedId] = useState(null); // 선택된 피드 id

  useEffect(() => {
    if (!user) return; // 로그인된 사용자 없으면 대기
    const fetchFeeds = async () => {
      const { data, error } = await supabase
        .from('feeds')
        .select(`id, title, feed_date, feed_photos(photo_url, display_order)`)
        .eq('user_id', user.id)
        .order('feed_date', { ascending: false });

      if (error) {
        console.error('피드 조회 오류:', error);
      } else {
        //console.log( data );
        const processed = data.map(feed => {
          const photos = feed.feed_photos || [];
          photos.sort((a, b) => a.display_order - b.display_order);
          return {
            id: feed.id,
            title: feed.title,
            date: feed.feed_date.slice(0, 10),
            repPhoto: photos[0]?.photo_url || ''
          };
        });


        setFeeds(processed);
      }
      setLoading(false);
    };

    fetchFeeds();
  }, [user]);

  if (loading) {
    return <div className="home-loading">로딩 중…</div>;
  }

  return (
    <div className="home-wrapper">
      <header className="home-header">
        {/*<h1 className="home-title">우리의 추억</h1>*/}
        <h1 className="home-title"> 사진 </h1>
      </header>

      <div className="home-icons-fixed">
        <FaClock className="home-icon" />
        <FaMapMarkerAlt className="home-icon" />
      </div>

      <div className="scroll-area">
        <div className="home-photo-grid">
          {feeds.map(feed => (
            <div
              key={feed.id}
              className="feed-card"
              onClick={() => setSelectedFeedId(feed.id)}
            >
              <img
                src={feed.repPhoto || '/assets/placeholder.png'}
                alt={feed.title}
                className="photo"
              />

            </div>

          ))}
        </div>
      </div>

      {selectedFeedId && (
        <div className="feed-detail-fullscreen">
          {/*<FeedDetail feedId={selectedFeedId} onClose={() => setSelectedFeedId(null)} />*/}
          <Feed feedId={selectedFeedId} onClose={() => setSelectedFeedId(null)} />
        </div>
      )}

      <NavigationBar active="home" />
    </div>
  );
};

export default Home;
