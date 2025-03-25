const axios = require('axios');
require('dotenv').config();

async function geocodeAddress(address) {
    try {
        // URL encode the address and construct the API URL
        const encodedAddress = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

        const response = await axios.get(url);
        
        if (response.data.status === 'ZERO_RESULTS') {
            throw new Error(`No results found for address: ${address}`);
        }

        if (response.data.status !== 'OK') {
            throw new Error(`Geocoding API error: ${response.data.status}`);
        }

        const location = response.data.results[0].geometry.location;
        return {
            lat: location.lat,
            lng: location.lng
        };
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Geocoding API error response:', error.response.data);
            throw new Error(`Geocoding service error: ${error.response.data.status}`);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response from geocoding service');
            throw new Error('No response from geocoding service');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error during geocoding:', error.message);
            throw error;
        }
    }
}

module.exports = geocodeAddress;
