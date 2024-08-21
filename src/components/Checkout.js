import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";


const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        onChange={(e) => {
          handleNewAddress({
            ...newAddress,
            value: e.target.value,
          })
        }}
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={() => { 
            addAddress(token, newAddress);
          }}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() =>{
            handleNewAddress({
              ...newAddress,
              isAddingNewAddress: false,
            })
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };


  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization:`Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

 
  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };


  const addAddress = async (token, newAddress) => {
    try {
    
      const res = await axios.post(`${config.endpoint}/user/addresses`,{address: newAddress.value},{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
      setAddresses({...addresses, all: res.data})
      setNewAddress({value:"", isAddingNewAddress: false})

    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };


  const deleteAddress = async (token, addressId) => {
    try {
     
      const res = await axios.delete(`${config.endpoint}/user/addresses/${addressId}`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
        })
        setAddresses({...addresses, all: res.data});
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

 
  const validateRequest = (items, addresses) => {
    if(localStorage.getItem("balance") < getTotalCartValue(items)){
      enqueueSnackbar("not have enough balance",{
        variant:"warning"
      })
      return false;
    }
    if(!addresses.all.length){
      enqueueSnackbar("Please add new address before proceeding",{
        variant:"warning"
      })
      return false;
    }
    if(!addresses.selected.length){
      enqueueSnackbar("Please select one shipping address before proceeding",{
        variant:"warning"
      })
      return false;
    }
    return true;
  };

  const performCheckout = async (token, items, addresses) => {
    if(!validateRequest(items,addresses)) return;

    try{
      await axios.post(`${config.endpoint}/cart/checkout`,{addressId: addresses.selected},{
        headers:{
        Authorization: `Bearer ${token}`
      }
      })
      enqueueSnackbar("Order placed successfully!",{variant: "success"});
      const newBalance = parseInt(localStorage.getItem("balance") - getTotalCartValue(items))
      localStorage.setItem("balance",newBalance)
      history.push("/thanks");
    }
    catch(e){
      if(e.response){
        enqueueSnackbar(e.response.data.message, {variant:"error"});
      }
      else{
        enqueueSnackbar("Could not placed order. check that the backend is running",{variant: "error"});
      }
    }
  };

 
  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
    };
    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(token){
      getAddresses(token);
    } else{
      enqueueSnackbar('You must be logged in to access checkout page',{variant:'info'});
      history.push('/');
    }
  },[token])

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
             
               {
                addresses.all.length ? (
                  addresses.all.map((item) => (
                    <Box key={item._id} className={addresses.selected === item._id ? "address-item selected" : "address-item not-selected"} onClick={() => {
                      setAddresses({...addresses, selected: item._id})
                    }}> 
                    <Typography>{item.address}</Typography>
                    <Button startIcon={<Delete />} onClick={async() => {
                      await deleteAddress(token, item._id)
                    }}>Delete</Button>
                    </Box>
                  ))
                ) : (
                <Typography my="1rem">
                  No addresses found for this account. Please add one to proceed
                </Typography>
                )
                } 
            </Box>
     

          
            { !newAddress.isAddingNewAddress &&
            <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                }}
              >
                Add new address
            </Button>
                }

            { newAddress.isAddingNewAddress &&
            <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
            />
            }

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={() => {
                performCheckout(token, items, addresses);
              }}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;