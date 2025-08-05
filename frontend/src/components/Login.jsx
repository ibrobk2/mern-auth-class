import React from 'react'
import Button from './Button'
import {FaUserLock, FaLinux} from 'react-icons/fa'
import {FiYoutube} from 'react-icons/fi'


export default function Login() {
  return (
    <>
    <FaUserLock style={{fontSize: "35px", color: "goldenrod"}}/>
    <FaLinux />

    <FiYoutube style={{color: "red"}} />  
        <h2>User Login</h2>
        <form action="">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required/>
            <br/>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required/>
            <Button name="Log" />

            
        </form>
    </>
  )
}

