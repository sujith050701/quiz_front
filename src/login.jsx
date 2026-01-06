import React, { useState, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @import url("https://fonts.googleapis.com/css?family=Poppins:200,300,400,500,600,700,800,900&display=swap");
      @import url("https://use.fontawesome.com/releases/v6.5.1/css/all.css");

      body {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #25252b;
      }

      * {
        font-family: "Poppins", sans-serif;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .box {
        position: relative;
        width: 400px;
        height: 500px;
        border-radius: 20px;
        filter: drop-shadow(0 15px 50px #000);
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.5s;
        background: repeating-conic-gradient(
          from 0deg,
          #ff2770 0%,
          #ff2770 10%,
          transparent 10%,
          transparent 40%,
          #ff2770 50%
        );
        animation: rotating 4s linear infinite;
        overflow: hidden;
      }

      @keyframes rotating {
        0% { background: repeating-conic-gradient(from 0deg, #ff2770 0%, #ff2770 10%, transparent 10%, transparent 40%, #ff2770 50%); }
        100% { background: repeating-conic-gradient(from 360deg, #45f3ff 0%, #45f3ff 10%, transparent 10%, transparent 40%, #45f3ff 50%); }
      }

      .box::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background: repeating-conic-gradient(
          from 0deg,
          #45f3ff 0%,
          #45f3ff 10%,
          transparent 10%,
          transparent 40%,
          #45f3ff 50%
        );
        filter: drop-shadow(0 15px 50px #000);
        border-radius: 20px;
        animation: rotating 4s linear infinite;
        animation-delay: -1s;
      }

      .box::after {
        content: "";
        position: absolute;
        inset: 4px;
        background: #2d2d39;
        border-radius: 15px;
        border: 8px solid #25252b;
        z-index: 1;
      }

      .login {
        position: absolute;
        width: 90%;
        height: 85%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        z-index: 2;
        box-shadow: inset 0 10px 20px #00000080;
        border-bottom: 2px solid #ffffff80;
        padding: 20px;
      }

      h2 {
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-align: center;
      }

      h2 i {
        color: #ff2770;
        text-shadow: 0 0 5px #ff2770, 0 0 20px #ff2770;
      }

      form {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        width: 100%;
      }

      input {
        width: 100%;
        padding: 12px;
        outline: none;
        border: none;
        font-size: 1em;
        color: #fff;
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid #fff;
        border-radius: 30px;
        text-align: center;
        transition: 0.3s;
      }

      input::placeholder {
        color: #bbb;
      }

      input:focus {
        border-color: #45f3ff;
        box-shadow: 0 0 10px #45f3ff;
      }

      input[type="submit"] {
        background: #45f3ff;
        border: none;
        font-weight: 600;
        color: #111;
        cursor: pointer;
        transition: 0.5s;
      }

      input[type="submit"]:hover {
        box-shadow: 0 0 10px #45f3ff, 0 0 60px #45f3ff;
        transform: scale(1.05);
      }

      .group {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-top: 10px;
      }

      .group a {
        color: #45f3ff;
        text-decoration: none;
        font-size: 0.9em;
        transition: 0.3s;
      }

      .group a:hover {
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://192.168.29.171:3002/api/users/login", {
        username: formData.username,
        password: formData.password,
      });

      if (response.status === 200) {
        // Handle response format: backend wraps in { success: true, data: {...} }
        const loginData = response.data.data || response.data;
        localStorage.setItem("userId", loginData.userId);
        localStorage.setItem("name", loginData.name);
        localStorage.setItem("score", loginData.totalScore || 0);
        navigate("/userdashboard");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Invalid credentials!");
    }
  };

  return (
    <div className="box">
      <div className="login">
        <h2>
          <i className="fa-solid fa-right-to-bracket" /> Login{" "}
          <i className="fa-solid fa-heart" />
        </h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <input type="submit" value="Sign in" />
          <div className="group">
            <a href="#">Forgot Password?</a>
            <Link to="/signup">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
