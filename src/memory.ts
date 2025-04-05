import { JSONFilePreset, JSONFileSyncPreset } from 'lowdb/node'
import type { AIMessage } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { runTool } from './toolRunner'

export type MessageWithMetaData = AIMessage & {
  id: string
  createdAt: string
}
type Data = {
  messages: MessageWithMetaData[]
}

export const addMetadata = (message: AIMessage) => {
  return {
    ...message,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
}

export const removeMetadata = (message: MessageWithMetaData) => {
  const { id, createdAt, ...rest } = message
  return rest
}

const defaultData: Data = {
  messages: [],
}

export const getDb = async () => {
  const db = await JSONFilePreset<Data>('db.json', defaultData)
  return db
}

export const addMessages = async (messages: AIMessage[]) => {
  const db = await getDb()
  db.data.messages.push(...messages.map(addMetadata))
  await db.write()
}

export const getMessages = async () => {
  const db = await getDb()
  return db.data.messages.map(removeMetadata)
}

export const saveToolResponse = async (toolCallId: string, toolResponse: string) => {
  return addMessages([{ role: 'tool', content: toolResponse, tool_call_id: toolCallId }])
}
