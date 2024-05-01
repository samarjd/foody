import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { logUserAction } from '../components/loginAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    logUserAction('viewed the contact page.');
  }, []);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setLoading(true);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      await Swal.fire({
        title: 'Required Fields',
        text: 'Please fill in all required fields.',
        icon: 'warning',
      });
      setLoading(false);
      return;
    }

    const confirmation = await Swal.fire({
      title: 'Confirm Message',
      text: 'Are you sure you want to send this message?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Send',
      cancelButtonText: 'Cancel',
    });
  
    if (confirmation.isConfirmed) {
      const response = await fetch('http://localhost:4000/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, message, subject }),
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.status === 201) {
        await Swal.fire({
          title: 'Message Sent',
          text: 'Your message has been sent successfully.',
          icon: 'success',
        });
        setName('');
        setEmail('');
        setMessage('');
        setSubject('');
        logUserAction('sent a contact email.');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'An error occurred while sending the message. Please try again.';

        await Swal.fire({
          title: 'Message Not Sent',
          text: errorMessage,
          icon: 'error',
        });
      }
    }
    setLoading(false);
  }  

  return (
    <section className="contact-page">
        <div className="contact-info">
            <h1>Contact Us</h1>
            <h3>Thanks for your interest in Foody.</h3>
            <p>Feel free to contact us with any questions or concerns you may have. We are here to help and will get back to you as soon as possible.</p>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Your Name"
                value={name}
                required
                onChange={(ev) => setName(ev.target.value)}
            />
            <input
                type="email"
                placeholder="Your Email"
                value={email}
                required
                onChange={(ev) => setEmail(ev.target.value)}
                autoComplete="email"
            />
            <input
                type="text"
                placeholder="Your Subject"
                value={subject}
                required
                onChange={(ev) => setSubject(ev.target.value)}
            />
            <textarea
                placeholder="Your Message"
                value={message}
                required
                onChange={(ev) => setMessage(ev.target.value)}
            ></textarea>
            <button disabled={loading}>
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Send Message'}
            </button>
        </form>
    </section>
  );
}