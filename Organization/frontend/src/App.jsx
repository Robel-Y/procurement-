import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ApproverDashboard from "./pages/ApproverDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ApproverDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
