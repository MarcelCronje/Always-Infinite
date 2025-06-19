// app.js
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Utility: Load file contents
function loadFile(folder, name) {
  const filePath = path.join(__dirname, 'views', folder, `${name}.html`);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

// Renderer: Create full HTML from layout, sections, components, and page
function renderPage(pageName, title = 'Always Infinite') {
  let layout = loadFile('layouts', 'main');
  let page = loadFile('pages', pageName);

  // Replace {{component:name}} with actual component HTML
  page = page.replace(/{{component:(.*?)}}/g, (_, name) => loadFile('components', name.trim()));

  // Replace {{section:name}} in layout with content
  layout = layout.replace(/{{section:(.*?)}}/g, (_, name) => loadFile('sections', name.trim()));

  // Inject the correct CSS file if it exists (e.g., /css/pages/home.css)
  const cssLink = `<link rel="stylesheet" href="/css/pages/${pageName}.css">`;
  layout = layout.replace('{{styles}}', cssLink);

  // Inject per-page JS if it exists
  const jsPath = `/js/pages/${pageName}.js`;
  const jsScript = `<script src="${jsPath}" defer></script>`;
  layout = layout.replace('{{scripts}}', jsScript);

  // Inject page content and title
  layout = layout.replace('{{content}}', page).replace('{{title}}', title);

  return layout;
}

// Routes
app.get('/', (req, res) => {
  const html = renderPage('home', 'Home | Always Infinite');
  res.send(html);
});
  

app.get('/about', (req, res) => {
  const html = renderPage('about', 'About | Always Infinite');
  res.send(html);
});

app.get('/contact', (req, res) => {
  const html = renderPage('contact', 'Contact | Always Infinite');
  res.send(html);
});

// Contact form handler
app.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'your-email@example.com',
    subject: `Contact Form Submission from ${name}`,
    text: `You have a new message from ${name} (${email}):\n\n${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Error sending email');
    }
    res.status(200).send('Email sent successfully');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
