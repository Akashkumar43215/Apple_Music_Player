import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-dark px-4 text-center">
      <h1 className="bg-gradient-brand bg-clip-text text-8xl font-black text-transparent">404</h1>
      <p className="mt-4 text-xl font-semibold text-white">This page dropped the beat.</p>
      <p className="mt-2 max-w-sm text-white/50">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-8">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
