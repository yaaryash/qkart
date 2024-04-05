import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import ProductCard from './ProductCard'
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Cart from "./Cart"
import { generateCartItemsFrom} from "./Cart"
import Header from "./Header";
import "./Products.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [loading,setLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar();
  const [filteredProducts,setFilteredProducts] = useState([])
  const [searchText, setSearchText] = useState('')
  const [timer, setTimer] = useState(null)

   //to call FetchCart fucntion in useEffect when "", henec use the below state in dependency array:
 const [cartLoad, setcartLoad]= useState(false);
  const token = localStorage.getItem("token")

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    try {
      let res = await axios.get(`${config.endpoint}/products`)
      setProducts(res.data)
      setFilteredProducts(res.data)
      setcartLoad(true);
    } catch(e) {
      enqueueSnackbar(
        e.response.data.message,
        { variant: "error"}
      )
    } finally {
      setLoading(false)
    }
  };
  // useEffect(() => {
  //   const onLoadHandler = async () => {
  //     const productsData = await performAPICall()
  //     const cartData = await (fetchCart(token))
  //     const cartDetails = await generateCartItemsFrom(cartData, productsData)
  //     setItems(cartDetails)
  //     console.log(items)
  //   };
  //   onLoadHandler();
    
  // },[])
  useEffect(() => {
     performAPICall() 
  },[])

//----------------yours-------------------------------
  //  useEffect(() => {
  //   const onLoadHandler = async () => {
     
  //     const cartData = await (fetchCart(token))
  //     const cartDetails = await generateCartItemsFrom(cartData, products)
  //     setItems(cartDetails)
  //     console.log(items)
  //   };
  //   onLoadHandler();
    
  // },[products])

   //------------------my approach, simple approach with one state change to trigger the useEffect---------------------
   //get req to fetch cart items for a logged in user
   useEffect(()=>{
    fetchCart(token)
},[cartLoad]);



  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      let res = await axios.get(`${config.endpoint}/products/search?value=${text}`)
      setFilteredProducts(res.data)
    } catch (e) {
    if(e.response) {
     
      if(e.response.status === 404) {
        setFilteredProducts([])
      } else {
        enqueueSnackbar(
          e.response.data.message,
          { variant: "error"}
        )
        setFilteredProducts([...products])
      }
    } else {
      
      enqueueSnackbar(
       "Could not fetch products. Check that the backend is running, reachable and returns valid JSON",
        { variant: "error"}
      )
    }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    if(debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
    let timerId = setTimeout(() => {
      performSearch(event.target.value)
    },500)
    setTimer(timerId)
  };

//------------no need to use another function for jsx--------------
/*
  const getGridItems = (filteredProducts) => {
    return (
      filteredProducts.length ? filteredProducts.map(product=> (<Grid key={product._id} item xs={6} md={3}>
        <ProductCard
              product={product}
              handleAddToCart={ async ()=> {
                await addToCart(
                  token,
                  items,
                  products,
                  product._id,
                  1,
                  {
                    preventDuplicate:true,
                  }
                )
              }}
              />
      </Grid>)) : <Box className="loading">
        <SentimentDissatisfied color='action' /><h2>No products found</h2></Box>
    )
  }

*/


  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers:{
          Authorization: `Bearer ${token}`,
        }
      })
      // return response.data
      setItems(generateCartItemsFrom(response.data,products));
      // console.log(response.data)
    } catch(e) {
      if(e.response && e.response.status ===400) {
        enqueueSnackbar(
          e.response.data.message,
          { variant: "error"}
        )
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error"}
        )
      }
      return null;
    }
  }
  // we can do this in one line, no  need of extra function
  /*
  const updateCartItems = (cartData,products) => {
    const cartItems = generateCartItemsFrom(cartData,products);
    
    setItems(cartItems)
    console.log(items)
  }
*/

  //   try {
  //     // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
  //   } catch (e) {
  //     if (e.response && e.response.status === 400) {
  //       enqueueSnackbar(e.response.data.message, { variant: "error" });
  //     } else {
  //       enqueueSnackbar(
  //         "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
  //         {
  //           variant: "error",
  //         }
  //       );
  //     }
  //     return null;
  //   }
  // };
  const isItemInCart = (items, productId) => {
    for(let i=0;i<items.length;i++){
      if(items[i].productId===productId){
        return true;
      }
    }
    return false;
     
      
  };


  //we will call this function (addToCart) inside another helper function ie: handleCart and pass this handleCart to ProductCard fucntion (as a prop) so that when
  // "add to cart" button gets clicked (on any product card) that passed fucntion (handleCart) will get called.
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty=1,
    // options = { preventDuplicate: false }
  ) => {
    //check if user is logged in

    if(token){
      //now check if item is already in the cart or 
       if(isItemInCart(items, productId)){
         enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          {
            variant: "error",
          }
        );
       }
       else{
         //make post req with product id and qty
          addInCart(productId,qty);
       }
     
     }
    else{
      // 
      enqueueSnackbar(
        "Login to add an item to the Cart",
        {
          variant: "error",
        }
      );

    }
  };


  //helper function for addToCart (addition to the cart logic here)
  const addInCart=async(productId,qty)=>{
    // console.log("qty passed in addInCart:",qty);
     try{
      let response= await axios.post(
        `${config.endpoint}/cart` ,
        {
          productId:productId,
          qty:qty
         },
         {
          headers: {
            Authorization: `Bearer ${token}`,
          }

         }

      );
      //update the cart items again setItems , no need to use extra function
      setItems(generateCartItemsFrom(response.data,products)); 
     }
     catch(e){
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;

     }
  }

