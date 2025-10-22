"use client"

import { Stepper } from "@/components/stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency, formatTime } from "@/lib/utils"
import { ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface PageProps {
  params: {
    tenant: string
    barbershop: string
  }
}

interface Barber {
  id: string
  name: string
  specialties?: string
}

interface Service {
  id: string
  name: string
  durationMinutes: number
  priceCents: number
}

interface TimeSlot {
  time: string
  available: boolean
}

const steps = [
  { id: "barber", title: "Profissional", description: "Escolha seu barbeiro" },
  { id: "services", title: "Serviços", description: "Selecione os serviços" },
  { id: "date", title: "Data", description: "Escolha o dia" },
  { id: "time", title: "Horário", description: "Selecione o horário" },
  { id: "checkout", title: "Dados", description: "Confirme seus dados" }
]

export default function SchedulePage({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedBarber, setSelectedBarber] = useState<string>("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    email: ""
  })
  const [loading, setLoading] = useState(false)

  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    // Mock data - em produção viria da API
    setBarbers([
      { id: "1", name: "João Silva", specialties: "Corte, Barba" },
      { id: "2", name: "Maria Santos", specialties: "Sobrancelha, Barba" }
    ])

    setServices([
      { id: "1", name: "Corte Masculino", durationMinutes: 30, priceCents: 2500 },
      { id: "2", name: "Barba", durationMinutes: 20, priceCents: 1500 },
      { id: "3", name: "Sobrancelha", durationMinutes: 15, priceCents: 2000 }
    ])

    // Mock time slots
    setTimeSlots([
      { time: "09:00", available: true },
      { time: "09:15", available: true },
      { time: "09:30", available: false },
      { time: "09:45", available: true },
      { time: "10:00", available: true },
      { time: "10:15", available: true },
      { time: "10:30", available: false },
      { time: "10:45", available: true },
      { time: "11:00", available: true },
      { time: "11:15", available: true },
      { time: "11:30", available: true },
      { time: "11:45", available: true },
      { time: "14:00", available: true },
      { time: "14:15", available: true },
      { time: "14:30", available: true },
      { time: "14:45", available: true },
      { time: "15:00", available: true },
      { time: "15:15", available: true },
      { time: "15:30", available: true },
      { time: "15:45", available: true },
      { time: "16:00", available: true },
      { time: "16:15", available: true },
      { time: "16:30", available: true },
      { time: "16:45", available: true },
      { time: "17:00", available: true },
      { time: "17:15", available: true },
      { time: "17:30", available: true },
      { time: "17:45", available: true }
    ])

    // Pre-select barber if in URL
    const barberParam = searchParams.get("barber")
    if (barberParam) {
      setSelectedBarber(barberParam)
    }
  }, [searchParams])

  const totalDuration = selectedServices.reduce((total, serviceId) => {
    const service = services.find(s => s.id === serviceId)
    return total + (service?.durationMinutes || 0)
  }, 0)

  const totalPrice = selectedServices.reduce((total, serviceId) => {
    const service = services.find(s => s.id === serviceId)
    return total + (service?.priceCents || 0)
  }, 0)

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedBarber !== ""
      case 1: return selectedServices.length > 0
      case 2: return selectedDate !== ""
      case 3: return selectedTime !== ""
      case 4: return customerData.name !== "" && customerData.phone !== ""
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Mock API call
      const appointment = {
        id: "stub-" + Date.now(),
        barber: barbers.find(b => b.id === selectedBarber)?.name,
        services: selectedServices.map(id => services.find(s => s.id === id)),
        date: selectedDate,
        time: selectedTime,
        customer: customerData,
        totalPrice
      }

      // Redirect to confirmation
      router.push(`/t/${params.tenant}/${params.barbershop}/confirm/${appointment.id}`)
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Escolha seu profissional</h3>
            <div className="grid gap-4">
              <Card 
                className={`cursor-pointer transition-colors ${selectedBarber === "" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedBarber("")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Sem preferência</h4>
                      <p className="text-sm text-muted-foreground">Qualquer profissional disponível</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {barbers.map((barber) => (
                <Card 
                  key={barber.id}
                  className={`cursor-pointer transition-colors ${selectedBarber === barber.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedBarber(barber.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{barber.name}</h4>
                        <p className="text-sm text-muted-foreground">{barber.specialties}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Selecione os serviços</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <Card key={service.id} className="cursor-pointer transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedServices([...selectedServices, service.id])
                          } else {
                            setSelectedServices(selectedServices.filter(id => id !== service.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(service.durationMinutes)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatCurrency(service.priceCents)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedServices.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(totalPrice)} • {formatTime(totalDuration)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Escolha a data</h3>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 14 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() + i)
                const dateStr = date.toISOString().split('T')[0]
                const isSelected = selectedDate === dateStr
                const isToday = i === 0
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-3 rounded-xl text-center transition-colors ${
                      isSelected 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-bold">
                      {date.getDate()}
                    </div>
                    {isToday && (
                      <div className="text-xs">Hoje</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Escolha o horário</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`p-3 rounded-xl text-center transition-colors ${
                    selectedTime === slot.time
                      ? "bg-primary text-primary-foreground"
                      : slot.available
                      ? "bg-muted hover:bg-muted/80"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Confirme seus dados</h3>
            
            {/* Resumo do agendamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profissional:</span>
                  <span className="font-medium">
                    {selectedBarber === "" ? "Sem preferência" : barbers.find(b => b.id === selectedBarber)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviços:</span>
                  <div className="text-right">
                    {selectedServices.map(id => {
                      const service = services.find(s => s.id === id)
                      return (
                        <div key={id} className="text-sm">
                          {service?.name} - {formatCurrency(service?.priceCents || 0)}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">
                    {selectedDate && new Date(selectedDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horário:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-4">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Formulário de dados */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/t/${params.tenant}/${params.barbershop}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            Agendar Horário
          </h1>
          <p className="text-muted-foreground">
            {params.barbershop === 'centro' ? 'Barbearia Centro' : 'Barbearia Moinhos'}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
            >
              {loading ? "Processando..." : currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
