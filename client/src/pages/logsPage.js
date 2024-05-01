import React, { useState, useEffect, useContext } from "react";
import { format } from "date-fns";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {UserContext} from "../components/userContext";
import { logUserAction } from '../components/loginAction';
import Swal from "sweetalert2";
import Chef from '../assets/images/chef.png';

const LogPage = () => {
  const [logs, setLogs] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const {userInfo} = useContext(UserContext); 
  const [sortBy, setSortBy] = useState({ column: "createdAt", order: "dec" }); 

  useEffect(() => {
    fetchLogs();
    logUserAction('viewed the logs management page');
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/logs?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`);
      const logData = await response.json();
      setLogs(logData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching logs:", error);
    }
  };

  const handleDeleteLog = async (logId) => {
    const { value: confirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      focusCancel: true,
    });
  
    if (!confirmed) {
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:4000/logs/${logId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (response.ok) {
        setLogs((prevLogs) => prevLogs.filter((log) => log._id !== logId));
      } else {
        console.error("Error deleting log:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };  

  const handleSort = (column) => {
    const newOrder = sortBy.column === column && sortBy.order === "asc" ? "desc" : "asc";
  
    const sortedLogs = [...logs].sort((a, b) => {
      if (column === "createdAt") {
        return (new Date(a.createdAt) - new Date(b.createdAt)) * (newOrder === "asc" ? 1 : -1);
      } else if (column === "username") {
        const usernameA = a.userId ? a.userId.username : 'Non-Logged-In User';
        const usernameB = b.userId ? b.userId.username : 'Non-Logged-In User';
        return usernameA.localeCompare(usernameB) * (newOrder === "asc" ? 1 : -1);
      } else {
        return a[column].localeCompare(b[column]) * (newOrder === "asc" ? 1 : -1);
      }
    });
  
    setLogs(sortedLogs);
    setSortBy({ column, order: newOrder });
  };
  

  if(userInfo.userRole !== "Admin"){
    return (
      <section className="main-posts">
        <h1 className='titles'>Logs</h1>
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
      <h2 className="titles">Logs ({logs.length})</h2>
      <div className="date-range-input">
        <div className="row align-center">
          <label>Start Date:</label>
          <input type="date" value={format(startDate, 'yyyy-MM-dd')} onChange={(e) => setStartDate(new Date(e.target.value))} />
          <label>End Date:</label>
          <input type="date" value={format(endDate, 'yyyy-MM-dd')} onChange={(e) => setEndDate(new Date(e.target.value))} />
        </div>
        <div className="submit-div">
          <a className="submit" onClick={fetchLogs}>Submit</a>
        </div>
      </div>
      <table className="table">
        <thead>
        <tr>
            <th></th>
            <th onClick={() => handleSort("username")}>
              <a>
                User
                {sortBy.column === "username" && (
                  <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
                )}
              </a>
            </th>
            <th onClick={() => handleSort("action")}>
              <a>
                Action
                {sortBy.column === "action" && (
                  <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
                )}
              </a>
            </th>
            <th onClick={() => handleSort("ipAddress")}>
              <a>
                IP Address
                {sortBy.column === "ipAddress" && (
                  <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
                )}
              </a>
            </th>
            <th onClick={() => handleSort("createdAt")}>
              <a>
                Date
                {sortBy.column === "createdAt" && (
                  <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
                )}
              </a>
            </th>
            <th>Actions</th>
          </tr>

        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>
                <div className="info">
                  <img className="author-image" src={log.userId?.cover ? `http://localhost:4000/${log.userId?.cover}` : Chef} alt="author Cover" />
                </div>
              </td>
              <td>{log.userId ? log.userId.username : 'Non-Logged-In User'}</td>              
              <td>{log.action}</td>
              <td>{log.ipAddress}</td>
              <td>{format(new Date(log.createdAt), "MMM dd, yyyy H:ii:ss")}</td>
              <td>
                <div className="edit-row">
                  <a className="delete-btn" onClick={() => handleDeleteLog(log._id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogPage;