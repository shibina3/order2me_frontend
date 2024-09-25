import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Login = (props) => {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('danger')

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const data = { email, password, path: "/login" };
    const response = await fetch('https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    let result = await response.json();
    result = JSON.parse(result.body);
    
    if(result.message){
      setAlertMessage(result.message);
      setAlertType('success');
      localStorage.setItem('email', result?.data?.email);
      localStorage.setItem('mobile', result?.data?.mobile);
      localStorage.setItem('name',result?.data?.username);
      localStorage.setItem('userID', result?.data?.id);
      props.setActivePage('home');
    } else {
      setAlertMessage(result.error);
      setAlertType('danger');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const data = { email, mobile, password, username, path: "/register" };
    const response = await fetch('https://mdsab35oki.execute-api.us-east-1.amazonaws.com/dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    let result = await response.json();
    result = JSON.parse(result.body);
    if(result.message){
      setAlertMessage(result.message);
      setAlertType('success');
      setIsLogin(true);
    } else {
      setAlertMessage(result.error);
      setAlertType('danger');
    }
  };

  return (
    <>
      <div className="login-page d-flex justify-content-center align-items-center">
        <Card className="login-card p-4 shadow-lg">
          <h3 className="text-center mb-4 content-primary"><img src="/assets/logo-side.png" alt="Order2me" /></h3>
          {
            isLogin ?
              <Form onSubmit={handleLoginSubmit}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="danger" type="submit" className="w-100 mt-4">
                  Login
                </Button>
                <a className="d-block content-primary text-center mt-3">Forgot password?</a>
                <a onClick={()=>setIsLogin(!isLogin)} className="d-block content-primary text-center mt-3">Don't have an account? Register</a>
              </Form> :
              <Form onSubmit={handleRegisterSubmit}>
                <Form.Group controlId="formBasicName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicEmail" className="mt-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicMobile" className="mt-3">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="danger" type="submit" className="w-100 mt-4">
                  Register
                </Button>
              </Form>
          }
        </Card>
      </div>
      {
        alertMessage ? <Alert className='alertMsg' variant={alertType} dismissible>
            <p>{alertMessage}</p>
          </Alert> : null
      }
    </>
  );
};

export default Login;
