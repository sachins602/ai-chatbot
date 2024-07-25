// a component that displays a list of frequently asked questions
// and their corresponding answers
'use client'
import { useState } from 'react'
import { Button } from './ui/button'

const faqs = [
  {
    question: 'How does the chatbot greet users?',
    answer:
      'When you start a conversation with the chatbot, it will greet you with a friendly message, making you feel welcomed and ready to assist you.'
  },
  {
    question: 'Does the chatbot say goodbye when I finish the conversation?',
    answer:
      'Yes, the chatbot will say goodbye at the end of the conversation, ensuring the interaction feels complete.'
  },
  {
    question: 'Can I ask the chatbot common questions?',
    answer:
      'Yes, you can ask the chatbot common questions, and it will provide accurate answers quickly, so you donot have to search through documentation.'
  },
  {
    question: 'What kind of questions can I ask the chatbot?',
    answer:
      'You can ask the chatbot a variety of common questions related to the services, features, or general information it provides.'
  },
  {
    question: 'Does the chatbot remember my name and preferences?',
    answer:
      'Yes, the chatbot can remember your name and preferences to make each interaction more personalized and relevant to your needs.'
  },
  {
    question: 'How does the chatbot use my preferences?',
    answer:
      'The chatbot uses your preferences to tailor its responses and recommendations, enhancing your overall experience.'
  },
  {
    question: 'Can I schedule appointments through the chatbot?',
    answer:
      'Yes, you can schedule appointments through the chatbot, making it easy to manage your bookings without the need to call or email.'
  },
  {
    question:
      'Is it possible to reschedule or cancel my appointments using the chatbot?',
    answer:
      'Absolutely. You can reschedule or cancel your appointments through the chatbot, allowing you to adjust your plans quickly and efficiently.'
  },
  {
    question: 'How can I provide feedback on my interaction with the chatbot?',
    answer:
      'At the end of your interaction, the chatbot will prompt you to provide feedback. Your input will help improve its performance and ensure it meets your needs.'
  },
  {
    question: 'Why does the chatbot collect user feedback?',
    answer:
      'The chatbot collects user feedback to understand user satisfaction and identify areas for improvement, helping the business owner enhance the service quality.'
  }
]

// a component that displays a button when clicked, expands the section and displays the faqs
// it also has a state to keep track of whether the section is expanded or not with a go back button

export function FaqSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <div className="w-full h-3/5 overflow-y-scroll max-w-md pt-4 md:pt-10">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
          isExpanded ? 'rounded-b-none' : ''
        }`}
      >
        FAQs
      </Button>
      {isExpanded && (
        <div>
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
