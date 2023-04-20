import { useBotUI, useBotUIAction } from "@botui/react"

export const addMessage = () => {
  const bot = useBotUI()
  return(                
   (bot.next({text:hi}))              
  
  )
}