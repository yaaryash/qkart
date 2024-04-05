import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory, Link } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  if(hasHiddenAuthButtons) {
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={()=> {
            history.push('/')
          }}
        >
          <Link className="link" to="/"> Back to explore</Link>
      
        </Button>
      </Box>
    );
}
return (
  <Box className="header">
    <Box className="header-title">
        <Link to='/'><img src="logo_light.svg" alt="QKart-icon"></img></Link>
    </Box>
    {children}
    <Stack direction="row" spacing={1} alignItems="center">
      {localStorage.getItem('token') ? (<>
      <Avatar src="avatar.png" alt={localStorage.getItem('username')} />
      <p>{localStorage.getItem('username')}</p>
      <Button onClick={()=> {
        localStorage.clear();
        window.location.reload();
      }}>Logout</Button>
      </>) : (<>
      <Link to="/login"><Button>Login</Button></Link>
      <Link to="/register"><Button variant='contained'>Register</Button></Link>
      </>)}
    </Stack>
  </Box>
);
}


export default Header;
