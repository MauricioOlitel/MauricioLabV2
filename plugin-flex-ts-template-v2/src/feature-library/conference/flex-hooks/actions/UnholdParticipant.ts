import { Actions } from "@twilio/flex-ui";
import * as Flex from '@twilio/flex-ui';

import ProgrammableVoiceService from '../../../../utils/serverless/ProgrammableVoice/ProgrammableVoiceService';
import { isConferenceEnabledWithoutNativeXWT } from '../../config';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.UnholdParticipant;
export const actionHook = function handleUnholdConferenceParticipant(flex: typeof Flex, _manager: Flex.Manager) {
  if (!isConferenceEnabledWithoutNativeXWT()) return;

  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, abortFunction) => {
  const { participantType, task } = payload;
  const targetSid = payload.targetSid;
  const options = payload.options;

    if (participantType !== 'unknown') {
      return;
    }

  console.log('Unholding participant', targetSid);

    const conferenceSid = task.conference?.conferenceSid || task.attributes?.conference?.sid;
    abortFunction();
    Actions.invokeAction("UnholdParticipant", {
      sid: task.sid,
      targetSid,
      options
    });
  });
};
