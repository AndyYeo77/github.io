class VoiceAgent {
  constructor() {
    this.name = 'Explorer';
    this.knowledge = {
      mars: 'Mars is the fourth planet from the Sun, known for its red surface and huge volcanoes like Olympus Mons.',
      ocean: 'The ocean covers over 70% of the planet and contains more than 20% of the world’s oxygen supply.',
      galaxy: 'A galaxy is a massive system of stars, gas, dust, and dark matter held together by gravity.',
      moon: 'The Moon orbits Earth and controls tides while keeping our nights bright and quiet.'
    };
  }

  speak(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  answer(text) {
    const lower = text.toLowerCase().trim();

    if (/\b(hi|hello|hey)\b/.test(lower)) {
      return 'Hello! I am your Explore Voice Agent. What would you like to discover today?';
    }

    if (/\bwhat can you do\b|\bhelp\b|\bexplore\b/.test(lower)) {
      return 'I can explore topics, answer simple questions, and open a search suggestion for you. Try asking me about science, places, or the weather.';
    }

    const topicMatch = lower.match(/tell me about\s+(.+)/) || lower.match(/what is\s+(.+)/);
    if (topicMatch) {
      const topic = topicMatch[1].trim();
      const key = topic.split(' ')[0];
      if (this.knowledge[key]) {
        return this.knowledge[key];
      }
      return `Here is a quick exploration of ${topic}. It's a great topic to learn more about online.`;
    }

    const weatherMatch = lower.match(/weather in\s+(.+)/);
    if (weatherMatch) {
      return `The weather in ${weatherMatch[1].trim()} looks pleasant. You can check a live forecast online for exact details.`;
    }

    const searchMatch = lower.match(/search for\s+(.+)/);
    if (searchMatch) {
      return `I found some ideas for ${searchMatch[1].trim()}. Open a browser search to explore them further.`;
    }

    if (/\bname\b/.test(lower)) {
      return `My name is ${this.name}. I am here to help you explore new ideas with voice.`;
    }

    return 'I am ready to explore with you. Try asking me to tell you about a topic, search for something, or describe the weather in your city.';
  }
}

const transcriptEl = document.getElementById('transcript');
const responseEl = document.getElementById('response');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const agent = new VoiceAgent();

let recognition;
let listening = false;

function createRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    responseEl.textContent = 'Speech recognition is not supported in this browser. Use Chrome or Edge with microphone access enabled.';
    startBtn.disabled = true;
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    listening = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    responseEl.textContent = 'Listening... Speak clearly into your microphone.';
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join(' ');

    transcriptEl.textContent = transcript;
    const reply = agent.answer(transcript);
    responseEl.textContent = reply;
    agent.speak(reply);
  };

  recognition.onerror = (event) => {
    const message = event.error === 'no-speech' ? 'No speech detected. Try again.' : `Recognition error: ${event.error}`;
    responseEl.textContent = message;
  };

  recognition.onend = () => {
    listening = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    if (responseEl.textContent === 'Listening... Speak clearly into your microphone.') {
      responseEl.textContent = 'Ready when you are.';
    }
  };

  return recognition;
}

function startListening() {
  if (!recognition) {
    recognition = createRecognition();
    if (!recognition) return;
  }
  recognition.start();
}

function stopListening() {
  if (recognition && listening) {
    recognition.stop();
  }
}

startBtn.addEventListener('click', startListening);
stopBtn.addEventListener('click', stopListening);

if (!('speechSynthesis' in window)) {
  responseEl.textContent = 'Speech synthesis is not supported in your browser. Your responses will show as text.';
}
