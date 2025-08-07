import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaMapMarkerAlt, FaHome, FaPlus, FaUser } from 'react-icons/fa';
import { useAuth } from '../../features/auth/useAuth';
import { supabase } from '../../services/supabase';
import NavigationBar from '@/components/NavigationBar/NavigationBar';

import Feed from '../FeedDetail/Feed'; // FeedDetail 컴포넌트 import

import './Home.css';

const LIMIT = 3;

const Home = () => {
  const { user } = useAuth();

  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);


  const [loading, setLoading] = useState(true);
  const [selectedFeedId, setSelectedFeedId] = useState(null); // 선택된 피드 id
  const observerRef = useRef();
  const feedIdSetRef = useRef(new Set()); // ✅ 중복 방지용

  const fetchFeeds = useCallback(async () => {
    if (!user && !hasMore) return; // 로그인된 사용자 없으면 대기

    const from = page * LIMIT;
    const to = from + LIMIT - 1;

    console.log('form :: ' + from);
    console.log('to :: ' + to);
    // 방어 코드: from 또는 to가 음수가 되면 종료
    if (from < 0 || to < 0) return;

    const { data, error } = await supabase
      .from('feeds')
      .select(`id, title, feed_date, feed_photos(photo_url, display_order)`, { count: 'exact' })
      .eq('user_id', user.id)
      .order('feed_date', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('피드 조회 오류:', error);
      return;
    } else {

      const newFeeds = [];

      for (const feed of data) {
        if (feedIdSetRef.current.has(feed.id)) continue;
        feedIdSetRef.current.add(feed.id);

        const photos = feed.feed_photos || [];
        photos.sort((a, b) => a.display_order - b.display_order);

        newFeeds.push({
          id: feed.id,
          title: feed.title,
          date: feed.feed_date.slice(0, 10),
          repPhoto: photos[0]?.photo_url || ''
        })

      }
      //console.log( data );

      /*const processed = data.map(feed => {
        const photos = feed.feed_photos || [];
        photos.sort((a, b) => a.display_order - b.display_order);
        return {
          id: feed.id,
          title: feed.title,
          date: feed.feed_date.slice(0, 10),
          repPhoto: photos[0]?.photo_url || ''
        };
      });
      */

      setFeeds(prev => [...prev, ...newFeeds]);
      if (data.length < LIMIT) setHasMore(false);
      setLoading(false);
    }
  }, [page, user, hasMore]);

  useEffect(() => {
    if (user && hasMore) fetchFeeds();
  }, [page, user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    }
  }, [hasMore]);

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
          <div ref={observerRef} style={{ height: '1px' }} /> {/* ✅ 여기! */}
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
