"use client"
import { scrapeAndStoreProduct } from '@/lib/actions';
import React, { FormEvent } from 'react'

import { useState } from 'react'

const isValidAmazonProductURL = (url: string) => {
  try{
    const parsedURL = new URL(url);
    const hostname=parsedURL.hostname;

    // Check if the hostname is 'www.amazon.com' or 'amazon.in'
    if (hostname === 'www.amazon.com' || hostname === 'www.amazon.de'|| hostname === 'www.amazon.in' || hostname === 'www.amazon') {
      return true;
    }
  }
  catch(error){
    return false;
  }
  return false;
}

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = React.useState('')
  const [isLoading,setIsLoading] = useState(false);
  
  //function to handle submit
const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  
  const isValidLink = isValidAmazonProductURL(searchPrompt);

  if(!isValidLink){
    return alert('Please provide a valid product URL')
}
try{
 setIsLoading(true);

 // Scrape the product page and extract the product name and price
 const Product = await scrapeAndStoreProduct(searchPrompt);
}catch(error){
  console.log(error);
}
finally{
  setIsLoading(false);
}
} 
  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input 
      type="text"
      value={searchPrompt}
      onChange={(e) => setSearchPrompt(e.target.value)}
      placeholder="Enter product link"
      className="searchbar-input"      
      />
      <button 
      type="submit" className="searchbar-btn"
      disabled={searchPrompt === ''}>
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}

export default Searchbar


