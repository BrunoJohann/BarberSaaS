"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Calendar, Clock, Phone, Scissors, Star, User } from "lucide-react"
import Link from "next/link"
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
  bio?: string
  specialties?: string
  isActive: boolean
}

interface Service {
  id: string
  name: string
  durationMinutes: number
  priceCents: number
  isActive: boolean
}

export default function BarbershopPage({ params }: PageProps) {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - em produção viria da API
    setBarbers([
      {
        id: "1",
        name: "João Silva",
        bio: "Especialista em cortes modernos e barba",
        specialties: "Corte, Barba",
        isActive: true
      },
      {
        id: "2", 
        name: "Maria Santos",
        bio: "Especialista em sobrancelha e design",
        specialties: "Sobrancelha, Barba",
        isActive: true
      }
    ])

    setServices([
      {
        id: "1",
        name: "Corte Masculino",
        durationMinutes: 30,
        priceCents: 2500,
        isActive: true
      },
      {
        id: "2",
        name: "Barba",
        durationMinutes: 20,
        priceCents: 1500,
        isActive: true
      },
      {
        id: "3",
        name: "Sobrancelha",
        durationMinutes: 15,
        priceCents: 2000,
        isActive: true
      }
    ])

    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-32 bg-muted rounded-2xl"></div>
              <div className="h-32 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Scissors className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {params.barbershop === 'centro' ? 'Barbearia Centro' : 'Barbearia Moinhos'}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {params.barbershop === 'centro' 
              ? 'Rua das Flores, 123 - Centro' 
              : 'Av. Osvaldo Aranha, 456 - Moinhos'
            }
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {params.barbershop === 'centro' ? '(11) 3333-4444' : '(11) 3333-5555'}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Seg-Sáb: 09:00-18:00
            </div>
          </div>
        </div>

        {/* Professionals */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Nossos Profissionais</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {barbers.map((barber) => (
              <Card key={barber.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{barber.name}</CardTitle>
                      <CardDescription>{barber.bio}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {barber.specialties?.split(', ').map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="pt-2">
                      <Link href={`/t/${params.tenant}/${params.barbershop}/schedule?barber=${barber.id}`}>
                        <Button className="w-full group-hover:bg-primary/90">
                          Agendar com {barber.name}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Nossos Serviços</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription>
                    {Math.floor(service.durationMinutes / 60)}h {service.durationMinutes % 60}min
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(service.priceCents)}
                    </span>
                    <Star className="w-5 h-5 text-warning" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href={`/t/${params.tenant}/${params.barbershop}/schedule`}>
            <Button size="lg" className="text-lg px-12 py-6">
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Horário
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
