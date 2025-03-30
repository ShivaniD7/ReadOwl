import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import {
    FaArrowLeft,
    FaHeart,
    FaRegHeart,
    FaFont,
    FaSearchPlus,
    FaSearchMinus,
    FaBookmark,
    FaBookOpen,
    FaArrowRight,
    FaSync,
    FaPlay,
    FaStop,
    FaBook,
    FaYoutube,
    FaCog,
    FaList,
    FaLanguage
} from "react-icons/fa";
import "../styles/PDFReader.css";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js?v=2.12.313`;

export default function PDFReader() {
    const { filename } = useParams();
    const navigate = useNavigate();
    const viewerRef = useRef(null);
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.2);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFavorite, setIsFavorite] = useState(
        JSON.parse(localStorage.getItem("favorites") || "[]").includes(filename)
    );
    const [isScrollMode, setIsScrollMode] = useState(false);
    const [progress, setProgress] = useState(0);
    const [textContent, setTextContent] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [speechRate, setSpeechRate] = useState(1);
    const [fontFamily, setFontFamily] = useState("default");
    const [fontSize, setFontSize] = useState(100);
    const [theme, setTheme] = useState("light");
    const [autoRead, setAutoRead] = useState(false); // Auto-read state
    const [showTTSSettings, setShowTTSSettings] = useState(false); // TTS settings dialog visibility
    const pageFlipSound = useRef(new Audio("/sounds/page-flip.mp3"));
    const [bookmarks, setBookmarks] = useState(() => {
        return JSON.parse(localStorage.getItem(`pdfBookmarks:${filename}`) || '[]');
    });

    const fullFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    const fileUrl = `http://localhost:5000/books/${fullFilename}`;
    const [showDictionary, setShowDictionary] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [highlights, setHighlights] = useState(() => {
        return JSON.parse(localStorage.getItem(`highlights:${filename}`) || '{}');
    });
    const dragOffsetBookmark = useRef({ x: 0, y: 0 });
    const [bookmarkPosition, setBookmarkPosition] = useState({ x: 90, y: 80 });

    const dictRef = useRef(null);
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

    const getThemeStyles = (theme) => {
        switch (theme) {
            case "dark":
                return {
                    backgroundColor: "#1e1e1e",
                    color: "#f5f5f5",
                };
            case "aurora":
                return {
                    background: "linear-gradient(to bottom, #00111c, #004466)",
                    color: "#e0f7fa",
                };
            case "pastel":
                return {
                    backgroundColor: "#fff1f8",
                    color: "#4b4b4b",
                };
            case "nature":
                return {
                    backgroundColor: "#264d3d",
                    color: "#f0f5e9",
                };
            case "vintage":
                return {
                    backgroundColor: "#8b6a4e",
                    color: "#d7c6a8",
                    fontFamily: "'Georgia', serif",
                };
            case "colorblind":
                return {
                    backgroundColor: "#f8f9fa", // very light grey
                    color: "#000000",
                    fontFamily: '"Arial", sans-serif',
                    selection: {
                        background: "#ffcc00",
                        color: "#000000",
                    },
                    headings: {
                        h1: { color: "#D55E00" },
                        h2: { color: "#009E73" },
                        h3: { color: "#CC79A7" },
                    },
                    strong: { color: "#E69F00" },
                    em: { color: "#56B4E9" },
                    code: {
                        background: "#eaeaea",
                        color: "#000000",
                        padding: "2px 4px",
                        borderRadius: "4px",
                        fontFamily: "'Courier New', monospace",
                    },
                };

            case "light":
            default:
                return {
                    backgroundColor: "#ffffff",
                    color: "#000000",
                };
        }
    };

    const themeStyle = getThemeStyles(theme);
    const themeFont = fontFamily === "default" ? themeStyle.fontFamily || "inherit" : fontFamily;

    const handleTextHighlight = () => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (!selectedText) return;

        const pageIndex = currentPage - 1;
        const confirmed = window.confirm(`Highlight: "${selectedText}"?`);

        if (confirmed) {
            const newHighlights = { ...highlights };
            newHighlights[pageIndex] = [...(newHighlights[pageIndex] || []), { text: selectedText }];

            setHighlights(newHighlights);
            localStorage.setItem(`highlights:${filename}`, JSON.stringify(newHighlights));
            selection.removeAllRanges();
        }
    };

    const startListening = () => {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            alert("Speech recognition not supported.");
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = dictRef.current.querySelector(".dictionary-input");
            if (input) {
                input.value = transcript;
                input.focus();
            }
        };
        recognition.start();
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "ArrowRight" && !isScrollMode && currentPage < numPages) {
                pageFlipSound.current.currentTime = 0;
                pageFlipSound.current.play();
                setCurrentPage(p => p + 1);
            }
            if (e.key === "ArrowLeft" && !isScrollMode && currentPage > 1) {
                pageFlipSound.current.currentTime = 0;
                pageFlipSound.current.play();
                setCurrentPage(p => p - 1);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [currentPage, numPages, isScrollMode]);

    useEffect(() => {
        if (numPages) {
            const percentage = Math.floor((currentPage / numPages) * 100);
            setProgress(percentage);
        }
    }, [currentPage, numPages]);

    const toggleFavorite = () => {
        const saved = JSON.parse(localStorage.getItem("favorites") || "[]");
        const updated = isFavorite
            ? saved.filter(f => f !== filename)
            : [...saved, filename];
        localStorage.setItem("favorites", JSON.stringify(updated));
        setIsFavorite(!isFavorite);
    };

    const handleSpeak = () => {
        const text = textContent[currentPage - 1];
        if (!text) return alert("No readable text found.");

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = selectedVoice;
            utterance.rate = speechRate;

            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const onLoadSuccess = async ({ numPages }) => {
        setNumPages(numPages);
        const textPromises = [];

        for (let i = 1; i <= numPages; i++) {
            textPromises.push(
                pdfjs.getDocument(fileUrl).promise
                    .then(pdf => pdf.getPage(i))
                    .then(page => page.getTextContent())
                    .then(textContent => {
                        const textItems = textContent.items.map(item => item.str);
                        return textItems.join(' '); // Join text items into a single string
                    })
            );
        }

        const texts = await Promise.all(textPromises);
        setTextContent(texts); // Store the text content for each page
    };

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

    // Draggable dialog functionality
    const dragOffset = useRef({ x: 0, y: 0 });

    const [dictPosition, setDictPosition] = useState(() => {
        const saved = localStorage.getItem("dictPosition");
        return saved ? JSON.parse(saved) : { x: 100, y: 100 };
    });
    const [dictSize, setDictSize] = useState({ width: 400, height: 250 });
    const [isMinimized, setIsMinimized] = useState(false);
    const resizing = useRef(false);

    // Drag logic
    const startDrag = (e) => {
        if (!dictRef.current) return; // ✅ Prevent crash

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

    // Resize logic
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

    return (
        <>
            <div
                className="pdf-reader"
                style={{
                    height: "100vh",
                    width: "100vw",
                    display: "flex",
                    flexDirection: "column",
                    fontFamily: themeFont,
                    fontSize: `${fontSize}%`,
                    backgroundColor: themeStyle.backgroundColor,
                    background: themeStyle.background,
                    color: themeStyle.color,
                }}
            >
                <header className="pdf-header">
                    <h3 style={{ margin: 0 }}>📖 {filename}</h3>
                </header>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>

                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    <div className="sidebar-pdf">
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
                                    <option value="'Lexend', sans-serif">Lexend</option>
                                    <option value="'Atkinson Hyperlegible', sans-serif">Atkinson Hyperlegible</option>
                                </select>
                            </span>
                        </div>

                        <div className="icon-btn" onClick={() => setScale((s) => Math.min(s + 0.1, 2))}>
                            <FaSearchPlus />
                            <span>Zoom In</span>
                        </div>


                        <div className="icon-btn" onClick={() => setScale((s) => Math.max(s - 0.1, 0.8))}>
                            <FaSearchMinus />
                            <span>Zoom Out</span>
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

                        <div
                            className="icon-btn"
                            onClick={() => window.open("https://translate.google.co.in/?sl=auto&tl=en&op=translate", "_blank")}
                        >
                            <FaLanguage />
                            <span>Google Translate</span>
                        </div>

                        <div className="icon-btn" onClick={() => {
                            if (currentPage > 1) {
                                pageFlipSound.current.currentTime = 0;
                                pageFlipSound.current.play();
                                setCurrentPage(p => Math.max(p - 1, 1));
                            }
                        }}>

                            <FaArrowLeft />
                            <span>Previous Page</span>
                        </div>

                        <div className="icon-btn" onClick={() => {
                            if (currentPage < numPages) {
                                pageFlipSound.current.currentTime = 0;
                                pageFlipSound.current.play();
                                setCurrentPage(p => Math.min(p + 1, numPages));
                            }
                        }}>

                            <FaArrowRight />
                            <span>Next Page</span>
                        </div>

                        <div className="icon-btn">
                            <FaBookOpen />
                            <span>Progress: {progress}%</span>
                        </div>

                        <div className="icon-btn" onClick={() => window.open("https://www.youtube.com", "_blank")}>
                            <FaYoutube />
                            <span>YouTube</span>
                        </div>

                        <div className="icon-btn" onClick={() => setShowDictionary(!showDictionary)}>
                            <FaBook />
                            <span>Dictionary</span>
                        </div>

                        <div className="icon-btn" onClick={handleSpeak}>
                            {isSpeaking ? <FaStop /> : <FaPlay />}
                            <span>{isSpeaking ? "Stop Speaking" : "Speak Text"}</span>
                        </div>

                        <div className="icon-btn" onClick={() => setShowTTSSettings(!showTTSSettings)}>
                            <FaCog />
                            <span>TTS Settings</span>
                        </div>
                    </div>

                    <div ref={viewerRef} className="pdf-viewer" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                        <Document file={fileUrl} onLoadSuccess={onLoadSuccess}>
                            {isScrollMode ? (
                                <div
                                    className="text-scroll-view"
                                    style={{ padding: "1rem", lineHeight: "1.6" }}
                                    onMouseUp={handleTextHighlight}
                                >
                                    {textContent.map((pageText, index) => {
                                        const pageHighlights = highlights[index] || [];
                                        let displayText = pageText;

                                        // Replace highlights with clickable <mark> spans
                                        pageHighlights.forEach((h, highlightIndex) => {
                                            const safeText = h.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                                            const regex = new RegExp(safeText, "g");

                                            // Replace matched text with a custom clickable marker
                                            displayText = displayText.replace(
                                                regex,
                                                `<mark class='highlight' data-page='${index}' data-index='${highlightIndex}'>${h.text}</mark>`
                                            );
                                        });

                                        return (
                                            <div
                                                key={index}
                                                style={{ marginBottom: "2rem" }}
                                                onClick={(e) => {
                                                    const mark = e.target.closest("mark.highlight");
                                                    if (mark) {
                                                        const page = Number(mark.getAttribute("data-page"));
                                                        const idx = Number(mark.getAttribute("data-index"));
                                                        const updated = { ...highlights };
                                                        updated[page].splice(idx, 1);
                                                        if (updated[page].length === 0) delete updated[page];
                                                        setHighlights(updated);
                                                        localStorage.setItem(`highlights:${filename}`, JSON.stringify(updated));
                                                    }
                                                }}
                                            >
                                                <h4>Page {index + 1}</h4>
                                                <p
                                                    dangerouslySetInnerHTML={{ __html: displayText }}
                                                    style={{ whiteSpace: "pre-wrap" }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Page pageNumber={currentPage} scale={scale} renderTextLayer={false} />
                            )}

                        </Document>

                    </div>
                </div>

                {
                    showTTSSettings && (
                        <div
                            id="tts-settings-dialog"
                            className="tts-settings-dialog"
                            onMouseDown={startDrag}
                            style={{
                                position: "absolute",
                                top: "20%",
                                left: "20%",
                                width: "300px",
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                                padding: "10px",
                                zIndex: 1000,
                            }}
                        >
                            <h4>TTS Settings</h4>
                            <div>
                                <label>Voice:</label>
                                <select
                                    value={selectedVoice?.name}
                                    onChange={(e) => {
                                        const voice = voices.find((v) => v.name === e.target.value);
                                        setSelectedVoice(voice);
                                    }}
                                >
                                    {voices.map((voice, idx) => (
                                        <option key={idx} value={voice.name}>
                                            {voice.name} ({voice.lang})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Reading Rate:</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={speechRate}
                                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                                />
                                <span>{speechRate.toFixed(1)}x</span>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={autoRead}
                                        onChange={(e) => setAutoRead(e.target.checked)}
                                    />
                                    Auto-read on page flip
                                </label>
                            </div>
                        </div>
                    )
                }
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
                            padding: "16px",
                            width: "250px",
                            maxHeight: "300px",
                            overflowY: "auto",
                            zIndex: 999,
                            fontFamily: '"Segoe UI", sans-serif',
                            cursor: "move", // 👈 optional visual cue
                        }}
                    >

                        <h4>📑 Bookmarks</h4>
                        <ul>
                            {bookmarks.map((bm, i) => (
                                <li key={i}>
                                    <button onClick={() => setCurrentPage(bm.page)}>{bm.title}</button>
                                    <button
                                        onClick={() => {
                                            const updated = bookmarks.filter((_, idx) => idx !== i);
                                            setBookmarks(updated);
                                            localStorage.setItem(`pdfBookmarks:${filename}`, JSON.stringify(updated));
                                        }}
                                    >
                                        ❌
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div >
        </>
    );
}