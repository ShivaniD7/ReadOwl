import React from "react";
import { Link } from "react-router-dom";
import "./PageStyles.css";

export default function Contact() {
    return (
        <>
            <div
                className="hero-banner"
                style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1532012197267-da84d127e765)`,
                }}
            >
                <div className="hero-banner-overlay">
                    <h1>📬 Contact Us</h1>
                    <p>“Let’s connect over the love of books.”</p>
                </div>
            </div>

            <div className="page-content">
                <p data-emoji="💌">
                    We'd love to hear from you! Whether it's feedback, suggestions, or just to say hello — feel free to reach out.
                </p>

                <ul>
                    <li>📧 Email: <a href="mailto:contact@readowl.com">contact@readowl.com</a></li>
                    <li>🐦 Twitter: <a href="https://twitter.com/readowl" target="_blank" rel="noreferrer">@readowl</a></li>
                    <li>📸 Instagram: <a href="https://instagram.com/readowl" target="_blank" rel="noreferrer">@readowl</a></li>
                </ul>

                <p data-emoji="📚">
                    Have a book recommendation for us? Spotted a typo? Or maybe you’re an indie author looking to share your story with the world? We’re all ears!
                </p>

                <p data-emoji="💬">
                    Our team is small but passionate, and we read every message that comes our way. You can also DM us on social media — we're always up for a bookish chat!
                </p>

                <p data-emoji="🌟">
                    Thank you for being a part of the ReadOwl community. Together, let’s make the world a little more magical, one story at a time.
                </p>
            </div>

            <Link to="/" className="back-link">← Back to Home</Link>
        </>
    );
}
