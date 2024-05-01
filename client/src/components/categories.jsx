import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import SearchIcon from "../assets/images/icons/magnifying-glass.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function CategoriesSection({ postCount }) {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:4000/categories');
        if (response.ok) {
          const categoriesData = await response.json();
          const categoryOptions = categoriesData.map(category => ({ value: category._id, label: category.name }));
          setFilteredOptions(categoryOptions);
        } else {
          console.error('Failed to fetch categories:', response.statusText);
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    };
    fetchCategories();
  
    // Extract search term from the path
    const pathSegments = location.pathname.split('/');
    const searchIndex = pathSegments.indexOf('search');
    if (searchIndex !== -1 && searchIndex + 1 < pathSegments.length) {
      const pathSearchTerm = pathSegments[searchIndex + 1];
      if (pathSearchTerm.trim() !== '') {
        setSearchTerm(pathSearchTerm);
        setSearchVisible(true);
        (async () => {
          try {
            const response = await fetch(`http://localhost:4000/search/${encodeURIComponent(pathSearchTerm)}`);
            if (response.ok) {
              await response.json();
            } else {
              console.error('Failed to fetch search results:', response.statusText);
            }
          } catch (error) {
            console.error('Network error:', error);
          }
        })();
      } else {
        setSearchTerm('');
        setSearchVisible(false);
      }
    } else {
      setSearchTerm('');
      setSearchVisible(false);
    }
  }, [location.pathname]);
  
  
  const visibleCategories = filteredOptions.slice(0, 5);
  const hiddenCategories = filteredOptions.slice(5);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
  };

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter' && searchTerm.trim() !== '') {
      navigate(`/search/${searchTerm.trim()}`);
    }
  };

  return (
    <section className='categories-section'>
      <Link to={`/`}>
      <div className={`a-category ${location.pathname === '/' ? 'active' : ''}`} key="default">
        All Posts {postCount !== undefined && `(${postCount})`}
      </div>
      </Link>
      {visibleCategories.map(category => (
        <Link to={`/postcategory/${category.value}`} key={category.value}>
          <div className={`a-category ${id === category.value ? 'active' : ''}`}>
            {category.label}
          </div>
        </Link>
      ))}
      
      {hiddenCategories.length > 0 && (
        <div className={`dropdown ${isOpen ? 'open' : ''}`}>
          <a className=" a-category dropbtn" onClick={toggleDropdown}>
            <span>More</span> <FontAwesomeIcon icon={faChevronDown} />
          </a>
          <div className="dropdown-content">
            {hiddenCategories.map(category => (
              <Link to={`/postcategory/${category.value}`} key={category.value}>
                <div className={`a-category ${id === category.value ? 'active' : ''}`}>
                  {category.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="search-container">
        <div className={`search-icon ${searchVisible ? 'active' : ''}`} onClick={toggleSearch}>
          <img src={SearchIcon} alt="search" />
        </div>
        <input
          className={`search-input ${searchVisible ? 'active' : ''}`}
          type="text"
          placeholder="Search"
          value={decodeURIComponent(searchTerm)}
          onChange={handleSearchChange}
          onKeyDown={handleSearchSubmit}
          spellCheck={false}
        />
      </div>
    </section>
  );
}
