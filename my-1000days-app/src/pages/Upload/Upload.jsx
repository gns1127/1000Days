import React, { useState, useEffect } from 'react';
import EXIF from 'exif-js';
import './Upload.css';
import { getDate, getMonth } from 'date-fns';

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [latLng, setLatLng] = useState(null); // 좌표 저장용

  const MAX_FILES = 10;

  const handleFileChange = (e) => {
    let selectedFiles = Array.from(e.target.files);

    if( selectedFiles.length > MAX_FILES ){
      alert(`최대 ${MAX_FILES}장까지만 업로드가능 합니다.`);
      selectedFiles = selectedFiles.slice(0, MAX_FILES);
    }

    setFiles(selectedFiles);
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // EXIF → GPS → 주소
    if (selectedFiles.length > 0) {
      extractGPSFromFile(selectedFiles[0], (gps) => {
        if (gps) {
          const { latitude, longitude } = gps;
          console.log( 'latitude :: ' + latitude);
          console.log( 'longitude :: ' + longitude);
          setLatLng({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude); // 주소 변환
        }
      });
    }
  };

  const extractGPSFromFile = (file, callback) => {
    EXIF.getData(file, function () {
      const lat = EXIF.getTag(this, 'GPSLatitude');
      const lon = EXIF.getTag(this, 'GPSLongitude');
      const latRef = EXIF.getTag(this, 'GPSLatitudeRef') || 'N';
      const lonRef = EXIF.getTag(this, 'GPSLongitudeRef') || 'E';

      if (lat && lon) {
        const latitude = convertDMSToDD(lat, latRef);
        const longitude = convertDMSToDD(lon, lonRef);
        callback({ latitude, longitude });
      } else {
        callback(null); // 위치 정보 없음
      }
    });
  };

  const convertDMSToDD = (dms, ref) => {
    const [d, m, s] = dms;
    let dd = d + m / 60 + s / 3600;
    if (ref === 'S' || ref === 'W') dd *= -1;
    return dd;
  };

  // ✅ 좌표 → 주소 변환
  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    const coord = new window.kakao.maps.LatLng(lat, lng);
    geocoder.coord2Address(coord.getLng(), coord.getLat(), function (result, status) {
      if (status === window.kakao.maps.services.Status.OK) {
        const address = result[0].address.address_name;
        setLocation(address);
      }
    });
  };

  useEffect(() => {
    return () => {

      let today = new Date();
      
      let yyyy = today.getFullYear();
      let mm = padZero( today.getMonth() + 1 );
      let dd = padZero( today.getDate() );

      setDate( `${yyyy}-${mm}-${dd}` );

      
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const padZero = ( input ) => {
    const str = String(input);
    return str.length === 1 ? '0' + str : str;
  }

  const handleSubmit = (e) => {
    //e.preventDefault();
    console.log('업로드 데이터:', { title, date, location, description, files });

  };

  return (
    <div className="upload-container">
      <h2>추억 업로드</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <label className="upload-box" htmlFor="file-input"></label>
        <input id="file-input" type="file" accept="image/*" multiple onChange={handleFileChange} />

        <div className="preview-gallery">
          {previewUrls.map((url, idx) => (
            <img key={idx} src={url} alt={`preview-${idx}`} className="preview-image" />
          ))}
        </div>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input value={location} onChange={(e) => {setLocation(e.target.value); console.log(e); }} placeholder="위치 (자동 입력됨)" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명" />

        <button type="submit" className="upload-button">업로드</button>
      </form>
    </div>
  );
};

export default Upload;
