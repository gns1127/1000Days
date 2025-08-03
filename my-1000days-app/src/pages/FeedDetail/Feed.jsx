import React, { useEffect, useState } from 'react';
import './Feed.css';
import { AiOutlineLeft, AiOutlineRight, AiOutlineClose } from 'react-icons/ai';
import test from '@/assets/image/test_img.jpg'  // 정적 이미지 import 추후 동적 이미지로 변경
import test2 from '@/assets/image/test_img2.jpg'  // 정적 이미지 import 추후 동적 이미지로 변경
import test3 from '@/assets/image/test_img3.jpg'  // 정적 이미지 import 추후 동적 이미지로 변경

import { supabase } from '../../services/supabase';
import { FaHeart, FaRegComment, FaBookmark } from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';


const feedInfo = {
  id: 1,
  photos: [
    test,
    test2,
    test3,
  ],
  title: '데이트했던 북악산!',
  date: '2023.09.14',
  location: '북악팔각정',
  desc: '정말 멋진 풍경과 함께한 하루~',
  likes: 3,
  comments: [
    { id: 1, user: '영희', content: '사진 너무 예뻐!' },
    { id: 2, user: '철수', content: '부럽다!' },
  ],
  authorId: 'u123',
};
/* ------------------------------------------------------------------------- */
const Feed = ({ feedId, onClose }) => {
  const [feed, setFeed] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);


  useEffect(() => {
    const fetchFeed = async () => {
      const { data: feedData } = await supabase
        .from('feeds')
        .select('*')
        .eq('id', feedId)
        .single();

      const { data: photoData } = await supabase
        .from('feed_photos')
        .select('*')
        .eq('feed_id', feedId)
        .order('display_order');

      setFeed(feedData);

      setPhotos(photoData);
    };

    fetchFeed();
  }, [feedId]);

  if (!feed || photos.length === 0) return null;


  if (!visible) return null; // 닫힌 상태라면 렌더링 X

  const next = () => setIndex((prev) => (prev + 1) % photos.length);
  const prev = () => setIndex((prev) => (prev - 1 + photos.length) % photos.length);

  const handleEdit = () => {
    console.log('수정:', feed);
    // TODO: 수정 로직
  };

  const handleDelete = () => {
    console.log('삭제 ID:', feed.id);
    // TODO: 삭제 로직
  };

  return (
    <div className="feed">
      <button className="feed__close" onClick={() => setVisible(false)} aria-label="닫기">
        <AiOutlineClose size={24} />
      </button>

      <div className="feed__photo-wrapper">
        {/*<Swiper spaceBetween={0} slidesPerView={1} className="feed-detail-swiper">
          {photos.map((photo, idx) => (
            <SwiperSlide key={idx}>
              <img src={photo.photo_url} alt={`slide-${idx}`} className="feed-detail-image" />
            </SwiperSlide>
          ))}
        </Swiper>
        */}
        <img src={photos[index].photo_url} alt={`photo-${index}`} />
        {photos.length > 1 && (
          <>
            <button className="nav left" onClick={prev} aria-label="이전">
              <AiOutlineLeft size={24} />
            </button>
            <button className="nav right" onClick={next} aria-label="다음">
              <AiOutlineRight size={24} />
            </button>
          </>
        )}
      </div>

      <section className="feed__info">
        <h2>{feed.title}</h2>
        <p className="meta">
          {feed.feed_date.substring(0,10)} · {feed.building_name ? feed.building_name : feed.location }
        </p>
        <p className="desc">{feedInfo.desc}</p>
        <p className="stat">
          ♥ 좋아요 {feedInfo.likes} · 💬 댓글 {feedInfo.comments.length }
        </p>
      </section>

      <section className="feed__comments">
        <h3>댓글</h3>
        { feedInfo.comments.length === 0 &&  <p className="empty">아직 댓글이 없습니다</p>}
        {feedInfo.comments.map((c) => (
          <div key={c.id} className="comment">
            <span className="user">{c.user}</span>
            <span className="content">{c.content}</span>
          </div>
        ))}
      </section>

      {/*isAuthor && (
        <div className="feed__author-actions">
          <button onClick={handleEdit} className="edit">
            수정
          </button>
          <button onClick={handleDelete} className="delete">
            삭제
          </button>
        </div>
      )*/}
    </div>
  );
}

export default Feed;
