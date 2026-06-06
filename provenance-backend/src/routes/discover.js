const express = require('express');
const router = express.Router();

// In production this would come from a CMS or database
// For now it's hardcoded — swap for headless CMS (Contentful, Sanity) later
const EDITORIAL_CONTENT = require('../models/editorialContent');

router.get('/', (req, res) => {
  const { type, limit = 20, offset = 0 } = req.query;

  let content = EDITORIAL_CONTENT;

  if (type && type !== 'all') {
    content = content.filter(item => item.type === type);
  }

  const paginated = content.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    items: paginated,
    total: content.length,
    hasMore: Number(offset) + Number(limit) < content.length
  });
});

router.get('/:slug', (req, res) => {
  const item = EDITORIAL_CONTENT.find(i => i.slug === req.params.slug);
  if (!item) return res.status(404).json({ error: 'Article not found' });
  res.json(item);
});

module.exports = router;
