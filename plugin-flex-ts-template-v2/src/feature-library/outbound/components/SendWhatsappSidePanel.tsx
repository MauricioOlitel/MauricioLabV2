import React, { useState, useEffect } from "react";
import { SidePanel, Manager, useFlexSelector } from "@twilio/flex-ui";
import {
  Label,
  Select,
  Option,
  HelpText,
  Separator,
  Box,
  Text,
  TextArea,
  Button
} from "@twilio-paste/core";
import { PhoneNumberUtil, AsYouTypeFormatter } from "google-libphonenumber";
import { Actions } from "@twilio/flex-ui";

interface SendWhatsappSidePanelProps {
  isOpen: boolean;
  phoneNumber: string;
  templates: any[];
  onClose: () => void;
}

export const SendWhatsappSidePanel: React.FC<SendWhatsappSidePanelProps> = ({
  isOpen,
  templates,
  phoneNumber,
  onClose,
}) => {
  const [toNumber, setToNumber] = useState(phoneNumber);
  const [contentTemplateSid, setContentTemplateSid] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [queueSid, setQueueSid] = useState("");
  const manager = Manager.getInstance();
  // Reactive subscription to queue list; ensures re-render when Flex populates realtimeQueues later
  const queueOptions = useFlexSelector(state => {
    const ql = state.flex?.realtimeQueues?.queuesList || {};
    return Object.values(ql);
  }) as any[];

  // Quando o painel abrir, zere os campos e preencha o número
  useEffect(() => {
    if (isOpen) {
      setToNumber(phoneNumber);
  setContentTemplateSid("");
  setQueueSid("");
    }
  }, [isOpen, phoneNumber]);

  // Validação básica de número internacional
  const isToNumberValid = (() => {
    if (!toNumber) return false;
    try {
      const phoneUtil = PhoneNumberUtil.getInstance();
      // Tenta parse adicionando '+' se faltar
      const raw = toNumber.startsWith('+') ? toNumber : `+${toNumber}`;
      const parsed = phoneUtil.parse(raw);
      return phoneUtil.isPossibleNumber(parsed);
    } catch {
      // Fallback simples: 8+ dígitos
      return /[0-9]{8,}/.test(toNumber.replace(/[^0-9]/g, ''));
    }
  })();

  // Exibe número formatado
  let friendlyPhoneNumber = "";
  try {
    const formatter = new AsYouTypeFormatter("BR");
    friendlyPhoneNumber = "";
    [...toNumber].forEach((c) => (friendlyPhoneNumber = formatter.inputDigit(c)));
  } catch {
    friendlyPhoneNumber = toNumber;
  }

  // Envia WhatsApp
  const handleSend = async () => {
    setIsSending(true);
    try {
      let normalizedNumber = toNumber.trim();
      // Garante que o número começa com +
      if (!normalizedNumber.startsWith("+")) {
        normalizedNumber = "+" + normalizedNumber.replace(/^0+/, "");
      }

      await Actions.invokeAction("SendOutboundMessage", {
        destination: `whatsapp:${normalizedNumber}`,
        callerId: `whatsapp:${process.env.FLEX_APP_TWILIO_WHATSAPP_FROM_NUMBER}`,
        contentTemplateSid,
        messageType: "whatsapp",
        openChat: true,
        routeToMe: true,
        queueSid: queueSid || undefined
      });

      onClose();
    } catch (e: any) {
      alert("Erro ao enviar mensagem: " + e.message);
    }
    setIsSending(false);
  };



  if (!isOpen) return null;

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: 400,
        background: "#fff",
        zIndex: 9999,
        boxShadow: "0 0 16px rgba(0,0,0,.14)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cabeçalho */}
      <Box
        padding="space50"
        borderBottomStyle="solid"
        borderBottomWidth="borderWidth10"
        borderBottomColor="colorBorderWeak"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="colorBackground"
      >
        <Text as="h3" fontWeight="fontWeightBold" fontSize="fontSize40">
          Enviar WhatsApp
        </Text>
        <Button size="icon_small" variant="secondary_icon" onClick={onClose}>
          ✕
        </Button>
      </Box>
      {/* Corpo */}
      <Box flex="1 1 0" overflowY="auto" padding={"space50"}>
        <Label htmlFor="select_content_template">Telefone</Label>
        <Text as="p" marginBottom="space40" fontWeight="fontWeightSemibold">
          {friendlyPhoneNumber || toNumber}
        </Text>
    <Label htmlFor="select_content_template">Template WhatsApp</Label>
          <Select
            id="select_content_template"
            value={contentTemplateSid}
            onChange={e => setContentTemplateSid(e.target.value)}
          >
            <Option value="">Selecione um template</Option>
            {templates.map(template => (
            <Option value={template.sid} key={template.sid}>
                {template.name}
            </Option>
            ))}
          </Select>
        <HelpText>
      Escolha um template aprovado para envio via WhatsApp. Mensagens personalizadas foram desabilitadas.
        </HelpText>
    <Separator orientation="horizontal" verticalSpacing="space60" />
    <Label htmlFor="select_queue_sid">Fila (Queue)</Label>
      <Select
        id="select_queue_sid"
        value={queueSid}
        onChange={e => setQueueSid(e.target.value)}
      >
        <Option value="">Selecione uma fila (opcional)</Option>
        {queueOptions.map(q => (
          <Option key={q.sid} value={q.sid}>{q.friendlyName || q.queueName || q.sid}</Option>
        ))}
      </Select>
      <HelpText>Se selecionada, a tarefa outbound será roteada por esta fila.</HelpText>
    <Separator orientation="horizontal" verticalSpacing="space60" />
    <HelpText>Preencha apenas o template. O conteúdo será montado automaticamente.</HelpText>
      </Box>
      {/* Rodapé */}
      <Box
        padding="space50"
        borderTopStyle="solid"
        borderTopWidth="borderWidth10"
        borderTopColor="colorBorderWeak"
        backgroundColor="colorBackgroundBody"
        display="flex"
        justifyContent="flex-end"
      >
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={!contentTemplateSid || isSending}
          loading={isSending}
          onClick={handleSend}
        >
          Enviar WhatsApp
        </Button>
      </Box>
    </Box>
  );
};

export default SendWhatsappSidePanel;
