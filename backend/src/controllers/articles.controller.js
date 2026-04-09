const { body } = require('express-validator');
const prisma = require('../config/database');

const articleRules = [
  body('title').notEmpty().withMessage('Titre requis'),
  body('content').notEmpty().withMessage('Contenu requis'),
  body('category').notEmpty().withMessage('Catégorie requise'),
];

const CATEGORIES = ['nutrition', 'grossesse', 'maladies', 'hygiene', 'pediatrie', 'general'];

async function listArticles(req, res, next) {
  try {
    const { category, page = 1, limit = 20, search } = req.query;
    const where = { isPublished: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: { id: true, title: true, category: true, imageUrl: true, createdAt: true },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.article.count({ where }),
    ]);

    res.json({ articles, total, categories: CATEGORIES });
  } catch (err) {
    next(err);
  }
}

async function getArticleById(req, res, next) {
  try {
    const article = await prisma.article.findFirst({
      where: { id: req.params.id, isPublished: true },
    });
    if (!article) return res.status(404).json({ message: 'Article introuvable' });
    res.json(article);
  } catch (err) {
    next(err);
  }
}

async function createArticle(req, res, next) {
  try {
    const { title, content, category, imageUrl } = req.body;
    const article = await prisma.article.create({
      data: { title, content, category, imageUrl, publishedBy: req.user.id, isPublished: false },
    });
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
}

async function updateArticle(req, res, next) {
  try {
    const { title, content, category, imageUrl, isPublished } = req.body;
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: { title, content, category, imageUrl, isPublished },
    });
    res.json(article);
  } catch (err) {
    next(err);
  }
}

async function deleteArticle(req, res, next) {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ message: 'Article supprimé' });
  } catch (err) {
    next(err);
  }
}

// Admin: liste tous les articles (publiés ou non)
async function listAllArticles(req, res, next) {
  try {
    const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(articles);
  } catch (err) {
    next(err);
  }
}

module.exports = { listArticles, getArticleById, createArticle, updateArticle, deleteArticle, listAllArticles, articleRules };
