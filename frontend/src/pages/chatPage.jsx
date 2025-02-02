import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, MessageCircle, X } from 'lucide-react';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const startNewSession = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/api/chat/new-session', {
                    headers:{
                        Authorization: token
                    }
                });
                setSessionId(response.data.sessionId);
                
                const welcomeResponse = await axios.post('http://localhost:3000/api/chat', {
                    sessionId: response.data.sessionId
                },{
                    headers:{
                        Authorization: token
                    }
                });
                
                setMessages([{
                    sender: 'ai', 
                    text: welcomeResponse.data.response 
                }]);

            } 
            
            catch(error){
                console.error('Session start error:', error);
            }
        };
    
        startNewSession();
    }, []);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !sessionId) return;

        const userMessage = { 
            sender: 'user', 
            text: input 
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const token = localStorage.getItem('token');

            const response = await axios.post('http://localhost:3000/api/chat', {
                message: input,
                sessionId
            },{
                headers:{
                    Authorization: token
                }
            });

            const aiMessage = { 
                sender: 'ai', 
                text: response.data.response 
            };

            setMessages(prev => [...prev, aiMessage]);
        } 
        
        catch(err){
            console.log(err);
        }
    };

    return (
        <div className="fixed bottom-4 rounded-lg right-4 z-50">
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-500 p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
                >
                    <MessageCircle color="white" />
                </button>

            ) : (
                <div className="bg-white w-96 h-[500px] rounded-lg shadow-2xl border flex flex-col">
                    <div className="bg-blue-500 text-white p-3 rounded-lg flex justify-between items-center">
                        <h2>Support</h2>

                        <button onClick={() => setIsOpen(false)}>
                            <X color="white" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 rounded-lg">
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`p-2 rounded-lg max-w-[80%] ${
                                    msg.sender === 'user' 
                                    ? 'bg-blue-100 self-end ml-auto' 
                                    : 'bg-gray-100 self-start'
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-2 flex">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask something..."
                            className="flex-1 p-2 border rounded-l-lg"
                        />

                        <button 
                            onClick={sendMessage}
                            className="bg-blue-500 p-2 rounded-r-lg"
                        >
                            <Send color="white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}