import { useEffect, useState, useContext } from "react";
import { format } from "date-fns";
import Chef from "../assets/images/chef.png";
import Crown from "../assets/images/icons/crown.png";
import Picture from "../assets/images/no-pictures.png";
import { CategoryContext } from "./categoryContext";

export default function Post({ _id, title, summary, content, cover, createdAt, author, views, categories }) {
  const [categoryNames, setCategoryNames] = useState([]);
  const {allCategories} = useContext(CategoryContext);

  useEffect(() => {
    const fetchCategoryNames = () => {  
      if (!categories || !allCategories) {
        console.error('Categories or allCategories is undefined or null');
        return;
      }
  
      const resolvedCategoryNames = categories.map((categoryId) => {
        const category = allCategories.find((c) => c._id === categoryId);
        return category ? category.name : '';
      });
      
      setCategoryNames(resolvedCategoryNames);
    };
  
    fetchCategoryNames();
  }, [categories, allCategories]);
  

  const contentText = new DOMParser().parseFromString(content, 'text/html').body.textContent || '';
  const displaySummary = summary || (contentText && contentText.slice(0, 150)) + "...";
  const divStyle = {
    backgroundImage: cover
      ? `url(http://localhost:4000/${encodeURIComponent(cover).replace(/%5C/g, '/')})`
      : `url(${Picture})`,
    width: '100%',
    backgroundPosition: 'center',
  };
  
  
  return (
    <div className="post">
      <div className="views">{views || 0} views</div>
      <div className="image" style={divStyle}>
      </div>
      <div className="texts">
        <div className="info">
          <img className="author-image" src={author?.cover ? `http://localhost:4000/${author?.cover}` : Chef} alt="author Cover" />
          <div className="sub-info">
            <div className="author">
              {author?.username} {author?.userRole === 'Admin' && (<img alt="author" src={Crown} />)}
            </div>
            <time>{format(new Date(createdAt), 'MMM dd, yyyy')}</time>
          </div>
        </div>
        <h2>{title}</h2>
        <p className="summary">{displaySummary}</p>
        <div className="categories">
          {categoryNames.map((category, index) => (
            <span key={index}>#{category}</span>
          ))}
        </div>
      </div>
    </div>
  );
}