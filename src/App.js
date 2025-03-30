import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import "./App.css";

export default function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showFavorites, setShowFavorites] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [genreFilter, setGenreFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");

  // At the top level, usually in index.js or App.js
  const ignoreResizeObserverError = (err) => {
    if (err.message === "ResizeObserver loop completed with undelivered notifications.") {
      return;
    }
    console.error(err);
  };

  // Add this in your App.js or index.js (top level)
  window.addEventListener("error", (e) => {
    if (
      e.message === "ResizeObserver loop completed with undelivered notifications." ||
      e.message === "ResizeObserver loop limit exceeded"
    ) {
      const errorOverlay = document.getElementById("webpack-dev-server-client-overlay");
      if (errorOverlay) {
        errorOverlay.style.display = "none"; // Hide red error box
      }
      e.stopImmediatePropagation(); // Prevent from bubbling to React
    }
  });


  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch("http://localhost:5000/api/books")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Error loading books:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

  const detectGenreFromName = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("dragon") || lower.includes("magic") || lower.includes("sword")) return "Fantasy";
    if (lower.includes("love") || lower.includes("kiss") || lower.includes("romance")) return "Romance";
    if (lower.includes("murder") || lower.includes("detective") || lower.includes("mystery")) return "Mystery";
    if (lower.includes("alien") || lower.includes("space") || lower.includes("future")) return "Sci-Fi";
    if (lower.includes("ghost") || lower.includes("haunted") || lower.includes("horror")) return "Horror";
    return "Other";
  };
  let filteredBooks = books
    .filter((book) =>
      book.name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((book) => !showFavorites || favorites.includes(book.file));

  if (genreFilter !== "All") {
    filteredBooks = filteredBooks.filter((book) => detectGenreFromName(book.name || "") === genreFilter);
  }

  if (sortOrder === "asc") {
    filteredBooks = filteredBooks.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === "desc") {
    filteredBooks = filteredBooks.sort((a, b) => b.name.localeCompare(a.name));
  }

  const openReaderTab = (book) => {
    const url = `${window.location.origin}/${book.type}/${encodeURIComponent(book.file)}`;
    window.open(url, "_blank");
  };

  const placeholderDescriptions = [
    "A thrilling adventure through forgotten realms.",
    "Two lives cross in a story of fate and time.",
    "Secrets buried deep are brought to light.",
    "An unforgettable journey through memories.",
    "The sky is not the limit—it’s just the beginning.",
    "Love, loss, and letters never sent.",
    "Where dreams blur into dangerous reality.",
    "Time bends. Truth breaks. Who survives?",
    "A detective with no memory must solve a murder he may have committed.",
    "She receives postcards from a town that doesn’t exist—until someone vanishes into it.",
    "A murder podcast host is stalked by her next episode’s killer.",
    "Every day at 6:17 PM, the lights flicker—and someone disappears.",
    "Trapped in a snowed-in lodge, five strangers realize one of them is a killer.",
    "A florist and a funeral director fall in love through anonymous letters.",
    "He writes breakup songs—until he meets the girl he can't stop writing about.",
    "Her fake fiancé becomes very real when her past walks back into town.",
    "Two rival chefs are forced to co-host a Valentine’s Day special.",
    "A prince in disguise falls for the one girl who hates royalty.",
    "A soldier is sent back in time—to stop herself.",
    "Humanity’s last survivors float above Earth, but one engineer wants to return.",
    "Every citizen is born with a countdown—hers ended five minutes ago.",
    "He fell through a black hole and woke up in a world ruled by machines.",
    "A starship crew finds a planet where time runs backward.",
    "A cursed assassin must protect the heir she was meant to kill.",
    "Dragons are extinct—until one hatches in her oven.",
    "A librarian discovers her books whisper secrets of an ancient war.",
    "Every dream he steals becomes a weapon in the real world.",
    "The last witch in a dying world must resurrect magic—or lose everything.",
    "She has a plan to survive high school—until a ghost starts texting her.",
    "A rebellious teen inherits a diary that predicts future heartbreaks.",
    "He builds a fake online identity and accidentally becomes famous.",
    "One summer. One secret. One life-changing decision.",
    "She thought moving meant a fresh start—not reliving someone else’s past.",
    "They signed up for a haunted house challenge—none of them ever left.",
    "He’s been dead for ten years—so why is he at her door?",
    "Every night the painting on her wall moves closer to the door.",
    "A viral video dares you to watch it—and then it watches you.",
    "She can see ghosts—but now one won’t leave her alone.",
    "A young woman hides a coded message in every quilt she makes.",
    "During WWII, a blind boy and a runaway girl cross enemy lines together.",
    "A violinist in 1800s Vienna uncovers a forbidden symphony.",
    "He’s a war hero to the world, but his sister knows the truth.",
    "A love story unfolds through letters buried in the walls of a castle.",
    "She’s losing time—and someone else is living it for her.",
    "A grieving father starts seeing his son in strangers’ faces.",
    "He wakes up every morning with a different personality.",
    "Her memories lie, but her scars tell the truth.",
    "Two strangers meet at therapy and agree to fix each other's lives.",
    "A plane crashes in the Arctic, and only three teens survive.",
    "A treasure map leads her into the world her grandfather warned her about.",
    "An explorer lost in the Amazon finds a city no map dares show.",
    "One wrong step on the hike turns the trip into a deadly game.",
    "She sails solo across the Atlantic—until someone else boards.",
    "Everyone’s shadow tells the truth—except his.",
    "She wakes up every day in a different parallel universe.",
    "When people lie, she hears music instead of words.",
    "His tattoos rewrite themselves based on what he fears.",
    "A vending machine appears in the middle of a desert—and grants wishes.",
    "A tea shop owner finds a body steeping in more than just gossip.",
    "A librarian’s cat keeps pointing her toward murder suspects.",
    "When a knitting circle turns deadly, the town’s quiet charm unravels.",
    "Her cupcakes are sweet—but someone’s got a taste for blood.",
    "A retired schoolteacher discovers the killer lives on her crossword grid.",
    "A ghost-hunting granny stumbles upon a very real corpse.",
    "A bed and breakfast with a perfect view—and a perfectly placed body.",
    "A garden tour ends with a dead guest and a missing bouquet.",
    "She opened a bookstore for peace and quiet, not police tape.",
    "The town’s pie contest gets heated when one judge ends up dead.",
    "She hosts murder mystery parties—until one turns into the real thing.",
    "A sleepy coastal town hides secrets between its antique shop shelves.",
    "A knitting pattern reveals more than just stitches—it maps a crime.",
    "A vintage dress shop owner unzips a killer’s past.",
    "An old journal, a secret recipe, and one poisoned potluck.",
    "A matchmaking aunt plays Cupid—until one match ends in murder.",
    "A cozy cabin, a snowstorm, and one guest who won’t leave alive.",
    "A gardening blogger digs up more than tulip bulbs in her backyard.",
    "Her dog walker job turns into a deadly chase through the suburbs.",
    "A candle-making class ends with a whiff of something far worse than wax."
  ];

  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
      quote: "A reader lives a thousand lives before he dies. – George R.R. Martin"
    },
    {
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
      quote: "Books are a uniquely portable magic. – Stephen King"
    },
    {
      url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353",
      quote: "Reading gives us someplace to go when we have to stay where we are. – Mason Cooley"
    },
    {
      url: "https://images.unsplash.com/photo-1532012197267-da84d127e765",
      quote: "Once you learn to read, you will be forever free. – Frederick Douglass"
    },
    {
      url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66",
      quote: "A room without books is like a body without a soul. – Cicero"
    },
    {
      url: "https://images.unsplash.com/photo-1529634892444-c1f5d43f982b",
      quote: "So many books, so little time. – Frank Zappa"
    },
    {
      url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d",
      quote: "Books are mirrors: you only see in them what you already have inside you. – Carlos Ruiz Zafón"
    },
    {
      url: "https://images.unsplash.com/photo-1496104679561-38d6b3c2677d",
      quote: "Reading is essential for those who seek to rise above the ordinary. – Jim Rohn"
    },
    {
      url: "https://images.unsplash.com/photo-1519682577862-22b62b24e493",
      quote: "That’s the thing about books. They let you travel without moving your feet. – Jhumpa Lahiri"
    },
    {
      url: "https://images.unsplash.com/photo-1590608897129-79da93edc78c",
      quote: "Between the pages of a book is a lovely place to be."
    },
    {
      url: "https://images.unsplash.com/photo-1513415564515-763d91423bdd",
      quote: "Books open your mind, broaden your mind, and strengthen you as nothing else can. – William Feather"
    },
    {
      url: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4",
      quote: "There is no friend as loyal as a book. – Ernest Hemingway"
    },
    {
      url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
      quote: "Reading is dreaming with open eyes."
    },
    {
      url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
      quote: "Today a reader, tomorrow a leader. – Margaret Fuller"
    }
  ];


  // Simulate latest books as the last added ones
  const latestReleases = books.slice(-5).reverse();

  // Recommended books (randomly picked)
  const recommended = books.filter((_, idx) => idx % 5 === 0).slice(0, 5);

  return (
    <>
      <header className="hero" style={{ backgroundImage: `url(${heroImages[heroIndex].url})` }}>
        <div className="overlay">
          <nav className="navbar">
            <h1 className="logo"> 🦉ReadOwl🦉</h1>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link">About Us</Link>
              <Link to="/contact" className="nav-link">Contact Us</Link>
            </div>
            <div className="search-bar-container">
              <input
                type="text"
                className="hero-search"
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="search-button"
                onClick={() => {
                  // Trigger search manually if needed (search already filters live)
                }}
              >
                🔍
              </button>
            </div>


            <div className="nav-actions">
              <select className="theme-selector" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="light">☀️ Light</option>
                <option value="dark">🌙 Dark</option>
                <option value="aurora">🌌 Aurora</option>
                <option value="pastel">🍬 Pastel</option>
                <option value="nature">🌿 Nature</option>
                <option value="vintage">📜 Vintage</option>
              </select>

              <button className="theme-toggle" onClick={() => setShowFavorites(!showFavorites)}>
                {showFavorites ? "All Books" : "Show Favorites"}
              </button>
            </div>
          </nav>

          <div className="hero-quote">
            <blockquote>“{heroImages[heroIndex].quote}”</blockquote>
          </div>
        </div>
      </header>

      {/* Latest Releases Section */}
      <section className="latest-releases">
        <h2 className="section-title">📚 Latest Releases</h2>
        <div className="latest-grid">
          {latestReleases.length > 0 ? (
            latestReleases.map((book, index) => {
              if (!book) return null; // Skip undefined entries
              const randomDescription = placeholderDescriptions[index % placeholderDescriptions.length];

              return (
                <div key={book.file || index} className="latest-card" onClick={() => openReaderTab(book)}>
                  <img
                    src={`https://picsum.photos/seed/${encodeURIComponent(book.name || "placeholder")}/160/230`}
                    alt={book.name || "Book cover"}
                    loading="lazy"
                    decoding="async"
                  />
                  <h4>{book.name || "Untitled"}</h4>
                  <p className="latest-description">
                    {book.description || randomDescription}
                  </p>
                </div>
              );
            })
          ) : (
            <p>No recent releases found.</p>
          )}
        </div>
      </section>


      {/* Main Content: Books + Sidebar */}
      <div className="main-container">
        <div className="library-container">
          <h1>📒All Books</h1>
          <div className="filters">
            <label>
              Genre:
              <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Romance">Romance</option>
                <option value="Mystery">Mystery</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Horror">Horror</option>
                {/* Add more genres based on your actual data */}
              </select>
            </label>

            <label>
              Sort:
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="default">Default</option>
                <option value="asc">A → Z</option>
                <option value="desc">Z → A</option>
              </select>
            </label>
          </div>

          <div className="book-grid">
            {filteredBooks.length === 0 ? (
              <p className="no-results">No books found.</p>
            ) : (
              filteredBooks.map((book, index) => {
                const randomDescription = placeholderDescriptions[index % placeholderDescriptions.length];

                return (
                  <div key={book.file || index} className="book-card" onClick={() => openReaderTab(book)}>
                    <img
                      src={`https://picsum.photos/seed/${encodeURIComponent(book.name)}/150/220`}
                      alt="Book cover"
                      className="book-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="book-info">
                      <h3 className="book-title">
                        {book.name || "Untitled"}{favorites.includes(book.file) && <span> ★</span>}
                      </h3>
                      <p className="book-type">{(book.type || "Unknown").toUpperCase()}</p>
                      <p className="book-description">{book.description || randomDescription}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recommended Sidebar */}
        <aside className="sidebar">
          <h3 className="sidebar-title">✨ Recommended for You</h3>
          {recommended.map((book, index) => {
            const randomDescription = placeholderDescriptions[index % placeholderDescriptions.length];

            return (
              <div key={book.file} className="sidebar-book" onClick={() => openReaderTab(book)}>
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(book.name)}/80/120`}
                  alt={book.name}
                  loading="lazy"
                />
                <div className="sidebar-info">
                  <h4>{book.name}</h4>
                  <p className="sidebar-type">{(book.type || "Unknown").toUpperCase()}</p>
                  <p className="sidebar-description">
                    {book.description || randomDescription}
                  </p>
                </div>
              </div>
            );
          })}
        </aside>

      </div>
    </>
  );
}
