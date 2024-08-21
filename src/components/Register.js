import { Link, useHistory } from  "react-router-dom";
import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory()
  const [formData,setFormData] = useState({username: '',password:'',confirmPassword:''})
  const handleInput= (e) => {
    let newFormData = {...formData}
    newFormData[e.target.name] = e.target.value
    setFormData(newFormData)
  }
  const [loading, setLoading] = useState(false)



  const register = async (formData) => {
    console.log(formData)
    if(validateInput(formData)) {
    try {
      setLoading(true);
      let responce = await axios.post(`${config.endpoint}/auth/register`, {
        username: formData.username ,
        password: formData.password
      })
      enqueueSnackbar(
        'Registered Successfully',
        {variant: "success"}
      )
      history.push('/login')
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
    if(data.username.length < 6) {
      enqueueSnackbar(
        "Username must be at least 6 characters",
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
    if(data.password.length < 6) {
      enqueueSnackbar(
        "Password must be at least 6 characters",
          {variant: "warning"}
        )
        return false
    }
    if(data.password !== data.confirmPassword) {
      enqueueSnackbar(
        " Passwords do not match",
          {variant: "warning"}
        )
        return false
    }
    return true;
    
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
          <h2 className="title">Register</h2>
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
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleInput}
          />
           { loading ? <Box display="flex" justifyContent="center"><CircularProgress color='success' size={25} /></Box> : <Button className="button" variant="contained"
           onClick={()=> 
           {
            register(formData)
          }
           }>
            Register Now
           </Button>}
          <p className="secondary-action">
            Already have an account?
              <Link className="link" to="/login">Login here</Link>
          </p>
      
             
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
