const express = require('express');
const Resource = require('../models/resource');
const router = express.Router();
const geocodeAddress = require('../utils/geocode.js');

/// --- CRUD Operations for Admins --- ///

// Create a new resource
router.post('/', async (req, res) => {
    try {
        const newResource = new Resource(req.body);
        const savedResource = await newResource.save();
        res.status(201).json(savedResource);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create resource', details: err.message });
    }
});

// Read all resources (or filter by type or zipCode)
router.get('/', async (req, res) => {
    const { type, zipCode } = req.query;
    try {
        const query = {};
        if (type) query.type = type;
        if (zipCode) query.zipCode = zipCode;

        const resources = await Resource.find(query);
        res.status(200).json(resources);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch resources', details: err.message });
    }
});

// Update a resource by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedResource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedResource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.status(200).json(updatedResource);
    } catch (err) {
        res.status(400).json({ error: 'Failed to update resource', details: err.message });
    }
});

// Delete a resource by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedResource = await Resource.findByIdAndDelete(req.params.id);
        if (!deletedResource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete resource', details: err.message });
    }
});

/// --- Read Operation for Frontend Users --- ///

// Retrieve resources based on zip code
router.get('/zipCode/:zipCode', async (req, res) => {
    const zipCode = req.params.zipCode;

    try {
        const resources = await Resource.find({ zipCode: zipCode });
        if (resources.length === 0) {
            return res.status(404).json({ error: 'No resources found for this zip code' });
        }
        res.status(200).json(resources);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch resources', details: err.message });
    }
});

// Search resources by address with optional radius
router.post('/address', async (req, res) => {
    const { address, radius } = req.body;

    if (!address) {
        return res.status(400).send('Address is required');
    }

    const searchRadius = radius || 5; // Default radius is 10 miles

    try {
        // Geocode the address to get latitude and longitude
        const location = await geocodeAddress(address);
        const { lat, lng } = location;

        // Convert miles to meters
        const radiusInMeters = searchRadius * 1609.34;

        // Find resources within the specified radius
        const resources = await Resource.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [lng, lat] },
                    $maxDistance: radiusInMeters,
                },
            },
        });

        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error.message);
        res.status(500).send('Failed to retrieve resources');
    }
});


module.exports = router;
