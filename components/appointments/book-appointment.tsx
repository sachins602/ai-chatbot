import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '../ui/skeleton'

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
    date: string
    time: string
    description: string
  }
}) {
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
