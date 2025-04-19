import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";

import './register.css';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Enter a valid email";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          userType: "freelancer",
          uid: user.uid,
          profilePic: "",
        };

        await setDoc(doc(db, "users", user.uid), userData);

        alert("Registration successful!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
        navigate("/login");
      } catch (err) {
        let errorMessage = "Failed to create account, please try again.";
        if (err.code === "auth/email-already-in-use") {
          errorMessage = "This email is already in use.";
        } else if (err.code === "auth/weak-password") {
          errorMessage = "Password should be at least 6 characters.";
        } else if (err.code === "auth/invalid-email") {
          errorMessage = "Invalid email address.";
        }
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div id='register-container' className='register-container-register'>
      <h1 className='register-header-web-name'>Sociable</h1>
      <div className='register-form-register'>
        <h2 className='register-header-register'>REGISTER</h2>
        <form className='form-register' onSubmit={handleSubmit}>
          <label className='label-register' htmlFor="email">Email:</label>
          <input
            className='input-register'
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <span className='error-register'>{errors.email}</span>

          <label className='label-register' htmlFor="password">Password:</label>
          <input
            className='input-register'
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <span className='error-register'>{errors.password}</span>

          <label className='label-register' htmlFor="firstName">First Name:</label>
          <input
            className='input-register'
            id="firstName"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
          <span className='error-register'>{errors.firstName}</span>

          <label className='label-register' htmlFor="lastName">Last Name:</label>
          <input
            className='input-register'
            id="lastName"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
          <span className='error-register'>{errors.lastName}</span>

          <button 
            className='submit-button-register'
            type="submit" 
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
          {error && <p className='error-message-register' style={{ color: "red" }}>{error}</p>}
        </form>
        <p className='login-redirect-register'>
          <span className='alrHaveAcc'>Already have an account? </span><span className='login-link-register' onClick={() => navigate("/login")}>Sign In</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
