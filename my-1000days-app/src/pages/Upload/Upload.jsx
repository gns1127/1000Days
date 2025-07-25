import React, { useState, useRef, useEffect } from 'react';
import EXIF from 'exif-js';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../features/auth/useAuth';
import './Upload.css';

const Upload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [latLng, setLatLng] = useState(null);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef();

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const uniqueNewFiles = selected.filter(
      newFile => !files.some(
        f => f.name === newFile.name && f.lastModified === newFile.lastModified
      )
    );
    const updatedFiles = [...files, ...uniqueNewFiles].slice(0, 10);

    // Revoke old previews
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    const updatedPreviews = updatedFiles.map(f => URL.createObjectURL(f));

    setFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);

    // Sync input
    const dataTransfer = new DataTransfer();
    updatedFiles.forEach(file => dataTransfer.items.add(file));
    fileInputRef.current.files = dataTransfer.files;

    if (uniqueNewFiles[0]) extractGPS(uniqueNewFiles[0]);
  };

  // Remove individual image
  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setFiles(newFiles);
    setPreviewUrls(newPreviews);

    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    fileInputRef.current.files = dataTransfer.files;
  };

  // Extract GPS from EXIF and reverse geocode
  const extractGPS = (file) => {
    EXIF.getData(file, function () {
      const lat = EXIF.getTag(this, 'GPSLatitude');
      const lon = EXIF.getTag(this, 'GPSLongitude');
      const latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
      const lonRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'E';
      if (lat && lon) {
        const toDd = (dms, ref) => {
          const [d, m, s] = dms;
          let dd = d + m / 60 + s / 3600;
          return (ref === 'S' || ref === 'W') ? -dd : dd;
        };
        const latitude = toDd(lat, latRef);
        const longitude = toDd(lon, lonRef);
        setLatLng({ lat: latitude, lng: longitude });

        const geocoder = new window.kakao.maps.services.Geocoder();
        const coord = new window.kakao.maps.LatLng(latitude, longitude);
        geocoder.coord2Address(coord.getLng(), coord.getLat(), (res, stat) => {
          if (stat === window.kakao.maps.services.Status.OK) {
            setLocation(res[0].address.address_name);
          }
        });
      }
    });
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => previewUrls.forEach(u => URL.revokeObjectURL(u));
  }, [previewUrls]);

  // Initialize Kakao map for location selection
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;
    const container = document.getElementById('kakao-map');
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5
    };
    const map = new window.kakao.maps.Map(container, options);
    const geocoder = new window.kakao.maps.services.Geocoder();
    let marker = null;

    // Click to select location
    window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      setLatLng({ lat: latlng.getLat(), lng: latlng.getLng() });
      geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (res, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setLocation(res[0].address.address_name);
        }
      });

      if (!marker) {
        marker = new window.kakao.maps.Marker({ map, position: latlng });
      } else {
        marker.setPosition(latlng);
      }
    });
  }, []);

  // Submit feed
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setStatus('로그인이 필요합니다.');
    if (!files.length) return setStatus('⚠️ 사진을 선택해 주세요.');

    try {
      setStatus('피드 생성 중…');
      const { data: feedData, error: feedErr } = await supabase
        .from('feeds')
        .insert([{ user_id: user.id, title, description, location, location_lat: latLng?.lat || null, location_lng: latLng?.lng || null, feed_date: date || new Date().toISOString() }])
        .select().single();
      if (feedErr) throw feedErr;

      const feedId = feedData.id;
      setStatus('사진 업로드 중…');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2)}.${ext}`;

        const { error: upErr } = await supabase.storage.from('photos').upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;

        const { data: urlData, error: urlErr } = supabase.storage.from('photos').getPublicUrl(fileName);
        if (urlErr) throw urlErr;

        const { error: photoErr } = await supabase.from('feed_photos').insert([{ feed_id: feedId, photo_url: urlData.publicUrl, storage_path: fileName, caption: '', display_order: i, photo_lat: latLng?.lat || null, photo_lng: latLng?.lng || null, photo_taken_at: date || null }]);
        if (photoErr) throw photoErr;
      }

      setStatus('✅ 업로드 완료!');
      setFiles([]); setPreviewUrls([]); setTitle(''); setDescription(''); setDate(''); setLocation(''); setLatLng(null);
      fileInputRef.current.value = null;
    } catch (err) {
      console.error(err);
      setStatus(`❌ 오류: ${err.message}`);
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">추억 업로드</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} />
        <div className="preview-gallery">
          {previewUrls.map((url, i) => (
            <div key={i} className="preview-wrapper">
              <img src={url} alt={`preview-${i}`} className="preview-image" />
              <button type="button" className="remove-button" onClick={() => handleRemoveImage(i)}>✕</button>
            </div>
          ))}
        </div>

        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="설명" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />

        {/* 장소 검색 Autocomplete */}
        <div style={{ position: 'relative', marginTop: '1rem' }}>
          <input
            type="text"
            value={location}
            onChange={e => {
              setLocation(e.target.value);
              if (place) place.keywordSearch(e.target.value, placesSearchCB);
            }}
            placeholder="위치 검색"
          />
          <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', maxHeight: '200px', overflowY: 'auto', zIndex: 1000, border: '1px solid #ccc' }}>
            {suggestions.map((item, idx) => (
              <li key={idx} style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => selectSuggestion(item)}>
                {item.place_name}
              </li>
            ))}
          </ul>
        </div>

        {/* 지도 클릭으로 위치 선택 */}
        <div id="kakao-map" style={{ width: '100%', height: '300px', marginTop: '1rem' }} />

        <button type="submit" className="upload-button">업로드</button>
      </form>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default Upload;
