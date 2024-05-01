import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faFlag } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisVertical, faChevronDown} from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp as solidThumbsUp, faThumbsDown as solidThumbsDown, faFlag as solidFlag } from '@fortawesome/free-solid-svg-icons';
import Chef from '../assets/images/chef.png';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import Crown from "../assets/images/icons/crown.png";

const CommentComp = ({ comments, userInfo }) => {
    const [sortBy, setSortBy] = useState('newest');
    const [sortedComments, setSortedComments] = useState(comments);

    const sortComments = (sortBy) => {
        if (sortBy === 'newest') {
            setSortedComments([...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } else {
            setSortedComments([...comments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        }
    };
    
    useEffect(() => {
        sortComments(sortBy);
    }, [sortBy, comments]);

    const handleActions = async (commentId, action) => {
        if (!userInfo || !userInfo?.id) {
            Swal.fire({
                icon: 'error',
                title: 'Login Required',
                text: 'You need to login first to perform this action.',
                showConfirmButton: true,
            });
            return;
        }
        try {
          const response = await fetch(`http://localhost:4000/comment`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, commentId }),
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json(); 
            const updatedComments = sortedComments.map((comment) => {
                if (comment._id === commentId) {
                    return data.comment;
                }
                return comment;
            });
            setSortedComments(updatedComments);
          } else {
            console.error(`Error ${action}ing a comment:`, response);
          }
        } catch (error) {
          console.error(`Error ${action}ing a comment:`, error);
        }
    }; 
    
    const deleteComment = async (commentId) => {
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
        try {
          const response = await fetch(`http://localhost:4000/comment/${commentId}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (response.ok) {
            const updatedComments = sortedComments.filter((comment) => comment._id !== commentId);
            setSortedComments(updatedComments);
          } else {
            Swal.fire({
                title: 'Error',
                text: 'Unable to delete this comment right now!',
                icon: 'error',
            });
            console.error(`Error deleting a comment:`, response);
          }
        } catch (error) {
          console.error(`Error deleting a comment:`, error);
        }
    }; 

  return (
    <div className="comment-list">
      <label>
        Sort by:
        <div className={`dropdown`}>
          <a className=" a-category dropbtn">
            <span>{sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span> <FontAwesomeIcon icon={faChevronDown} />
          </a>
          <div className="dropdown-content">
            <a onClick={() => setSortBy('newest')}><div className="a-category">Newest</div></a>
            <a onClick={() => setSortBy('oldest')}><div className="a-category">Oldest</div></a>
          </div>
        </div>
      </label>
      {sortedComments.length === 0 ? (
        <div className='text-center'>
          <p>Be the 1st to comment!</p>
        </div>
      ) : (
      sortedComments.map((comment) => (
        <div key={comment._id} className="comment">
            <div className="row justify-between align-center">
            <div className="info">
                <img className="author-image" src={comment?.userId?.cover ? `http://localhost:4000/${comment.userId.cover}` : Chef} alt="author Cover" />
                <div className="sub-info">
                <a className="author">{comment.userId?.username} {comment.userId?.userRole === 'Admin' && (<img src={Crown} />)}</a>
                <time>{format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm:ss', { timeZone: 'UTC' })}</time>
                </div>
            </div>
            <div className="comment-control">
            {userInfo && (userInfo?.id === comment.userId?._id || userInfo?.userRole === 'Admin') && (
                <div className={`dropdown`}>
                    <a className=" a-category dropbtn">
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </a>
                    <div className="dropdown-content">
                        <a onClick={() => deleteComment(comment._id)}><div className="a-category">Delete</div></a>
                    </div>
                </div>
            )}
            </div>
            </div>
            <div className="comment-content">
                <p>{comment.content}</p>
                <div className="actions">
                <a onClick={userInfo && (() => handleActions(comment._id, "like"))}>
                    {comment.likedBy.includes(userInfo?.id) ? (
                        <FontAwesomeIcon icon={solidThumbsUp} style={{ color: '#2778c4' }} />
                    ) : (
                        <FontAwesomeIcon icon={faThumbsUp} />
                    )}
                    {comment.likes || 0}
                    </a>

                    <a onClick={userInfo && (() => handleActions(comment._id, "dislike"))}>
                    {comment.dislikedBy.includes(userInfo?.id) ? (
                        <FontAwesomeIcon icon={solidThumbsDown} style={{ color: '#2778c4' }} />
                    ) : (
                        <FontAwesomeIcon icon={faThumbsDown} />
                    )}
                    {comment.dislikes || 0}
                    </a>

                    <a onClick={userInfo && (() => handleActions(comment._id, "flag"))}>
                    {comment.flaggedBy.includes(userInfo?.id) ? (
                        <FontAwesomeIcon icon={solidFlag} style={{ color: 'red' }} />
                    ) : (
                        <FontAwesomeIcon icon={faFlag} />
                    )}
                    {comment.flags || 0}
                    </a>
                </div>      
            </div>
                 
        </div>
        ))
      )}
    </div>
  );
};

export default CommentComp;