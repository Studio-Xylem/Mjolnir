import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { FeedPage } from './pages/Feed/FeedPage';
import { PostDetailPage } from './pages/PostDetail/PostDetailPage';
import { CreatePostPage } from './pages/CreatePost/CreatePostPage';
import { MyPostsPage } from './pages/MyPosts/MyPostsPage';
import { AuthPage } from './pages/Auth/AuthPage';
import { NotFoundPage } from './pages/NotFound/NotFoundPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/login" element={<AuthPage initialMode="signin" />} />
        <Route path="/register" element={<AuthPage initialMode="signup" />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/create" element={<CreatePostPage />} />
        <Route path="/my-posts" element={<MyPostsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
