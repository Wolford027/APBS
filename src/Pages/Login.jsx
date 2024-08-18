import { Avatar, Button, Grid, Paper, TextField } from "@mui/material";
import Logo from "../assets/B.png";
import * as React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Alert, Box } from "@mui/material";
import style from '../Pages/style.css'
import Link from '@mui/joy/Link';


export default function Login() {
  const paperStyle = {
    padding: 20,
    height: "45rem",
    width: "20rem",
    margin: "0rem auto",
    marginTop: "5rem",
    marginButtom: "3rem",
    marginLeft: "40rem",
    marginRight: "40rem",
  };
  const textStyle = { margin: "0.625rem 0rem" };
  const loginStyle = { borderRadius: "0.313rem", marginTop: "1rem" };
  const headerStyle = { margin: "1rem" , marginTop:"-.25rem" };

  const navigate = useNavigate(); // Initialize useNavigate hook
  const [inputs, setInputs] = React.useState({});
  const [error, setError] = React.useState(null);

  const [username, setusername] = useState('');
  const [password, setpassword] = useState('');
  function handleSubmit(event) {
    event.preventDefault();

    axios
      .post("http://localhost:8800/login", { username, password })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }

  return (
    <div>
      <Grid container >
        <Paper elevation={10} style={paperStyle}>
          <Grid align="center">
            <Avatar alt="Logo" src={Logo} sx={{ width: "9rem", height: "9rem" }} />
            <h2 style={headerStyle}>Login</h2>
          </Grid>
          <form onSubmit={handleSubmit} >
            {error && (
              <div
                style={{
                  color: "red",
                  fontSize: "14px",
                  transition: "opacity 0.3s ease-in",
                }}
              >
                
                {error}
              </div>
            )}
            <TextField
              label="Username"
              placeholder="Enter Username"
              name="username"
              style={textStyle}
              fullWidth
              onChange={e => setusername(e.target.value)}
            />
            <TextField
              label="Password"
              placeholder="Enter Password"
              name="password"
              type="password"
              style={textStyle}
              fullWidth
              onChange={e => setpassword(e.target.value)}
            />
            <Button
              type="submit"
              color="primary"
              variant="contained"
              style={loginStyle}
              fullWidth
            >
              Login
            </Button>
            
            <div className="center">
               <Link href="#" variant=""  >Forgot Password?</Link>
            </div>
           
            
          </form>
        </Paper>
      </Grid>
    </div>
  );
}
