import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import GetDefaultWhatsAppByUser from "./GetDefaultWhatsAppByUser";

const GetDefaultWhatsApp = async (
  companyId: number,
  userId?: number
): Promise<Whatsapp> => {
  console.log(`Função GetDefaultWhatsApp chamada com companyId: ${companyId}, userId: ${userId}`);
  
  let connection: Whatsapp;

  // Logando o valor do WhatsApp padrão
  const defaultWhatsapp = await Whatsapp.findOne({
    where: { isDefault: true, companyId }
  });
  console.log("WhatsApp padrão encontrado:", defaultWhatsapp);

  if (defaultWhatsapp?.status === 'CONNECTED') {
    console.log("O WhatsApp padrão está conectado.");
    connection = defaultWhatsapp;
  } else {
    console.log("O WhatsApp padrão não está conectado, buscando outro WhatsApp conectado.");
    const whatsapp = await Whatsapp.findOne({
      where: { status: "CONNECTED", companyId }
    });
    console.log("WhatsApp conectado encontrado:", whatsapp);
    connection = whatsapp;
  }

  if (userId) {
    console.log(`Buscando WhatsApp pelo userId: ${userId}`);
    const whatsappByUser = await GetDefaultWhatsAppByUser(userId);
    console.log("WhatsApp encontrado pelo usuário:", whatsappByUser);
    
    if (whatsappByUser?.status === 'CONNECTED') {
      console.log("O WhatsApp do usuário está conectado.");
      connection = whatsappByUser;
    } else {
      console.log("O WhatsApp do usuário não está conectado, buscando outro WhatsApp conectado.");
      const whatsapp = await Whatsapp.findOne({
        where: { status: "CONNECTED", companyId }
      });
      console.log("WhatsApp conectado encontrado:", whatsapp);
      connection = whatsapp;
    }
  }

  if (!connection) {
    console.error(`Nenhuma conexão encontrada para a companyId: ${companyId}`);
    throw new AppError(`ERR_NO_DEF_WAPP_FOUND in COMPANY ${companyId}`);
  }

  console.log("Retornando conexão encontrada:", connection);
  return connection;
};

export default GetDefaultWhatsApp;
