import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";


export const generateCartItemsFrom = (cartData, productsData) => {
  if(!cartData) return;
  const nextCart = cartData.map((item) => ({
    ...item,
    ...productsData.find((product) => item.productId === product._id) || {}
  })
  )
  return nextCart;
};


export const getTotalCartValue = (items = []) => {
  if(!items.length) return 0;
  const total = items.map((item)=> item.cost*item.qty).reduce((total,n) => total+n)
  return total;
};
export const getTotalItems = (items = []) => {
  if(!items.length) return 0;
  const total = items.map((item)=>item.qty).reduce((total,n) => total+n)
  return total;
};



const ItemQuantity = ({
  value,
  handleAdd,
  handleDelete,
  isReadOnly
}) => {
  if(isReadOnly) {
    return <Box>Qty:{value}</Box>
  }
  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};


const Cart = ({
  products,
  items = [],
  handleQuantity,
  hasCheckoutButton=false,
  isReadOnly = false
}) => {
  const token = localStorage.getItem("token");
  const username=localStorage.getItem("username");
  const history = useHistory()
  const routeToCheckout = () => {
    history.push("/checkout")
  }
  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }
//  console.log(items)
  return (
    <>
      <Box className="cart">
      
        {
      items.map((item) => (
      <Box display="flex" alignItems="flex-start" padding="1rem" key={item._id}> 
      <Box className="image-container">
        <img
          src={item.image}
          alt={item.name}
          width="100%"
          height="100%"
        />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="6rem"
        paddingX="1rem"
      >
        <div>{item.name}</div>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
        {isReadOnly?(
            <Box style={{ fontSize: "1rem" }}>
              Qty: {item.qty} 
            </Box>

          ):(
            <ItemQuantity
            // Pass item quantity here
            value={item.qty} 
            handleAdd= {()=>handleQuantity(item.productId,item.qty+1)}
            handleDelete={()=>handleQuantity(item.productId,item.qty-1)}
            isReadOnly={isReadOnly}
          />

          )}

          <Box padding="0.5rem" fontWeight="700">
            ${item.cost}
          </Box>
        </Box>
      </Box>
    </Box>
  ))
}
        {/* checkout */}
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>

        {hasCheckoutButton && <Box display="flex" justifyContent="flex-end" className="cart-footer">
          <Button
            color="primary"
            variant="contained"
            startIcon={<ShoppingCart />}
            className="checkout-btn"
            onClick={routeToCheckout}
          >
            Checkout
          </Button>
        </Box>}
      </Box>
      {isReadOnly && (
        <Box className="cart" padding="1rem">
          <h2>Order Details</h2>
          <Box className="cart-row">
            <p>Products</p>
            <p>{getTotalItems(items)}</p>
          </Box>
          <Box className="cart-row">
            <p>Subtotal</p>
            <p>{getTotalCartValue(items)}</p>
          </Box>
          <Box className="cart-row">
            <p>Shipping Charges</p>
            <p>$0</p>
          </Box>
          <Box className="cart-row" fontSize="1.25rem" fontWeight='700'>
            <p>Total</p>
            <p>{getTotalCartValue(items)}</p>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Cart;
