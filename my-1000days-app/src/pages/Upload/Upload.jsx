// src/pages/Upload.jsx
import React, { useState, useRef, useEffect } from 'react';
import EXIF from 'exif-js';

import { supabase } from '../../services/supabase';
import { useAuth } from '../../features/auth/useAuth';
import './Upload.css';

const Upload = () => {
  const { user } = useAuth();                  // 로그인한 유저 정보
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [latLng, setLatLng] = useState(null);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef();

  // EXIF → GPS → 주소 자동 입력
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviewUrls(selected.map(f => URL.createObjectURL(f)));
    if (selected[0]) extractGPS(selected[0]);
  };
  const extractGPS = (file) => {
    EXIF.getData(file, function() {
      const lat = EXIF.getTag(this, 'GPSLatitude');
      const lon = EXIF.getTag(this, 'GPSLongitude');
      const latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
      const lonRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'E';
      if (lat && lon) {
        const toDd = (dms, ref) => {
          const [d, m, s] = dms;
          let dd = d + m/60 + s/3600;
          return (ref==='S'||ref==='W') ? -dd : dd;
        };
        const latitude = toDd(lat, latRef);
        const longitude = toDd(lon, lonRef);
        setLatLng({ lat: latitude, lng: longitude });
        // 카카오 reverse-geocode (스크립트 로드 필요)
        const geocoder = new window.kakao.maps.services.Geocoder();
        const coord    = new window.kakao.maps.LatLng(latitude, longitude);
        geocoder.coord2Address(
          coord.getLng(), 
          coord.getLat(), 
          (res, stat) => {
            if (stat === window.kakao.maps.services.Status.OK) {
              setLocation(res[0].address.address_name);
            }
          }
        );
      }
    });
  };

  // unmount 시 ObjectURL 해제
  useEffect(() => () => {
    previewUrls.forEach(u => URL.revokeObjectURL(u));
  }, [previewUrls]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setStatus('로그인이 필요합니다.');
      return;
    }
    if (!files.length) {
      setStatus('⚠️ 사진을 선택해 주세요.');
      return;
    }

    const session = await supabase.auth.getSession();
    console.log('세션 있음?', session);
    console.log( 'user.id :: ' , user.id );
    setStatus('피드 생성 중…');
    try {
      // 1) feeds 테이블에 피드 정보 insert
      const feedPayload = {
        user_id:        user.id,
        title : 'test123',
        description : '설명 테스트',
        location : '위치 테스트',
        location_lat:   latLng?.lat || null,
        location_lng:   latLng?.lng || null,
        feed_date:      date || new Date().toISOString(),
        // created_at, updated_at는 DB default
      };


      console.log( feedPayload );

      const { data: feedData, error: feedErr } = await supabase
        .from('feeds')
        .insert([feedPayload])
        .select('id');
        // .single();
      if (feedErr) throw feedErr;
      const feedId = feedData.id;

      // 2) 각 파일 업로드 + feed_photos insert
      setStatus('사진 업로드 중…');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext  = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2)}.${ext}`;

        // 2-1) Storage 업로드
        const { error: upErr } = await supabase
          .storage
          .from('photos')
          .upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;

        // 2-2) 공용 URL 가져오기
        const { data: urlData, error: urlErr } = supabase
          .storage
          .from('photos')
          .getPublicUrl(fileName);
        if (urlErr) throw urlErr;

        // 2-3) feed_photos에 insert
        const photoPayload = {
          feed_id:      feedId,
          photo_url:    urlData.publicUrl,
          storage_path: fileName,
          caption:      '',           // 필요 시 per-file 캡션 필드로 교체
          display_order: i,
          photo_lat:     latLng?.lat  || null,
          photo_lng:     latLng?.lng  || null,
          photo_taken_at: date || null,
        };
        const { error: photoErr } = await supabase
          .from('feed_photos')
          .insert([photoPayload]);
        if (photoErr) throw photoErr;
      }

      setStatus('✅ 업로드 완료!');
      // form 리셋
      setFiles([]); setPreviewUrls([]);
      fileInputRef.current.value = null;
      setTitle(''); setDescription(''); setDate(''); setLocation(''); setLatLng(null);

    } catch (err) {
      console.error(err);
      setStatus(`❌ 오류: ${err.message}`);
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">추억 업로드</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        <div className="preview-gallery">
          {previewUrls.map((url, i) => (
            <div key={i} className="preview-wrapper">
              <img src={url} alt={`preview-${i}`} className="preview-image" />
            </div>
          ))}
        </div>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목"
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="설명"
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="위치"
        />

        <button type="submit" className="upload-button">
          업로드
        </button>
      </form>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default Upload;
