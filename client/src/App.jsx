import { useEffect, useState } from "react";
import "./App.css";
import { registerUser, loginUser } from "./api";

const API_URL = "http://localhost:5000/api";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [posts, setPosts] = useState([]);

  const [showCreate, setShowCreate] = useState(false);

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    image: "",
  });

  const [editingId, setEditingId] = useState(null);

  // GET POSTS
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(loginData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      setMessage("Login successful!");
      setShowLogin(false);

      setLoginData({
        email: "",
        password: "",
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await registerUser(registerData);

      setMessage("Account created successfully! Please login.");

      setShowRegister(false);
      setShowLogin(true);

      setRegisterData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);

    setMessage("Logged out successfully.");
  };

  // CREATE / UPDATE POST
  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!postData.title || !postData.content) {
      setMessage("Please enter title and content.");
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/posts/${editingId}`
        : `${API_URL}/posts`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(
        editingId
          ? "Post updated successfully!"
          : "Post published successfully!"
      );

      setPostData({
        title: "",
        content: "",
        image: "",
      });

      setEditingId(null);
      setShowCreate(false);

      fetchPosts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // EDIT
  const editPost = (post) => {
    setPostData({
      title: post.title,
      content: post.content,
      image: post.image || "",
    });

    setEditingId(post._id);
    setShowCreate(true);
  };

  // DELETE
  const deletePost = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage("Post deleted successfully!");
      fetchPosts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          Blog<span>Sphere</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#explore">Explore</a>
          <a href="#about">About</a>

          {user ? (
            <>
              <button
                className="login-btn"
                onClick={() => setShowCreate(true)}
              >
                + Write
              </button>

              <button
                className="login-btn"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="login-btn"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* MESSAGE */}
      {message && (
        <div className="message-box">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="small-heading">WELCOME TO BLOGSPHERE</p>

          <h1>
            Stories that
            <br />
            <span>inspire ideas.</span>
          </h1>

          <p className="hero-text">
            A modern space where writers share their thoughts,
            experiences and ideas with the world.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() =>
                user
                  ? setShowCreate(true)
                  : setShowRegister(true)
              }
            >
              Start Writing
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                document
                  .getElementById("explore")
                  ?.scrollIntoView()
              }
            >
              Explore Blogs
            </button>
          </div>
        </div>
      </section>

      {/* POSTS */}
      <section className="posts-section" id="explore">
        <div className="section-heading">
          <div>
            <p className="small-heading">DISCOVER</p>
            <h2>Latest Stories</h2>
          </div>
        </div>

        <div className="posts-grid">

          {posts.length === 0 ? (
            <div className="empty-posts">
              <h3>No posts yet</h3>
              <p>Be the first person to share a story.</p>
            </div>
          ) : (
            posts.map((post) => (
              <article className="post-card" key={post._id}>

                <div className="post-image image-1">
                  <span>Blog</span>
                </div>

                <div className="post-content">

                  <p className="post-author">
                    By {post.author?.name || "Unknown Author"}
                  </p>

                  <h3>{post.title}</h3>

                  <p className="post-description">
                    {post.content.length > 150
                      ? post.content.substring(0, 150) + "..."
                      : post.content}
                  </p>

                  <div className="post-actions">

                    {user &&
                      post.author?._id === user.id && (
                        <>
                          <button
                            className="read-btn"
                            onClick={() => editPost(post)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deletePost(post._id)
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}

                  </div>
                </div>
              </article>
            ))
          )}

        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div>
          <p className="small-heading">ABOUT BLOGSPHERE</p>
          <h2>One place for every story.</h2>
        </div>

        <p>
          BlogSphere is a full-stack blogging platform where users
          can create, discover and manage blog posts in one place.
        </p>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="logo">
          Blog<span>Sphere</span>
        </div>

        <p>Share your story. Inspire someone.</p>

        <p>© 2026 BlogSphere</p>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div
          className="modal-overlay"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="login-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>

            <p className="small-heading">WELCOME BACK</p>
            <h2>Login to BlogSphere</h2>

            <form onSubmit={handleLogin}>

              <input
                type="email"
                placeholder="Email address"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value,
                  })
                }
                required
              />

              <button className="primary-btn full-btn">
                Login
              </button>

            </form>

            <p className="signup-text">
              Don't have an account?{" "}
              <b
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
              >
                Register
              </b>
            </p>
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div
          className="modal-overlay"
          onClick={() => setShowRegister(false)}
        >
          <div
            className="login-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setShowRegister(false)}
            >
              ×
            </button>

            <p className="small-heading">JOIN BLOGSPHERE</p>
            <h2>Create an Account</h2>

            <form onSubmit={handleRegister}>

              <input
                type="text"
                placeholder="Full name"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email address"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                type="password"
                placeholder="Password (6+ characters)"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    password: e.target.value,
                  })
                }
                minLength="6"
                required
              />

              <button className="primary-btn full-btn">
                Create Account
              </button>

            </form>

            <p className="signup-text">
              Already have an account?{" "}
              <b
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
              >
                Login
              </b>
            </p>
          </div>
        </div>
      )}

      {/* CREATE / EDIT POST */}
      {showCreate && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="login-modal create-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => {
                setShowCreate(false);
                setEditingId(null);
              }}
            >
              ×
            </button>

            <p className="small-heading">
              {editingId ? "EDIT STORY" : "CREATE STORY"}
            </p>

            <h2>
              {editingId ? "Edit your post" : "Write something"}
            </h2>

            <form onSubmit={handlePostSubmit}>

              <input
                type="text"
                placeholder="Blog title"
                value={postData.title}
                onChange={(e) =>
                  setPostData({
                    ...postData,
                    title: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Image URL (optional)"
                value={postData.image}
                onChange={(e) =>
                  setPostData({
                    ...postData,
                    image: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Write your story..."
                value={postData.content}
                onChange={(e) =>
                  setPostData({
                    ...postData,
                    content: e.target.value,
                  })
                }
                required
              />

              <button className="primary-btn full-btn">
                {editingId ? "Update Post" : "Publish Post"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;