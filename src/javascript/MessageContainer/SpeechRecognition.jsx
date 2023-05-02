import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

const Dictaphone = () => {
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
        {SpeechRecognition.stopListening}
        {resetTranscript}
    }
  
    return (
      <div>
        {listening?
        (
            <div>
                <IconButton
                        color="secondary"
                        aria-label="stop recording"
                        onClick={SpeechRecognition.stopListening}
                        // disabled={!isRecording}
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
        ):(<IconButton                       
            aria-label="start recording"
            onClick={SpeechRecognition.startListening}                       
        >
            <MicIcon />
        </IconButton>)}
      </div>
    );
  };
  export default Dictaphone;