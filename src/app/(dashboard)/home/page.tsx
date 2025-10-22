"use client"

import { KpiCard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import {
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    TrendingUp,
    Users
} from "lucide-react"
import { useEffect, useState } from "react"

interface DashboardData {
  todayAppointments: number
  monthlyRevenue: number
  activeCustomers: number
  occupancyRate: number
  recentAppointments: Array<{
    id: string
    customerName: string
    barberName: string
    time: string
    services: string[]
    status: string
  }>
  upcomingAppointments: Array<{
    id: string
    customerName: string
    barberName: string
    time: string
    services: string[]
  }>
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("today")

  useEffect(() => {
    // Mock data - em produção viria da API
    setTimeout(() => {
      setData({
        todayAppointments: 12,
        monthlyRevenue: 1542000, // em centavos
        activeCustomers: 89,
        occupancyRate: 78.5,
        recentAppointments: [
          {
            id: "1",
            customerName: "João Silva",
            barberName: "Maria Santos",
            time: "09:00",
            services: ["Corte", "Barba"],
            status: "CONFIRMED"
          },
          {
            id: "2",
            customerName: "Pedro Costa",
            barberName: "João Silva",
            time: "09:30",
            services: ["Corte"],
            status: "CONFIRMED"
          },
          {
            id: "3",
            customerName: "Ana Oliveira",
            barberName: "Maria Santos",
            time: "10:00",
            services: ["Sobrancelha"],
            status: "CONFIRMED"
          }
        ],
        upcomingAppointments: [
          {
            id: "4",
            customerName: "Carlos Mendes",
            barberName: "João Silva",
            time: "10:30",
            services: ["Corte", "Barba"]
          },
          {
            id: "5",
            customerName: "Lucia Ferreira",
            barberName: "Maria Santos",
            time: "11:00",
            services: ["Sobrancelha", "Barba"]
          }
        ]
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">7 dias</SelectItem>
              <SelectItem value="month">30 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Agendamentos Hoje"
          value={data.todayAppointments}
          icon={Calendar}
          trend={{ value: 12, label: "vs ontem", isPositive: true }}
        />
        <KpiCard
          title="Receita do Mês"
          value={formatCurrency(data.monthlyRevenue)}
          icon={DollarSign}
          trend={{ value: 8.2, label: "vs mês anterior", isPositive: true }}
        />
        <KpiCard
          title="Clientes Ativos"
          value={data.activeCustomers}
          icon={Users}
          trend={{ value: 5.1, label: "vs mês anterior", isPositive: true }}
        />
        <KpiCard
          title="Taxa de Ocupação"
          value={`${data.occupancyRate}%`}
          icon={TrendingUp}
          trend={{ value: 2.3, label: "vs mês anterior", isPositive: true }}
        />
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Receita dos Últimos 7 Dias
            </CardTitle>
            <CardDescription>
              Evolução da receita diária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Gráfico será implementado no Prompt 3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Serviços Mais Populares
            </CardTitle>
            <CardDescription>
              Ranking dos serviços mais solicitados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <span className="font-medium">Corte Masculino</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">45 agendamentos</p>
                  <p className="text-sm text-muted-foreground">R$ 1.125,00</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <span className="font-medium">Barba</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">32 agendamentos</p>
                  <p className="text-sm text-muted-foreground">R$ 480,00</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <span className="font-medium">Sobrancelha</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">18 agendamentos</p>
                  <p className="text-sm text-muted-foreground">R$ 360,00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Agendamentos Recentes
            </CardTitle>
            <CardDescription>
              Últimos agendamentos confirmados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{appointment.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.barberName} • {appointment.time}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {appointment.services.map((service, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximos Agendamentos
            </CardTitle>
            <CardDescription>
              Agendamentos confirmados para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{appointment.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.barberName} • {appointment.time}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {appointment.services.map((service, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
