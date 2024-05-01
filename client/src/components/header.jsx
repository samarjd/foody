import {Link, useNavigate, useLocation} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {UserContext} from "./userContext";
import Logo from '../assets/images/logo.webp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPenToSquare, faFolder, faLayerGroup, faUsersGear, faUser, faRightFromBracket, faPaperPlane, faEnvelopesBulk, faChevronDown, faCircleInfo, faClockRotateLeft, faComment} from '@fortawesome/free-solid-svg-icons'
import { logUserAction } from '../components/loginAction';

export default function Header() {
  const {setUserInfo,userInfo} = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isHeaderCollapsed]);

  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    }).catch(error => {
      console.error('Error fetching user profile:', error);
      navigate('/login');
    });
  }, []);
  
  
  async function logout() {
    try {
      logUserAction('logged out');
      setTimeout(async () => {
        try {
          await fetch('http://localhost:4000/logout', {
            credentials: 'include',
            method: 'POST',
          });
          setUserInfo(null);
          navigate('/login');
        } catch (fetchError) {
          console.error('Error fetching after logout:', fetchError);
        }
      }, 10);
    } catch (logError) {
      console.error('Error logging out:', logError);
    }
  }
    
  const username = userInfo?.username;
  const isRouteActive = (path) => location.pathname.startsWith(path);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleHeader = () => {
    setIsHeaderCollapsed(!isHeaderCollapsed);
  };

  const handleDocumentClick = (event) => {
    if (!event.target.closest("header") && !isHeaderCollapsed) {
      toggleHeader();
    }
  };

  const role = userInfo?.userRole || 'user';

  return (
    <header className={isHeaderCollapsed ? "collapsed" : ""}>
      <div className="row">
        <Link to="/" className="logo"><img src={Logo} alt="foody logo" className='brand-image' /> </Link>
        <Link to="/" className="logo">
          <h1>FOODY</h1>
          <span>Stay Curious</span>
        </Link>
      </div>
      <nav>
        <Link to="/contact" className={isRouteActive("/contact") ? "active" : ""}>Contact</Link>
        <Link to="/about" className={isRouteActive("/about") ? "active" : ""}>About</Link>
        {username && (
          <>
            {role !== 'Suspended' && (
              <>
                <div className={`dropdown ${isOpen ? 'open' : ''}`}>
                  <a className="dropbtn" onClick={toggleDropdown}>
                    <span className="d-flex align-center" tabIndex="0">
                      <span className="user-name">Posts management</span>
                        <FontAwesomeIcon icon={faChevronDown} />                
                      </span>
                  </a>
                  <div className="dropdown-content">
                    <Link to="/create">
                      <div  className={isRouteActive("/create") ? "a-category active" : "a-category"}>New post</div>
                    </Link>
                    <Link to="/archive">
                      <div className={isRouteActive("/archive") ? "a-category active" : "a-category"}>Archive</div>
                    </Link>  
                  </div>
                </div>
              </>
            )}
            {role === 'Admin' && (
              <>
                <div className={`dropdown ${isOpen ? 'open' : ''}`}>
                  <a className="dropbtn" onClick={toggleDropdown}>
                    <span className="d-flex align-center" tabIndex="0">
                      <span className="user-name">Administration</span>
                        <FontAwesomeIcon icon={faChevronDown} />                
                      </span>
                  </a>
                  <div className="dropdown-content">
                      <Link to="/manageCategories">
                        <div  className={isRouteActive("/manageCategories") ? "a-category active" : "a-category"}>Categories</div>
                      </Link>
                      <Link to="/manageUsers">
                        <div className={isRouteActive("/manageUsers") ? "a-category active" : "a-category"}>Users</div>
                      </Link>                        
                      <Link to="/emailPage">
                        <div className={isRouteActive("/emailPage") ? "a-category active" : "a-category"}>Mails</div>
                      </Link>  
                      <Link to="/activityLogs">
                        <div className={isRouteActive("/activityLogs") ? "a-category active" : "a-category"}>Logs</div>
                      </Link>  
                      <Link to="/comments">
                        <div className={isRouteActive("/comments") ? "a-category active" : "a-category"}>Comments</div>
                      </Link>  

                  </div>
                </div>
              </>
            )}

            <div className={`dropdown ${isOpen ? 'open' : ''}`}>
              <a className="dropbtn" onClick={toggleDropdown}>
                <span className="d-flex align-center" tabIndex="0">
                  <span className="user-name">{username}</span>
                    <FontAwesomeIcon icon={faChevronDown} />                
                  </span>
              </a>
              <div className="dropdown-content">
                  <Link to="/profile">
                    <div className={isRouteActive("/profile") ? "a-category active" : "a-category"}>
                      Profile
                    </div>
                  </Link>
                  <a onClick={logout}>
                    <div className="a-category">
                      Log out
                    </div>
                  </a>                
              </div>
            </div>
          </>
        )}
        {!username && (
          <>
            <Link to="/login" className={isRouteActive("/login") ? "active" : ""}>Login</Link>
            <Link to="/register" className={isRouteActive("/register") ? "active" : ""}>Register</Link>
          </>
        )}
      </nav>
      <button className="nabvarControl" onClick={toggleHeader}>
        <FontAwesomeIcon icon={faBars} />
      </button>
      <div className="phoneNav">
        <div className="row-column">
          <div className="row justify-between mb-3">
            <div className="align-center row">
              <Link to="/" className="logo"onClick={toggleHeader}><img src={Logo} alt="foody logo" className='brand-image' /> </Link>
              <Link to="/" className="logo" onClick={toggleHeader}>
                <h1>FOODY</h1>
                <span>Stay Curious</span>
              </Link>
            </div>
            <div className="row align-center justify-end w-100">
              <button className="nabvarControl" onClick={toggleHeader}>
                <FontAwesomeIcon icon={faBars} />
              </button>
            </div>
          </div>
          <Link to="/contact" className={isRouteActive("/contact") ? "active" : ""} onClick={toggleHeader}>
            <FontAwesomeIcon icon={faPaperPlane} /> Contact
          </Link>
          <Link to="/about" className={isRouteActive("/about") ? "active" : ""} onClick={toggleHeader}>
          <FontAwesomeIcon icon={faCircleInfo} /> About
          </Link>
      {username && (
        <>
            {role !== 'Suspended' && (
              <>
              <Link to="/create" className={isRouteActive("/create") ? "active" : ""} onClick={toggleHeader}>
                <FontAwesomeIcon icon={faPenToSquare} />Create new post
              </Link>
              <Link to="/archive" className={isRouteActive("/archive") ? "active" : ""} onClick={toggleHeader}>
                <FontAwesomeIcon icon={faFolder} />Archive
              </Link>
              </>
            )}
            {role === 'Admin' && (
              <>
              <Link to="/manageCategories" className={isRouteActive("/manageCategories") ? "active" : ""} onClick={toggleHeader}>
                <FontAwesomeIcon icon={faLayerGroup} />Categories
              </Link>
              <Link to="/manageUsers" className={isRouteActive("/manageUsers") ? "active" : ""} onClick={toggleHeader}>
                <FontAwesomeIcon icon={faUsersGear} />Users
              </Link>
              <Link to="/emailPage" className={isRouteActive("/emailPage") ? "active" : ""} onClick={toggleHeader}>
                <FontAwesomeIcon icon={faEnvelopesBulk} />Mails
              </Link>
              <Link to="/activityLogs" className={isRouteActive("/activityLogs") ? "active" : ""} onClick={toggleHeader}>
                <FontAwesomeIcon icon={faClockRotateLeft} />Logs
              </Link>  
              <Link to="/comments" className={isRouteActive("/comments") ? "active" : ""} onClick={toggleHeader}>
                <FontAwesomeIcon icon={faComment} />Comments
              </Link>   
              </>
            )}

            <Link to="/profile" className={isRouteActive("/profile") ? "active" : ""} onClick={toggleHeader}>
              <div className="a-category"><FontAwesomeIcon icon={faUser} />Profile</div>
            </Link>
        </>
        )}
        </div>
        {username && (
          <div className="row-column">
            <a onClick={logout}>
              <div className="a-category"><FontAwesomeIcon icon={faRightFromBracket} />Log out</div>
            </a>  
          </div>
        )}
        {!username && (
          <div className="row-column">
            <Link to="/login" className={isRouteActive("/login") ? "active" : ""} onClick={toggleHeader}>Login</Link>
            <Link to="/register" className={isRouteActive("/register") ? "active" : ""} onClick={toggleHeader}>Register</Link>
          </div>
        )}
      </div>
    </header>
  );
}