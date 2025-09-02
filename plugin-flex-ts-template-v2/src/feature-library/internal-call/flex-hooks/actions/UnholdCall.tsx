import * as Flex from '@twilio/flex-ui';

import ProgrammableVoiceService from '../../../../utils/serverless/ProgrammableVoice/ProgrammableVoiceService';
import { isInternalCall } from '../../helpers/internalCall';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import { Actions } from "@twilio/flex-ui";

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.UnholdCall;
export const actionHook = function handleInternalUnholdCall(flex: typeof Flex, _manager: Flex.Manager) {
  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, abortFunction) => {
    if (!isInternalCall(payload.task)) {
      return;
    }

    const { task } = payload;
    const conference = task.conference ? task.conference.conferenceSid : task.attributes.conferenceSid;

    const participant = task.attributes.conference.participants
      ? task.attributes.conference.participants.worker
      : task.attributes.worker_call_sid;

      Actions.invokeAction("UnholdParticipant", {
        sid: task.sid,
        targetSid: participant,
        options: {}
      });
    abortFunction();
  });
};
