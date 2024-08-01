import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '../ui/skeleton'
import { Resend } from 'resend'

interface EmailTemplateProps {
  appointment: {
    email: string
    name: string
    date: string
    time: string
    description: string
  }
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  appointment
}: {
  appointment: {
    email: string
    name: string
    date: string
    time: string
    description: string
  }
}) => (
  <div>
    <h1>Hello, {appointment.name}!</h1>

    <p>
      Your appointment is confirmed for {appointment.date} at {appointment.time}
      .
    </p>

    <p>Your appointment note: {appointment.description}</p>
  </div>
)

const resend = new Resend(process.env.RESEND_API_KEY)

const sendEmail = async ({
  appointment
}: {
  appointment: {
    email: string
    name: string
    date: string
    time: string
    description: string
  }
}) => {
  'use server'
  const { data, error } = await resend.emails.send({
    from: 'sachin@sapkotasachin.com.np',
    to: [appointment.email],
    subject: 'Appointment Confirmation',
    react: EmailTemplate({
      appointment
    })
  })

  if (error) {
    return console.error(error)
  }

  console.log(data)
}

export function BookAppointmentHead() {
  return (
    <Card>
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </Card>
  )
}

export function AppointmentDetailsCard({
  appointment
}: {
  appointment: {
    name: string
    email: string
    date: string
    time: string
    description: string
  }
}) {
  // call sendEmail function
  sendEmail({
    appointment
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Details</CardTitle>
        <CardDescription>{appointment.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Date: {appointment.date}</p>
      </CardContent>
      <CardFooter>
        <p>Time: {appointment.time}</p>
      </CardFooter>
    </Card>
  )
}
