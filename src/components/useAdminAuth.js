import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UseAdminAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    console.log("Admin token:", token);
    if (!token) {
      navigate("/");
    }
  }, [navigate]);
};
export default UseAdminAuth;
