import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PageStyles.css";

export default function Reviews() {
    const [selected, setSelected] = useState(null); // 'book' or 'website'
    const [username, setUsername] = useState("");
    const [form, setForm] = useState({ name: "", rating: 0, tags: {}, text: "" });
    const [bookReviews, setBookReviews] = useState([]);
    const [siteReviews, setSiteReviews] = useState([]);
    const [hoverRating, setHoverRating] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", rating: 0, tags: {}, text: "" });

    useEffect(() => {
        setBookReviews(JSON.parse(localStorage.getItem("bookReviews") || "[]"));
        setSiteReviews(JSON.parse(localStorage.getItem("siteReviews") || "[]"));
        const savedUsername = localStorage.getItem("username") || "";
        setUsername(savedUsername);
    }, []);

    useEffect(() => {
        localStorage.setItem("bookReviews", JSON.stringify(bookReviews));
    }, [bookReviews]);

    useEffect(() => {
        localStorage.setItem("siteReviews", JSON.stringify(siteReviews));
    }, [siteReviews]);

    useEffect(() => {
        localStorage.setItem("username", username);
    }, [username]);

    const handleFormChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleTagChange = (tag, value) => {
        setForm({ ...form, tags: { ...form.tags, [tag]: value } });
    };

    const handleEditChange = (field, value) => {
        setEditForm({ ...editForm, [field]: value });
    };

    const handleEditTagChange = (tag, value) => {
        setEditForm({ ...editForm, tags: { ...editForm.tags, [tag]: value } });
    };

    const submitReview = () => {
        if (!username || !form.name || !form.text || !form.rating) return alert("Please fill in all fields.");
        const newReview = { id: Date.now(), username, ...form };

        if (selected === "book") {
            setBookReviews([...bookReviews, newReview]);
        } else {
            setSiteReviews([...siteReviews, newReview]);
        }

        setForm({ name: "", rating: 0, tags: {}, text: "" });
    };

    const deleteReview = (id) => {
        if (selected === "book") {
            setBookReviews(bookReviews.filter((r) => r.id !== id));
        } else {
            setSiteReviews(siteReviews.filter((r) => r.id !== id));
        }
    };

    const startEditReview = (review) => {
        setEditingId(review.id);
        setEditForm({ name: review.name, rating: review.rating, tags: review.tags, text: review.text });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: "", rating: 0, tags: {}, text: "" });
    };

    const saveEdit = (id) => {
        const updatedReview = { id, username, ...editForm };
        if (selected === "book") {
            setBookReviews(bookReviews.map((r) => (r.id === id ? updatedReview : r)));
        } else {
            setSiteReviews(siteReviews.map((r) => (r.id === id ? updatedReview : r)));
        }
        cancelEdit();
    };

    const getStarClass = (value, target) => {
        const rating = target ?? form.rating;
        return rating >= value ? "filled" : "";
    };

    const renderStarInput = (currentValue, setValue) => (
        <div className="star-rating">
            <label>Rating:</label>
            <div>
                {[...Array(10)].map((_, i) => {
                    const full = i + 1;
                    const half = i + 0.5;
                    return (
                        <span key={i} className="half-star-wrapper">
                            <span
                                className={`star half ${getStarClass(half, currentValue)}`}
                                onClick={() => setValue(half)}
                            >
                                ★
                            </span>
                            <span
                                className={`star full ${getStarClass(full, currentValue)}`}
                                onClick={() => setValue(full)}
                            >
                                ★
                            </span>
                        </span>
                    );
                })}
                <span style={{ marginLeft: "0.5rem" }}>{currentValue}/10</span>
            </div>
        </div>
    );

    const renderForm = () => {
        const isBook = selected === "book";
        const tags = isBook ? ["Plot", "Characters", "Writing"] : ["Design", "Content", "Functionality"];

        const reviews = isBook ? bookReviews : siteReviews;

        return (
            <fieldset>
                <legend>{isBook ? "📚 Book Review Form" : "🌐 Website Review Form"}</legend>

                <label>
                    Username:
                    <input
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. owl_reader_23"
                    />
                </label>

                <label>
                    {isBook ? "Book Title" : "Website Name"}:
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        placeholder={isBook ? "e.g. The Midnight Library" : "e.g. ReadOwl"}
                    />
                </label>

                {renderStarInput(form.rating, (val) => handleFormChange("rating", val))}

                {tags.map((tag) => (
                    <label key={tag}>
                        {tag}:
                        <input
                            type="text"
                            placeholder={`Your thoughts on ${tag.toLowerCase()}...`}
                            value={form.tags[tag.toLowerCase()] || ""}
                            onChange={(e) => handleTagChange(tag.toLowerCase(), e.target.value)}
                        />
                    </label>
                ))}

                <label>
                    Full Review:
                    <textarea
                        rows={5}
                        value={form.text}
                        onChange={(e) => handleFormChange("text", e.target.value)}
                        placeholder="Share your full thoughts here..."
                    />
                </label>

                <button onClick={submitReview}>Submit Review</button>

                <div style={{ marginTop: "1rem" }}>
                    <h3>🗂️ All {isBook ? "Book" : "Website"} Reviews</h3>
                    {reviews.map((r) => (
                        <div className="review-card" key={r.id}>
                            {editingId === r.id ? (
                                <>
                                    <label>
                                        Title:
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => handleEditChange("name", e.target.value)}
                                        />
                                    </label>
                                    {renderStarInput(editForm.rating, (val) => handleEditChange("rating", val))}
                                    {tags.map((tag) => (
                                        <label key={tag}>
                                            {tag}:
                                            <input
                                                type="text"
                                                value={editForm.tags[tag.toLowerCase()] || ""}
                                                onChange={(e) => handleEditTagChange(tag.toLowerCase(), e.target.value)}
                                            />
                                        </label>
                                    ))}
                                    <label>
                                        Review:
                                        <textarea
                                            rows={3}
                                            value={editForm.text}
                                            onChange={(e) => handleEditChange("text", e.target.value)}
                                        />
                                    </label>
                                    <button onClick={() => saveEdit(r.id)}>💾 Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <h4>{r.username} reviewed "{r.name}" — rated {r.rating}/10</h4>
                                    {Object.entries(r.tags).map(([key, value]) => (
                                        <p key={key}><strong>{key}:</strong> {value}</p>
                                    ))}
                                    <p>{r.text}</p>
                                    <button onClick={() => startEditReview(r)}>✏️ Edit</button>
                                    <button onClick={() => deleteReview(r.id)}>❌ Remove</button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </fieldset>
        );
    };

    return (
        <>
            <div
                className="hero-banner"
                style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1524985069026-dd778a71c7b4)`
                }}
            >
                <div className="hero-banner-overlay">
                    <h1>📢 Reviews</h1>
                    <p>Choose your review type and share your thoughts 🌟</p>
                </div>
            </div>

            <div className="review-form-container">
                <div className="toggle-buttons">
                    <button onClick={() => setSelected("book")} className={selected === "book" ? "active" : ""}>
                        📚 Book Review
                    </button>
                    <button onClick={() => setSelected("website")} className={selected === "website" ? "active" : ""}>
                        🌐 Website Review
                    </button>
                </div>

                {selected && renderForm()}
            </div>

            <Link to="/" className="back-link">← Back to Home</Link>
        </>
    );
}