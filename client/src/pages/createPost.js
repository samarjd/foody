import 'react-quill/dist/quill.snow.css';
import {useState, useEffect, useContext} from "react";
import {Navigate} from "react-router-dom";
import Editor from "../Editor";
import CreatableSelect from 'react-select/creatable';
import Swal from 'sweetalert2';
import { CategoryContext } from "../components/categoryContext";
import {UserContext} from "../components/userContext";
import { logUserAction } from '../components/loginAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function CreatePost() {
  const [title,setTitle] = useState('');
  const [summary,setSummary] = useState('');
  const [content,setContent] = useState('');
  const [files, setFiles] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const { fetchCategories } = useContext(CategoryContext);
  const {userInfo} = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = (selectedCategories) => {
    setCategories(selectedCategories.map((category) => category.value));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:4000/categories');
        if (response.ok) {
          const categoriesData = await response.json();
          const categoryOptions = categoriesData.map(category => ({ value: category.name, label: category.name }));
          setOptions(categoryOptions);
        } else {
          console.error('Failed to fetch categories:', response.statusText);
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    };

    fetchCategories();
    logUserAction('viewed the create post page.');
  }, []);
  

  async function createNewPost(ev) {
    const data = new FormData();
    const updatedIsVisible = String(isVisible);
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('file', files[0]);
    data.set('isVisible', updatedIsVisible);
    data.set('categories', JSON.stringify(categories));

    ev.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/post', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      if (response.ok) {
        logUserAction('created a new post.');
        await Swal.fire({
          title: 'Success!',
          text: 'Post created successfully.',
          icon: 'success',
          timer: 1500,
        });
        fetchCategories();
        setRedirect(true);
      } else {
        console.error('Failed to create post:', response.statusText);
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to create post. Please try again.',
          icon: 'error',
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Network error:', error);
      await Swal.fire({
        title: 'Network Error!',
        text: 'Failed to connect to the server. Please check your network connection.',
        icon: 'error',
      });
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }

  if (!userInfo?.id) {
    return (
      <section className="main-posts">
        <h1 class="titles">Create new post</h1>
        <div className="loading">
          <div className="empty">
            <h1>Restricted Access!</h1>
            <h3>Your access to this page is restricted.</h3>
          </div>
        </div>
      </section>
    );
  }

  if(userInfo.userRole === "Suspended"){
    return (
      <section className="main-posts">
        <h1 className='titles'>Create new post</h1>
        <div className="empty">
          <h1>Suspended user!</h1>
          <h3>Your access to this page is restricted due to account suspension.</h3>
        </div>
      </section>
    );
  }

  return (
    <form className="important" onSubmit={createNewPost}>
      <h1 className='titles'>Create new post</h1>
      <input type="title"
             placeholder={'Title'}
             value={title}
             required
             spellCheck={false}
             onChange={ev => setTitle(ev.target.value)} />
      <input type="summary"
             placeholder={'Summary'}
             value={summary}
             spellCheck={false}
             onChange={ev => setSummary(ev.target.value)} />
      <input type="file"
             accept="image/*"
             onChange={ev => setFiles(ev.target.files)} />
      <CreatableSelect
        isMulti
        options={options}
        value={categories.map(category => ({ value: category, label: category }))}
        onChange={handleCategoryChange}
      />
      <br/>
      <Editor value={content} onChange={setContent} />
      <div className='row'>
        <label htmlFor="visible">Is Visible:</label>
        <input
          id="visible"
          type="checkbox"
          checked={isVisible}
          style={{width: 'fit-content'}}
          onChange={() => setIsVisible(!isVisible)}
        />
      </div>
      <button style={{marginTop:'5px'}} disabled={loading}>
        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Create post'}
      </button>
    </form>
  );
}