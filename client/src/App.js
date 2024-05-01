import React, { useEffect } from "react";
import './App.css';
import {Route, Routes, useLocation} from "react-router-dom";

import Layout from "./layout";
import IndexPage from "./pages/indexPage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import ProfilePage from "./pages/profilePage";
import { UserContextProvider } from './components/userContext';
import CreatePost from "./pages/createPost";
import PostPage from "./pages/postPage";
import EditPost from "./pages/editPost";
import ArchivePage from "./pages/archivePage";
import PostCategoryPage from "./pages/postCategoryPage";
import CategoryPage from "./pages/categoryPage";
import UserPage from "./pages/userPage";
import SearchPost from "./pages/searchPost";
import ContactPage from "./pages/contactPage";
import EmailPage from "./pages/emailPage";
import AboutPage from "./pages/aboutPage";
import LogsPage from "./pages/logsPage";
import { CategoryProvider } from './components/categoryContext';
import TokenPage from "./pages/tokenPage";
import CommentsPage from "./pages/commentsPage";
import NotFoundPage from "./pages/notFoundPage";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!pathname.includes("/postcategory/") && !pathname.includes("/search/")){
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <UserContextProvider>
      <CategoryProvider>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<IndexPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/EmailPage' element={<EmailPage />} />
            <Route path="/activityLogs" element={<LogsPage />} />
            <Route path='/create' element={<CreatePost />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/edit/:id" element={<EditPost />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/manageCategories" element={<CategoryPage />} />
            <Route path="/manageUsers" element={<UserPage />} />
            <Route path="/postcategory/:id" element={<PostCategoryPage />} />
            <Route path="/search/:id" element={<SearchPost />} />
            <Route path="/verify-token/:id" element={<TokenPage />} />
            <Route path="/comments" element={<CommentsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CategoryProvider>
    </UserContextProvider>
  );
}

export default App;