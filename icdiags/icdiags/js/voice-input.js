let recognition = null;
let dotNetRef = null;
let isListening = false;

window.initializeVoiceInput = function (dotNetReference) {
    dotNetRef = dotNetReference;
    
    // Initialize Web Speech API if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3;
        
        recognition.onresult = function(event) {
            console.log('Speech recognition result:', event.results);
            const transcript = event.results[0][0].transcript;
            const confidence = event.results[0][0].confidence;
            
            console.log('Transcript:', transcript, 'Confidence:', confidence);
            
            // Stop recognition and update state
            isListening = false;
            recognition.stop();
            
            if (dotNetRef) {
                // Convert to base64 to match the existing interface
                const mockResult = JSON.stringify({
                    transcribedText: transcript,
                    confidenceScore: confidence,
                    alternatives: Array.from(event.results[0], result => result.transcript),
                    isPartial: false,
                    processingTimeMs: 100
                });
                
                dotNetRef.invokeMethodAsync('OnAudioRecorded', btoa(mockResult));
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            if (dotNetRef) {
                dotNetRef.invokeMethodAsync('OnRecordingError', 'Speech recognition error: ' + event.error);
            }
            isListening = false;
        };
        
        recognition.onend = function() {
            console.log('Speech recognition ended');
            isListening = false;
            
            // Notify Blazor that recording has ended
            if (dotNetRef) {
                dotNetRef.invokeMethodAsync('OnRecordingEnded');
            }
        };
        
        recognition.onstart = function() {
            console.log('Speech recognition started');
            isListening = true;
        };
    }
};

window.startRecording = async function () {
    try {
        if (!recognition) {
            throw new Error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
        }
        
        if (isListening) {
            console.log('Already listening...');
            return;
        }
        
        console.log('Starting speech recognition...');
        recognition.start();
        
    } catch (error) {
        console.error('Error starting recording:', error);
        if (dotNetRef) {
            dotNetRef.invokeMethodAsync('OnRecordingError', error.message);
        }
    }
};

window.stopRecording = function () {
    if (recognition && isListening) {
        console.log('Stopping speech recognition...');
        recognition.stop();
        isListening = false;
    }
};

function convertBlobToBase64(blob) {
    const reader = new FileReader();
    reader.onloadend = function () {
        // Remove the data URL prefix (data:audio/webm;base64,)
        const base64String = reader.result.split(',')[1];
        
        if (dotNetRef) {
            dotNetRef.invokeMethodAsync('OnAudioRecorded', base64String);
        }
    };
    reader.onerror = function () {
        console.error('Error converting audio to base64');
        if (dotNetRef) {
            dotNetRef.invokeMethodAsync('OnRecordingError', 'Failed to process audio data');
        }
    };
    reader.readAsDataURL(blob);
}

// Check browser compatibility
window.checkVoiceInputSupport = function () {
    return {
        hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        hasMediaRecorder: !!window.MediaRecorder,
        supportedMimeTypes: [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/wav'
        ].filter(type => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type))
    };
};