import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './components/auth/login';
import Register from './components/auth/register';
import Dashboard from './dashboard';
import Course from './components/course/course';
import Content from './components/course/contents';
import Result from './components/result/result';
import Assign from './components/assign/assign';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register/>} />

        {/* Parent layout */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* default page when visiting /dashboard */}
          <Route index element={<Navigate to="courses" replace />} />
          {/* child routes are RELATIVE to /dashboard */}
          <Route path="courses" element={<Course />} />
          <Route path="content/:courseId" element={<Content />} />
          <Route path="result" element={<Result />} />
          <Route path="assign" element={<Assign />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
