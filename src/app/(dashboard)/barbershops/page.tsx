"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
    Building2,
    Calendar,
    DollarSign,
    Eye,
    MapPin,
    MoreHorizontal,
    Phone,
    Users
} from "lucide-react"
import { useEffect, useState } from "react"

interface Barbershop {
  id: string
  name: string
  address: string
  phone: string
  isActive: boolean
  todayAppointments: number
  todayRevenue: number
  totalBarbers: number
  occupancyRate: number
  lastAppointment?: string
}

export default function BarbershopsPage() {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - em produção viria da API
    setTimeout(() => {
      setBarbershops([
        {
          id: "1",
          name: "Barbearia Centro",
          address: "Rua das Flores, 123 - Centro",
          phone: "(11) 3333-4444",
          isActive: true,
          todayAppointments: 12,
          todayRevenue: 180000, // em centavos
          totalBarbers: 3,
          occupancyRate: 85.5,
          lastAppointment: "14:30"
        },
        {
          id: "2",
          name: "Barbearia Moinhos",
          address: "Av. Osvaldo Aranha, 456 - Moinhos",
          phone: "(11) 3333-5555",
          isActive: true,
          todayAppointments: 8,
          todayRevenue: 120000, // em centavos
          totalBarbers: 2,
          occupancyRate: 72.3,
          lastAppointment: "16:00"
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-2xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Filiais</h1>
          <p className="text-muted-foreground">
            Gerencie suas barbearias e acompanhe o desempenho
          </p>
        </div>
        <Button>
          <Building2 className="w-4 h-4 mr-2" />
          Nova Filial
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Filiais</p>
                <p className="text-2xl font-bold">{barbershops.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                <p className="text-2xl font-bold">
                  {barbershops.reduce((sum, shop) => sum + shop.todayAppointments, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Hoje</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(barbershops.reduce((sum, shop) => sum + shop.todayRevenue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Barbeiros</p>
                <p className="text-2xl font-bold">
                  {barbershops.reduce((sum, shop) => sum + shop.totalBarbers, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barbershops List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {barbershops.map((barbershop) => (
          <Card key={barbershop.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{barbershop.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {barbershop.address}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={barbershop.isActive ? "default" : "secondary"}>
                    {barbershop.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                {barbershop.phone}
              </div>

              {/* Today's Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{barbershop.todayAppointments}</p>
                  <p className="text-xs text-muted-foreground">Agendamentos</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-success">{formatCurrency(barbershop.todayRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Receita</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barbeiros:</span>
                  <span className="font-medium">{barbershop.totalBarbers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ocupação:</span>
                  <span className="font-medium">{barbershop.occupancyRate}%</span>
                </div>
                {barbershop.lastAppointment && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Último agendamento:</span>
                    <span className="font-medium">{barbershop.lastAppointment}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t">
                <Button className="w-full group-hover:bg-primary/90">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {barbershops.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma filial cadastrada</h3>
            <p className="text-muted-foreground mb-6">
              Comece criando sua primeira filial para gerenciar agendamentos
            </p>
            <Button>
              <Building2 className="w-4 h-4 mr-2" />
              Criar Primeira Filial
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
