import React, { useState, useEffect, useRef } from 'react';
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

  const fileInputRef = useRef();

  const MAX_FILES = 10;

  const handleFileChange = (e) => {

    const dataTransfer = new DataTransfer();

    let selectedFiles = Array.from(e.target.files);

    if( selectedFiles.length > MAX_FILES ){
      alert(`최대 ${MAX_FILES}장까지만 업로드가능 합니다.`);
      selectedFiles = selectedFiles.slice(0, MAX_FILES);

      selectedFiles.forEach( file => dataTransfer.items.add( file ));
      fileInputRef.current.files = dataTransfer.files;
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

  // 한글자 일시 앞에 '0' 추가
  const padZero = ( input ) => {
    const str = String(input);
    return str.length === 1 ? '0' + str : str;
  }

  const handleSubmit = (e) => {
    //e.preventDefault();
    console.log('업로드 데이터:', { title, date, location, description, files });

  };

  const removeImage = ( indexToRemove ) => {

    // 메모리 정리
    URL.revokeObjectURL(previewUrls[indexToRemove]);

    const dataTransfer = new DataTransfer();
    console.log( indexToRemove );
    // FileList를 변경하기 위한 객체( Drag and Drop API )

    const nextFiles = files.filter((_, i) => i !== indexToRemove);
    const nextPreviews = previewUrls.filter((_, i) => i !== indexToRemove);

    setFiles(nextFiles);
    setPreviewUrls(nextPreviews);

    nextFiles.forEach( file => dataTransfer.items.add(file));

    //fileInputRef.current.value = null; // ✅ 파일 input도 초기화
    fileInputRef.current.files = dataTransfer.files;
  }

  /**
   * 리스트 동적 생성시 key 필수
   * react는 리스트 요소를 렌더링할때 key를 기준으로 어떤 요소가 추가/삭제/변경 됬는지 판단
   * 
   * key가 없거나 중복되면 -> 렌더링 최적화가 깨지고 버그 발생 가능
   * key는 고유한 값
   * key는 최상위 객체만 위치, 하위 객체가 key를 가져도 아무런 효과 X key 중복시 디버깅 어려움
   * 
   * 
   * ex) 
   * {previewUrls.map((url, idx) => (
            <div key={idx} className='preview-wrapper'>
              <img src={url} alt={`preview-${idx}`} className="preview-image" />
              <button className='remove-button' onClick={( ) => removeImage( idx )}>x</button>
            </div>
          ))}
   */
  return (
    <div className="upload-container">
      <h2>추억 업로드</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <label className="upload-box" htmlFor="file-input"></label>
        <input id="file-input" type="file" accept="image/*" multiple onChange={handleFileChange} ref={fileInputRef}/>
        
        <div className="preview-gallery">
          {previewUrls.map((url, idx) => (
            <div key={idx} className='preview-wrapper'>
              <img src={url} alt={`preview-${idx}`} className="preview-image" />
              <button className='remove-button' onClick={( ) => removeImage( idx )}>x</button>
            </div>
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