//another helper function to be passed as a prop to ProductCard, and we are taking productId form travesing filteredItems array.
let handleCart=(productId)=>{
  addToCart(
    token,
    items,
    products,
    productId
    // 1
  );
}

//helper function to handle the quantity of products ie + and - buttons will use this function(to add or remove quantity) and ultimately this function will call addInCart
const handleQuantity=(productId,qty)=>{
  // console.log("productId and qty in handleQuantity: "+productId+" "+qty);
  addInCart(productId,qty);
}


  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
        className="search-desktop"
        size="small"
       
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value)
          debounceSearch(e, timer)
        }}
      />

      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value)
          debounceSearch(e, timer)
        }}
      />
       <Grid container>
      {/* below is the first item in main grid containing: a grid of hero section and another grid having products(70% of screen is taken)*/}
      <Grid
        item
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        xs
        md
        // OR: md={token && productDetails.length>0 ? 9 : 12}
      >
      <Grid item className="product-grid" >
        <Box className="hero">
          <p className="hero-heading">
            India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
            to your door step
          </p>
        </Box>
      </Grid>
      {/* used a loading condition here to show loading during api call else show products */}
      {loading ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{margin:"auto"}}
          py={10}
        >
          <CircularProgress size={30} />
          <h4> Loading Products... </h4>
        </Box>
      ) : (
        // now show filtered products OR products using another grid...2nd item in item container grid
          //also check if filtered product array is not empty 

          
        <Grid
          container
          item
          spacing={2}
          direction="row"
          justifyContent="center"
          alignItems="center"
          my={3}
        >
        {
          filteredProducts.length ? (
            filteredProducts.map((product) => (
            // a particular card in a grid
            <Grid item key={product["_id"]} xs={6} md={3}>
              <ProductCard 
              product={product} 
              //taking _id from above
              handleAddToCart={(event)=>handleCart(product["_id"])}
              />
            </Grid>
          ))
        ):(
          <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                py={10}
                sx={{margin: "auto"}}
              >
                <SentimentDissatisfied size={40} />
                <h4>No products found</h4>
              </Box>

        )}
        {/* product grid end here */}
    </Grid>
    )}
    {/* 1st grid item of main conatiner ends here */}
    </Grid>
  {token && (
    <Grid
      container
      item
      xs={12}
      md={3} //bcz after log out we want our main grid to take whole width
      style={{ backgroundColor: "#E9F5E1", height: "100vh" }}
      justifyContent="center"
      alignItems="stretch"
      >
      {/* cart component */}
          <Cart 
          hasCheckoutButton
        products={products}
        items={items}
        handleQuantity={handleQuantity}
        />
      
      </Grid>
      )}

        
       </Grid>
      
       
      <Footer />
    </div>
  );
};

export default Products;
