"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Calendar, CheckCircle, Clock, Download, Mail, MapPin, Phone, Scissors, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface PageProps {
  params: {
    tenant: string
    barbershop: string
    appointmentId: string
  }
}

interface Appointment {
  id: string
  barber: string
  services: Array<{
    name: string
    priceCents: number
  }>
  date: string
  time: string
  customer: {
    name: string
    phone: string
    email?: string
  }
  totalPrice: number
  status: string
}

export default function ConfirmPage({ params }: PageProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - em produção viria da API
    setTimeout(() => {
      setAppointment({
        id: params.appointmentId,
        barber: "João Silva",
        services: [
          { name: "Corte Masculino", priceCents: 2500 },
          { name: "Barba", priceCents: 1500 }
        ],
        date: "2024-01-20",
        time: "14:30",
        customer: {
          name: "João da Silva",
          phone: "(11) 99999-9999",
          email: "joao@email.com"
        },
        totalPrice: 4000,
        status: "CONFIRMED"
      })
      setLoading(false)
    }, 1000)
  }, [params.appointmentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Agendamento não encontrado
            </h1>
            <p className="text-muted-foreground mb-8">
              O agendamento solicitado não foi encontrado.
            </p>
            <Link href={`/t/${params.tenant}/${params.barbershop}`}>
              <Button>Voltar para a barbearia</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Agendamento Confirmado!
            </h1>
            <p className="text-xl text-muted-foreground">
              Seu horário foi agendado com sucesso
            </p>
          </div>

          {/* Appointment Details */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Detalhes do Agendamento</CardTitle>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  {appointment.status === "CONFIRMED" ? "Confirmado" : appointment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Barber & Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profissional</p>
                    <p className="font-medium">{appointment.barber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">
                      {params.barbershop === 'centro' ? 'Barbearia Centro' : 'Barbearia Moinhos'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {appointmentDateTime.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-medium">{appointment.time}</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Serviços</p>
                <div className="space-y-2">
                  {appointment.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <span className="font-semibold text-primary">
                        {formatCurrency(service.priceCents)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(appointment.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-3">Dados do Cliente</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{appointment.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{appointment.customer.phone}</span>
                  </div>
                  {appointment.customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.customer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Adicionar ao Calendário</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Baixe o arquivo .ics para adicionar o agendamento ao seu calendário
              </p>
              <Button asChild className="w-full md:w-auto">
                <a 
                  href={`/api/ics/appointment/${appointment.id}`}
                  download={`agendamento-${appointment.id}.ics`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar .ics
                </a>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/t/${params.tenant}/${params.barbershop}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Fazer Novo Agendamento
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="ghost" className="w-full">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Você receberá um lembrete por SMS 1 hora antes do agendamento.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Para cancelar ou reagendar, entre em contato conosco.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
