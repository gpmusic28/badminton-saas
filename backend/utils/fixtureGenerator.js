function calculateSlots(teamCount) {
  if (teamCount <= 1) return 2;
  return Math.pow(2, Math.ceil(Math.log2(teamCount)));
}

function distributeByes(teamCount, totalSlots) {
  const byeCount = totalSlots - teamCount;
  if (byeCount === 0) return [];
  const byePositions = [];
  for (let i = 0; i < byeCount; i++) {
    byePositions.push(i % 2 === 0 ? i * 2 + 1 : i * 2);
  }
  return byePositions.sort((a, b) => a - b);
}

function getRoundName(totalSlots, roundIndex) {
  const totalRounds = Math.log2(totalSlots);
  if (roundIndex === totalRounds - 1) return 'FINAL';
  if (roundIndex === totalRounds - 2) return 'SF';
  if (roundIndex === totalRounds - 3) return 'QF';
  const matchesInRound = totalSlots / Math.pow(2, roundIndex + 1);
  return `R${matchesInRound * 2}`;
}

function generateBracket(teams, rules = {}) {
  const teamCount = teams.length;
  const totalSlots = calculateSlots(teamCount);
  const byePositions = distributeByes(teamCount, totalSlots);
  const totalRounds = Math.log2(totalSlots);
  const allRounds = [];
  const firstRound = [];
  let teamIndex = 0;

  for (let i = 0; i < totalSlots / 2; i++) {
    const pos1 = i * 2, pos2 = i * 2 + 1;
    const team1IsBye = byePositions.includes(pos1);
    const team2IsBye = byePositions.includes(pos2);
    const match = {
      id: `R0_M${i}`,
      round: getRoundName(totalSlots, 0),
      roundIndex: 0,
      matchNumber: i + 1,
      team1: team1IsBye ? null : (teams[teamIndex++] || null),
      team2: team2IsBye ? null : (teams[teamIndex++] || null),
      team1IsBye, team2IsBye,
      winner: null,
      status: 'pending',
      scores: [],
      rules: { pointsPerSet: 21, deuce: true, bestOf: 3, ...rules }
    };
    if (team1IsBye) { match.winner = match.team2; match.status = 'completed'; }
    else if (team2IsBye) { match.winner = match.team1; match.status = 'completed'; }
    firstRound.push(match);
  }
  allRounds.push(firstRound);

  for (let r = 1; r < totalRounds; r++) {
    const prevRound = allRounds[r - 1];
    const round = [];
    for (let i = 0; i < prevRound.length / 2; i++) {
      const match = {
        id: `R${r}_M${i}`,
        round: getRoundName(totalSlots, r),
        roundIndex: r,
        matchNumber: i + 1,
        team1: prevRound[i * 2].winner || null,
        team2: prevRound[i * 2 + 1].winner || null,
        team1IsBye: false, team2IsBye: false,
        winner: null, status: 'pending', scores: [],
        sourceMatch1: prevRound[i * 2].id,
        sourceMatch2: prevRound[i * 2 + 1].id,
        rules: { pointsPerSet: 21, deuce: true, bestOf: 3, ...rules }
      };
      prevRound[i * 2].nextMatchId = match.id;
      prevRound[i * 2 + 1].nextMatchId = match.id;
      round.push(match);
    }
    allRounds.push(round);
  }

  return {
    totalSlots, totalTeams: teamCount,
    byeCount: totalSlots - teamCount,
    totalRounds, rounds: allRounds,
    status: 'not_started'
  };
}

module.exports = { calculateSlots, generateBracket, getRoundName };
