import { ITask, Manager } from '@twilio/flex-ui';

import { TeamActivityCounts, TeamTaskCounts } from '../types';

const _manager = Manager.getInstance();
const workerActivities = _manager.store.getState().flex?.worker?.activities || new Map();

const STATUS_AVAILABLE = 'Disponivel';
const TASK_CHANNEL_VOICE = 'voice';

export function getAgentStatusCounts(workers: any[] = [], teams: string[] = []) {
  const ac: TeamActivityCounts = {};

  // "All" (todos os times juntos)
  ac.All = { teamName: 'All', totalAgentCount: 0, activities: { Idle: 0, Busy: 0 } };

  // Substituímos "Other" por "NaoAtribuido"
  ac.NaoAtribuido = { teamName: 'Não atribuído', totalAgentCount: 0, activities: { Idle: 0, Busy: 0 } };

  // Inicializa contadores para cada time
  teams.forEach((team) => {
    ac[team] = { teamName: team, totalAgentCount: 0, activities: { Idle: 0, Busy: 0 } };
    workerActivities.forEach((value) => {
      ac[team].activities[value.name] = 0;
      ac.All.activities[value.name] = 0;
    });
  });

  // Agrupa Activity/Status por Team
  workers.forEach((wk) => {
    const workerStatus = wk.worker.activityName;
    const tasks = wk?.tasks || [];
    // Se não tiver team_name, usamos "Não atribuído"
    const teamName: string = wk.worker?.attributes?.team_name || 'Não atribuído';
    let tm = teamName;

    // Se não estiver na lista de teams, consideramos "NaoAtribuido"
    if (!teams.includes(teamName)) {
      tm = 'NaoAtribuido';
    }

    // Incrementa contadores
    const currentCount = ac[tm].activities[workerStatus] ?? 0;
    ac[tm].activities[workerStatus] = currentCount + 1;
    ac[tm].totalAgentCount += 1;

    // Ajusta se for Disponível mas tem tasks => Busy, senão => Idle
    if (workerStatus === STATUS_AVAILABLE) {
      if (tasks.length > 0) {
        ac[tm].activities.Busy = (ac[tm].activities.Busy ?? 0) + 1;
      } else {
        ac[tm].activities.Idle = (ac[tm].activities.Idle ?? 0) + 1;
      }
    }

    // "All" - Total de todos os agentes
    const allCount = ac.All.activities[workerStatus] ?? 0;
    ac.All.activities[workerStatus] = allCount + 1;
    if (workerStatus === STATUS_AVAILABLE) {
      if (tasks.length > 0) {
        ac.All.activities.Busy = (ac.All.activities.Busy ?? 0) + 1;
      } else {
        ac.All.activities.Idle = (ac.All.activities.Idle ?? 0) + 1;
      }
    }
    ac.All.totalAgentCount += 1;
  });

  return ac;
}

export function getTasksByTeamCounts(workers: any[] = [], teams: string[] = []) {
  const taskCounts: TeamTaskCounts = {};
  const initTasks = { voice_inbound: 0, voice_outbound: 0, sms: 0, chat: 0, video: 0 };

  // "All" (todos os times juntos)
  taskCounts.All = { teamName: 'All', totalTaskCount: 0, tasks: { ...initTasks } };

  // Substituímos "Other" por "NaoAtribuido"
  taskCounts.NaoAtribuido = { teamName: 'Não atribuído', totalTaskCount: 0, tasks: { ...initTasks } };

  // Inicializa contadores para cada time
  teams.forEach((team) => {
    taskCounts[team] = { teamName: team, totalTaskCount: 0, tasks: { ...initTasks } };
  });

  // Agrupa Tasks por Team
  workers.forEach((wk) => {
    // Se não tiver team_name, usamos "Não atribuído"
    const teamName: string = wk.worker?.attributes?.team_name || 'Não atribuído';
    let tm = teamName;
    if (!teams.includes(teamName)) {
      tm = 'NaoAtribuido';
    }

    const tasks = wk?.tasks || [];
    tasks.forEach((task: ITask) => {
      let channel = '';

      // Define se é voice_inbound ou voice_outbound
      if (task.taskChannelUniqueName === TASK_CHANNEL_VOICE) {
        channel = `voice_${task.attributes?.direction || 'inbound'}`;
      } else {
        channel = task.taskChannelUniqueName;
      }

      const count = taskCounts[tm].tasks[channel] ?? 0;
      taskCounts[tm].tasks[channel] = count + 1;
      taskCounts[tm].totalTaskCount += 1;

      // Incrementa também no "All"
      const allCount = taskCounts.All.tasks[channel] ?? 0;
      taskCounts.All.tasks[channel] = allCount + 1;
      taskCounts.All.totalTaskCount += 1;
    });
  });

  return taskCounts;
}
