// server/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Enable frontend to access API
app.use(cors());

// Serve static files from /books
app.use('/books', express.static(path.join(__dirname, 'books')));

// List all .pdf and .epub files from /books
app.get('/api/books', (req, res) => {
    const booksDir = path.join(__dirname, 'books');

    fs.readdir(booksDir, (err, files) => {
        if (err) {
            console.error("Error reading books directory:", err);
            return res.status(500).json({ error: "Failed to read books folder" });
        }

        const bookList = files
            .filter(file => file.endsWith('.pdf') || file.endsWith('.epub'))
            .map(file => ({
                name: path.parse(file).name,
                file,
                type: file.endsWith('.pdf') ? 'pdf' : 'epub',
                url: `/books/${file}`
            }));

        res.json(bookList);
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
