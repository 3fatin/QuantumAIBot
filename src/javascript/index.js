import logo from '../Assets/logo.jpg'
import React from "react"
import { createRoot } from "react-dom/client"
import * as styles from '../../dist/index.19e5b2c6.css';
import { MainContainer } from "./MessageContainer/MessageContainer"

const axios = require('axios');

const App = () => {
  return(
    <div className="App" >
      
      <div>
        <MainContainer />
      </div>      
    </div>
  )
}

const containerElement = document.getElementById("botui")
if (containerElement) {
  const root = createRoot(containerElement)
  root.render(<App />)
}
