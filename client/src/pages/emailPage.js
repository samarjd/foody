import React, { useState, useEffect, useContext } from "react";
import { format } from "date-fns";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faEye } from '@fortawesome/free-solid-svg-icons';
import {UserContext} from "../components/userContext";
import { logUserAction } from '../components/loginAction';

const EmailPage = () => {
  const [mails, setMails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const {userInfo} = useContext(UserContext); 
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState({ column: "createdAt", order: "asc" }); 

  useEffect(() => {
    const handleDocumentClick = (event) => {
      const isButtonClicked = event.target.classList.contains('full-mail-trigger');
      if (!event.target.closest(".full-email") && selectedEmail !== null && !isButtonClicked) {
        setSelectedEmail(null);
      }
    };    

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [selectedEmail]);

  useEffect(() => {
    const fetchmails = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:4000/emails");
        const mailData = await response.json();
        setMails(mailData);
        setLoading(false);
        logUserAction('viewed the emails management page');
      } catch (error) {
        setLoading(false);
        console.error("Error fetching mails:", error);
      }
    };
    fetchmails();
  }, []);

  const handleSeeFullEmail = (mail) => {
    setSelectedEmail(mail);
  };

  const handleFilter = (type) => {
    setFilterType(type ? type.toLowerCase() : null);
  };

  const handleSort = (column) => {
    const newOrder = sortBy.column === column && sortBy.order === "asc" ? "desc" : "asc";
    const sortedMails = [...mails].sort((a, b) => {
      if (column === "date") {
        return (new Date(a.createdAt) - new Date(b.createdAt)) * (newOrder === "asc" ? 1 : -1);
      } else {
        return a[column].localeCompare(b[column]) * (newOrder === "asc" ? 1 : -1);
      }
    });
    setMails(sortedMails);
    setSortBy({ column, order: newOrder });
  };

  if(userInfo.userRole !== "Admin"){
    return (
      <section className="main-posts">
        <h1 className='titles'>Blog Emails</h1>
        <div className="empty">
          <h1>Restricted Access!</h1>
          <h3>Your access to this page is restricted.</h3>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="main-section">
        <div className="loading">
          <div className="empty">
            <h1>Loading Content...</h1>
            <h3>Please wait!</h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="post-page">
      <h2 className="titles">Blog Emails ({mails.filter(mail => !filterType || mail.type.toLowerCase() === filterType.toLowerCase()).length})</h2>
      <div className="filter-buttons">
      <a className={filterType === null ? "active" : ""} onClick={() => handleFilter(null)}>All</a>
      <a className={filterType && filterType.toLowerCase() === 'contact' ? "active" : ""} onClick={() => handleFilter('Contact')}>Contact</a>
      <a className={filterType && filterType.toLowerCase() === 'registration' ? "active" : ""} onClick={() => handleFilter('Registration')}>Registration</a>

      </div>
      <table className="table">
        <thead>
        <tr>
          <th onClick={() => handleSort("name")}>
            <a>
              Name
              {sortBy.column === "name" && (
                <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
              )}
            </a>
          </th>
          <th onClick={() => handleSort("email")}>
            <a>
              Email
              {sortBy.column === "email" && (
                <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
              )}
            </a>
          </th>
          <th onClick={() => handleSort("subject")}>
            <a>
              Subject
              {sortBy.column === "subject" && (
                <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
              )}
            </a>
          </th>
          <th onClick={() => handleSort("date")}>
            <a>
              Date
              {sortBy.column === "date" && (
                <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
              )}
            </a>
          </th>
          <th>Actions</th>
        </tr>

        </thead>
        <tbody>
          {mails
            .filter(mail => !filterType || mail.type.toLowerCase() === filterType.toLowerCase())
            .map((mail) => (
              <tr key={mail._id}>
                <td>{mail.name}</td>
                <td>{mail.email}</td>
                <td>{mail.subject}</td>
                <td>{format(new Date(mail.createdAt), "MMM dd, yyyy")}</td>
                <td>
                  <button className="full-mail-trigger" onClick={() => handleSeeFullEmail(mail)}>
                    <FontAwesomeIcon icon={faEye} onClick={() => handleSeeFullEmail(mail)} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>

      </table>
      <div className={`full-email ${selectedEmail ? 'open' : ''}`}>
        {selectedEmail && (
          <>
            <div className="row align-center justify-between header">
              <h3>Full Email</h3>
              <a className="nabvarControl" onClick={() => setSelectedEmail(null)}><FontAwesomeIcon icon={faClose} /></a>
            </div>
            <div className="content">
              <div><strong>Name:</strong> <p>{selectedEmail.name}</p></div>
              <div><strong>Email:</strong> <p>{selectedEmail.email}</p></div>
              <div><strong>Subject:</strong> <p>{selectedEmail.subject}</p></div>
              <div><strong>Date:</strong> <p>{format(new Date(selectedEmail.createdAt), "MMM dd, yyyy H:ii:ss")}</p></div>
              <div><strong>Message:</strong> <p>{selectedEmail.message}</p></div>
            </div>
            <p className="text-center">©{new Date().getFullYear()} all rights reserved by <strong>Foody</strong></p>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailPage;