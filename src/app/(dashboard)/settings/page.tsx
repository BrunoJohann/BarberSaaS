"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatTime } from "@/lib/utils"
import {
    Building2,
    CheckCircle,
    Clock,
    Save,
    Settings
} from "lucide-react"
import { useEffect, useState } from "react"

interface BarbershopSettings {
  name: string
  address: string
  phone: string
  timezone: string
  slotGranularity: number
  isActive: boolean
}

const timezones = [
  { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
  { value: "America/New_York", label: "Nova York (UTC-5)" },
  { value: "Europe/London", label: "Londres (UTC+0)" },
]

const slotGranularityOptions = [
  { value: 5, label: "5 minutos" },
  { value: 10, label: "10 minutos" },
  { value: 15, label: "15 minutos" },
  { value: 20, label: "20 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 60, label: "1 hora" },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<BarbershopSettings>({
    name: "",
    address: "",
    phone: "",
    timezone: "America/Sao_Paulo",
    slotGranularity: 15,
    isActive: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Mock data - em produção viria da API
    setTimeout(() => {
      setSettings({
        name: "Barbearia Centro",
        address: "Rua das Flores, 123 - Centro",
        phone: "(11) 3333-4444",
        timezone: "America/Sao_Paulo",
        slotGranularity: 15,
        isActive: true
      })
      setLoading(false)
    }, 1000)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Mock API call - em produção seria PATCH /api/admin/barbershops/[id]/settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="space-y-4">
          <div className="h-64 bg-muted rounded-2xl"></div>
          <div className="h-64 bg-muted rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua barbearia
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className={saved ? "bg-success hover:bg-success/90" : ""}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados principais da barbearia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Barbearia</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({...settings, name: e.target.value})}
                placeholder="Nome da sua barbearia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                placeholder="Endereço completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Barbearia Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Quando desativada, não aceita novos agendamentos
                </p>
              </div>
              <Switch
                id="isActive"
                checked={settings.isActive}
                onCheckedChange={(checked) => setSettings({...settings, isActive: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Configurações de Horários
            </CardTitle>
            <CardDescription>
              Defina como os horários são organizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => setSettings({...settings, timezone: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotGranularity">Granularidade dos Horários</Label>
              <Select 
                value={settings.slotGranularity.toString()} 
                onValueChange={(value) => setSettings({...settings, slotGranularity: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {slotGranularityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Intervalo mínimo entre agendamentos. Atual: {formatTime(settings.slotGranularity)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações Avançadas
          </CardTitle>
          <CardDescription>
            Configurações adicionais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Notificações</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembretes por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembretes 1h antes do agendamento
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Confirmação por WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar confirmação via WhatsApp
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Integrações</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Google Calendar</Label>
                    <p className="text-sm text-muted-foreground">
                      Sincronizar com Google Calendar
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp Business</Label>
                    <p className="text-sm text-muted-foreground">
                      Integração com WhatsApp Business
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam permanentemente sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <h4 className="font-medium text-destructive">Desativar Barbearia</h4>
                <p className="text-sm text-muted-foreground">
                  Desativa permanentemente a barbearia e cancela todos os agendamentos futuros
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Desativar
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <h4 className="font-medium text-destructive">Excluir Conta</h4>
                <p className="text-sm text-muted-foreground">
                  Remove permanentemente sua conta e todos os dados associados
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
