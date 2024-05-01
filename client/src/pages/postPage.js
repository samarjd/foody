import { useContext, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import Swal from 'sweetalert2';
import { UserContext } from "../components/userContext";
import { CategoryContext } from "../components/categoryContext";
import CategoriesSection from "../components/categories";
import Chef from "../assets/images/chef.png";
import Crown from "../assets/images/icons/crown.png"
import { logUserAction } from '../components/loginAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import CommentComp from '../components/comment'; 

export default function PostPage() {
  const { id } = useParams();
  const [postInfo, setPostInfo] = useState(null);
  const { userInfo } = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);
  const [categoryNames, setCategoryNames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { allCategories } = useContext(CategoryContext);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentarea, setCommentarea] = useState('');

  useEffect(() => {
    setLoading(false);
    const fetchPostInfo = async () => {
      try {
        const response = await fetch(`http://localhost:4000/post/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        const { postDoc, views, comments } = await response.json();
        setPostInfo(postDoc);
        setViews(views || 0);
        setComments(comments || []); // Set comments state
        setLoading(false);
        logUserAction('viewed a post.');
        const element = document.getElementById("mmain-section");
        if (element) {
          const scrollPosition = element.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth"
          });
        }
      } catch (error) {
        console.error('Error fetching post information:', error);
        setLoading(false);
      }
    };

    fetchPostInfo();
  }, [id]);

  useEffect(() => {
    if (postInfo) {
      setCategories(postInfo.categories);
    }
  }, [postInfo]);

  useEffect(() => {
    if (allCategories && allCategories.length > 0 && categories) {
      fetchCategoryNames();
    }
  }, [allCategories, categories]);

  async function fetchCategoryNames() {
    try {
      if (!allCategories || allCategories.length === 0 || !categories) {
        return;
      }

      const resolvedCategoryNames = categories.map((categoryId) => {
        const category = allCategories.find((c) => c._id === categoryId);
        return category ? category.name : '';
      });

      setCategoryNames(resolvedCategoryNames);
    } catch (error) {
      console.error('Error fetching category names:', error);
    }
  }

  async function handleDelete(ev) {
    ev.preventDefault();
    const { value: confirmed } = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      focusCancel: true,
    });

    if (!confirmed) {
      return;
    }

    const data = new FormData();
    data.set('id', id);
    const response = await fetch(`http://localhost:4000/post/${id}`, {
      method: 'DELETE',
      body: data,
      credentials: 'include',
    });

    if (response.ok) {
      logUserAction('deleted a post');
      setRedirect(true);
    }
  }

  const handlePublishClick = async () => {
    try {
      const response = await fetch('http://localhost:4000/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentarea, postId: id}),
        credentials: 'include',
      });

      if (response.ok) {
        try {
          const responseData = await response.json();
          if (responseData) {
            setComments(responseData);
            setCommentarea('');
          } else {
            console.error('Failed to add comment: Invalid response data');
          }
        } catch (error) {
          console.error('Failed to add comment:', error);
        }
      } else {
        console.error('Failed to publish comment:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  if (redirect) {
    return <Navigate to={'/'} />
  }

  if (loading) {
    return (
      <section id="main-section" className="main-section">
        <CategoriesSection postCount={1} />
        <div className="loading">
          <div className="empty">
            <h1>Loading Content...</h1>
            <h3>Please wait!</h3>
          </div>
        </div>
      </section>
    );
  } else if (!postInfo) {
    return (
      <section id="main-section" className="main-section">
        <CategoriesSection postCount={1} />
        <div className="loading">
          <div className="empty">
            <h1>No post found</h1>
            <h3>Check later or contact the admins</h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="main-section" className="main-section">
      <CategoriesSection />
      <div className="post-page">
        <div className="post-header">
          <div className="info">
            <img className="author-image" src={postInfo.author.cover ? `http://localhost:4000/${postInfo.author.cover}` : Chef} alt="author Cover" />
            <div className="sub-info">
              <a className="author">{postInfo.author.username} {postInfo.author.userRole === 'Admin' && (<img src={Crown} />)} .
                <time>{format(new Date(postInfo.createdAt), 'MMM dd, yyyy')}</time>
              </a>
            </div>
            {((userInfo?.id === postInfo.author._id && userInfo?.userRole !== "Suspended") || userInfo?.userRole === "Admin") && (
              <strong className="text-lowercase f-m-br">. {views} views</strong>
            )}
          </div>
          {((userInfo?.id === postInfo.author._id && userInfo?.userRole !== "Suspended") || userInfo?.userRole === "Admin") ? (
            <div className="edit-row">
              <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
                <FontAwesomeIcon icon={faEdit} />
              </Link>
              <a className="delete-btn" onClick={handleDelete}>
                <FontAwesomeIcon icon={faTrash} />
              </a>
            </div>
          ) : (
            <strong className="text-lowercase f-m-br">{views} views</strong>
          )}
        </div>
        <h1>{postInfo.title}</h1>
        {postInfo.createdAt !== postInfo.updatedAt && (
          <time>Updated at: {format(new Date(postInfo.updatedAt), 'MMM dd, yyyy')}</time>
        )}
        <div className="image">
          <img src={`http://localhost:4000/${postInfo.cover}`} alt="" />
        </div>
        <div className="content" dangerouslySetInnerHTML={{ __html: postInfo.content }} />
        <div className="categories">
          {categoryNames.map((category, index) => (
            <Link to={`/postcategory/${categories[index]}`} key={index}>
              <span>#{category}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="comments">
        <h2>Comments</h2>
        {!userInfo?.id ? (
          <div className="comment-form">
            <textarea placeholder="Login to comment..." disabled />
          </div>
        ) : userInfo?.userRole === 'Suspended' ? (
          <div className="comment-form">
            <textarea placeholder="Unauthorized action" disabled />
          </div>
        ) : (
          <div className="comment-form">
            <textarea placeholder="Write a comment..." value={commentarea} onChange={ev => setCommentarea(ev.target.value)} spellCheck={false} />
            <div className="edit-row">
              <a className="cancel-btn" onClick={ev => setCommentarea("")}>Cancel</a>
              <a className={`edit-btn ${commentarea.trim() === '' ? 'disabled' : ''}`} 
                onClick={handlePublishClick} 
                disabled={commentarea.trim() === ''}>
                Publish
              </a>
            </div>
          </div>
        )}

        <CommentComp comments={comments} userInfo={userInfo} />
      </div>
    </section>
  );
}