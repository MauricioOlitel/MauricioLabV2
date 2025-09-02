import * as Flex from '@twilio/flex-ui';

import ProgrammableVoiceService from '../../../../utils/serverless/ProgrammableVoice/ProgrammableVoiceService';
import { isConferenceEnabledWithoutNativeXWT } from '../../config';
import { FlexActionEvent, FlexAction } from '../../../../types/feature-loader';
import { Actions } from "@twilio/flex-ui";

export const actionEvent = FlexActionEvent.before;
export const actionName = FlexAction.HoldParticipant;
export const actionHook = function handleHoldConferenceParticipant(flex: typeof Flex, _manager: Flex.Manager) {
  if (!isConferenceEnabledWithoutNativeXWT()) return;

  flex.Actions.addListener(`${actionEvent}${actionName}`, async (payload, abortFunction) => {
  const { participantType, task } = payload;
  const targetSid = payload.targetSid;
  const options = payload.options;

    if (participantType !== 'unknown') {
      return;
    }

    const conferenceSid = task.conference?.conferenceSid || task.attributes?.conference?.sid;
    abortFunction();
  console.log('Holding participant', targetSid);
    Actions.invokeAction("HoldParticipant", {
      sid: task.sid,
      targetSid,
      options
    });
  });
};
