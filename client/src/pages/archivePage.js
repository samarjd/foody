import Post from "../components/post";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CategoryContext } from "../components/categoryContext";
import {UserContext} from "../components/userContext";
import { logUserAction } from '../components/loginAction';

export default function ArchivePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const {allCategories} = useContext(CategoryContext);
  const {userInfo} = useContext(UserContext);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:4000/archive', {
          method: 'GET',
          credentials: 'include',
        });
  
        if (response.status === 404) {
          setPosts([]);
        } else if (!response.ok) {
          throw new Error('Failed to fetch posts');
        } else {
          const posts = await response.json();
          setPosts(posts);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error.message);
        setLoading(false);
      }
    };
    fetchPosts();
    logUserAction('visited the archive page.');
  }, []);

  if(userInfo.userRole === "Suspended"){
    return (
      <section className="main-posts">
        <h1 className='titles'>Archive</h1>
        <div className="empty">
          <h1>Suspended user!</h1>
          <h3>Your access to this page is restricted due to account suspension.</h3>
        </div>
      </section>
    );
  }
  
  return (
    <section className="main-posts">
      <h1 className='titles'>Archive ({posts.length})</h1>
      {loading ? (
        <div className="loading">
          <div className="empty">
              <h1>Loading Content...</h1>
              <h3>Please wait!</h3>
          </div>
        </div>
      ) : posts.length > 0 ? (
        posts.map(post => (
          <Link to={`/post/${post._id}`} key={post._id}>
            <div className="item">
              <Post key={post._id} {...post} allCategories={allCategories} />
            </div>
          </Link>
        ))
      ) : (
        <div className="empty">
          <h1>No archived posts</h1>
          <h3>Explore the home page or check back later.</h3>
        </div>
      )}
    </section>
  );
}