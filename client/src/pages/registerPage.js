import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { logUserAction } from '../components/loginAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State to track loading state

  useEffect(() => {
    logUserAction('viewed the registeration page.');
  }, []); 

  async function register(ev) {
    ev.preventDefault();
    setLoading(true);

    const confirmation = await Swal.fire({
      title: 'Confirm Registration',
      text: 'Are you sure you want to register?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Register',
      cancelButtonText: 'Cancel',
    });
  
    if (confirmation.isConfirmed) {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, email, dob, firstname, lastname }),
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({
          title: 'Registration Successful',
          text: 'You have been successfully registered.',
          icon: 'success',
        });
        setUsername('');
        setPassword('');
        setFirstname('');
        setLastname('');
        setEmail('');
        setDob('');
        logUserAction('successfully registered an account.');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'An error occurred during registration. Please try again.';

        await Swal.fire({
          title: 'Registration Failed',
          text: errorMessage,
          icon: 'error',
        });
      }
    }
    setLoading(false);
  }  

  return (
    <section className="main-section register-bg">
      <form className="register" onSubmit={register}>
        <h1>Register</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          required
          onChange={(ev) => setUsername(ev.target.value)}
        />
        <div className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            required
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>
        <br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(ev) => setEmail(ev.target.value)}
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={dob}
          required
          onChange={(ev) => setDob(ev.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="First Name"
          value={firstname}
          required
          onChange={(ev) => setFirstname(ev.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastname}
          required
          onChange={(ev) => setLastname(ev.target.value)}
        />
        <button disabled={loading}>
          {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Register'}
        </button>
      </form>
    </section>
  );
}
