import { useEffect, useState } from "react";
import supabase from "./supabase";
import { Sun, Moon } from "lucide-react";
import "./style.css";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function App() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCaregory, setCurrentCategory] = useState("all");
  const [isSortingType, setIsSortingType] = useState("none");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    async function getPosts() {
      setIsLoading(true);

      let query = supabase.from("posts").select("*");
      if (currentCaregory !== "all") {
        query = query.eq("category", currentCaregory);
      }

      if (isSortingType !== "none") {
        query = query.order(isSortingType, { ascending: false });
      }

      const { data: posts, error } = await query.limit(100);
      if (!error) {
        setPosts(posts);
        console.log(posts);
      } else {
        alert("There was a problem getting data");
      }
      setIsLoading(false);
    }
    getPosts();
  }, [currentCaregory, isSortingType]);

  return (
    <>
      <Header
        setIsFormVisible={setIsFormVisible}
        isFormVisible={isFormVisible}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      {isFormVisible && (
        <NewPostForm setPosts={setPosts} setIsFormVisible={setIsFormVisible} />
      )}

      <main className="main">
        {posts.lenght === 0 ? (
          <p className="message">No posts for this category yet!</p>
        ) : (
          ""
        )}
        <div>
          <CategoryFilter setCurrentCategory={setCurrentCategory} />
          <SortingPosts
            posts={posts}
            setPosts={setPosts}
            sortingType={isSortingType}
            setIsSortingType={setIsSortingType}
            darkMode={darkMode}
          />
        </div>
        {isLoading ? (
          <Loader />
        ) : (
          <PostList posts={posts} setPosts={setPosts} />
        )}
        <Footer />
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}
function Header({ setIsFormVisible, isFormVisible, darkMode, setDarkMode }) {
  const appTitle = "My Simple Posts";
  return (
    <header className="header">
      <div className="logo">
        <img src="/logo.png" height="68" width="68" alt="Logo" />
        <h1>{appTitle}</h1>
      </div>
      <div className="logo">
        {/* Toggle Light and Dark Mode */}
        <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        <button
          className="btn btn-large btn-open"
          onClick={() => setIsFormVisible((visible) => !visible)}
        >
          {isFormVisible ? "Close" : "Share a fact"}
        </button>
      </div>
    </header>
  );
}

function DarkModeToggle({ darkMode, setDarkMode }) {
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`theme-toggle ${darkMode ? "dark" : "light"}`}
        aria-label="Toggle dark mode"
      >
        <div className="icon-wrapper">
          <Sun className={`theme-icon sun ${darkMode ? "hidden" : ""}`} />
          <Moon className={`theme-icon moon ${darkMode ? "visible" : ""}`} />
        </div>
        <div className={`pulse-ring ${darkMode ? "dark" : "light"}`}></div>
      </button>
    </>
  );
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewPostForm({ setPosts, setIsFormVisible }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("http://example.com");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      setIsUploading(true);
      // Insert into Supabase
      const { data: newPost, error } = await supabase
        .from("posts")
        .insert([
          {
            text,
            source,
            category,
          },
        ])
        .select()
        .single();
      setIsUploading(false);
      if (!error) {
        setPosts((posts) => [newPost, ...posts]);
      }
      setText("");
      setSource("");
      setCategory("");
      setIsFormVisible(false);
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a Post with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span style={textLength > 200 ? { color: "red" } : {}}>
        {200 - textLength}
      </span>
      {textLength > 200 ? (
        <p className="warning-message">
          The post should be 200 characters max.
        </p>
      ) : (
        ""
      )}
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((category) => (
          <CategoryItem
            key={category.name}
            category={category}
            setCurrentCategory={setCurrentCategory}
          />
        ))}
      </ul>
    </aside>
  );
}

function CategoryItem({ category, setCurrentCategory }) {
  return (
    <li className="category">
      <button
        className="btn btn-category"
        style={{ backgroundColor: category.color }}
        onClick={() => setCurrentCategory(category.name)}
      >
        {category.name}
      </button>
    </li>
  );
}

function PostList({ posts, setPosts }) {
  if (posts.length === 0) {
    return <p className="message">No posts to show</p>;
  }

  return (
    <section>
      <ul className="post-list">
        {posts.map((post) => (
          <Post key={post.id} post={post} setPosts={setPosts} />
        ))}
      </ul>
      <p>There are {posts.length} posts in total</p>
    </section>
  );
}

