import React, { useState, useRef, useEffect } from 'react';
import EXIF from 'exif-js';
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../services/supabase';
import { useAuth } from '../../features/auth/useAuth';
import DateInputWithCalendar from '@/components/DateInputWithCalendar';
import imageCompression from 'browser-image-compression';

import './Upload.css';

const Upload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [latLng, setLatLng] = useState(null);
  const [status, setStatus] = useState('');
  const [suggestions, setSuggestions] = useState([]);


  const navigate = useNavigate()


  const fileInputRef = useRef();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const placeServiceRef = useRef(null);

  // Initialize Kakao map and Places service
  useEffect(() => {

    if (!window.kakao || !window.kakao.maps) return;
    const container = document.getElementById('kakao-map');
    const options = { center: new window.kakao.maps.LatLng(37.5665, 126.9780), level: 5 };
    const map = new window.kakao.maps.Map(container, options);
    mapRef.current = map;
    placeServiceRef.current = new window.kakao.maps.services.Places();
    markerRef.current = new window.kakao.maps.Marker({ map });

    window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      markerRef.current.setPosition(latlng);
      const newLatLng = { lat: latlng.getLat(), lng: latlng.getLng() };
      setLatLng(newLatLng);

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (res, stat) => {
        if (stat === window.kakao.maps.services.Status.OK) {
          const addr = res[0].address.address_name;
          setLocation(addr);
          placeServiceRef.current.keywordSearch(addr, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK && data.length) {
              setBuildingName(data[0].place_name);
            }
          });
          setSuggestions([]);
        }
      });
    });
  }, []);

  // EXIF extraction and map update
  const extractGPS = (file) => {
    EXIF.getData(file, function () {
      const lat = EXIF.getTag(this, 'GPSLatitude');
      const lon = EXIF.getTag(this, 'GPSLongitude');
      const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
      const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');
      if (lat && lon) {
        const toDd = (dms, ref) => {
          const [d, m, s] = dms;
          let dd = d + m / 60 + s / 3600;
          return (ref === 'S' || ref === 'W') ? -dd : dd;
        };
        const latitude = toDd(lat, latRef);
        const longitude = toDd(lon, lonRef);
        const position = new window.kakao.maps.LatLng(latitude, longitude);

        if (markerRef.current) markerRef.current.setPosition(position);
        if (mapRef.current) mapRef.current.setCenter(position);
        setLatLng({ lat: latitude, lng: longitude });

        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(longitude, latitude, (res, stat) => {
          if (stat === window.kakao.maps.services.Status.OK) {
            const addr = res[0].address.address_name;
            setLocation(addr);
            placeServiceRef.current.keywordSearch(addr, (data, status) => {
              if (status === window.kakao.maps.services.Status.OK && data.length) {
                setBuildingName(data[0].place_name);
              }
            });
          }
        });
      }
    });
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    const uniqueNew = selected.filter(
      nf => !files.some(f => f.name === nf.name && f.lastModified === nf.lastModified)
    );
    const updated = [...files, ...uniqueNew].slice(0, 10);

    previewUrls.forEach(url => URL.revokeObjectURL(url));
    //const previews = updated.map(f => URL.createObjectURL(f));

    // 압축된 파일 목록을 만들어서 preview만 압축본을 사용
    const compressedFiles = await Promise.all(
      updated.map((file) =>
        imageCompression(file, {
          maxSizeMB: 0.3,             // 300KB 이하로 압축
          maxWidthOrHeight: 800,     // 800px 이하로 축소
          useWebWorker: true,
        })
      )
    );

    const previews = compressedFiles.map(f => URL.createObjectURL(f));
    setPreviewUrls(previews);
    //setFiles(updated);
    //setPreviewUrls(previews);

    const dt = new DataTransfer();
    updated.forEach(f => dt.items.add(f));
    fileInputRef.current.files = dt.files;

    if (uniqueNew[0]) extractGPS(uniqueNew[0]);
  };

  // Remove image
  const handleRemoveImage = (idx) => {
    URL.revokeObjectURL(previewUrls[idx]);
    const remaining = files.filter((_, i) => i !== idx);
    const remainingPreviews = remaining.map(f => URL.createObjectURL(f));

    setFiles(remaining);
    setPreviewUrls(remainingPreviews);

    const dt = new DataTransfer();
    remaining.forEach(f => dt.items.add(f));
    fileInputRef.current.files = dt.files;
  };

  // Autocomplete callback
  const placesSearchCB = (data, status) => {
    if (status === window.kakao.maps.services.Status.OK) {
      setSuggestions(data);
    }
  };

  // Prevent Enter key submitting form in search input
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      placeServiceRef.current?.keywordSearch(searchKeyword, placesSearchCB);
    }
  };

  // Suggestion select
  const selectSuggestion = (item) => {
    setSearchKeyword(item.place_name);
    const addr = item.road_address_name || item.address_name;
    setLocation(addr);
    setBuildingName(item.place_name);
    const lat = parseFloat(item.y);
    const lng = parseFloat(item.x);
    const pos = new window.kakao.maps.LatLng(lat, lng);
    markerRef.current.setPosition(pos);
    mapRef.current.setCenter(pos);
    setLatLng({ lat, lng });
    setSuggestions([]);
  };

  // Cleanup URLs
  useEffect(() => {
    return () => previewUrls.forEach(u => URL.revokeObjectURL(u));
  }, [previewUrls]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setStatus('로그인이 필요합니다.');
    if (!files.length) return setStatus('⚠️ 사진을 선택해 주세요.');
    if (!title.length) return setStatus('⚠️ 제목을 입력해 주세요.');

    try {
      setStatus('피드 생성 중…');
      const { data: fData, error: fErr } = await supabase
        .from('feeds')
        .insert([{ user_id: user.id, title, description, location, building_name: buildingName, location_lat: latLng?.lat || null, location_lng: latLng?.lng || null, feed_date: date || new Date().toISOString() }])
        .select()
        .single();
      if (fErr) throw fErr;
      const feedId = fData.id;

      setStatus('사진 업로드 중…');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop();
        const fname = `${Date.now()}_${Math.random().toString(36).substr(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('photos').upload(fname, file, { cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;
        const { data: urlData, error: urlErr } = supabase.storage.from('photos').getPublicUrl(fname);
        if (urlErr) throw urlErr;
        const { error: pErr } = await supabase.from('feed_photos').insert([{ feed_id: feedId, photo_url: urlData.publicUrl, storage_path: fname, caption: '', display_order: i, photo_lat: latLng?.lat || null, photo_lng: latLng?.lng || null, photo_taken_at: date || null }]);
        if (pErr) throw pErr;
      }

      setStatus('✅ 업로드 완료!');
      setFiles([]);
      setPreviewUrls([]);
      setTitle('');
      setDescription('');
      setDate('');
      setSearchKeyword('');
      setLocation('');
      setBuildingName('');
      setLatLng(null);
      fileInputRef.current.value = null;

      navigate('/home');
    } catch (err) {
      console.error(err);
      setStatus(`❌ 오류: ${err.message}`);
    }
  };

  return (
    <div className="upload-container">
      {/*<h2 className="upload-title">추억 업로드</h2>*/}
      <form onSubmit={handleSubmit} className="upload-form">
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} />
        <div className="preview-gallery">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="preview-wrapper">
              <img src={url} alt={`prev-${idx}`} className="preview-image" />
              <button type="button" className="remove-button" onClick={() => handleRemoveImage(idx)}>✕</button>
            </div>
          ))}
        </div>

        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="설명" />
        <DateInputWithCalendar selected={date} onChange={setDate} />
        {/*<input type="date" value={date} onChange={e => setDate(e.target.value)} />*/}

        {/* 장소 검색 Autocomplete */}
        <div style={{ position: 'relative', marginTop: '1rem' }}>
          <input type="text" value={searchKeyword} onChange={e => { setSearchKeyword(e.target.value); placeServiceRef.current?.keywordSearch(e.target.value, placesSearchCB); }}
            onKeyDown={handleSearchKeyDown}
            placeholder="장소 검색"
          />
          {suggestions.length > 0 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', maxHeight: '200px', overflowY: 'auto', zIndex: 1000, border: '1px solid #ccc', padding: 0, margin: 0, listStyle: 'none' }}>
              {suggestions.map((item, i) => (
                <li key={i} style={{ padding: '0.5rem', cursor: 'pointer' }} onClick={() => selectSuggestion(item)}>
                  {item.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 선택된 주소 및 건물명 */}
        <input type="text" value={location} readOnly placeholder="선택된 주소" style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />
        <input type="text" value={buildingName} readOnly placeholder="선택된 건물명" style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }} />

        {/* 지도 */}
        <div id="kakao-map" style={{ width: '100%', height: '300px', marginTop: '1rem' }} />

        <button type="submit" className="upload-button">업로드</button>
      </form>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default Upload;
