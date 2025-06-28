import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Map from './pages/Map/Map';

function App() {

  // 도메인 localhost로 설정 추후 key 변경
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=a114e10a23a5835a0302da69682392a8&libraries=clusterer,services"></script>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;