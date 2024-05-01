// CategoryContext.js
import { createContext, useState, useEffect } from 'react';

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [allCategories, setAllCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/allCategories');
      if (response.ok) {
        const categories = await response.json();
        setAllCategories(categories);
      } else {
        console.error('Failed to fetch categories:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories(); // Fetch categories on initial mount
  }, []);

  return (
    <CategoryContext.Provider value={{ allCategories, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};
