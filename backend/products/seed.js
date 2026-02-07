import Products from './products.js';

export default async function seedProducts(){
    const res = await fetch("https://fakestoreapi.com/products");
    const data = await res.json();
    const products = data.map(p => ({
        name: p.title,
        description: p.description,
        price: p.price,
        available: process.env.DEFAULT_PRODUCTS_AVAILABLE || 10,
        img_path: p.image
    }));

    await Products.bulkCreate(products);
}