import logo from '../../Assets/png.png'
import React from 'react';
import { createBot } from "botui"
import React, { useEffect, useState, useRef } from "react"
import { BotUI, BotUIAction, BotUIMessageList } from "@botui/react"
// import { addMessage } from '../MsgBot/MsgBot';
import axios from 'axios';
import MicIcon from '@mui/icons-material/Mic';
// import { AudioControls } from './AudioControl';
// import MicExternalOffIcon from '@mui/icons-material/MicExternalOff';
import { IconButton } from "@mui/material";
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SendIcon from '@mui/icons-material/Send'; 
import CampaignIcon from '@mui/icons-material/Campaign';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';




// import "@botui/react/dist/styles/default.theme.scss"

const mybot = createBot();
const speechSynthesis = window.speechSynthesis;



 export const MainContainer = () => {

    const [input, setInput] = useState("")
    const [response, setResponse] = useState("")
    const [isAudioInput, setAudioInput] = useState(false)

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();
    
      if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
      }
  
      const closeRecord = () => {
          {SpeechRecognition.stopListening()};
          {resetTranscript()};
      }
    

    useEffect(() => {
        mybot.message
          .add({ text: "Hello" })
          .then(() => mybot.wait({ waitTime: 1000 }))
          .then(() => mybot.message.add({ text: "I'm the Quantum AI Bot. You can ask me any question." }))
          .then(() => mybot.message.add({ text: "How are you?" }))
          .then(() => mybot.wait({ waitTime: 500 }))
          .then(() =>
            mybot.action.set(
              {
                options: [
                  { label: "Good", value: "good" },
                  { label: "Great", value: "great" },
                ],
              },
              { actionType: "selectButtons" }
                

            )
          )
          .then((data) => mybot.wait({ waitTime: 500 }, data))
          .then((data) =>
            mybot.message.add({ text: `You are feeling ${data?.selected?.label}!` })
          )
          .then(()=>mybot.wait({waitTime:1000}))
          .then(()=> mybot.message.add({text:"How can I help you?"}))         
      }, [])

      useEffect(() => {

        console.log("New response: ", response)
        response!="" && (
        mybot.message.add({text : response})
        .then(() => handleResponseSpeech()))
     
     }, [response])

     useEffect(() => {
        if(isAudioInput){
        console.log("New Input: ", input)
        input!="" && AddMsg();
    }}, [input, isAudioInput])

        const handleInput = (event) => {
            setAudioInput(false)
            setInput(event.target.value)
        }

        const startAudio = () => {
            setAudioInput(true)
            {SpeechRecognition.startListening()};
        }

        async function handleVoiceInput() {
            console.log("Entered Handle Voice Input")
            {SpeechRecognition.stopListening()};
            console.log(transcript)
            setInput(transcript)
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
                .then(()=> console.log("Response Success"))
        }

        async function fetchResponse() {
            const promptInput = input.split(" ").join("%20")
            const url = `https://hipaa-test-api.onrender.com/gpt?promt=${promptInput}`
            console.log(url)
            const res = await axios.get(url)            
            .then((res)=> setResponse(`${res.data.answer}`))
        }
        
        const handleResponseSpeech = () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            } else {
                const utterance = new SpeechSynthesisUtterance(response);
                utterance.rate = 0.9;
                utterance.pitch = 1.2;
                utterance.volume = 1.5;
                speechSynthesis.speak(utterance);
            }
        }
    
      return (
        <div className='MainContainer'>
            <div className="HeaderBar">
                <img src={logo} height={'40px'} width={'40px'}/>
                <span>Qauntum AI Bot</span>
            </div>
          <div className='MessageContainer' style={{backgroundImage: {logo}}}>
            <BotUI bot={mybot}>
              <BotUIMessageList />
              <BotUIAction />
            </BotUI>
          </div>
            <div className='MessageInputBox'>
                <form>
                    <input id="MsgInput" type='text' placeholder='Enter your text here' onChange={handleInput} onSubmit={AddMsg} value={input} ></input>
                    <button id="SendBtn" className='SubmitBtn' onClick={AddMsg} disabled = { input === ""}><SendIcon /></button>                    
                    <input type='submit' hidden onSubmit={AddMsg}></input>  
                    <div>
                        {listening?
                        (
                            <div>
                                <IconButton
                                        color="secondary"
                                        aria-label="stop recording"
                                        onClick={handleVoiceInput}                                        
                                        >
                                        <FiberManualRecordIcon />
                                        </IconButton>
                                <IconButton                       
                                    aria-label="start recording"
                                    onClick={closeRecord}                            
                                >
                                <DisabledByDefaultIcon />
                                </IconButton>
                            </div>
                        ):(
                            <div>
                            <IconButton
                                color='blue'                       
                                aria-label="start recording"
                                onClick= {startAudio}                      
                            >
                                <MicIcon />
                            </IconButton>
                            
                            <IconButton 
                                color='blue'                      
                                aria-label="start recording"                                
                                onClick= {handleResponseSpeech}                      
                            >
                                <CampaignIcon />
                            </IconButton>                      
                            </div>
                        )}
                    </div>
                </form>   
            </div>
            
          <div className='disclaimer'>
            <span >This is a demo version of the Bot</span>
          </div>
        </div>
    )    
}
