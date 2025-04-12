import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PageStyles.css";

export default function Discussions() {
    const [username, setUsername] = useState("");
    const [threadText, setThreadText] = useState("");
    const [threads, setThreads] = useState([]);
    const [replyText, setReplyText] = useState({});
    const [editMode, setEditMode] = useState({});
    const [editReplyText, setEditReplyText] = useState({});

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("discussionThreads") || "[]");
        setThreads(stored);
    }, []);

    useEffect(() => {
        localStorage.setItem("discussionThreads", JSON.stringify(threads));
    }, [threads]);

    const postThread = () => {
        if (!username || !threadText.trim()) return alert("Please fill in your name and message.");
        const newThread = {
            id: Date.now(),
            username,
            text: threadText,
            replies: [],
        };
        setThreads([newThread, ...threads]);
        setThreadText("");
    };

    const replyToThread = (id) => {
        const text = replyText[id]?.trim();
        if (!username || !text) return;
        setThreads((prev) =>
            prev.map((t) =>
                t.id === id
                    ? { ...t, replies: [...t.replies, { id: Date.now(), username, text }] }
                    : t
            )
        );
        setReplyText({ ...replyText, [id]: "" });
    };

    const deleteThread = (id) => {
        if (window.confirm("Delete this thread?")) {
            setThreads(threads.filter((t) => t.id !== id));
        }
    };

    const deleteReply = (threadId, replyId) => {
        if (window.confirm("Delete this reply?")) {
            setThreads(
                threads.map((t) =>
                    t.id === threadId
                        ? { ...t, replies: t.replies.filter((r) => r.id !== replyId) }
                        : t
                )
            );
        }
    };

    const startEditThread = (id, oldText) => {
        setEditMode({ ...editMode, [id]: true });
        setEditReplyText({ ...editReplyText, [id]: oldText });
    };

    const saveEditedThread = (id) => {
        const newText = editReplyText[id].trim();
        if (!newText) return;
        setThreads((prev) =>
            prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
        );
        setEditMode({ ...editMode, [id]: false });
    };

    const startEditReply = (threadId, replyId, oldText) => {
        const key = `${threadId}-${replyId}`;
        setEditMode({ ...editMode, [key]: true });
        setEditReplyText({ ...editReplyText, [key]: oldText });
    };

    const saveEditedReply = (threadId, replyId) => {
        const key = `${threadId}-${replyId}`;
        const newText = editReplyText[key].trim();
        if (!newText) return;
        setThreads((prev) =>
            prev.map((t) =>
                t.id === threadId
                    ? {
                        ...t,
                        replies: t.replies.map((r) =>
                            r.id === replyId ? { ...r, text: newText } : r
                        ),
                    }
                    : t
            )
        );
        setEditMode({ ...editMode, [key]: false });
    };
    useEffect(() => {
        const storedName = localStorage.getItem("discussionUsername");
        if (storedName) setUsername(storedName);
    }, []);

    useEffect(() => {
        localStorage.setItem("discussionUsername", username);
    }, [username]);

    return (
        <>
            <div
                className="discussions-hero"
                style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1516196252840-f9947d2bcb7a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
                }}
            >
                <div className="discussions-hero-overlay">
                    <h1>💬 Discussions</h1>
                    <p>Start a thread or join the conversation</p>
                </div>
            </div>

            <div className="discussions-page">
                <label>
                    Username:
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. ChattyReader"
                    />
                </label>

                <textarea
                    rows={3}
                    value={threadText}
                    onChange={(e) => setThreadText(e.target.value)}
                    placeholder="Start a new discussion..."
                />
                <button onClick={postThread}>Post Thread</button>

                <div style={{ marginTop: "2rem" }}>
                    {threads.length === 0 && <p>No discussions yet. Start one! 😊</p>}

                    {threads.map((t) => (
                        <div key={t.id} className="thread-card">
                            <h4>🧵 {t.username}</h4>
                            {editMode[t.id] ? (
                                <>
                                    <textarea
                                        value={editReplyText[t.id]}
                                        onChange={(e) =>
                                            setEditReplyText({ ...editReplyText, [t.id]: e.target.value })
                                        }
                                        rows={3}
                                    />
                                    <br />
                                    <button onClick={() => saveEditedThread(t.id)}>Save</button>
                                    <button onClick={() => setEditMode({ ...editMode, [t.id]: false })}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p>{t.text}</p>
                                    <button onClick={() => startEditThread(t.id, t.text)}>Edit</button>
                                    <button onClick={() => deleteThread(t.id)}>Delete</button>
                                </>
                            )}

                            <div className="replies">
                                {t.replies.map((r) => {
                                    const key = `${t.id}-${r.id}`;
                                    return (
                                        <div key={r.id}>
                                            <strong>{r.username}:</strong>{" "}
                                            {editMode[key] ? (
                                                <>
                                                    <textarea
                                                        value={editReplyText[key]}
                                                        onChange={(e) =>
                                                            setEditReplyText({ ...editReplyText, [key]: e.target.value })
                                                        }
                                                        rows={2}
                                                    />
                                                    <br />
                                                    <button onClick={() => saveEditedReply(t.id, r.id)}>Save</button>
                                                    <button
                                                        onClick={() => setEditMode({ ...editMode, [key]: false })}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{r.text}</span>
                                                    <button onClick={() => startEditReply(t.id, r.id, r.text)}>
                                                        Edit
                                                    </button>
                                                    <button onClick={() => deleteReply(t.id, r.id)}>Delete</button>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <textarea
                                rows={2}
                                placeholder="Reply to this thread..."
                                value={replyText[t.id] || ""}
                                onChange={(e) => setReplyText({ ...replyText, [t.id]: e.target.value })}
                            />
                            <br />
                            <button onClick={() => replyToThread(t.id)}>Reply</button>
                        </div>
                    ))}
                </div>
            </div>
            <Link to="/" className="back-link">← Back to Home</Link>
        </>
    );
}
