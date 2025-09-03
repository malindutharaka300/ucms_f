import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './components/auth/login';
import Register from './components/auth/register';
import Dashboard from './dashboard';
import Course from './components/course/course';
import Content from './components/course/contents';
import Result from './components/result/result';
import Assign from './components/assign/assign';

export default function App() {
  return (
    <BrowserRouter basename="/ucms_f">
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register/>} />

        {/* Parent layout */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="courses" replace />} />
          <Route path="courses" element={<Course />} />
          <Route path="content/:courseId" element={<Content />} />
          <Route path="result" element={<Result />} />
          <Route path="assign" element={<Assign />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
