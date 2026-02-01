import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sendCozeMessageStream } from '../lib/coze-api';

interface PopupAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
}

export function PopupAssistant({ isOpen, onClose }: PopupAssistantProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'need more help?', sender: 'assistant' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`);
  const assistantMessageIdRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 开场白按钮选项
  const quickActions = [
    'What is this platform?',
    'How to create a trade?',
    'How to accept a trade?',
    'What are the main features?'
  ];
  
  // 判断是否显示开场白按钮
  const showQuickActions = messages.length <= 1 && !isLoading;

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickAction = (actionText: string) => {
    handleSend(actionText);
  };

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || message.trim();
    if (!messageToSend || isLoading) return;
    
    const userMessage = messageToSend;
    const userMessageId = Date.now() + Math.random();
    setMessages(prev => [...prev, { id: userMessageId, text: userMessage, sender: 'user' }]);
    setMessage('');
    setIsLoading(true);
    
    // 创建占位符助手消息用于流式输出
    const assistantMessageId = Date.now() + 1 + Math.random();
    assistantMessageIdRef.current = assistantMessageId;
    setMessages(prev => [...prev, { 
      id: assistantMessageId, 
      text: '', 
      sender: 'assistant' 
    }]);
    
    try {
      await sendCozeMessageStream(
        userMessage,
        userId,
        (chunk: string) => {
          // 严格更新助手消息
          setMessages(prev => prev.map(msg => {
            if (msg.id === assistantMessageIdRef.current && msg.sender === 'assistant') {
              return { ...msg, text: msg.text + chunk };
            }
            return msg;
          }));
        }
      );
    } catch (error) {
      console.error('Failed to get response from Coze:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageIdRef.current
          ? { ...msg, text: error instanceof Error ? error.message : 'Failed to send message, please try again later.' }
          : msg
      ));
    } finally {
      setIsLoading(false);
      assistantMessageIdRef.current = null;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '500px',
          height: '600px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #334155',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #334155'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#FFA500',
            margin: 0
          }}>Hackathon AI</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Console Info */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #334155',
          backgroundColor: '#0f172a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#8b5cf6',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '12px', height: '12px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#e2e8f0' }}>
              Hackathon AI Assistant
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Powered by Coze AI</span>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  backgroundColor: msg.sender === 'user' ? '#8b5cf6' : '#334155',
                  color: '#ffffff'
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* 开场白按钮 */}
          {showQuickActions && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#475569';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#334155';
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          )}
          
          {isLoading && messages[messages.length - 1]?.sender === 'assistant' && !messages[messages.length - 1]?.text && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                backgroundColor: '#334155',
                color: '#e2e8f0',
                borderRadius: '8px',
                padding: '0.75rem 1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* 滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          borderTop: '1px solid #334155',
          padding: '1rem 1.5rem',
          backgroundColor: '#0f172a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Enter message..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '1px solid #334155',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !message.trim()}
              style={{
                padding: '0.75rem',
                backgroundColor: isLoading || !message.trim() ? '#334155' : '#8b5cf6',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                cursor: isLoading || !message.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading || !message.trim() ? 0.5 : 1
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
