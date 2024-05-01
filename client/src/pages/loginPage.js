import {useContext, useState, useEffect} from "react";
import {Navigate} from "react-router-dom";
import {UserContext} from "../components/userContext";
import Swal from 'sweetalert2';
import { logUserAction } from '../components/loginAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function LoginPage() {
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [redirect,setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const {setUserInfo} = useContext(UserContext);

  useEffect(() => {
    logUserAction('viewed the login page.');
  }, []); 

  async function login(ev) {
    ev.preventDefault();
    setLoading(true);

    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const userInfo = await response.json();
      logUserAction('logged in.');
      await Swal.fire({
        title: `Welcome ${userInfo.username}! 🎉`,
        text: "We're thrilled to have you here. Hope your stay is fabulous!",
        icon: 'success',
        showConfirmButton: false,
        timer: "2000",
      });

      setUserInfo(userInfo);
      setRedirect(true);
    } else {
      const errorResponse = await response.json();
      await Swal.fire({
        title: 'Login Failed',
        text: errorResponse.error,
        icon: 'error',
      });
    }
    setLoading(false);
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }
  return (
    <section className="main-section login-bg">
      <form className="login" onSubmit={login}>
        <h1>Login</h1>
        <input type="text"
              placeholder="username"
              value={username}
              onChange={ev => setUsername(ev.target.value)}/>
        <input type="password"
              placeholder="password"
              value={password}
              onChange={ev => setPassword(ev.target.value)}/>
        <button disabled={loading}>
          {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Login'}
        </button>
      </form>
    </section>
  );
}