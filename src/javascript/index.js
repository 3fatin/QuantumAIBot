import React from "react"
import { createRoot } from "react-dom/client"

import "@botui/react/dist/styles/default.theme.scss"
import { MainContainer } from "./MessageContainer/MessageContainer"

const App = () => {
  return(
    <div>
      <MainContainer />
    </div>
  )
}

const containerElement = document.getElementById("botui")
if (containerElement) {
  const root = createRoot(containerElement)
  root.render(<App />)
}
