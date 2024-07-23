import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import User from './User';
import Login from './Login';
import Register from './Register';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/user' element={<User />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
