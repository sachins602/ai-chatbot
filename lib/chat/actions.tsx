import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Stock,
  Purchase
} from '@/components/stocks'

import { z } from 'zod'
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'
import {
  AppointmentDetailsCard,
  BookAppointmentHead
} from '@/components/appointments/book-appointment'
import useStorage from '@/app/utils/useStorage'

async function confirmPurchase(symbol: string, price: number, amount: number) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const purchasing = createStreamableUI(
    <div className="inline-flex items-start gap-1 md:items-center">
      {spinner}
      <p className="mb-2">
        Purchasing {amount} ${symbol}...
      </p>
    </div>
  )

  const systemMessage = createStreamableUI(null)

  runAsyncFnWithoutBlocking(async () => {
    await sleep(1000)

    purchasing.update(
      <div className="inline-flex items-start gap-1 md:items-center">
        {spinner}
        <p className="mb-2">
          Purchasing {amount} ${symbol}... working on it...
        </p>
      </div>
    )

    await sleep(1000)

    purchasing.done(
      <div>
        <p className="mb-2">
          You have successfully purchased {amount} ${symbol}. Total cost:{' '}
          {formatNumber(amount * price)}
        </p>
      </div>
    )

    systemMessage.done(
      <SystemMessage>
        You have purchased {amount} shares of {symbol} at ${price}. Total cost ={' '}
        {formatNumber(amount * price)}.
      </SystemMessage>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: nanoid(),
          role: 'system',
          content: `[User has purchased ${amount} shares of ${symbol} at ${price}. Total cost = ${
            amount * price
          }]`
        }
      ]
    })
  })

  return {
    purchasingUI: purchasing.value,
    newMessage: {
      id: nanoid(),
      display: systemMessage.value
    }
  }
}

type Appointment = {
  name: string
  email: string
  date: string
  time: string
  description: string
}

