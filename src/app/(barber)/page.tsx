import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Phone, Scissors } from "lucide-react"
import Link from "next/link"

export default function BarberHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Scissors className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Agende seu horário
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontre a barbearia perfeita e agende seu horário de forma rápida e fácil
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Barbearia Centro</CardTitle>
                  <CardDescription>Rua das Flores, 123 - Centro</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  (11) 3333-4444
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Seg-Sáb: 09:00-18:00
                </div>
                <div className="pt-4">
                  <Link href="/t/acme/centro">
                    <Button className="w-full group-hover:bg-primary/90">
                      Agendar na Centro
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Barbearia Moinhos</CardTitle>
                  <CardDescription>Av. Osvaldo Aranha, 456 - Moinhos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  (11) 3333-5555
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Seg-Sáb: 09:00-18:00
                </div>
                <div className="pt-4">
                  <Link href="/t/acme/moinhos">
                    <Button className="w-full group-hover:bg-primary/90">
                      Agendar na Moinhos
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground">
            Ou acesse diretamente: <Link href="/t/acme/centro" className="text-primary hover:underline">acme.barbersaas.com/centro</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
