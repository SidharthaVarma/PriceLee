"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { connect } from "http2";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
    if(!productUrl) return;
    try{

    connectToDB();
        const scrapedProduct = await scrapeAmazonProduct(productUrl);
    if(!scrapedProduct) return;

    let product = scrapedProduct;

  // checks the existing product in the database
  const existingProduct = await Product.findOne({ url: scrapedProduct.url });

  if(existingProduct) {
    const updatedPriceHistory: any = [
      ...existingProduct.priceHistory,
      { price: scrapedProduct.currentPrice }
    ]

    product = {
      ...scrapedProduct,
      priceHistory: updatedPriceHistory,
      lowestPrice: getLowestPrice(updatedPriceHistory),
      highestPrice: getHighestPrice(updatedPriceHistory),
      averagePrice: getAveragePrice(updatedPriceHistory),
    }
  }

    //if new product then create new product
    const newProduct = await Product.findOneAndUpdate(
        { url: scrapedProduct.url },
        product,
        { upsert: true, new: true }
      );
  
      revalidatePath(`/products/${newProduct._id}`);
}
    catch(error: any){
        throw new Error('Failed to create/update product: ' + error.message);
    }
}

// this function used to get product by id and can use this function to display the product details from the scraped product
export async function getProductById(productId: string) {
    try{
     connectToDB();
     const product = await Product.findOne({ _id: productId });

     if(!product) return null;

     return product;

    }catch (error)
    {
        console.log(error);
    }
}

// goes to the database and fetchs the product from there
export async function getAllProducts(){
    try{
     connectToDB();
     const products = await Product.find({});
     return products;
    }catch (error)
    {
        console.log(error);
    }
}


export async function getSimilarProducts(productId:String){
  try{
   connectToDB();
   const currentProduct = await Product.findById(productId);
   
   if(!currentProduct) return null;

   const similarProducts = await Product.find({_id: {$ne: productId},}).limit(5);
   
   return similarProducts;
  }catch (error)
  {
      console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try{
  //send our email
  const product = await Product.findById(productId);

  if(!product) return;

  const userExists = product.users.some((user: User) => user.email === userEmail);

  if(!userExists)
  {
    product.users.push({
      email: userEmail
    });

    await product.save();
    const emailContent = await generateEmailBody(product,"WELCOME");

    await sendEmail(emailContent,[userEmail]);
  }
  }
    catch(error){
      console.log(error);
  }
}




