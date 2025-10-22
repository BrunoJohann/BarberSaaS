import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, reason } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar agendamento existente
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        appointmentServices: true,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    // Validar transição de status
    if (!isValidStatusTransition(existingAppointment.status, status)) {
      return NextResponse.json(
        { error: 'Transição de status inválida' },
        { status: 400 }
      );
    }

    // Atualizar agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    // Registrar histórico de status
    await prisma.appointmentStatusHistory.create({
      data: {
        appointmentId: id,
        fromStatus: existingAppointment.status,
        toStatus: status,
        reason: reason || `Status alterado para ${status}`,
      },
    });

    // Se cancelado, remover do calendário (best effort)
    if (status === 'CANCELED') {
      deleteAppointmentFromCalendar(id).catch(console.error);
    }

    return NextResponse.json({
      appointment: updatedAppointment,
      message: `Agendamento ${status.toLowerCase()} com sucesso`,
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Buscar agendamento existente
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    // Cancelar agendamento
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELED',
        updatedAt: new Date(),
      },
    });

    // Registrar histórico de status
    await prisma.appointmentStatusHistory.create({
      data: {
        appointmentId: id,
        fromStatus: existingAppointment.status,
        toStatus: 'CANCELED',
        reason: 'Agendamento cancelado',
      },
    });

    // Remover do calendário (best effort)
    deleteAppointmentFromCalendar(id).catch(console.error);

    return NextResponse.json({
      appointment: updatedAppointment,
      message: 'Agendamento cancelado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function isValidStatusTransition(
  fromStatus: string,
  toStatus: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    CONFIRMED: ['CANCELED', 'COMPLETED'],
    CANCELED: [], // Não pode sair do cancelado
    COMPLETED: [], // Não pode sair do completado
  };

  return validTransitions[fromStatus]?.includes(toStatus) || false;
}

async function deleteAppointmentFromCalendar(
  appointmentId: string
): Promise<void> {
  // Implementação mock - em produção, integrar com Google Calendar, Outlook, etc.
  console.log(`Removendo agendamento ${appointmentId} do calendário`);
}
