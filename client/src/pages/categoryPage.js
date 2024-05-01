import React, { useState, useEffect, useRef, useContext } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { CategoryContext } from "../components/categoryContext";
import {UserContext} from "../components/userContext";
import { logUserAction } from '../components/loginAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState({ column: "createdAt", order: "dec" });
  const [editCategory, setEditCategory] = useState({ id: null, name: "" });
  const { fetchCategories } = useContext(CategoryContext); 
  const {userInfo} = useContext(UserContext); 
  const [loading, setLoading] = useState(true);

  const inputRef = useRef(null);

  useEffect(() => {
    const manageCategoriesFetch = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:4000/manageCategories");
        const categoryData = await response.json();
        setCategories(categoryData);
        logUserAction('viewed the categories management page');
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching categories:", error);
      }
    };
    manageCategoriesFetch();
  }, []);

  const handleDelete = async (categoryId) => {
    const { value: confirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      focusCancel: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setCategories((prevCategories) => prevCategories.filter((category) => category._id !== categoryId));
        fetchCategories();
        logUserAction('deleted a category');
      } else {
        console.error("Error deleting category:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleSort = (column) => {
    setSortBy((prevSortBy) => ({
      column,
      order: prevSortBy.column === column && prevSortBy.order === "asc" ? "desc" : "asc",
    }));
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const order = sortBy.order === "asc" ? 1 : -1;
    const columnA = String(a[sortBy.column]);
    const columnB = String(b[sortBy.column]);
  
    if (columnA === columnB) {
      return 0;
    }
    return columnA.localeCompare(columnB) * order;
  });

  const handleEditClick = (categoryId, categoryName) => {
    setEditCategory({ id: categoryId, name: categoryName });
  };

  const handleEditClickPreventPropagation = (e) => {
    e.stopPropagation();
  };

  const handleEditChange = (e) => {
    setEditCategory({ ...editCategory, name: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:4000/categories/${editCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editCategory.name, id: editCategory.id }), // Include the category's ID
        credentials: "include",
      });

      if (response.ok) {
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category._id === editCategory.id ? { ...category, name: editCategory.name } : category
          )
        );
        setEditCategory({ id: null, name: "" });
        fetchCategories();
        logUserAction('updated a category');
      } else {
        console.error("Error updating category:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleEditSubmit();
    }
  };

  const handleDocumentClick = (e) => {
    if (editCategory.id && inputRef.current && !inputRef.current.contains(e.target)) {
      setEditCategory({ id: null, name: "" });
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [editCategory.id]);

  const renderEditInput = () => (
    <input
      type="text"
      ref={inputRef}
      value={editCategory.name}
      onChange={handleEditChange}
      onKeyPress={handleKeyPress}
      onClick={handleEditClickPreventPropagation}
    />
  );

  const renderCategoryName = (category) => (
    <>
      {editCategory.id === category._id ? (
        renderEditInput()
      ) : (
        category.name
      )}
    </>
  );

  if(userInfo.userRole !== "Admin"){
    return (
      <section className="main-posts">
        <h1 className='titles'>Categories</h1>
        <div className="empty">
          <h1>Restricted Access!</h1>
          <h3>Your access to this page is restricted.</h3>
        </div>
      </section>
    );
  }

  
  if (loading) {
    return (
      <section className="main-section">
        <div className="loading">
          <div className="empty">
            <h1>Loading Content...</h1>
            <h3>Please wait!</h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="post-page">
      <h2 className="titles">Categories ({sortedCategories.length})</h2>
      <table className="table">
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>
              <a>Name
              {sortBy.column === "name" && (
                <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
              )}
              </a>
            </th>
            <th onClick={() => handleSort("postCount")}>
              <a>Number of Posts
              {sortBy.column === "postCount" && (
                <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
              )}
              </a>
            </th>
            <th onClick={() => handleSort("createdAt")}>
              <a>Created At
              {sortBy.column === "createdAt" && (
                <span>{sortBy.order === "asc" ? " ▲" : " ▼"}</span>
              )}
              </a>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedCategories.map((category) => (
            <tr key={category._id}>
              <td>{renderCategoryName(category)}</td>
              <td>{category.postCount}</td>
              <td>
                <time>{format(new Date(category.createdAt), "MMM dd, yyyy")}</time>
              </td>
              <td>
                <div className="edit-row">
                  <a
                    className="edit-btn"
                    onClick={(e) => {
                      handleEditClick(category._id, category.name);
                      e.stopPropagation();
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </a>
                  <a className="delete-btn" onClick={() => handleDelete(category._id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryPage;