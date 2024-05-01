import Post from "../components/post";
import { useEffect, useState, useContext } from "react";
import VideoSection from "../components/video";
import Partner from "../components/partner";
import CategoriesSection from "../components/categories";
import Quote from "../components/quote";
import { Link } from "react-router-dom";
import { CategoryContext } from "../components/categoryContext";
import { logUserAction } from '../components/loginAction';

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const {allCategories} = useContext(CategoryContext);

  useEffect(() => {
    logUserAction('visited the home page.');
  }, []);

  useEffect(() => {
    fetch('http://localhost:4000/post')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
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
  }, []);

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
              <Link to={{ pathname: `/post/${post._id}`, state: { allCategories } }}
              key={post._id}>
                <div className="item">
                  <Post key={post._id} {...post} allCategories={allCategories} />
                </div>
              </Link>
            ))
          ) : (
            <div className="empty">
              <h1>Posts Coming Soon</h1>
              <h3>Explore other categories in this blog or check back later.</h3>
            </div>
          )}
        </div>
        <Partner />
      </section>
      <Quote />
    </>
  );
}
