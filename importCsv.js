const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const dotenv = require('dotenv');
const Resource = require('./models/Resource.js');
const geocodeAddress = require('./utils/geocode.js');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const importCSV = () => {
    const rows = [];
    fs.createReadStream('./UCLA.csv')
        .pipe(csv())
        .on('data', (row) => rows.push(row)) // Collect all rows from the CSV
        .on('end', async () => {
            for (const row of rows) {
                try {
                    // Await coordinates before creating the resource
                    const location = await geocodeAddress(row.address);
                    const { lat, lng } = location;

                    // Now that coordinates are ready, create the resource
                    const resource = new Resource({
                        name: row.name,
                        category: row.category,
                        address: row.address,
                        phone: row.phone,
                        zipCode: row.address.slice(-5),
                        location: { type: 'Point', coordinates: [lng, lat] }, // Use geocoded coordinates
                        summary: row.summary
                    });

                    // Save the resource to the database
                    await resource.save();
                    console.log(`Saved resource: ${row.name}`);
                } catch (error) {
                    console.error(`Failed to process resource at address ${row.address}:`, error.message);
                }
            }
            console.log('CSV data imported successfully');
            mongoose.connection.close();
        });
};

importCSV();
