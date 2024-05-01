import Post from "../components/post";
import { useEffect, useState, useContext } from "react";
import VideoSection from "../components/video";
import CategoriesSection from "../components/categories";
import Quote from "../components/quote";
import { Link, useParams } from "react-router-dom";
import { logUserAction } from '../components/loginAction';

export default function PostCategoyPage() {
  const [posts, setPosts] = useState([]);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    setLoading(true);
    const element = document.querySelector(".main-section");
    if (element) {
      const scrollPosition = element.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth"
      });
    } else {
      console.error("Element with class .main-section not found");
    }

    fetch(`http://localhost:4000/postcategory/${id.toString()}`)
      .then((response) => response.json())
      .then((posts) => {
        setPosts(posts);
        setLoading(false);
        logUserAction('viewed posts under the category: ' + id);
      })
      .catch((error) => {
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
          ) : posts?.length > 0 ? (
            posts.map((post) => (
              <Link key={post._id} to={`/post/${post._id}`}>
                <div className="item">
                  <Post key={post._id} {...post} />
                </div>
              </Link>
            ))
          ) : (
            <div className="empty">
              <h1>No posts under this category</h1>
              <h3>Explore other categories in this blog or check back later.</h3>
            </div>
          )}
        </div>
      </section>
      <Quote />
    </>
  );
}