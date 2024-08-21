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




const Products = () => {
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [loading,setLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar();
  const [filteredProducts,setFilteredProducts] = useState([])
  const [searchText, setSearchText] = useState('')
  const [timer, setTimer] = useState(null)

 const [cartLoad, setcartLoad]= useState(false);
  const token = localStorage.getItem("token")

  
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
 
  useEffect(() => {
     performAPICall() 
  },[])


   useEffect(()=>{
    fetchCart(token)
},[cartLoad]);




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


  const debounceSearch = (event, debounceTimeout) => {
    if(debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
    let timerId = setTimeout(() => {
      performSearch(event.target.value)
    },500)
    setTimer(timerId)
  };




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


  // };
  const isItemInCart = (items, productId) => {
    for(let i=0;i<items.length;i++){
      if(items[i].productId===productId){
        return true;
      }
    }
    return false;
     
      
  };


  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty=1,
    // options = { preventDuplicate: false }
  ) => {
    

    if(token){
   
       if(isItemInCart(items, productId)){
         enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          {
            variant: "error",
          }
        );
       }
       else{
         
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


 
  const addInCart=async(productId,qty)=>{
  
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


let handleCart=(productId)=>{
  addToCart(
    token,
    items,
    products,
    productId
    // 1
  );
}

const handleQuantity=(productId,qty)=>{
 
  addInCart(productId,qty);
}


  return (
    <div>
      <Header>
       
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
 
      <Grid
        item
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        xs
        md
      
      >
      <Grid item className="product-grid" >
        <Box className="hero">
          <p className="hero-heading">
            India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
            to your door step
          </p>
        </Box>
      </Grid>
   
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
          
            <Grid item key={product["_id"]} xs={6} md={3}>
              <ProductCard 
              product={product} 
            
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
       
    </Grid>
    )}
   
    </Grid>
  {token && (
    <Grid
      container
      item
      xs={12}
      md={3}
      style={{ backgroundColor: "#E9F5E1", height: "100vh" }}
      justifyContent="center"
      alignItems="stretch"
      >
   
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
