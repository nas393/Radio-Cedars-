const express = require('express');
const Parser = require('rss-parser');
const parser = new Parser();
const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded RSS feeds (all free, no keys needed)
// I've selected Lebanese outlets that have working RSS
const FEEDS = [
  {
    name: 'Annahar (Arabic)',
    url: 'https://www.annahar.com/rss/article.xml'
  },
  {
    name: 'L\'Orient-Le Jour (English)',
    url: 'https://today.lorientlejour.com/feed.xml'
  },
  {
    name: 'Al-Manar English',
    url: 'https://eng.almanar.com.lb/feed.php'
  },
  {
    name: 'The961 (English, Lebanon)',
    url: 'https://www.the961.com/feed'
  }
];

// API endpoint for news
app.get('/api/news', async (req, res) => {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(feed => parser.parseURL(feed.url))
    );
    const news = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          source: FEEDS[index].name,
          items: result.value.items.slice(0, 5).map(item => ({
            title: item.title,
            link: item.link,
            date: item.pubDate || ''
          }))
        };
      } else {
        return { source: FEEDS[index].name, items: [] };
      }
    });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Serve static frontend
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Wardé running on port ${PORT}`);
});
