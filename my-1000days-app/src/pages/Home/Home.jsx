// src/pages/Home/Home.jsx
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../features/auth/useAuth';
import { supabase } from '../../services/supabase';
import NavigationBar from '@/components/NavigationBar/NavigationBar';
import Feed from '../FeedDetail/Feed';
import './Home.css';

const LIMIT = 9;

// 새 아이템 붙인 후 화면을 약간 위로 보정하는 비율(뷰포트/컨테이너 높이의 10%)
const SCROLL_OFFSET_RATIO = 0.1;

// 바닥 감지 임계값(px) & 재장전을 위한 위로 이동 거리(px)
// - distanceFromBottom <= BOTTOM_GAP_PX 이면 "바닥 근처"로 판단
// - 바닥에서 REARM_DISTANCE_PX 이상 위로 올랐다가 다시 바닥에 닿아야 다음 페이지 로드
const BOTTOM_GAP_PX = 40;
const REARM_DISTANCE_PX = 120;

const Home = () => {
  const { user } = useAuth();

  // ----- 상태 -----
  const [feeds, setFeeds] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedFeedId, setSelectedFeedId] = useState(null);

  // ----- ref -----
  const feedIdSetRef = useRef(new Set());    // 중복 방지
  const scrollAreaRef = useRef(null);        // 내부 스크롤 컨테이너
  const restoreRef = useRef(null);           // 스크롤 복원 정보
  const isFetchingRef = useRef(false);       // 네트워크 중복 방지
  const rearmRef = useRef(true);             // 다음 페이지 불러오기 허용 플래그

  // 모바일 스크롤 높이 계산용(레이아웃 요소)
  const headerRef = useRef(null);
  const iconsRef = useRef(null);

  // ----- 데이터 조회 -----
  const fetchFeeds = useCallback(async () => {
    if (!user || !hasMore) return;
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    const from = page * LIMIT;
    const to = from + LIMIT - 1;
    if (from < 0 || to < 0) {
      isFetchingRef.current = false;
      setLoading(false);
      return;
    }

    // 스크롤 복원을 위해 현재 오프셋 저장(하단에 아이템 붙는 구조)
    const el = scrollAreaRef.current;
    if (el) {
      restoreRef.current = {
        mode: 'bottomOffset',
        value: el.scrollHeight - el.scrollTop,
      };
    }

    try {
      const { data, error } = await supabase
        .from('feeds')
        .select(
          `id, title, feed_date, feed_photos(photo_url, display_order)`,
          { count: 'exact' }
        )
        .eq('user_id', user.id)
        .order('feed_date', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('피드 조회 오류:', error);
        return;
      }

      const newFeeds = [];
      for (const feed of data || []) {
        if (feedIdSetRef.current.has(feed.id)) continue;
        feedIdSetRef.current.add(feed.id);

        const photos = (feed.feed_photos || [])
          .slice()
          .sort((a, b) => a.display_order - b.display_order);

        newFeeds.push({
          id: feed.id,
          title: feed.title,
          date: (feed.feed_date || '').slice(0, 10),
          repPhoto: photos[0]?.photo_url || '',
        });
      }

      setFeeds(prev => [...prev, ...newFeeds]);
      if ((data?.length ?? 0) < LIMIT) setHasMore(false);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [user, hasMore, page]);

  // 페이지/유저 변화 시 로드
  useEffect(() => {
    if (user && hasMore) fetchFeeds();
  }, [user, page, hasMore, fetchFeeds]);

  // ----- 스크롤 핸들러: "바닥에서 다시 스크롤" 시에만 다음 페이지 로드 -----
  const handleScroll = (e) => {
    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);

    // 사용자가 바닥에서 충분히 '떴다면' 다음 로드를 허용(재장전)
    if (distanceFromBottom > REARM_DISTANCE_PX) {
      rearmRef.current = true;
    }

    // 바닥 근처 && 재장전 상태 && 로딩 중 아님 && 더 있음 => 다음 페이지 로드
    if (
      distanceFromBottom <= BOTTOM_GAP_PX &&
      rearmRef.current &&
      hasMore &&
      !loading &&
      !isFetchingRef.current
    ) {
      rearmRef.current = false;    // 다시 바닥에서 한 번 더 스크롤해야 다음 로드
      setPage(prev => prev + 1);
    }
  };

  // ----- 스크롤 위치 복원 (모바일 대응 & 10% 위로 보정 유지) -----
  useLayoutEffect(() => {
    const el = scrollAreaRef.current;
    const restore = restoreRef.current;
    if (!el || !restore) return;

    // 모바일(iOS)에서 레이아웃/이미지 로드 타이밍 때문에 즉시 반영 안 되는 문제 보강
    const getViewportHeight = () =>
      window.visualViewport?.height ||
      el.clientHeight ||
      document.documentElement.clientHeight ||
      0;

    const adjust = () => {
      const vh = getViewportHeight();
      const offset = vh * SCROLL_OFFSET_RATIO; // 화면 높이의 10% 위로 보정
      if (restore.mode === 'bottomOffset') {
        el.scrollTop = Math.max(0, el.scrollHeight - restore.value - offset);
      } else if (restore.mode === 'top') {
        el.scrollTop = Math.max(0, restore.value - offset);
      }
      restoreRef.current = null;
    };

    requestAnimationFrame(() => {
      setTimeout(adjust, 50);
    });
  }, [feeds]);

  // ----- 모바일 스크롤 고정 높이 계산 (픽셀 강제) -----
  useLayoutEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;

    // 하단 NavigationBar 높이가 고정이 아니라면 ref로 측정해 빼도 됨
    const navFallback = 64;

    const calcHeight = () => {
      const vv =
        window.visualViewport?.height ||
        window.innerHeight ||
        document.documentElement.clientHeight ||
        0;

      const headerH = headerRef.current?.offsetHeight || 0;
      const iconsH = iconsRef.current?.offsetHeight || 0;

      const h = Math.max(0, vv - headerH - iconsH - navFallback);
      el.style.height = `${h}px`; // 🔥 핵심: 픽셀 높이로 강제
    };

    // 초기 & 레이아웃 확정 타이밍 보강
    requestAnimationFrame(() => {
      calcHeight();
      setTimeout(calcHeight, 50);
    });

    // 주소창/회전/키보드 등 변화 대응
    window.addEventListener('resize', calcHeight);
    window.visualViewport?.addEventListener?.('resize', calcHeight);
    window.addEventListener('orientationchange', calcHeight);
    return () => {
      window.removeEventListener('resize', calcHeight);
      window.visualViewport?.removeEventListener?.('resize', calcHeight);
      window.removeEventListener('orientationchange', calcHeight);
    };
  }, []);

  const showInitialLoading = loading && feeds.length === 0;

  return (
    <div className="home-wrapper">
      <header className="home-header" ref={headerRef}>
        <h1 className="home-title">사진</h1>
      </header>

      <div className="home-icons-fixed" ref={iconsRef}>
        <FaClock className="home-icon" />
        <FaMapMarkerAlt className="home-icon" />
      </div>

      <div className="scroll-area" ref={scrollAreaRef} onScroll={handleScroll}>
        {showInitialLoading ? (
          <div className="home-loading">로딩 중…</div>
        ) : (
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
                  loading="lazy"
                />
              </div>
            ))}
            {/* 하단 로딩 인디케이터 */}
            {loading && hasMore && (
              <div className="home-loading" style={{ padding: 12 }}>
                불러오는 중…
              </div>
            )}
          </div>
        )}
      </div>

      {selectedFeedId && (
        <div className="feed-detail-fullscreen">
          <Feed feedId={selectedFeedId} onClose={() => setSelectedFeedId(null)} />
        </div>
      )}

      <NavigationBar active="home" />
    </div>
  );
};

export default Home;
