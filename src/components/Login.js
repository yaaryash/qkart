import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory()
  const [formData,setFormData] = useState({username: '',password:''})
  const[loading,setLoading] = useState(false)
  const handleInput= (e) => {
    let newFormData = {...formData}
    newFormData[e.target.name] = e.target.value
    setFormData(newFormData)
  }


  const login = async (formData) => {
    if(validateInput(formData)) {
      try {
        setLoading(true);
        let responce = await axios.post(`${config.endpoint}/auth/login`, {
          username: formData.username ,
          password: formData.password
        })
        enqueueSnackbar(
          'Logged in Successfully',
          {variant: "success"}
        )
        persistLogin(responce.data.token,responce.data.username,responce.data.balance)
        history.push('/')
      } catch (e) {
        if(e.response.status === 400) {
          enqueueSnackbar(
           e.response.data.message,
            {variant: "error"}
          )
        } else {
          enqueueSnackbar(
           'Something went wrong. Check that the backend is running, reachable and returns valid JSON',
             {variant: "error"}
           )
        }
      } finally {
        setLoading(false)
      }
      }
  };

  const validateInput = (data) => {
     if(data.username === '') {
      enqueueSnackbar(
        "Username is a required field",
          {variant: "warning"}
        )
        return false
    }
    if(data.password === '') {
      enqueueSnackbar(
        "Password is a required field",
          {variant: "warning"}
        )
        return false
    }
    return true;
  };


  const persistLogin = (token, username, balance) => {
    localStorage.setItem('token',token);
    localStorage.setItem('username',username)
    localStorage.setItem('balance',balance)
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
        <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={formData.username}
            onChange={handleInput}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={formData.password}
            onChange={handleInput}
          />
           <Button className="button" variant="contained"
           onClick={()=> 
           {
            login(formData)
          }
           }>
           Login To QKART
           </Button>
          <p className="secondary-action">
            Don't have an account?{" "}
        
             <Link className="link" to="/register">Register now</Link>
           
          </p>
     
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
