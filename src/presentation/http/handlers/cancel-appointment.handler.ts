import { Context } from "koa";

// TODO: Implementar handler de cancelamento quando for criado o caso de uso
export async function handleCancelAppointment(ctx: Context) {
  try {
    const { token } = ctx.params;

    // Em um cenário real, teríamos um caso de uso específico para cancelamento
    // Neste exemplo, vamos apenas simular uma resposta
    ctx.body = {
      success: true,
      message: "Agendamento cancelado com sucesso",
    };
  } catch (error: any) {
    console.error("Erro ao cancelar agendamento:", error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
}
