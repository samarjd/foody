import { useContext, useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import { logUserAction } from '../components/loginAction';

export default function VerifyTokenPage() {
  const { id } = useParams();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [id]);

  async function verifyToken() {
    const response = await fetch(`http://localhost:4000/verify-token/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  
    if (response.ok) {
      logUserAction('token verified.');
      await Swal.fire({
        title: `Your token has been verified successfully! 🎉`,
        text: "You can now loggin in.",
        icon: 'success',
        showConfirmButton: false,
        timer: "2000",
      });
      setRedirect("/login");
  
    } else {
      const errorResponse = await response.json();
      if (errorResponse.error === 'Token expired') {
        await Swal.fire({
          title: 'Token Expired',
          text: 'Your token has expired. Would you like to reactivate it for another day?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Reactivate Token',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            reactivateToken();
          }
        });
      } else {
        await Swal.fire({
          title: 'Token Verification Failed',
          text: errorResponse.error,
          icon: 'error',
        });
      }
    }
  }
  
  async function reactivateToken() {
    const response = await fetch(`http://localhost:4000/verify-token/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  
    if (response.ok) {
        const confirmResult = await Swal.fire({
            title: 'Token Reactivated',
            text: 'Your token has been reactivated for another day. Would you like to proceed with verification now?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Yes, Proceed with Verification',
            cancelButtonText: 'Not Now',
        });
    
        if (confirmResult.isConfirmed) {
            verifyToken();
        }
    } else {
      await Swal.fire({
        title: 'Token Reactivation Failed',
        text: 'Could not reactivate your token. Please log in again.',
        icon: 'error',
      });
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }

  return (
    <section className="main-section">
        <div className="loading">
            <div className="empty">
                <h1>Verifying Token...</h1>
                <h3>Please wait while we verify your token.</h3>
            </div>
        </div>
    </section>
  );
}