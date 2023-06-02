import logo from '../../Assets/png.png'
import React from 'react';
import { createBot } from "botui"
import React, { useEffect, useState, useRef } from "react"
import { BotUI, BotUIAction, BotUIMessageList } from "@botui/react"
import axios from 'axios';
import MicIcon from '@mui/icons-material/Mic';
import { IconButton } from "@mui/material";
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SendIcon from '@mui/icons-material/Send';
import CampaignIcon from '@mui/icons-material/Campaign';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { v4 as uuidv4 } from 'uuid';

const mybot = createBot();
const speechSynthesis = window.speechSynthesis;


const styles = [
  { property: 'letter-spacing', value: '1px' },
  { property: 'font-size', value: '14px' },
  { property: 'text-align', value: 'center' }
];


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
  const [endResponseJson, setEndResponseJson] = useState("")
  const [analysis, setAnalysis] = useState(false)
  const [loadingAnim, setloadingAnim] = useState(false)

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
    { SpeechRecognition.stopListening() };
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
      .then((data) => { data?.selected?.label == "Chat With Bot" ? setInitialOption(true) : generateSessionId() }
      )
      .then(() => mybot.wait({ waitTime: 1000 }))
  }, [])

  useEffect(() => {

    console.log("New response: ", response)
    isprompt && (
      mybot.message.add({ text: response })
        .then(() => handleResponseSpeech()))

  }, [response])

  useEffect(() => {
    if (isAudioInput) {
      console.log("New Input: ", input)
      input != "" && AddMsg();
      setOldTranscript(transcript);
    }
  }, [input, isAudioInput, isprompt])

  useEffect(() => {
    console.log("Old Transcript: ", oldTranscript)
  }, [oldTranscript]);

  useEffect(() => {
    if (responseJson.question != "") {
      console.log(`Options are` + responseJson?.options)
      console.log(responseJson)
      const inputString = responseJson?.options;
      const jsonArray = inputString.split(',').map(s => s.trim());
      for (let i = 0; i < jsonArray.length; i++) {
        jsonArray[i] = jsonArray[i].replace(/"|\[|\'|\]/g, "");
      }
      mybot.message.add({ text: `${responseJson?.question}` })
        .then(() =>
          mybot.action.set({
            options: [
              { label: jsonArray[0], value: jsonArray[0] },
              { label: jsonArray[1], value: jsonArray[1] },
              { label: jsonArray[2], value: jsonArray[2] },
              { label: jsonArray[3], value: jsonArray[3] },
              { label: "Other", value: "Other" },
            ]
          },
            { actionType: "selectButtons" }
          )
        )
        // .then((res) => setSurveyResponse(res?.selected?.label))
        .then((res) => {
          console.log('here baby'+res?.selected)
          if (res?.selected?.label == null) {
            mybot.message.remove(5)
              .then(() =>
                mybot.action.set({
                  options: [
                    { label: jsonArray[0], value: jsonArray[0] },
                    { label: jsonArray[1], value: jsonArray[1] },
                    { label: jsonArray[2], value: jsonArray[2] },
                    { label: jsonArray[3], value: jsonArray[3] },
                    { label: "Other", value: "Other" },
                  ]
                },
                  { actionType: "selectButtons" }
                ))
              .then((ans) => {
                console.log('select here baby ' + ans)
                if (ans?.selected?.label == "Other") {
                  handleCustomAnswer();
                } else {
                  setSurveyResponse(ans?.selected?.label);
                }
              })
          }
          else if (res?.selected?.label == "Other") {
            handleCustomAnswer();
          } else {
            setSurveyResponse(res?.selected?.label);
          }
        })
    }
  }, [responseJson]);

  useEffect(() => {
    if (responseJson.question != "") {
      console.log(`Entered Survey Response - ${surveyResponse}`)
      setQuestionCount(questionCount + 1)
    }
  }, [surveyResponse]);

  useEffect(() => {
    console.log('input json here baby')
    if (inputJson.sessionid != "") {
      handleSurvey();
      if (questionCount < 5) {
        mybot.message.add({
          loading: true
        }).then(function (index) {
          mybot.message.remove(index);
        })
      }
    }
  }, [inputJson]);

  useEffect(() => {
    console.log(`Entered Question Count - ${questionCount}`)
    if (responseJson.question != "") {
      console.log("Entered validation")
      questionCount < 5 ? setInputJson({
        ...inputJson,
        "question": `${responseJson.question}`,
        "options": responseJson.options,
        "answer": `${responseJson.answer}`,
        "topic": 0,
        "response": `${surveyResponse}`,
      }) : setInputJson({
        ...inputJson,
        "question": `${responseJson.question}`,
        "options": `${responseJson.options}`,
        "answer": `${responseJson.answer}`,
        "topic": 0,
        "response": `${surveyResponse}`,
        "condition": "stop"
      })
    }
  }, [questionCount]);

  useEffect(() => {
    if (endResponseJson != '') {

      setloadingAnim(false)
      setAnalysis(true)
      console.log(`Entered End Repsonse - ` + endResponseJson)
    }

  }, [endResponseJson])

  const handleInput = (event) => {
    setAudioInput(false)
    setPrompt(true)
    setInput(event.target.value)
  }

  const startAudio = () => {
    setAudioInput(true)
    setPrompt(true)
    { SpeechRecognition.startListening({ continuous: true }) };
  }

  async function handleVoiceInput() {
    { SpeechRecognition.stopListening() };
    console.log(transcript)
    const newTranscript = transcript.replace(oldTranscript, "")
    setInput(newTranscript)
  }

  const AddMsg = () => {
    mybot.message.add({ text: input }, { fromHuman: true })
      .then(() => {
        console.log(input)
        { fetchResponse() };
      })
      .then(() => setInput(""))
      // .then(()=>mybot.wait({waitTime : 3000}))
      .then(() => console.log("Response Success"))
      .then(() => {
        mybot.message.add({
          loading: true
        }).then(function (index) {
          console.log('entered');
          mybot.message.remove(index);
        })
      })

  }

  async function fetchResponse() {
    const promptInput = input.split(" ").join("%20")
    const url = `https://hipaa-test-api.onrender.com/gpt?promt=${promptInput}`
    console.log(url)
    const res = await axios.get(url)
      .then((res) => setResponse(`${res.data.answer}`))
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
    setInputJson({ ...inputJson, sessionid: uuid })
  }

  const handleSurvey = () => {
    var objArray = [];
    console.log("Entered into handle survey")
    const surveyUrl = "https://hipaa-demo.onrender.com/preaudit";
    if (questionCount == 5) {
      mybot.message.add({ text: "Thankyou for taking the survey." })
      setloadingAnim(true)
    }

    axios.post(surveyUrl, inputJson)
      .then((res) => {
        if (questionCount < 5) {
          setResponseJson({
            ...responseJson,
            "question": `${res?.data?.question}`,
            "options": res?.data?.options,
            "answer": `${res?.data?.answer}`
          })
        } else {
          setEndResponseJson(res.data)
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
        <img src={logo} height={'40px'} width={'40px'} />
        <span>Quantum AI Bot</span>
      </div>
      <div className='MessageContainer' style={{ backgroundImage: { logo }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BotUI bot={mybot}>

          <BotUIMessageList />
          <BotUIAction />
        </BotUI>
        <div id="analysis" style={{ margin: '0 auto', maxWidth: '30%', overflowY: 'scroll', height: '400px' }}>
          <h1 style={{ textAlign: 'center' }}>Analysis</h1>
          {!analysis && <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            {!loadingAnim && <span style={{ textAlign: 'center', fontSize: '1.1em' }}>Take the survey to generate analysis</span>}
            {loadingAnim && <div class="loader"></div>}
          </div>}
          {analysis && <div><p>{endResponseJson}</p>
          </div>
          }
        </div>
      </div>
      {initialOption && <div className='MessageInputBox'>
        <form>
          <input id="MsgInput" type='text' placeholder='Enter your text here' onChange={handleInput} onSubmit={AddMsg} value={input} ></input>
          <button id="SendBtn" className='SubmitBtn' onClick={AddMsg} disabled={input === ""}><SendIcon /></button>
          <input type='submit' hidden onSubmit={AddMsg}></input>
          <div>
            {listening ?
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
              ) : (
                <div>
                  <IconButton
                    color='blue'
                    aria-label="start recording"
                    onClick={startAudio}
                  >
                    <MicIcon />
                  </IconButton>

                  <IconButton
                    color='blue'
                    aria-label="start recording"
                    onClick={handleResponseSpeech}
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
