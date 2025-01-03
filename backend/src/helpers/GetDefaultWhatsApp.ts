import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import GetDefaultWhatsAppByUser from "./GetDefaultWhatsAppByUser";

const GetDefaultWhatsApp = async (
  companyId: number,
  whatsappId?: number,
  userId?: number
): Promise<Whatsapp> => {
  if (!companyId) {
    throw new AppError("ERR_COMPANY_ID_REQUIRED");
  }

  let connection: Whatsapp | null = null;
  let defaultWhatsapp = null;

  // Verifica se o whatsappId foi passado e busca o WhatsApp correspondente
  if (whatsappId) {
    defaultWhatsapp = await Whatsapp.findOne({
      where: { id: whatsappId, companyId }
    });
  } else {
    // Busca o WhatsApp com status "CONNECTED" e que pertence à empresa especificada
    defaultWhatsapp = await Whatsapp.findOne({
      where: { status: "CONNECTED", companyId }
    });
  }

  // Se encontrou um WhatsApp conectado, define a conexão
  if (defaultWhatsapp?.status === "CONNECTED") {
    connection = defaultWhatsapp;
  }

  // Se o userId for passado, tenta buscar o WhatsApp específico do usuário
  if (userId) {
    const whatsappByUser = await GetDefaultWhatsAppByUser(userId);
    if (whatsappByUser?.status === "CONNECTED") {
      connection = whatsappByUser;
    } else {
      const whatsapp = await Whatsapp.findOne({
        where: { status: "CONNECTED", companyId }
      });
      connection = whatsapp;
    }
  }

  // Se não encontrou nenhuma conexão, lança um erro
  if (!connection) {
    throw new AppError(`ERR_NO_DEF_WAPP_FOUND in COMPANY ${companyId}`);
  }

  return connection;
};

export default GetDefaultWhatsApp;