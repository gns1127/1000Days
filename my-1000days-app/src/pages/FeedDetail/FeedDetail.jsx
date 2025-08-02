import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { FaHeart, FaRegComment, FaBookmark } from 'react-icons/fa';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './FeedDetail.css';

const FeedDetail = ({ feedId, onClose }) => {
  const [feed, setFeed] = useState(null);
  const [photos, setPhotos] = useState([]);

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

  return (
    <div className="feed-detail-fullscreen">
      <button className="feed-detail-close" onClick={onClose}>←</button>

      <Swiper spaceBetween={0} slidesPerView={1} className="feed-detail-swiper">
        {photos.map((photo, idx) => (
          <SwiperSlide key={idx}>
            <img src={photo.photo_url} alt={`slide-${idx}`} className="feed-detail-image" />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="feed-detail-meta">
        <strong>{feed.title}</strong>
        <p>{feed.description}</p>
        <p style={{ color: '#888' }}>{feed.feed_date}</p>
      </div>

      <div className="feed-detail-icons">
        <FaHeart size={20} />
        <FaRegComment size={20} />
        <FaBookmark size={20} />
      </div>
    </div>
  );
};

export default FeedDetail;
