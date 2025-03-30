import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ePub from "epubjs";
import {
    FaArrowLeft,
    FaHeart,
    FaRegHeart,
    FaFont,
    FaSearchPlus,
    FaSearchMinus,
    FaBookmark,
    FaBookOpen,
    FaList,
    FaSync,
    FaArrowRight,
    FaArrowLeft as FaPrev, FaYoutube, FaBook, FaVolumeUp, FaVolumeMute, FaPlay, FaStop,
    FaLanguage
} from "react-icons/fa";
import "../styles/EPUBReader.css";

export default function EPUBReader() {
    const [theme, setTheme] = useState("light");
    const { filename } = useParams();
    const navigate = useNavigate();
    const viewerRef = useRef(null);
    const renditionRef = useRef(null);
    const bookRef = useRef(null);
    const pageFlipSound = useRef(new Audio("/sounds/page-flip.mp3"));
    const [fontSize, setFontSize] = useState(100);
    const [zoom, setZoom] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isScrollMode, setIsScrollMode] = useState(false);
    const [progress, setProgress] = useState(0);
    const [bookmarks, setBookmarks] = useState([]);
    const [showDictionary, setShowDictionary] = useState(false);
    const [dictPosition, setDictPosition] = useState(() => {
        const saved = localStorage.getItem("dictPosition");
        return saved ? JSON.parse(saved) : { x: 100, y: 100 };
    });
    const [dictSize, setDictSize] = useState({ width: 300, height: 200 });
    const [isMinimized, setIsMinimized] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const dictRef = useRef(null);
    const resizing = useRef(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [speechRate, setSpeechRate] = useState(1);
    const [autoRead, setAutoRead] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const [showTTSSettings, setShowTTSSettings] = useState(false);
    const [fontFamily, setFontFamily] = useState("default");
    const dragOffsetBookmark = useRef({ x: 0, y: 0 });
    const [bookmarkPosition, setBookmarkPosition] = useState({ x: 90, y: 80 });
    const startDragBookmark = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffsetBookmark.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        window.addEventListener("mousemove", onDragBookmark);
        window.addEventListener("mouseup", stopDragBookmark);
    };

    const onDragBookmark = (e) => {
        const newPos = {
            x: e.clientX - dragOffsetBookmark.current.x,
            y: e.clientY - dragOffsetBookmark.current.y,
        };
        setBookmarkPosition(newPos);
    };

    const stopDragBookmark = () => {
        window.removeEventListener("mousemove", onDragBookmark);
        window.removeEventListener("mouseup", stopDragBookmark);
    };



    const startListening = () => {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onerror = (e) => {
            console.error(e.error);
            setIsListening(false);
            alert("Error recognizing speech.");
        };
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = dictRef.current.querySelector(".dictionary-input");
            if (input) {
                input.value = transcript;
                input.focus();
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };


    const handleSpeak = () => {
        const iframe = viewerRef.current?.querySelector("iframe");
        const doc = iframe?.contentDocument || iframe?.contentWindow?.document;

        if (!doc) return alert("Unable to access EPUB content.");

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const text = doc.body.innerText.trim();
            if (!text) return alert("No readable text found.");

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = selectedVoice;
            utterance.rate = speechRate;

            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };



    const startDrag = (e) => {
        const rect = dictRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        window.addEventListener("mousemove", onDrag);
        window.addEventListener("mouseup", stopDrag);
    };

    const onDrag = (e) => {
        const newPos = {
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
        };
        setDictPosition(newPos);
        localStorage.setItem("dictPosition", JSON.stringify(newPos));
    };

    const stopDrag = () => {
        window.removeEventListener("mousemove", onDrag);
        window.removeEventListener("mouseup", stopDrag);
    };
    const startResize = (e) => {
        resizing.current = { startX: e.clientX, startY: e.clientY, ...dictSize };
        window.addEventListener("mousemove", onResize);
        window.addEventListener("mouseup", stopResize);
    };

    const onResize = (e) => {
        if (!resizing.current) return;
        const deltaX = e.clientX - resizing.current.startX;
        const deltaY = e.clientY - resizing.current.startY;
        setDictSize({
            width: Math.max(200, resizing.current.width + deltaX),
            height: Math.max(150, resizing.current.height + deltaY),
        });
    };

    const stopResize = () => {
        resizing.current = false;
        window.removeEventListener("mousemove", onResize);
        window.removeEventListener("mouseup", stopResize);
    };


    const getThemeStyles = (theme) => {
        switch (theme) {
            case "dark":
                return {
                    body: {
                        background: "#1e1e1e",
                        color: "#f5f5f5",
                        accentColor: "#c74d7d",
                        accentHover: "#cc6b4e",
                        secondaryColor: "#967322",
                        secondaryHover: "#c9983f",
                        highlightColor: "#b0c94e",
                        cardBg: "#a7d1e0",
                        borderColor: "#719fb8",
                        textMuted: "#314350",
                        glow: "", // Optional: "0 0 10px #c74d7d"
                    },
                };
            case "aurora":
                return {
                    body: {
                        background: "linear-gradient(to bottom, #00111c, #004466)",
                        color: "#e0f7fa",
                        accentColor: "#c74d7d",
                        accentHover: "#cc6b4e",
                        secondaryColor: "#967322",
                        secondaryHover: "#c9983f",
                        highlightColor: "#b0c94e",
                        cardBg: "#a7d1e0",
                        borderColor: "#719fb8",
                        textMuted: "#314350",
                        glow: "",
                    },
                };
            case "pastel":
                return {
                    body: {
                        background: "#fff1f8",
                        color: "#4b4b4b",
                        accentColor: "#c74d7d",
                        accentHover: "#cc6b4e",
                        secondaryColor: "#967322",
                        secondaryHover: "#c9983f",
                        highlightColor: "#b0c94e",
                        cardBg: "#a7d1e0",
                        borderColor: "#719fb8",
                        textMuted: "#314350",
                        glow: "",
                    },
                };
            case "nature":
                return {
                    body: {
                        background: "#264d3d",        // deep forest green
                        color: "#f0f5e9",             // light sage text
                        accentColor: "#81b29a",       // eucalyptus green
                        accentHover: "#a8dadc",       // misty aqua
                        secondaryColor: "#f4a261",    // soft clay orange
                        secondaryHover: "#e76f51",    // terracotta red
                        highlightColor: "#d9ed92",    // limey leaf yellow
                        cardBg: "#3a5a40",            // dark olive for cards
                        borderColor: "#a3b18a",       // muted moss border
                        textMuted: "#cce3dc",         // pale leaf-muted text
                        glow: "0 0 10px #81b29a",     // soft green glow
                    },
                };

            case "vintage":
                return {
                    body: {
                        background: "#8b6a4e",
                        color: "#d7c6a8",
                        fontFamily: "'Georgia', serif",
                        accentColor: "#c74d7d",
                        accentHover: "#cc6b4e",
                        secondaryColor: "#967322",
                        secondaryHover: "#c9983f",
                        highlightColor: "#b0c94e",
                        cardBg: "#a7d1e0",
                        borderColor: "#719fb8",
                        textMuted: "#314350",
                        glow: "",
                    },
                };
            case "light":
            default:
                return {
                    body: {
                        background: "#ffffff",
                        color: "#000000",
                        accentColor: "#c74d7d",
                        accentHover: "#cc6b4e",
                        secondaryColor: "#967322",
                        secondaryHover: "#c9983f",
                        highlightColor: "#b0c94e",
                        cardBg: "#a7d1e0",
                        borderColor: "#719fb8",
                        textMuted: "#314350",
                        glow: "",
                    },
                };
            case "colorblind":
                return {
                    body: {
                        background: "#f8f9fa", // very light grey, easier on the eyes than pure white
                        color: "#000000",
                        fontFamily: '"Arial", sans-serif',
                    },
                    "::selection": {
                        background: "#ffcc00", // yellow highlight (safe and high contrast)
                        color: "#000000",
                    },
                    a: {
                        color: "#0072B2", // Colorblind-safe blue
                        textDecoration: "underline",
                    },
                    h1: { color: "#D55E00" }, // Colorblind-safe orange/red
                    h2: { color: "#009E73" }, // Colorblind-safe green
                    h3: { color: "#CC79A7" }, // Colorblind-safe pink/magenta
                    strong: { color: "#E69F00" }, // Emphasis with bold orange
                    em: { color: "#56B4E9" }, // Soft blue for italics
                    code: {
                        background: "#eaeaea",
                        color: "#000000",
                        padding: "2px 4px",
                        borderRadius: "4px",
                        fontFamily: "'Courier New', monospace"
                    }
                };


        }
    };

    useEffect(() => {
        const book = ePub(`http://localhost:5000/books/${filename}`);
        bookRef.current = book;

        const rendition = book.renderTo(viewerRef.current, {
            width: "100%",
            height: "100%",
            flow: isScrollMode ? "scrolled" : "paginated",
            allowScriptedContent: true,
        });

        renditionRef.current = rendition;

        renditionRef.current.themes.register("custom", {
            ...getThemeStyles(theme),
            body: {
                ...getThemeStyles(theme).body,
                "font-size": `${fontSize * zoom}% !important`,
                "font-family":
                    fontFamily === "default"
                        ? "inherit"
                        : fontFamily === "dyslexic"
                            ? "'OpenDyslexic', 'Arial', sans-serif"
                            : fontFamily === "lexend"
                                ? "'Lexend', sans-serif"
                                : fontFamily === "atkinson"
                                    ? "'Atkinson Hyperlegible', sans-serif"
                                    : fontFamily,
            },
        });

        rendition.themes.select("custom");

        rendition.display();

        const savedCfi = localStorage.getItem(`bookmark:${filename}`);
        if (savedCfi) rendition.display(savedCfi);

        book.ready
            .then(() => book.locations.generate(1600))
            .then(() => {
                rendition.on("relocated", (location) => {
                    const viewer = viewerRef.current.querySelector("iframe");
                    if (viewer) {
                        viewer.classList.add("fade-out");
                        setTimeout(() => {
                            viewer.classList.remove("fade-out");
                        }, 200);
                    }
                    try {
                        const percentage = book.locations.percentageFromCfi(location.start.cfi);
                        setProgress(Math.floor(percentage * 100));
                        localStorage.setItem(`bookmark:${filename}`, location.start.cfi);
                    } catch {
                        setProgress(0);
                    }
                    if (autoRead) {
                        const iframe = viewerRef.current?.querySelector("iframe");
                        const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
                        if (doc) {
                            const text = doc.body.innerText.trim();
                            if (text) {
                                window.speechSynthesis.cancel();
                                const utterance = new SpeechSynthesisUtterance(text);
                                utterance.voice = selectedVoice;
                                utterance.rate = speechRate;
                                window.speechSynthesis.speak(utterance);
                                setIsSpeaking(true);
                                utterance.onend = () => setIsSpeaking(false);
                            }
                        }
                    }

                });
            });

        const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setIsFavorite(savedFavorites.includes(filename));

        const storedBookmarks = JSON.parse(localStorage.getItem(`bookmarks:${filename}`) || "[]");
        setBookmarks(storedBookmarks);

        return () => book.destroy();
    }, [filename, isScrollMode]);

    useEffect(() => {
        if (renditionRef.current) {
            renditionRef.current.themes.register("custom", {
                ...getThemeStyles(theme),
                body: {
                    ...getThemeStyles(theme).body,
                    "font-size": `${fontSize * zoom}% !important`,
                    "font-family":
                        fontFamily === "default"
                            ? "inherit"
                            : fontFamily === "dyslexic"
                                ? "'OpenDyslexic', 'Arial', sans-serif"
                                : fontFamily === "lexend"
                                    ? "'Lexend', sans-serif"
                                    : fontFamily === "atkinson"
                                        ? "'Atkinson Hyperlegible', sans-serif"
                                        : fontFamily,
                },
            });
            renditionRef.current.themes.select("custom");
        }
    }, [fontSize, zoom, theme, fontFamily]);
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            if (availableVoices.length && !selectedVoice) {
                setSelectedVoice(availableVoices[0]);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);


    useEffect(() => {
        const handleSelected = (cfiRange, contents) => {
            renditionRef.current.annotations.add(
                "highlight",
                cfiRange,
                {
                    id: `highlight-${Date.now()}`,
                    type: "highlight",
                    style: {
                        backgroundColor: "var(--highlight-color)",
                        color: "#000",
                        opacity: "0.6",

                    },
                },
                (e) => {
                    renditionRef.current.annotations.remove(cfiRange, "highlight");
                }
            );
            contents.window.getSelection().removeAllRanges();
        };

        if (renditionRef.current) {
            renditionRef.current.on("selected", handleSelected);
        }

        return () => {
            if (renditionRef.current) {
                renditionRef.current.off("selected", handleSelected);
            }
        };
    }, []);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "ArrowRight") {
                pageFlipSound.current.currentTime = 0;
                pageFlipSound.current.play();
                renditionRef.current?.next();
            }
            if (e.key === "ArrowLeft") {
                pageFlipSound.current.currentTime = 0;
                pageFlipSound.current.play();
                renditionRef.current?.prev();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    const toggleFavorite = () => {
        const saved = JSON.parse(localStorage.getItem("favorites") || "[]");
        const updated = isFavorite
            ? saved.filter((item) => item !== filename)
            : [...saved, filename];
        localStorage.setItem("favorites", JSON.stringify(updated));
        setIsFavorite(!isFavorite);
    };

    return (
        <div
            className="epub-reader"
            style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}
        >
            <header className="epub-header">
                <h3 style={{ margin: 0 }}>📖 {filename}</h3>
            </header>
            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>

            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                <div className="sidebar-epub">
                    <div className="icon-btn" onClick={() => navigate("/")}>
                        <FaArrowLeft />
                        <span>Back to Library</span>
                    </div>

                    <div className="icon-btn" onClick={toggleFavorite}>
                        {isFavorite ? <FaHeart /> : <FaRegHeart />}
                        <span>{isFavorite ? "Unfavorite" : "Favorite"}</span>
                    </div>

                    <div className="icon-btn" onClick={() => setIsScrollMode(!isScrollMode)}>
                        <FaSync />
                        <span>{isScrollMode ? "Paged View" : "Scroll Mode"}</span>
                    </div>

                    <div className="icon-btn">
                        <FaFont />
                        <span>
                            Font Size:
                            <input
                                type="range"
                                min="80"
                                max="150"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="reader-slider"
                            />
                        </span>
                    </div>

                    <div className="icon-btn" onClick={() => setZoom((z) => z + 0.1)}>
                        <FaSearchPlus />
                        <span>Zoom In</span>
                    </div>

                    <div className="icon-btn" onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}>
                        <FaSearchMinus />
                        <span>Zoom Out</span>
                    </div>

                    <div
                        className="icon-btn"
                        onClick={() => {
                            renditionRef.current.prev();
                            pageFlipSound.current.play();
                        }}
                    >
                        <FaPrev />
                        <span>Previous Page</span>
                    </div>

                    <div
                        className="icon-btn"
                        onClick={() => {
                            renditionRef.current.next();
                            pageFlipSound.current.play();
                        }}
                    >
                        <FaArrowRight />
                        <span>Next Page</span>
                    </div>

                    <div
                        className="icon-btn"
                        onClick={() => {
                            const location = renditionRef.current.currentLocation();
                            if (!location) return;
                            const title = prompt("Bookmark Title?");
                            if (!title) return;
                            const note = prompt("Note (optional):");
                            const bookmark = { cfi: location.start.cfi, title, note };
                            const updated = [...bookmarks, bookmark];
                            setBookmarks(updated);
                            localStorage.setItem(`bookmarks:${filename}`, JSON.stringify(updated));
                        }}
                    >
                        <FaBookmark />
                        <span>Add Bookmark</span>
                    </div>
                    <div className="icon-btn">
                        <FaFont />
                        <span>
                            Font:
                            <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="font-selector"
                            >
                                <option value="default">Default</option>
                                <option value="serif">Serif</option>
                                <option value="sans-serif">Sans-Serif</option>
                                <option value="monospace">Monospace</option>
                                <option value="dyslexic">OpenDyslexic</option>
                                <option value="lexend">Lexend</option>
                                <option value="atkinson">Atkinson Hyperlegible</option>
                            </select>
                        </span>
                    </div>

                    <div className="icon-btn">
                        <FaBookOpen />
                        <span>Progress: {progress}%</span>
                    </div>
                    <div className="icon-btn">
                        <FaList />
                        <span>
                            Theme:
                            <select
                                className="theme-selector"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                            >
                                <option value="light">☀️ Light</option>
                                <option value="dark">🌙 Dark</option>
                                <option value="aurora">🌌 Aurora</option>
                                <option value="pastel">🍬 Pastel</option>
                                <option value="nature">🌿 Nature</option>
                                <option value="vintage">📜 Vintage</option>
                                <option value="colorblind">♿️ Colorblind</option>
                            </select>
                        </span>
                    </div>
                    <div
                        className="icon-btn"
                        onClick={() => window.open("https://www.youtube.com", "_blank")}
                    >
                        <FaYoutube />
                        <span>YouTube</span>
                    </div>

                    <div
                        className="icon-btn"
                        onClick={() => window.open("https://translate.google.co.in/?sl=auto&tl=en&op=translate", "_blank")}
                    >
                        <FaLanguage />
                        <span>Google Translate</span>
                    </div>

                    <div
                        className="icon-btn"
                        onClick={() => setShowDictionary((prev) => !prev)}
                    >
                        <FaBook />
                        <span>Dictionary</span>
                    </div>

                    <div className="icon-btn" onClick={handleSpeak}>
                        {isSpeaking ? <FaStop /> : <FaPlay />}
                        <span>{isSpeaking ? "Stop Speaking" : "Speak Text"}</span>
                    </div>

                    <div className="icon-btn" onClick={() => setShowTTSSettings(prev => !prev)}>
                        <FaVolumeUp />
                        <span>TTS Settings</span>
                    </div>
                </div>

                <div
                    ref={viewerRef}
                    className="epub-viewer"
                    style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
                />
                {showDictionary && (
                    <div
                        ref={dictRef}
                        className="dictionary-panel"
                        style={{
                            left: `${dictPosition.x}px`,
                            top: `${dictPosition.y}px`,
                            width: `${dictSize.width}px`,
                            height: `${dictSize.height}px`,
                        }}
                    >
                        <div onMouseDown={startDrag} className="dictionary-header">
                            <span>📘 Dictionary</span>
                            <div>
                                <button onClick={() => setIsMinimized(!isMinimized)}>
                                    {isMinimized ? "🔼" : "🔽"}
                                </button>
                                <button onClick={() => setShowDictionary(false)}>✖</button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <div className="dictionary-body">
                                <input
                                    type="text"
                                    placeholder="Type a word..."
                                    className="dictionary-input"
                                    onKeyDown={async (e) => {
                                        if (e.key === "Enter") {
                                            const word = e.target.value.trim();
                                            if (!word) return alert("Please enter a word.");
                                            try {
                                                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                                                const data = await res.json();
                                                const definition = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;
                                                if (!definition) throw new Error();
                                                alert(`Definition of "${word}":\n${definition}`);
                                            } catch {
                                                alert("Sorry, no definition found.");
                                            }
                                        }
                                    }}
                                />
                                <button
                                    onClick={startListening}
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        border: "1px solid #3498db",
                                        backgroundColor: isListening ? "#2980b9" : "#3498db",
                                        color: "white",
                                        cursor: "pointer",
                                        marginTop: "8px",
                                        fontSize: "0.95rem",
                                        transition: "background 0.2s ease",
                                    }}
                                >
                                    {isListening ? "🎙️ Listening..." : "🎤 Speak Word"}
                                </button>

                                <p className="dictionary-tip">Press Enter to look up</p>
                            </div>
                        )}

                        <div onMouseDown={startResize} className="dictionary-resize-handle" />
                    </div>
                )}




            </div>
            {showTTSSettings && (
                <div style={{
                    position: "absolute",
                    left: "80px",
                    top: "100px",
                    zIndex: 999,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
                    padding: "16px",
                    width: "250px",
                    fontFamily: "Segoe UI, sans-serif"
                }}>
                    <h4 style={{ marginTop: 0 }}>🔊 Text-to-Speech</h4>

                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>🎙 Voice</label>
                    <select
                        value={selectedVoice?.name}
                        onChange={(e) => {
                            const voice = voices.find((v) => v.name === e.target.value);
                            setSelectedVoice(voice);
                        }}
                        style={{ width: "100%", padding: "6px", marginBottom: "12px" }}
                    >
                        {voices.map((voice, idx) => (
                            <option key={idx} value={voice.name}>
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>

                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>⏱ Rate</label>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        style={{ width: "100%", marginBottom: "10px" }}
                    />
                    <div style={{ marginBottom: "10px" }}>{speechRate.toFixed(1)}x</div>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="checkbox"
                            checked={autoRead}
                            onChange={(e) => setAutoRead(e.target.checked)}
                        />
                        📖 Auto-read on page flip
                    </label>
                </div>
            )}
            {bookmarks.length > 0 && (
                <div
                    className="bookmark-manager"
                    onMouseDown={startDragBookmark}
                    style={{
                        position: "absolute",
                        top: `${bookmarkPosition.y}px`,
                        left: `${bookmarkPosition.x}px`,
                        // the rest of your styles
                        background: "#ffffff",
                        color: "#1f2937",
                        border: "2px solid var(--border-color, #ccc)",
                        borderRadius: "12px",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                        padding: "20px",
                        fontSize: "1.3rem",
                        width: "300px",
                        Height: "400px",
                        overflowY: "auto",
                        zIndex: 999,
                        fontFamily: '"Segoe UI", sans-serif',
                        cursor: "move", // 👈 optional visual cue
                    }}
                >

                    <h2>📑 Bookmarks</h2>
                    <ul style={{ fontSize: "1.1rem", padding: 0, listStyle: "none" }}>
                        {bookmarks.map((bm, i) => (
                            <li key={i} style={{ marginBottom: "12px" }}>
                                <button
                                    onClick={() => renditionRef.current.display(bm.cfi)}
                                    style={{ fontWeight: "bold", display: "block", fontSize: "1.5rem", marginBottom: "4px" }}
                                >
                                    {bm.title}
                                </button>
                                {bm.note && (
                                    <div
                                        style={{
                                            fontSize: "1.6rem",        // ⬅️ increased size
                                            color: "#222",
                                            background: "#f9f9f9",
                                            padding: "8px 10px",
                                            borderRadius: "6px",
                                            marginTop: "6px",
                                            border: "1px solid #ddd",
                                        }}
                                    >
                                        📝 {bm.note}
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        const updated = bookmarks.filter((_, idx) => idx !== i);
                                        setBookmarks(updated);
                                        localStorage.setItem(`bookmarks:${filename}`, JSON.stringify(updated));
                                    }}
                                    style={{ color: "red" }}
                                >
                                    ❌ Remove
                                </button>
                            </li>
                        ))}
                    </ul>

                </div>
            )}


        </div>
    );
}