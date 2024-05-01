import Post from "../components/post";
import { useEffect, useState, useContext } from "react";
import VideoSection from "../components/video";
import CategoriesSection from "../components/categories";
import Quote from "../components/quote";
import { Link, useParams } from "react-router-dom";
import { logUserAction } from '../components/loginAction';

export default function SearchPost() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const {id} = useParams();

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:4000/search/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        logUserAction('performed a search for a post: '+ id);
        return response.json();
      })
      .then(posts => {
        setPosts(posts);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
        setLoading(false);
      });
  }, [id]); 

  return (
    <>
      <VideoSection />
      <section className="main-section">
        <CategoriesSection postCount={posts.length} />
        <div className="main-posts">
          {loading ? (
            <div className="loading">
              <div className="empty">
                  <h1>Loading Content...</h1>
                  <h3>Please wait!</h3>
              </div>
            </div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <Link to={`/post/${post._id}`} key={post._id} >
                <div className="item">
                  <Post key={post._id} {...post} />
                </div>
              </Link>
            ))
          ) : (
            <div className="empty">
              <h1>No posts with the term "{id}"</h1>
              <h3>Search other terms in this blog or check back later.</h3>
            </div>
          )}
        </div>
      </section>
      <Quote />
    </>
  );
}