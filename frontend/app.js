// Backend API URL
const API_URL = "http://localhost:3000/api/products";

let currentStartIndex = 0; // Current Range of products
let totalProducts = 0; // Total number of products



// Function for fetching products with given ranges
// *Does not work in last tries probably because of that total token limit for goldapi passed
async function fetchProducts(filters = {}) {
    const { minPrice, maxPrice, minPopularity, maxPopularity } = filters;
    
    // QUERY string for filters
    let queryParams = `?minPrice=${minPrice || ''}&maxPrice=${maxPrice || ''}&minPopularity=${minPopularity || ''}&maxPopularity=${maxPopularity || ''}`;

    try {
        const response = await fetch(`${API_URL}${queryParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch products:", error);
        alert("Error fetching products. Please check the API and try again.");
        return [];
    }
}





// Rendering products to carousel
async function renderProducts(filters = {}) {
    const products = await fetchProducts(filters);
    totalProducts = products.length;

    
    const slider = document.getElementById("carouselSlider");
    slider.max = Math.max(totalProducts - 4, 0);
    slider.value = currentStartIndex;

    // for getting carousel container element
    const carouselTrack = document.getElementById("carouselTrack");

    // case if not any element returned
    if (products.length === 0) {
        carouselTrack.innerHTML = "<p>No products available.</p>";
        return;
    }


    carouselTrack.innerHTML = "";
    const visibleProducts = products.slice(currentStartIndex, currentStartIndex + 4);

    // Create card for each product
    visibleProducts.forEach((product, index) => {
        const card = document.createElement("div");
        card.classList.add("card");

        // Default color of product
        let currentColor = "yellow";

        // Star bar calculator for popularity(always show half bar if there is some decimal)
        const fullStars = Math.floor(product.popularityScore);
        const halfStars = product.popularityScore - fullStars >= 0.00001 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStars;
        const stars = "★".repeat(fullStars) + "⯨".repeat(halfStars) + "☆".repeat(emptyStars);

        // Add related details of product to each card
        const cardContent = `
            <div>
                <img id="product-image-${index}" src="${product.images[currentColor]}" alt="${product.name}" style="width: 100%; margin-bottom: 10px;">
                <h3>${product.name}</h3>
                <p>$${parseFloat(product.price).toFixed(2)} USD</p>
                </div>
                <div class="color-options">
                    <div class="color-circle" data-color="yellow" style="background-color: #E6CA97; border: 2px solid black;" data-index="${index}"></div>
                    <div class="color-circle" data-color="white" style="background-color: #D9D9D9;" data-index="${index}"></div>
                    <div class="color-circle" data-color="rose" style="background-color: #E1A4A9;" data-index="${index}"></div>
                </div>
                <div class="popularity-score">
                    <span>${stars}</span>
                    <span class="score">${product.popularityScore}/5</span>
                
            </div>
        `;

        card.innerHTML = cardContent;
        carouselTrack.appendChild(card);
    });

    // Color changer
    document.querySelectorAll(".color-circle").forEach((circle) => {
        circle.addEventListener("click", (event) => {
            const color = event.target.getAttribute("data-color");
            const index = event.target.getAttribute("data-index");
            const productImage = document.getElementById(`product-image-${index}`);
            const product = visibleProducts[index];

            if (product && product.images[color]) {
                productImage.src = product.images[color];
                const parent = event.target.parentElement;
                parent.querySelectorAll(".color-circle").forEach((c) => (c.style.border = "none"));
                event.target.style.border = "2px solid black";
            }
        });
    });
}

// Navigator buttons
document.getElementById("prevBtn").addEventListener("click", async () => {
    if (currentStartIndex > 0) {
        currentStartIndex--;
        document.getElementById("carouselSlider").value = currentStartIndex;
        await renderProducts();
    }
});

document.getElementById("nextBtn").addEventListener("click", async () => {
    if (currentStartIndex < totalProducts - 4) {
        currentStartIndex++;
        document.getElementById("carouselSlider").value = currentStartIndex;
        await renderProducts();
    }
});

// Slide bar
document.getElementById("carouselSlider").addEventListener("input", async (event) => {
    currentStartIndex = parseInt(event.target.value, 20);
    await renderProducts();
});


document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
});
