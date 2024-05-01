import 'react-quill/dist/quill.snow.css';
import {useEffect, useState, useContext} from "react";
import {Navigate, useParams} from "react-router-dom";
import Editor from "../Editor";
import CreatableSelect from 'react-select/creatable';
import Swal from 'sweetalert2';
import { CategoryContext } from "../components/categoryContext";
import {UserContext} from "../components/userContext";
import { logUserAction } from '../components/loginAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function EditPost() {
  const {id} = useParams();
  const [title,setTitle] = useState('');
  const [summary,setSummary] = useState('');
  const [content,setContent] = useState('');
  const [files, setFiles] = useState('');
  const [isVisible, setIsVisible] = useState(false);
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
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/post/${id}`);
        const postInfo = await response.json();  
        setTitle(postInfo.postDoc.title);
        setContent(postInfo.postDoc.content);
        setSummary(postInfo.postDoc.summary);
        setIsVisible(postInfo.postDoc.isVisible); 
          
        const categoryNames = await Promise.all(postInfo.postDoc.categories.map(async categoryRef => {
          const categoryResponse = await fetch(`http://localhost:4000/categories/${categoryRef}`);
          const categoryData = await categoryResponse.json();
          return categoryData.name;
        }));
  
        setCategories(categoryNames);
        logUserAction('viewed the edit post page.');
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    };
  
    fetchData();
  }, [id]);

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
  }, []);
  

  async function updatePost(ev) {
    ev.preventDefault();
    setLoading(true);

    const updatedIsVisible = String(isVisible);
    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('isVisible', updatedIsVisible);
    data.set('id', id);
    data.set('categories', JSON.stringify(categories));
  
    if (files?.[0]) {
      data.set('file', files?.[0]);
    }
  
    try {
      const response = await fetch('http://localhost:4000/post', {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });
  
      if (response.ok) {
        await Swal.fire({
          title: 'Success!',
          text: 'Post updated successfully.',
          icon: 'success',
        });
        setRedirect(true);
        fetchCategories();
        logUserAction('updated a post');
      } else {
        console.error('Failed to update post:', response.statusText);
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to update post. Please try again.',
          icon: 'error',
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Network error:', error);
      await Swal.fire({
        title: 'Network Error!',
        icon: 'error',
      });
    }
  }

  if (redirect) {
    return <Navigate to={'/post/'+id} />
  }

  if (!userInfo?.id) {
    return (
      <section className="main-posts">
        <h1 class="titles">Edit post</h1>
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
        <h1 className='titles'>Edit post</h1>
        <div className="empty">
          <h1>Suspended user!</h1>
          <h3>Your access to this page is restricted due to account suspension.</h3>
        </div>
      </section>
    );
  }

  return (
    <form className="important" onSubmit={updatePost}>
      <h1 className='titles'>Edit post</h1>
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
      <Editor onChange={setContent} value={content} />
      <div className='row'>
        <label htmlFor="visible">Is Visible:</label>
        <input
          id="visible"
          type="checkbox"
          checked={isVisible === true || isVisible === "true"}
          style={{width: 'fit-content'}}
          onChange={() => setIsVisible(!isVisible)}
        />
      </div>
      <button style={{marginTop:'5px'}} disabled={loading}>
        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Update post'}
      </button>
    </form>
  );
}