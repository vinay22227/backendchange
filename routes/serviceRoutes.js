const express = require('express');
const Category = require('../models/categoryModel');
const Service = require('../models/serviceModel');
const router = express.Router();

// Add a new category
router.post('/categories', async (req, res) => {
    try {
        // const { name, description } = req.body;
        // const category = new Category({ name, description });
        // await category.save();
        // res.status(201).json(category);
        const categories = req.body;  // The body should now be an array of category objects
        const result = await Category.insertMany(categories);  // Insert all categories in one go
        res.status(201).json(result);  // Return the created categories
    } catch (err) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// Add a new service under a category
router.post('/categories/services', async (req, res) => {
    try {
        const { name, description, categoryId } = req.body;
        const service = new Service({ name, description, categoryId });
        await service.save();
        res.status(201).json(service);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create service' });
    }
});

// GET all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();  // Fetch all categories from the database
        res.status(200).json(categories);  // Send the list of categories as a response
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET category by ID
router.get('/categories/:id', async (req, res) => {
    const { id } = req.params;  // Get the category ID from the URL parameters
    try {
        const category = await Category.findById(id);  // Fetch the category by ID
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });  // If not found, return an error
        }
        res.status(200).json(category);  // Return the found category
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

router.get('/categories-with-services', async (req, res) => {
    try {
        const categoriesWithServices = await Category.aggregate([
            {
                $lookup: {
                    from: 'services', // Collection name of services
                    localField: '_id', // Field in Category
                    foreignField: 'categoryId', // Field in Service
                    as: 'services' // Alias to hold the matched services
                }
            }
        ]);
        res.status(200).json(categoriesWithServices);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories with services' });
    }
});

router.get('/categories/:id/with-services', async (req, res) => {
    const { id } = req.params;
    try {
        const categoryWithServices = await Category.findById(id).lean();
        const services = await Service.find({ categoryId: id });

        res.status(200).json({
            ...categoryWithServices,
            services: services
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch category with services' });
    }
});

module.exports = router;
