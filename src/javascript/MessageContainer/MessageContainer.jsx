import React from 'react';
import { createBot } from "botui"
import React, { useEffect, useState, useRef } from "react"
import { BotUI, BotUIAction, BotUIMessageList } from "@botui/react"
import { addMessage } from '../MsgBot/MsgBot';
import axios from 'axios';



// import "@botui/react/dist/styles/default.theme.scss"

const mybot = createBot()





 export const MainContainer = () => {

    const [input, setInput] = useState("")
    const [response, setResponse] = useState("")
    const apiKey = "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"
    // mybot.action.get().then((data)=> console.log({data}))

    useEffect(() => {
        mybot.message
          .add({ text: "Hello" })
          .then(() => mybot.wait({ waitTime: 1000 }))
          .then(() => mybot.message.add({ text: "I'm the Quantum AI Bot. You can ask me any question." }))
        //   .then(() => mybot.wait({ waitTime: 500 }))
        //   .then(() =>
        //     mybot.action.set(
        //       {
        //         options: [
        //           { label: "Good", value: "good" },
        //           { label: "Great", value: "great" },
        //         ],
        //       },
        //       { actionType: "selectButtons" }
                

        //     )
        //   )
        //   .then((data) => mybot.wait({ waitTime: 500 }, data))
        //   .then((data) =>
        //     mybot.message.add({ text: `You are feeling ${data?.selected?.label}!` })
        //   )
        //   .then(()=>mybot.wait({waitTime:1000}))
        //   .then(()=> mybot.message.add({text:"How can I help you?"}))         
      }, [])

      

        const handleInput = (event) => {
            setInput(event.target.value)
        }

        const AddMsg = () => {                        
                mybot.message.add({text:input},{fromHuman:true})
                .then(()=>{
                    console.log("Entered to fetch")
                    console.log(input)
                    {fetchResponse()};
                })
                .then(()=> setInput(""))
                .then(()=>mybot.wait({waitTime : 3000}))
                .then(()=> console.log("Response Success"));
        }

        async function fetchResponse() {
            const promptInput = input.split(" ").join("%20")
            const url = `https://hipaa-test-api.onrender.com/gpt?promt=${promptInput}`
            console.log(url)
            const res = await axios.get(url)
            .then((res) => mybot.message.add({text : res.data.answer}))
        }

        
    
      return (
        <div className='MainContainer'>
            <div className="HeaderBar">
                <span>Qauntum AI Bot</span>
            </div>
          <div className='MessageContainer'>
            <BotUI bot={mybot}>
              <BotUIMessageList />
              <BotUIAction />
            </BotUI>
          </div>
            <div className='MessageInputBox'>
                <form>
                    <input id="MsgInput" type='text' placeholder='Enter your text here' onChange={handleInput} onSubmit={AddMsg} value={input} ></input>
                    <button id="SendBtn" className='SubmitBtn' onClick={AddMsg} disabled = { input === ""}>Send</button>  
                    <input type='submit' hidden onSubmit={AddMsg}></input>  
                </form>  
          </div>
          <div className='disclaimer'>
            <span >This is a demo version of the Bot</span>
          </div>
        </div>
      )

    
}
