import React, { useState, useEffect, useContext, useRef } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import {UserContext} from "../components/userContext";
import { logUserAction } from '../components/loginAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Chef from '../assets/images/chef.png';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState({ column: "createdAt", order: "desc" });
  const [editUser, setEditUser] = useState({ id: null, username: "", userRole: "" });
  const {userInfo} = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  const inputRef = useRef(null);
  
  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [editUser.id]);

  useEffect(() => {
    const fetchUserList = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:4000/manageUsers");
        const userData = await response.json();
        setUsers(userData);
        setLoading(false);
        logUserAction('viewed the users management page');
      } catch (error) {
        setLoading(false);
        console.error("Error fetching users:", error);
      }
    };
    fetchUserList();
  }, []);

  const handleDelete = async (userId) => {
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
      const response = await fetch(`http://localhost:4000/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        logUserAction('deleted a user');
      } else {
        console.error("Error deleting user:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSort = (column) => {
    setSortBy((prevSortBy) => ({
      column,
      order: prevSortBy.column === column && prevSortBy.order === "asc" ? "desc" : "asc",
    }));
  };

  const sortedUsers = [...users].sort((a, b) => {
    const order = sortBy.order === "asc" ? 1 : -1;
    const columnA = String(a[sortBy.column]);
    const columnB = String(b[sortBy.column]);
  
    if (columnA === columnB) {
      return 0;
    }
    return columnA.localeCompare(columnB) * order;
  });

  const handleEditClick = (userId, userRole) => {
    setEditUser({ id: userId, userRole });
  };

  const handleEditClickPreventPropagation = (e) => {
    e.stopPropagation();
  };

  const handleUserRoleChange = async (e) => {
    const newUserRole = e.target.value;
    setEditUser({ ...editUser, userRole: newUserRole });
    await handleEditSubmit(newUserRole);
  };

 
  const handleEditSubmit = async (newUserRole) => {
    try {
      const response = await fetch(`http://localhost:4000/users/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userRole: newUserRole }),
        credentials: "include",
      });
  
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
          user._id === editUser.id ? { ...user, userRole: newUserRole } : user
          )
        );
        setEditUser({ id: null, userRole: "" });
        logUserAction('edited a user');
      } else {
        console.error("Error updating user:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDocumentClick = (e) => {
    if (editUser.id && inputRef.current && !inputRef.current.contains(e.target)) {
      setEditUser({ id: null, userRole: "" });
    }
  };


  const renderRoleSelect = () => (
    <select value={editUser.userRole} ref={inputRef} onChange={handleUserRoleChange} onClick={handleEditClickPreventPropagation}>
        <option value="Admin">Admin</option>
        <option value="User">User</option>
        <option value="Suspended">Suspended</option>
    </select>
  );

  if(userInfo.userRole !== "Admin"){
    return (
      <section className="main-posts">
        <h1 className='titles'>Archive</h1>
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
      <h2 className="titles">Users ({sortedUsers.length})</h2>
      <table className="table">
        <thead>
        <tr>
          <th></th>
          <th onClick={() => handleSort("username")}>
            <a>
              Username
              {sortBy.column === "username" && (
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
          <th onClick={() => handleSort("userRole")}>
            <a>
              Role
              {sortBy.column === "userRole" && (
                <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
              )}
            </a>
          </th>
          <th onClick={() => handleSort("createdAt")}>
            <a>
              Created At
              {sortBy.column === "createdAt" && (
                <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
              )}
            </a>
          </th>
          <th onClick={() => handleSort("updatedAt")}>
            <a>
              Last Online
              {sortBy.column === "updatedAt" && (
                <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
              )}
            </a>
          </th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user._id}>
              <td>
                <div className="info">
                  <img className="author-image" src={user.cover ? `http://localhost:4000/${user.cover}` : Chef} alt="author Cover" />
                </div>
              </td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{editUser.id === user._id ? renderRoleSelect() : user.userRole}</td>
              <td><time>{user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : 'N/A'}</time></td>
              <td><time>{user.lastOnline ? format(new Date(user.lastOnline), "MMM dd, yyyy HH:ii") : 'N/A'}</time></td>
              <td>
                <div className="edit-row">
                  <a
                    className="edit-btn"
                    onClick={(e) => {
                      handleEditClick(user._id, user.userRole);
                      e.stopPropagation();
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </a>
                  <a className="delete-btn" onClick={() => handleDelete(user._id)}>
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

export default UserPage;
