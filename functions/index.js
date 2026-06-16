const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

admin.initializeApp();
const db = admin.firestore();

// TODO: Replace with your actual Gemini API Key or use process.env.GEMINI_API_KEY
// Ideally set via: firebase functions:config:set gemini.key="YOUR_KEY"
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBSoiYGbxMhzNXgoIXi0ZFxwOiInwCWIhs";
const genAI = new GoogleGenerativeAI(API_KEY);

const TOPICS = [
    "SEO Optimization Tips",
    "Digital Marketing Trends 2026",
    "Content Strategy for Startups",
    "AI in Content Creation",
    "Technical SEO Checklist",
    "Google Search Algorithm Updates",
    "Keyword Research Techniques",
    "Backlink Building Strategies"
];

async function generateContent() {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const prompt = `Write a blog post about "${randomTopic}". 
  Provide the output in JSON format with the following fields:
  - title: A catchy, SEO-friendly title.
  - content: The blog post content in HTML format (use <h2>, <p>, <ul>, <li> tags).
  - tags: An array of 3-5 relevant keywords.
  - slug: A URL-friendly slug based on the title.
  - description: A short meta description (150-160 characters).
  
  Make the content informative, engaging, and at least 300 words long.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up JSON string if it contains markdown formatting
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const postData = JSON.parse(jsonStr);

        postData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        postData.topic = randomTopic;

        await db.collection("posts").add(postData);
        console.log(`Successfully created post: ${postData.title}`);
        return postData;
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
}

// Scheduled trigger: Runs every 5 minutes
exports.scheduledPost = onSchedule("every 5 minutes", async (event) => {
    await generateContent();
});

// Serve Post with SEO Tags
exports.servePost = onRequest(async (req, res) => {
    const slug = req.path.split('/').pop(); // Extract slug from URL

    if (!slug) {
        res.redirect('/board.html');
        return;
    }

    try {
        const postsRef = db.collection('posts');
        const snapshot = await postsRef.where('slug', '==', slug).limit(1).get();

        if (snapshot.empty) {
            res.status(404).send('Post not found');
            return;
        }

        const post = snapshot.docs[0].data();
        const templatePath = path.join(__dirname, 'post_template.html');
        let html = fs.readFileSync(templatePath, 'utf8');

        // Inject data into template
        html = html.replace(/{{TITLE}}/g, post.title)
            .replace(/{{DESCRIPTION}}/g, post.description || post.title)
            .replace(/{{CONTENT}}/g, post.content)
            .replace(/{{DATE}}/g, post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : '')
            .replace(/{{TAGS}}/g, (post.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join(''));

        res.status(200).send(html);
    } catch (error) {
        console.error("Error serving post:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Serve Dynamic Sitemap
exports.serveSitemap = onRequest(async (req, res) => {
    try {
        const postsRef = db.collection('posts').select('slug', 'createdAt');
        const snapshot = await postsRef.get();

        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Add static board page
        xml += `
            <url>
                <loc>https://${req.hostname}/board.html</loc>
                <changefreq>daily</changefreq>
                <priority>0.8</priority>
            </url>
        `;

        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt ? new Date(data.createdAt.toDate()).toISOString() : new Date().toISOString();
            if (data.slug) {
                xml += `
                    <url>
                        <loc>https://${req.hostname}/post/${data.slug}</loc>
                        <lastmod>${date}</lastmod>
                        <changefreq>never</changefreq>
                        <priority>0.6</priority>
                    </url>
                `;
            }
        });

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        res.status(200).send(xml);
    } catch (error) {
        console.error("Error generating sitemap:", error);
        res.status(500).send('Error generating sitemap');
    }
});

// Manual trigger for testing
exports.manualGeneratePost = onRequest(async (req, res) => {
    try {
        const post = await generateContent();
        res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
