import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import Transfers from './pages/Transfers';

const App = () => (
  <BrowserRouter>
    <AppProvider>
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transfers" element={<Transfers />} />
            </Routes>
          </main>
        </div>
      </div>
    </AppProvider>
  </BrowserRouter>
);

export default App;
