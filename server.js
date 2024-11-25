const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const path = require("path");

const products = require("./products.json");
const app = express();

app.use(cors());
app.use(express.json());

//const PORT = 5000;

app.use(express.static(path.join(__dirname, "public"))); 

// API/PRODUCTS include jason file with added real price and changed popularity score
app.get("/api/products", async (req, res) => {
    const goldPrice = await getGoldPriceInUSD(); // function for getting dinamic price

    // Get parameters for filtering
    const { minPrice, maxPrice, minPopularity, maxPopularity } = req.query;
    
    // Filter products based on price and popularity score
    const filteredProducts = products.filter(product => {
        let isPriceValid = true;
        let isPopularityValid = true;

        // Price filter
        if (minPrice || maxPrice) {
            const price = (product.popularityScore + 1) * product.weight * goldPrice;
            isPriceValid = (!minPrice || price >= parseFloat(minPrice)) && (!maxPrice || price <= parseFloat(maxPrice));
        }

        // Popularity score filter
        if (minPopularity || maxPopularity) {
            const popularity = (product.popularityScore * 5) / 100; // changer from percentage to out of 5
            isPopularityValid = (!minPopularity || popularity >= parseFloat(minPopularity)) && 
                                (!maxPopularity || popularity <= parseFloat(maxPopularity));
        }

        // Return true if the product passes both filters
        return isPriceValid && isPopularityValid;})
        
        .map(product => {
        const price = (product.popularityScore + 1) * product.weight * goldPrice;
        return {
            ...product,
            price: price.toFixed(2),
            popularityScore: (product.popularityScore * 5 / 100).toFixed(1), // changer from percentage to out of 5
        };
    });

    res.json(filteredProducts);
});

// TESTING MAIN PAGE OF ROOT
//app.get("/", (req, res) => {
//    res.send("Backend is running!");
//});
//
// STARTER
//app.listen(PORT, () => {
//    console.log(`Server is running on http://localhost:${PORT}`);
//});


// Serve the main HTML file at the root of the app
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});



// Function to fetch gold price
const getGoldPriceInUSD = async () => {
    try {
        const response = await axios.get("https://www.goldapi.io/api/XAU/USD", {
            headers: {
                "x-access-token": process.env.GOLD_API_KEY,
                "Content-Type": "application/json",
            },
        });
        return response.data.price; // Gold price per gram in USD
    } catch (error) {
        console.error("Error fetching gold price:", error.message);
        return 50; // Fallback value
    }
};

// Listen on Heroku's provided port, defaulting to 5000 for local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});