import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }

    setError('');
    alert('Signup successful!');
    navigate('/');
  };

  return (
    <div className="container mx-auto p-6 flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-center">Sign Up</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-light-bg dark:bg-dark-bg p-6 rounded shadow border border-light-border dark:border-dark-border space-y-4"
        >
          {error && (
            <p className="text-light-error dark:text-light-error">{error}</p>
          )}
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full p-2 border rounded border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border rounded border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
          />
          <button
            type="submit"
            className="w-full bg-light-accent hover:bg-light-accent/80 dark:bg-dark-primary dark:hover:bg-dark-primary/80 text-white p-2 rounded"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;