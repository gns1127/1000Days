import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Map from './pages/Map/Map';
import Upload from './pages/Upload/Upload';
import Feed from './pages/Feed/Feed';
import FeedDetail from './pages/FeedDetail/FeedDetail';

function App() {

  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<Map />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/FeedDetail" element={<FeedDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;