async function deleteAppointment(appointment: Appointment) {
  'use client'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content: `Delete appointment for ${appointment.name} on ${appointment.date} at ${appointment.time} with description ${appointment.description}`
      }
    ]
  })
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  const result = await streamUI({
    model: openai('gpt-3.5-turbo'),
    initial: <SpinnerMessage />,
    system: `\You are a friendly assistant that helps the user with booking appointment. You ask for name and email of the user and help the user book an appointment to the business and asnwer the frequently asked questions. If user doesnot have any appointments booked say that user has no appointments and ask for the user to book an appointment, do not even the example appointments.
  
      
      Here's the flow: 
       1. Greet the user.
       3. Ask the user if they want to book an appointment or ask any question.
       4. If the user wants to book an appointment, ask for the message and the date and time of the appointment also their name and email.
       5. If user wants to book more appointments, ask for the message and the date and time of the appointment.
       6. If the user wants to delete an appointment ask which appointment to delete by showing the list of appointments.
       7. If the user wants to cancel an appointment ask which appointment to cancel by showing the list of appointments.

  Frequently Asked Questions from the Users:
1. What types of appointments can I book with this chatbot?
You can book various types of appointments, including consultations, meetings, service appointments, and more. The available options will be presented to you during the booking process.

2. How do I provide my name and email to the chatbot?
When you start a chat, the chatbot will prompt you to enter your name and email address. Simply type in the information when asked.

3. Can I specify my preferred date and time for the appointment?
Yes, after entering your name and email, the chatbot will ask you for your preferred date and time. You can specify the details, and the chatbot will check availability for you.

4. What happens if my preferred date and time are not available?
If your preferred date and time are not available, the chatbot will suggest the closest available slots and ask you to choose from the options provided.

5. How will I receive confirmation of my appointment?
You will receive a confirmation email with all the details of your appointment, including the date, time, and any other relevant information.

6. Can I reschedule my appointment through the chatbot?
Yes, you can reschedule your appointment by initiating a new chat with the chatbot. Provide your existing appointment details, and the bot will guide you through the rescheduling process.

7. Is there a way to cancel my appointment?
Yes, to cancel your appointment, you can either chat with the bot again and select the cancel option or follow the cancellation instructions provided in your confirmation email.

8. How do I know if my personal information is safe?
We take data privacy and security very seriously. Your personal information is encrypted and securely stored. We adhere to strict privacy policies to ensure your data is protected.

9. Can the chatbot handle multiple bookings at once?
Yes, the chatbot can handle multiple bookings. If you need to book more than one appointment, simply follow the prompts for each booking.

10. What if I encounter technical issues while using the chatbot?
If you experience any technical issues, you can contact our support team through the contact information provided on our website or in your confirmation email.

11. Can I book an appointment outside of normal business hours?
The chatbot will provide available slots based on the service provider’s business hours. If you require an appointment outside of these hours, please contact our support team for special arrangements.

12. Will I receive reminders for my appointment?
Yes, you will receive email reminders before your appointment to ensure you don’t miss it.

13. What if I entered the wrong email address by mistake?
If you entered the wrong email address, you can start a new chat with the correct information or contact our support team to update your details.

14. Can I add additional information or special requests to my booking?
Yes, the chatbot will provide an option for you to add any additional information or special requests related to your appointment.

15. Is there a mobile app for booking appointments, or is it only through the chatbot?
Currently, appointments can be booked through the chatbot. We are working on additional features and platforms, so stay tuned for updates.
   `,
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],

    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage content={textStream.value} />
      }

      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    tools: {
      listStocks: {
        description: 'List three imaginary stocks that are trending.',
        parameters: z.object({
          stocks: z.array(
            z.object({
              symbol: z.string().describe('The symbol of the stock'),
              price: z.number().describe('The price of the stock'),
              delta: z.number().describe('The change in price of the stock')
            })
          )
        }),
        generate: async function* ({ stocks }) {
          yield (
            <BotCard>
              <StocksSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'listStocks',
                    toolCallId,
                    args: { stocks }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'listStocks',
                    toolCallId,
                    result: stocks
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Stocks props={stocks} />
            </BotCard>
          )
        }
      },
      // saveNameEmail: {
      //   description: 'Save the name and email of the user.',
      //   parameters: z.object({
      //     name: z.string().describe('The name of the user'),
      //     email: z.string().describe('The email of the user')
      //   }),
      //   generate: async function* ({ name, email }) {
      //     yield <BotCard>LOADING</BotCard>

      //     await sleep(1000)

      //     const toolCallId = nanoid()

      //     aiState.done({
      //       ...aiState.get(),
      //       messages: [
      //         ...aiState.get().messages,
      //         {
      //           id: nanoid(),
      //           role: 'assistant',
      //           content: [
      //             {
      //               type: 'tool-call',
      //               toolName: 'saveNameEmail',
      //               toolCallId,
      //               args: { name, email }
      //             }
      //           ]
      //         },
      //         {
      //           id: nanoid(),
      //           role: 'tool',
      //           content: [
      //             {
      //               type: 'tool-result',
      //               toolName: 'saveNameEmail',
      //               toolCallId,
      //               result: { name, email }
      //             }
      //           ]
      //         }
      //       ]
      //     })

      //     // localStorage.setItem('name', name)
      //     // localStorage.setItem('email', email)

      //     console.log(name, email)

      //     return (
      //       <BotCard>
      //         <p>Hello! {name}</p>
      //       </BotCard>
      //     )
      //   }
      // },
      scheduleAppointment: {
        description: 'Schedule an appointment',
        parameters: z.object({
          appointment: z.object({
            name: z.string().describe('The name of the user'),
            email: z.string().describe('The email of the user'),
            date: z
              .string()
              .describe('The date of the appointment, in ISO-8601 format'),
            time: z
              .string()
              .describe('The time of the appointment, in ISO-8601 format'),
            description: z
              .string()
              .describe('The description of the appointment')
          })
        }),
        generate: async function* ({ appointment }) {
          yield <BookAppointmentHead />

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'scheduleAppointment',
                    toolCallId,
                    args: { appointment }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'scheduleAppointment',
                    toolCallId,
                    result: {
                      id: nanoid(),
                      name: appointment.name,
                      email: appointment.email,
                      date: appointment.date,
                      time: appointment.time,
                      description: appointment.description
                    }
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <AppointmentDetailsCard appointment={appointment} />
            </BotCard>
          )
        }
      },
      showAppointmentDetails: {
        description: 'Show the details of an appointment.',
        parameters: z.object({
          appointment: z.array(
            z.object({
              name: z.string().describe('The name of the user'),
              email: z.string().describe('The email for the appointment'),
              date: z
                .string()
                .describe('The date of the appointment, in ISO-8601 format'),
              time: z
                .string()
                .describe('The time of the appointment, in ISO-8601 format'),
              description: z
                .string()
                .describe('The description of the appointment')
            })
          )
        }),
        generate: async function* ({ appointment }) {
          yield <BotCard>LOADING</BotCard>

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'showAppointmentDetails',
                    toolCallId,
                    args: { appointment }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'showAppointmentDetails',
                    toolCallId,
                    result: {
                      appointment
                    }
                  }
                ]
              }
            ]
          })
          console.log(appointment)

          return (
            <div>
              {appointment.map((appointment, index) => (
                <AppointmentDetailsCard
                  key={appointment.name + index}
                  appointment={appointment}
                />
              ))}
            </div>
          )
        }
      },
      // updateAppointment: {
      //   description: 'Update an appointment.',
      //   parameters: z.object({
      //     appointment: z.array(
      //       z.object({
      //         name: z.string().describe('The name of the user'),
      //         email: z.string().describe('The email for the appointment'),
      //         date: z
      //           .string()
      //           .describe('The date of the appointment, in ISO-8601 format'),
      //         time: z
      //           .string()
      //           .describe('The time of the appointment, in ISO-8601 format'),
      //         description: z
      //           .string()
      //           .describe('The description of the appointment')
      //       })
      //     )
      //   }),
      //   generate: async function* ({ appointment }) {
      //     yield <BotCard>LOADING</BotCard>
      //     await sleep(1000)
      //     const toolCallId = nanoid()
      //     aiState.done({
      //       ...aiState.get(),
      //       messages: [
      //         ...aiState.get().messages,
      //         {
      //           id: nanoid(),
      //           role: 'assistant',
      //           content: [
      //             {
      //               type: 'tool-call',
      //               toolName: 'updateAppointment',
      //               toolCallId,
      //               args: { appointment }
      //             }
      //           ]
      //         },
      //         {
      //           id: nanoid(),
      //           role: 'tool',
      //           content: [
      //             {
      //               type: 'tool-result',
      //               toolName: 'updateAppointment',
      //               toolCallId,
      //               result: {
      //                 appointment
      //               }
      //             }
      //           ]
      //         }
      //       ]
      //     })

      //     return (
      //       <BotCard>
      //         <p>Which one do you want to update?</p>
      //         {appointment.map((appointment, index) => (
      //           <div key={appointment.date}>
      //             <p>{index + 1}</p>
      //             <p>Date: {appointment.date}</p>
      //             <p>Time: {appointment.time}</p>
      //             <p>Description: {appointment.description}</p>
      //             {/* <button onClick={() => {}}>Update</button> */}
      //           </div>
      //         ))}
      //       </BotCard>
      //     )
      //   }
      // },
      // deleteAppointment: {
      //   description: 'Delete an appointment.',
      //   parameters: z.object({
      //     appointment: z.array(
      //       z.object({
      //         name: z.string().describe('The name of the user'),
      //         email: z.string().describe('The email for the appointment'),
      //         date: z
      //           .string()
      //           .describe('The date of the appointment, in ISO-8601 format'),
      //         time: z
      //           .string()
      //           .describe('The time of the appointment, in ISO-8601 format'),
      //         description: z
      //           .string()
      //           .describe('The description of the appointment')
      //       })
      //     )
      //   }),
      //   generate: async function* ({ appointment }) {
      //     yield <BotCard>LOADING</BotCard>

      //     await sleep(1000)

      //     const toolCallId = nanoid()

      //     aiState.done({
      //       ...aiState.get(),
      //       messages: [
      //         ...aiState.get().messages,
      //         {
      //           id: nanoid(),
      //           role: 'assistant',
      //           content: [
      //             {
      //               type: 'tool-call',
      //               toolName: 'deleteAppointment',
      //               toolCallId,
      //               args: { appointment }
      //             }
      //           ]
      //         },
      //         {
      //           id: nanoid(),
      //           role: 'tool',
      //           content: [
      //             {
      //               type: 'tool-result',
      //               toolName: 'deleteAppointment',
      //               toolCallId,
      //               result: {
      //                 appointment
      //               }
      //             }
      //           ]
      //         }
      //       ]
      //     })

      //     return (
      //       <BotCard>
      //         <p>Which one do you want to delete?</p>
      //         {appointment.map((appointment, index) => (
      //           <div key={appointment.date}>
      //             <p>{index + 1}</p>
      //             <p>Date: {appointment.date}</p>
      //             <p>Time: {appointment.time}</p>
      //             <p>Description: {appointment.description}</p>
      //             <button onClick={() => {}}>Delete</button>
      //           </div>
      //         ))}
      //       </BotCard>
      //     )
      //   }
      // },
      showStockPrice: {
        description:
          'Get the current stock price of a given stock or currency. Use this to show the price to the user.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          delta: z.number().describe('The change in price of the stock')
        }),
        generate: async function* ({ symbol, price, delta }) {
          yield (
            <BotCard>
              <StockSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'showStockPrice',
                    toolCallId,
                    args: { symbol, price, delta }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'showStockPrice',
                    toolCallId,
                    result: { symbol, price, delta }
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Stock props={{ symbol, price, delta }} />
            </BotCard>
          )
        }
      },
      showStockPurchase: {
        description:
          'Show price and the UI to purchase a stock or currency. Use this if the user wants to purchase a stock or currency.',
        parameters: z.object({
          symbol: z
            .string()
            .describe(
              'The name or symbol of the stock or currency. e.g. DOGE/AAPL/USD.'
            ),
          price: z.number().describe('The price of the stock.'),
          numberOfShares: z
            .number()
            .optional()
            .describe(
              'The **number of shares** for a stock or currency to purchase. Can be optional if the user did not specify it.'
            )
        }),
        generate: async function* ({ symbol, price, numberOfShares = 100 }) {
          const toolCallId = nanoid()

          if (numberOfShares <= 0 || numberOfShares > 1000) {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      args: { symbol, price, numberOfShares }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      result: {
                        symbol,
                        price,
                        numberOfShares,
                        status: 'expired'
                      }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'system',
                  content: `[User has selected an invalid amount]`
                }
              ]
            })

            return <BotMessage content={'Invalid amount'} />
          } else {
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      args: { symbol, price, numberOfShares }
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'showStockPurchase',
                      toolCallId,
                      result: {
                        symbol,
                        price,
                        numberOfShares
                      }
                    }
                  ]
                }
              ]
            })

            return (
              <BotCard>
                <Purchase
                  props={{
                    numberOfShares,
                    symbol,
                    price: +price,
                    status: 'requires_action'
                  }}
                />
              </BotCard>
            )
          }
        }
      },
      getEvents: {
        description:
          'List funny imaginary events between user highlighted dates that describe stock activity.',
        parameters: z.object({
          events: z.array(
            z.object({
              date: z
                .string()
                .describe('The date of the event, in ISO-8601 format'),
              headline: z.string().describe('The headline of the event'),
              description: z.string().describe('The description of the event')
            })
          )
        }),
        generate: async function* ({ events }) {
          yield (
            <BotCard>
              <EventsSkeleton />
            </BotCard>
          )

          await sleep(1000)

          const toolCallId = nanoid()

          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: [
                  {
                    type: 'tool-call',
                    toolName: 'getEvents',
                    toolCallId,
                    args: { events }
                  }
                ]
              },
              {
                id: nanoid(),
                role: 'tool',
                content: [
                  {
                    type: 'tool-result',
                    toolName: 'getEvents',
                    toolCallId,
                    result: events
                  }
                ]
              }
            ]
          })

          return (
            <BotCard>
              <Events props={events} />
            </BotCard>
          )
        }
      }
    }
  })

  return {
    id: nanoid(),
    display: result.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    confirmPurchase
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'listStocks' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                {/* @ts-expect-error */}
                <Stocks props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPrice' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Stock props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'showStockPurchase' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Purchase props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'getEvents' ? (
              <BotCard>
                {/* @ts-expect-error */}
                <Events props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
