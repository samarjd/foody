import { useState, useContext, useEffect } from "react";
import Swal from 'sweetalert2';
import { UserContext } from '../components/userContext';
import Chef from '../assets/images/chef.png';
import Crown from "../assets/images/icons/crown.png";
import { logUserAction } from '../components/loginAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function ProfilePage() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false); 
  const [profile, setProfile] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [files, setFiles] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    firstname: '',
    lastname: '',
    email: '',
    dob: '',
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userInfo?.id) {
        setLoading(false);
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:4000/profile/${userInfo.id}`, { method: "POST" });
        const userData = await response.json();
        setProfile(userData);
        setFormData({
          password: userData.password || '',
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          email: userData.email || '',
          dob: userData.dob || '',
        });
        logUserAction('viewed their profile page.');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user information:', error);
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [userInfo.id]);
  

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);

    try {
      const response = await fetch(`http://localhost:4000/profile`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setUserInfo(updatedProfile);
        logUserAction('updated their profile informations.');
        Swal.fire('Success', 'Profile updated successfully!', 'success');
      } else {
        Swal.fire('Error', 'Failed to update profile. Please try again.', 'error');
      }
      setLoadingUpdate(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
      setLoadingUpdate(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(URL.createObjectURL(file));
      setFiles(e.target.files);
    } else {
      setNewImage(null);
      setFiles('');
    }
  };

  const handleSaveImage = async () => {
    setLoadingSave(true);
    const data = new FormData();
    data.set('file', files[0]);
    
    try {
      const response = await fetch('http://localhost:4000/profile', {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });

      if (response.ok) {
        logUserAction('updated their profile picture.');
        await Swal.fire({
          title: 'Success!',
          text: 'Profile updated successfully.',
          icon: 'success',
          timer: 1500,
        });
      } else {
        console.error('Failed to update profile:', response.statusText);
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to update profile. Please try again.',
          icon: 'error',
        });
      }
      setLoadingSave(false);
    } catch (error) {
      console.error('Network error:', error);
      await Swal.fire({
        title: 'Network Error!',
        text: 'Failed to connect to the server. Please check your network connection.',
        icon: 'error',
      });
      setLoadingSave(false);
    }
  };

  if (loading) {
    return (
      <section className="main-posts">
        <div className="loading">
          <div className="empty">
            <h1>Loading Content...</h1>
            <h3>Please wait!</h3>
          </div>
        </div>
      </section>
    );
  }

  if (!userInfo) {
    return (
      <section className="main-posts">
        <h1 className="titles">Profile</h1>
        <div className="loading">
          <div className="empty">
            <h1>Restricted Access!</h1>
            <h3>Your access to this page is restricted.</h3>
          </div>
        </div>
      </section>
    );
  }

  const dobDate = formData.dob ? new Date(formData.dob) : null;
  const formattedDate = dobDate ? dobDate.toISOString().split('T')[0] : '';
  
    return (
    <section className="main-posts ">
      <div className="row py-2 flex-50 user-section">
        <div className="main-info">
        <img className="author-image" src={newImage ? `${newImage}` : (profile?.cover ? `http://localhost:4000/${profile.cover}` : Chef)} alt="Profile Cover" />
          <div className="user-role">
            {profile?.userRole || "User"}
            {profile?.userRole === 'Admin' && (<img alt="Profile Cover" src={Crown} />)}
          </div>
          {userInfo.userRole !== "Suspended" && (
            <>
            <input type="file" accept="image/*" onChange={handleImageChange}  />
            <button disabled={loadingSave} onClick={handleSaveImage}>
              {loadingSave ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Save'}
            </button>
            </>
          )}
          
        </div>
        <div className="editable-info">
          <h1>User Info</h1>
          <form onSubmit={handleUpdateProfile}>
            <div className="row">
              <label>Username: </label>
              <input defaultValue={profile?.username || ''} readOnly />
            </div>
            <div className="row">
              <label>Password: </label>
              <div className="row">
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
            </div>
            <br />
            <div className="row">
              <label>First name: </label>
              <input
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
              />
            </div>
            <div className="row">
              <label>Last name: </label>
              <input
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              />
            </div>
            <div className="row">
              <label>Email: </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="row">
              <label>Date of Birth: </label>
              <input
                type="date"
                value={formattedDate}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            {userInfo.userRole !== "Suspended" && (
            <div className="row py-2">
              <button type="submit" disabled={loadingUpdate}>
                {loadingUpdate ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Update Profile'}
              </button>
            </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}