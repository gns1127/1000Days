import { useState, useEffect } from 'react';
//import { supabase } from '../../services/supabase';

export const usePhoto = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      // try {
      //   // 메타데이터 테이블에서 가져오기
      //   const { data: metadata, error: metaError } = await supabase
      //     .from('photo_metadata')
      //     .select('*');
      //   if (metaError) throw metaError;

      //   // 각 파일의 공개 URL 생성
      //   const photosWithUrl = await Promise.all(
      //     metadata.map(async (item) => {
      //       const { data, error: urlError } = supabase
      //         .storage
      //         .from('photos')
      //         .getPublicUrl(item.filename);
      //       if (urlError) throw urlError;
      //       return {
      //         id: item.id,
      //         url: data.publicUrl,
      //         filename: item.filename,
      //       };
      //     })
      //   );

      //   setPhotos(photosWithUrl);
      // } catch (err) {
      //   setError(err);
      // } finally {
      //   setLoading(false);
      // }
    };

    fetchPhotos();
  }, []);

  return { photos, loading, error };
};
