
"use strict";

//============================================================================
// ** Helper Functions
//============================================================================

//----------------------------------------------------------------------------
// * New Round
//----------------------------------------------------------------------------

const processNewRound = (event, totalEvents, currScores) => {
  for (let i = 0; i < currScores.length; i++) {
    currScores[i] = event.data.scores[i];
  }

  const roundEvent = {
    name: 'newRound',
    data: {
      roundWind: event.data.chang,
      seatWind: event.data.ju,
      honba: event.data.ben,
    },
  };

    
  totalEvents.push(roundEvent);
};

//----------------------------------------------------------------------------
// * Agari
//----------------------------------------------------------------------------

const processAgariNode = (event, totalEvents, currScores) => {
  const riichiEvent = {
    name: 'riichi',
    data: { riichi: [false, false, false, false] },
  };

  currScores.forEach((score, index) => {
    const playerRiichi = (score > event.data.old_scores[index]);
    riichiEvent.data.riichi[index] = playerRiichi;
  });

  totalEvents.push(riichiEvent);

  event.data.hules.forEach(agariData => {
    const agariEvent = { 
      name: 'agari', 
      data: processAgari(event.data, agariData),
    };

    totalEvents.push(agariEvent);
  });
};

const processAgari = (eventData, agariData) => {
  const result = {}

  result.han = agariData.yiman ? 13 : agariData.count;
  result.fu = agariData.fu;

  result.actor = agariData.seat;
  result.target = getAgariTarget(agariData, eventData.delta_scores);

  return result;
}

const getAgariTarget = (agariData, deltaScores) => {
  if (agariData.zimo) {
    return agariData.seat;
  }

  for (let i = 0; i < 4; i++) {
    if (deltaScores[i] < 0) {
      return i;
    }
  }

  return -1;
}

//----------------------------------------------------------------------------
// * Ryuukyoku
//----------------------------------------------------------------------------

const processRyuukyokuNode = (event, totalEvents, currScores) => {
  const riichiEvent = {
    name: 'riichi',
    data: { riichi: [false, false, false, false] },
  };

  currScores.forEach((score, index) => {
    const playerRiichi = (score > event.data.scores[0].old_scores[index]);
    riichiEvent.data.riichi[index] = playerRiichi;
  });

  totalEvents.push(riichiEvent);

  const ryuukyokuEvent = {
    name: 'ryuukyoku',
    data: { tenpai: [false, false, false, false] },
  };

  for (let i = 0; i < event.data.players.length; i++) {
    ryuukyokuEvent.data.tenpai[i] = event.data.players[i].tingpai;
  }


  totalEvents.push(ryuukyokuEvent);
}

//----------------------------------------------------------------------------
// * 9s9h
//----------------------------------------------------------------------------

const processAbortiveNode = (totalEvents) => {
  const abortiveEvent = { name: 'abortive', data: {} };

  totalEvents.push(abortiveEvent);
}

//============================================================================
// ** Main
//============================================================================

const parseLog = (logData) => {
  const totalEvents = [];
  const currScores = new Array(4).fill(30000);

  logData.forEach(event => {
    switch (event.name) {
      case 'RecordNewRound':
        processNewRound(event, totalEvents, currScores);
        break;
      case 'RecordHule':
        processAgariNode(event, totalEvents, currScores);
        break;
      case 'RecordNoTile':
        processRyuukyokuNode(event, totalEvents, currScores);
        break;
      case 'RecordLiuJu':
        processAbortiveNode(totalEvents);
        break;
    };
  });

  return totalEvents;
}

//=============================================================================
// ** Exports
//=============================================================================

module.exports = { parseLog: parseLog };