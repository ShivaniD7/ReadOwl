import React from "react";
import { Link } from "react-router-dom";
import "./PageStyles.css";

export default function About() {
    return (
        <>
            <div
                className="hero-banner"
                style={{
                    backgroundImage: `url(https://images.unsplash.com/photo-1526304640581-d334cdbbf45e)`,
                }}
            >
                <div className="hero-banner-overlay">
                    <h1>📖 About ReadOwl</h1>
                    <p>“Where stories come to life — one page at a time.”</p>
                </div>
            </div>

            <div className="page-content">
                <p>
                    ReadOwl is your cozy corner of the internet for discovering, reading, and falling in love with books.
                    Whether you prefer fantasy, romance, mystery, or sci-fi, we’ve got something just for you.
                </p>
                <p>
                    Our mission is to make stories accessible, interactive, and unforgettable. 🦉✨
                </p>
                <p>
                    Explore beautifully designed stories, curated lists, and personalized recommendations tailored to your taste.
                    Dive into immersive reading experiences, save your favorites, and track your progress effortlessly.
                </p>
                <p>
                    With ReadOwl, reading isn’t just a hobby — it’s an adventure. Join a growing community of readers, share reviews,
                    and connect with fellow book lovers who cherish stories as much as you do.
                </p>
                <p>
                    Ready to turn the page? Start discovering your next favorite book today!
                </p>
            </div>

            <Link to="/" className="back-link">← Back to Home</Link>
        </>
    );
}
