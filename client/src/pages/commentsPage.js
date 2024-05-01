import React, { useState, useEffect, useContext } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { UserContext } from "../components/userContext";
import { logUserAction } from "../components/loginAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import Chef from '../assets/images/chef.png';
import { Link } from 'react-router-dom';

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(UserContext);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:4000/comment", {
            method: "GET",
            credentials: "include",
        });
        const commentData = await response.json();
        setComments(commentData);
        setLoading(false);
        logUserAction("viewed the comments management page");
      } catch (error) {
        setLoading(false);
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, []);

  const handleDelete = async (commentId) => {
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
      const response = await fetch(`http://localhost:4000/comment/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
        logUserAction("deleted a comment");
      } else {
        console.error("Error deleting comment:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleUnflag = async (commentId) => {
    const { value: confirmed } = await Swal.fire({
        title: "Are you sure?",
        text: "This comment will be unflagged!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, unflag it!",
        focusCancel: true,
        });
    
    if (!confirmed) {
        return;
    }

    try {
      const response = await fetch(`http://localhost:4000/commentsManage/${commentId}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
        credentials: "include",
      });

      if (response.ok) {
        setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
        logUserAction("unflagged a comment");
      } else {
        console.error("Error unflagging comment:", response.statusText);
      }
    } catch (error) {
      console.error("Error unflagging comment:", error);
    }
  };

  const handleSuspendUser = async (userId) => {
    const { value: confirmed } = await Swal.fire({
        title: "Are you sure?",
        text: "This user will be suspended!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, suspend user!",
        focusCancel: true,
        });
    
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:4000/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userRole: "Suspended" }),
          credentials: "include",
        });
    
        if (response.ok) {
            await Swal.fire({
                title: 'Success',
                text: 'User has been suspended!',
                icon: 'success',
            });
            logUserAction('edited a user role');
        } else {
            await Swal.fire({
                title: 'Error',
                text: 'User could not be suspended!',
                icon: 'error',
            });
            console.error("Error updating user:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating user:", error);
      }
  };

  if (userInfo.userRole !== "Admin") {
    return (
      <section className="main-posts">
        <h1 className="titles">Comments</h1>
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
      <h2 className="titles">Flagged Comments ({comments.length})</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Commnter</th>
            <th>Post</th>
            <th>Content</th>
            <th>Date</th>
            <th>Flagged by</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment._id}>
              <td>
                <div className="info">
                  <img className="author-image" src={comment.userId.cover ? `http://localhost:4000/${comment.userId.cover}` : Chef} alt="author Cover" />
                  {comment.userId.username}
                </div>
              </td>
              <td>{comment.postId.title}</td>
              <td>{comment.content}</td>
              <td>{format(new Date(comment.createdAt), "MMM dd, yyyy")}</td>
              <td>
                <div className="comment-flags">
                  {comment.flaggedBy.map((flaggedUser) => (
                    <div className="info userInfo">
                      <img className="author-image" src={flaggedUser.cover ? `http://localhost:4000/${flaggedUser.cover}` : Chef} alt="author Cover" />
                      <span>{flaggedUser.username}</span>
                    </div>
                  ))}
                </div>
              </td>
              <td>
                <div className="dropdown">
                    <a className="dropbtn">
                        <span className="d-flex align-center" tabIndex="0">
                        <span className="user-name">Action</span>
                            <FontAwesomeIcon icon={faChevronDown} />                
                        </span>
                    </a>
                    <div className="dropdown-content">
                        <div className="a-category">
                            <a onClick={() => handleUnflag(comment._id)}>Unflag comment</a>
                        </div>
                        <div className="a-category">
                            <a onClick={() => handleDelete(comment._id)}>Delete comment</a>
                        </div>
                        <div className="a-category">
                            <Link to={`/post/${comment.postId._id}`}>Check post</Link>
                        </div>
                        <div className="a-category">
                            <a onClick={() => handleSuspendUser(comment.userId._id)}>Suspend user</a>    
                        </div>     
                    </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommentsPage;