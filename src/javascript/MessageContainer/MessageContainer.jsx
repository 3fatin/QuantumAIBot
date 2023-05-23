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
import { v4 as uuidv4 } from 'uuid';





// import "@botui/react/dist/styles/default.theme.scss"

const mybot = createBot();
const speechSynthesis = window.speechSynthesis;



 export const MainContainer = () => {

    const [input, setInput] = useState("")
    const [response, setResponse] = useState("")
    const [isAudioInput, setAudioInput] = useState(false)
    const [isprompt, setPrompt] = useState(false)
    const [oldTranscript, setOldTranscript] = useState("")
    const [initialOption, setInitialOption] = useState(false)
    const [sessionId, setSessionId] = useState("")
    const [inputJson, setInputJson] = useState({
      "question": "",
      "options": [],
      "answer": "",
      "topic": 0,
      "response": "",
      "sessionid": "",
      "condition": ""      
   });

  //  "condition": null

  const [responseJson, setResponseJson] = useState({
      "question": "",
      "options": ["option1", "option2", "option3", "option4"],
      "answer": "",
      "topic": 0,
      "response": "",
      "sessionid": "",
      "condition": ""  
  })

 const [surveyResponse, setSurveyResponse] = useState("")
 const [questionCount, setQuestionCount] = useState(0)
 const [endResponseJson, setEndResponseJson] = useState([{},{},{},{}])
 const [finalScore, setFinalScore] = useState(0)
 const [optionsList, setOptionsList] = useState([])

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
          setOldTranscript(transcript)
      }
    

    useEffect(() => {
      // console.log(`Initial Option is ${initialOption}`)
      console.log(responseJson.options)
        mybot.message
          .add({ text: "Hello" })
          .then(() => mybot.wait({ waitTime: 1000 }))
          .then(() => mybot.message.add({ text: "I'm the Quantum AI Bot. You can ask me any question." }))
          .then(() => mybot.message.add({ text: "How would you like to proceed?" }))
          .then(() => mybot.wait({ waitTime: 500 }))
          .then(() =>
            mybot.action.set(
              {
                options: [
                  { label: "Start Survey", value: "Start Survey" },
                  { label: "Chat With Bot", value: "Chat With Bot" },
                ],
              },
              { actionType: "selectButtons" }
                

            )
          )
          .then((data) => mybot.wait({ waitTime: 500 }, data))
          .then((data) =>
            // mybot.message.add({ text: `You are feeling ${data?.selected?.label}!` })
            {data?.selected?.label == "Chat With Bot" ? setInitialOption(true): generateSessionId()}
          )
          .then(()=>mybot.wait({waitTime:1000}))
          // .then(()=> mybot.message.add({text:"How can I help you?"}))         
      }, [])

      useEffect(() => {

        console.log("New response: ", response)
        isprompt && (
        mybot.message.add({text : response})
        .then(() => handleResponseSpeech()))
     
     }, [response])

     useEffect(() => {
        if(isAudioInput){               
        console.log("New Input: ", input)
        input!="" && AddMsg();
        setOldTranscript(transcript); 
    }}, [input, isAudioInput, isprompt])

    useEffect(() => {
      console.log("Old Transcript: ", oldTranscript)
    }, [oldTranscript]);

    // useEffect(() => {
    //   handleSurvey();
    // }, [sessionId]);

    useEffect(() => {
      if(responseJson.question != ""){
      console.log(`Options are` + responseJson?.options)
      console.log(responseJson)
      mybot.message.add({text: `${responseJson?.question}`}) 
      .then(() => 
          mybot.action.set({
            options:[
              {label: responseJson.options[0], value: responseJson.options[0]},
              {label: responseJson.options[1], value: responseJson.options[1]},
              {label: responseJson.options[2], value: responseJson.options[2]},
              {label: responseJson.options[3], value: responseJson.options[3]},
              {label: "Other", value: "Other"},
            ]
          },
          { actionType: "selectButtons" }
          )
      )
      // .then((res) => setSurveyResponse(res?.selected?.label))
      .then((res) => {
        if(res?.selected?.label == "Other"){
          handleCustomAnswer();
        } else{
          setSurveyResponse(res?.selected?.label);
        }
      })
    }
    }, [responseJson]);

    useEffect(() => {
      if(responseJson.question != ""){
        console.log(`Entered Survey Response - ${surveyResponse}`)
        setQuestionCount(questionCount+1)
      }
    },[surveyResponse]);

    useEffect(() => {
      if(inputJson.sessionid != ""){
      handleSurvey();
     
        mybot.message.add({
          loading: true
      }).then(function (index) {
          console.log('entered');
          // get the index of the empty message and delete it
          mybot.message.remove(index);
          // display action with 0 delay
      })
      
      }
    }, [inputJson]);

    useEffect(() => {
      console.log(`Entered Question Count - ${questionCount}`)
      if(responseJson.question != ""){
        console.log("Entered validation")
      questionCount < 5 ? setInputJson({...inputJson,
        "question": `${responseJson.question}`,
        "options": responseJson.options,
        "answer": `${responseJson.answer}`,
        "topic": 0,
        "response": `${surveyResponse}`,
        }) : setInputJson({...inputJson,
          "question": `${responseJson.question}`,
          "options": `${responseJson.options}`,
          "answer": `${responseJson.answer}`,
          "topic": 0,
          "response": `${surveyResponse}`,
          "condition": "stop"
          })}
    },[questionCount]);

    useEffect(() => {
      console.log(`Entered End Repsonse - ${endResponseJson}`)
      var score = 0;
      if(Array.isArray(endResponseJson)){
      endResponseJson.map((item,index) => (
        item?.valid == "Yes" ? score = score+1 : score = score
        // console.log(`Valid at ${index} is ` + item?.valid)
      ))
      setFinalScore(score);
    }
      
    }, [endResponseJson]);

    useEffect(() => {
      if(responseJson.question != ""){
      mybot.message.add({text: `Your score is ${finalScore}`})
      }
    },[finalScore]);

        const handleInput = (event) => {
            setAudioInput(false)
            setPrompt(true)
            setInput(event.target.value)
        }

        const startAudio = () => {
            setAudioInput(true)
            setPrompt(true)
            {SpeechRecognition.startListening({continuous: true})};
        }

        async function handleVoiceInput() {
            console.log("Entered Handle Voice Input")
            {SpeechRecognition.stopListening()};
            console.log(transcript)
            const newTranscript = transcript.replace(oldTranscript,"")
            setInput(newTranscript)
        }

        const AddMsg = () => {                        
                mybot.message.add({text:input},{fromHuman:true})
                .then(()=>{
                    console.log("Entered to fetch")
                    console.log(input)
                    {fetchResponse()};
                })
                .then(()=> setInput(""))
                // .then(()=>mybot.wait({waitTime : 3000}))
                .then(()=> console.log("Response Success"))
                .then(()=> {
                  mybot.message.add({
                    loading: true
                }).then(function (index) {
                    console.log('entered');
                    // get the index of the empty message and delete it
                    mybot.message.remove(index);
                    // display action with 0 delay
                })
                })
                
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

        const generateSessionId = () => {
          console.log("Entered into generateSessionId")
          const uuid = uuidv4();
          // setSessionId(uuid);
          console.log(uuid);
          setInputJson({...inputJson, sessionid : uuid})
        }

        const handleSurvey = () => {
          var objArray = [];
          console.log("Entered into handle survey")
          // const surveyUrl = "https://hipaa-audit-api.onrender.com/audit";
          const surveyUrl = "https://hipaa-demo.onrender.com/audit";
          axios.post(surveyUrl, inputJson)
          .then((res) => {
          if(questionCount < 5){ setResponseJson({...responseJson,
            "question" : `${res?.data?.question}`,
            "options" : res?.data?.options,
            "answer" : `${res?.data?.answer}`
          })} else{           
          Object.keys(res.data).forEach(key => {
            objArray = [...objArray, res.data[key]];
          });
          setEndResponseJson(objArray)  
        }
        })
        }

        const handleCustomAnswer = () => {
          var inputAnswer = ""
          mybot.action.set({ placeholder: 'Type your answer' }, { actionType: 'input' })
          .then((data) => inputAnswer = data.value)
          .then(() => setSurveyResponse(inputAnswer))
        }
    
      return (
        <div className='MainContainer'>
            <div className="HeaderBar">
                <img src={logo} height={'40px'} width={'40px'}/>
                <span>Quantum AI Bot</span>
            </div>
            <div className='chatName'>
              <span>Quantum Bot</span>
            </div>
          <div className='MessageContainer' style={{backgroundImage: {logo}}}>
            <BotUI bot={mybot}>
              
                <BotUIMessageList />
                <BotUIAction />
            </BotUI>
          </div>
            {initialOption && <div className='MessageInputBox'>
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
            }
          <div className='disclaimer'>
            <span >This is a demo version of the Bot</span>
          </div>
        </div>
    )    
}
