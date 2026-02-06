/**
 * AI 助手服务模块
 * 使用本地 Ollama 后端替代 Coze API
 */

// AI 服务配置
const AI_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_AI_API_URL || 'http://localhost:8000',
}

/**
 * AI 聊天消息接口
 */
export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * AI API 响应接口
 */
export interface AIResponse {
  choices: Array<{
    message: AIMessage
    finish_reason: string
  }>
  model?: string
  inference_time?: number
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * AI 服务类
 */
export class AIService {
  private static instance: AIService | null = null
  private apiUrl: string

  constructor() {
    if (AIService.instance) {
      return AIService.instance
    }
    this.apiUrl = AI_CONFIG.API_BASE_URL
    AIService.instance = this
  }

  /**
   * 检查 AI 服务健康状态
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.ok
    } catch (error) {
      console.error('AI 服务健康检查失败:', error)
      return false
    }
  }

  /**
   * 发送消息到 AI 助手（非流式）
   */
  async sendMessage(
    userMessage: string,
    conversationHistory: AIMessage[] = []
  ): Promise<string> {
    try {
      const messages: AIMessage[] = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]

      const response = await fetch(`${this.apiUrl}/v1/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages })
      })

      if (!response.ok) {
        throw new Error(`AI 服务错误: ${response.status} ${response.statusText}`)
      }

      const data: AIResponse = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  /**
   * 流式发送消息到 AI 助手（支持实时回调）
   * 注意：当前后端不支持流式响应，这里模拟流式效果
   */
  async sendMessageStream(
    userMessage: string,
    conversationHistory: AIMessage[] = [],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const messages: AIMessage[] = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]

      const response = await fetch(`${this.apiUrl}/v1/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages })
      })

      if (!response.ok) {
        throw new Error(`AI 服务错误: ${response.status} ${response.statusText}`)
      }

      const data: AIResponse = await response.json()
      const fullResponse = data.choices[0].message.content

      // 模拟流式输出效果
      if (onChunk) {
        const words = fullResponse.split('')
        let currentText = ''
        
        for (const char of words) {
          currentText += char
          onChunk(char)
          // 添加小延迟以模拟流式效果
          await new Promise(resolve => setTimeout(resolve, 20))
        }
      }

      return fullResponse
    } catch (error) {
      console.error('流式发送消息失败:', error)
      throw error
    }
  }
}

/**
 * 获取 AI 服务实例（单例模式）
 */
function getAIServiceInstance(): AIService {
  return new AIService()
}

/**
 * 简化的 API：发送消息到 AI 助手
 */
export async function sendAIMessage(
  userMessage: string,
  conversationHistory: AIMessage[] = []
): Promise<string> {
  const aiService = getAIServiceInstance()
  return await aiService.sendMessage(userMessage, conversationHistory)
}

/**
 * 简化的 API：流式发送消息到 AI 助手
 */
export async function sendAIMessageStream(
  userMessage: string,
  conversationHistory: AIMessage[] = [],
  onChunk: (chunk: string) => void
): Promise<string> {
  const aiService = getAIServiceInstance()
  return await aiService.sendMessageStream(userMessage, conversationHistory, onChunk)
}

/**
 * 检查 AI 服务是否可用
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  const aiService = getAIServiceInstance()
  return await aiService.checkHealth()
}

// 导出默认实例
export default getAIServiceInstance()