function SortingPosts({ sortingType, setIsSortingType, darkMode }) {
  function handleSort(e, columnName) {
    e.preventDefault(); // Prevent form submission

    // If clicking the same button again, remove the sort
    if (sortingType === columnName) {
      setIsSortingType("none");
    } else {
      setIsSortingType(columnName);
    }
  }

  return (
    <div className="sorting-buttons">
      <h3>Sorting Posts</h3>
      <div>
        <button
          type="button"
          className={`btn btn-category category sorting-btn ${
            darkMode ? "dark" : "light"
          }`}
          style={{
            background: sortingType === "voteInteresting" ? "#3b82f6" : "",
            color: sortingType === "voteInteresting" ? "white" : "",
            fontWeight: sortingType === "voteInteresting" ? "bold" : "normal",
          }}
          onClick={(e) => handleSort(e, "voteInteresting")}
        >
          Sort by Interesting
        </button>
        <button
          type="button"
          className={`btn btn-category category sorting-btn ${
            darkMode ? "dark" : "light"
          }`}
          style={{
            background: sortingType === "voteMindblowing" ? "#3b82f6" : "",
            color: sortingType === "voteMindblowing" ? "white" : "",
            fontWeight: sortingType === "voteMindblowing" ? "bold" : "normal",
          }}
          onClick={(e) => handleSort(e, "voteMindblowing")}
        >
          Sort by Mindblowing
        </button>
        <button
          type="button"
          className={`btn btn-category category sorting-btn ${
            darkMode ? "dark" : "light"
          }`}
          style={{
            background: sortingType === "voteFalse" ? "#3b82f6" : "",
            color: sortingType === "voteFalse" ? "white" : "",
            fontWeight: sortingType === "voteFalse" ? "bold" : "normal",
          }}
          onClick={(e) => handleSort(e, "voteFalse")}
        >
          Sort by False
        </button>
      </div>
    </div>
  );
}

function Post({ post, setPosts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [votedButton, setVotedButton] = useState(null); // Track which button was clicked

  const isDisputed =
    post.voteFalse > post.voteInteresting &&
    post.voteFalse > post.voteMindblowing;

  async function handleVote(columnName) {
    if (isUpdating) return;

    setIsUpdating(true);

    let updates = {};

    // If clicking the same button again, remove the vote
    if (votedButton === columnName) {
      updates[columnName] = post[columnName] - 1;

      const { data: updatedPost, error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", post.id)
        .select()
        .single();

      setIsUpdating(false);

      if (!error) {
        setPosts((posts) =>
          posts.map((p) => (p.id === post.id ? updatedPost : p))
        );
        setVotedButton(null); // Clear the vote
      }
    }
    // If clicking a different button, move the vote
    else if (votedButton) {
      updates[votedButton] = post[votedButton] - 1; // Remove from old button
      updates[columnName] = post[columnName] + 1; // Add to new button

      const { data: updatedPost, error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", post.id)
        .select()
        .single();

      setIsUpdating(false);

      if (!error) {
        setPosts((posts) =>
          posts.map((p) => (p.id === post.id ? updatedPost : p))
        );
        setVotedButton(columnName); // Update to new button
      }
    }
    // First time voting
    else {
      updates[columnName] = post[columnName] + 1;

      const { data: updatedPost, error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", post.id)
        .select()
        .single();

      setIsUpdating(false);

      if (!error) {
        setPosts((posts) =>
          posts.map((p) => (p.id === post.id ? updatedPost : p))
        );
        setVotedButton(columnName); // Set the voted button
      }
    }
  }

  return (
    <li className="post">
      <p>
        {isDisputed ? <span className="disputed">⛔️ [DISPUTED] </span> : null}
        {post.text}
        <a
          className="source"
          href={post.source}
          target="_blank"
          rel="noreferrer"
        >
          (Source)
        </a>
        <span className="time-ago">{getTimeAgo(post.created_at)}</span>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === post.category)
            .color,
        }}
      >
        {post.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("voteInteresting")}
          disabled={isUpdating}
          style={
            votedButton === "voteInteresting" ? { fontWeight: "bold" } : {}
          }
        >
          👍 {post.voteInteresting}
        </button>
        <button
          onClick={() => handleVote("voteMindblowing")}
          disabled={isUpdating}
          style={
            votedButton === "voteMindblowing" ? { fontWeight: "bold" } : {}
          }
        >
          🤯 {post.voteMindblowing}
        </button>
        <button
          onClick={() => handleVote("voteFalse")}
          disabled={isUpdating}
          style={votedButton === "voteFalse" ? { fontWeight: "bold" } : {}}
        >
          ⛔️ {post.voteFalse}
        </button>
      </div>
    </li>
  );
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
}

function Footer() {
  return (
    <footer>
      <p>Made with ❤️ by Haytham Saba</p>
    </footer>
  );
}

export default App;
